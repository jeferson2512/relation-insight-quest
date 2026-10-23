import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { PRODUCT } from "./quiz-config";
import type { ComputedResult } from "./quiz-analysis.server";

const utmSchema = z.record(z.string()).default({});

const stageSchema = z.enum([
  "intro",
  "core",
  "analysis1",
  "refinement",
  "analysis2",
  "crucial",
  "analysis3",
  "preview",
  "checkout",
  "result",
]);

type SessionRow = {
  id: string;
  session_token: string;
  answers: Record<string, string>;
  current_stage: string;
  result: unknown;
  result_id: string | null;
  lead_name: string | null;
  lead_email: string | null;
  result_unlocked: boolean;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function loadSession(token: string): Promise<SessionRow | null> {
  const db = await admin();
  const { data } = await db
    .from("quiz_sessions")
    .select("*")
    .eq("session_token", token)
    .maybeSingle();
  return (data as SessionRow | null) ?? null;
}

function newToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export const startSession = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ utm: utmSchema }).parse(data ?? {}))
  .handler(async ({ data }) => {
    const db = await admin();
    const token = newToken();
    const { error } = await db.from("quiz_sessions").insert({
      session_token: token,
      utm: data.utm,
      current_stage: "core",
    });
    if (error) throw new Error("Não foi possível iniciar a análise.");
    return { token };
  });

export const saveProgress = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        token: z.string().min(10),
        answers: z.record(z.string()),
        stage: stageSchema,
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
      .from("quiz_sessions")
      .update({ answers: data.answers, current_stage: data.stage })
      .eq("session_token", data.token);
    if (error) throw new Error("Não foi possível salvar suas respostas.");
    return { ok: true };
  });

export const saveLead = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        token: z.string().min(10),
        name: z.string().trim().min(1).max(80).optional(),
        email: z.string().trim().email().max(160).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    await db
      .from("quiz_sessions")
      .update({ lead_name: data.name ?? null, lead_email: data.email ?? null })
      .eq("session_token", data.token);
    return { ok: true };
  });

/** Calcula o resultado no servidor e devolve apenas a PRÉVIA. */
export const finalizeResult = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ token: z.string().min(10), answers: z.record(z.string()) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { computeResult } = await import("./quiz-analysis.server");
    const db = await admin();
    const session = await loadSession(data.token);
    if (!session) throw new Error("Sessão não encontrada.");

    const resultId = session.result_id ?? crypto.randomUUID();
    const result = computeResult(data.answers, resultId);

    await db
      .from("quiz_sessions")
      .update({
        answers: data.answers,
        result: result as never,
        result_id: resultId,
        current_stage: "preview",
      })
      .eq("id", session.id);

    return {
      preview: {
        levelTitle: result.levelTitle,
        previewLead: result.previewLead,
        topDimensions: result.topDimensions,
        resultId,
      },
    };
  });

/** Estado atual da sessão. Só devolve a análise completa se o pagamento foi aprovado. */
export const getSessionState = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ token: z.string().min(10) }).parse(data))
  .handler(async ({ data }) => {
    const { buildFullAnalysis } = await import("./quiz-analysis.server");
    const db = await admin();
    const session = await loadSession(data.token);
    if (!session) return null;

    const { data: payment } = await db
      .from("payments")
      .select("id, payment_status, created_at")
      .eq("session_id", session.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const result = session.result as ComputedResult | null;

    const unlocked = session.result_unlocked === true;

    return {
      stage: session.current_stage,
      answers: session.answers ?? {},
      lead: { name: session.lead_name, email: session.lead_email },
      paymentStatus: (payment?.payment_status as string | undefined) ?? null,
      paymentId: (payment?.id as string | undefined) ?? null,
      unlocked,
      preview: result
        ? {
            levelTitle: result.levelTitle,
            previewLead: result.previewLead,
            topDimensions: result.topDimensions,
            resultId: result.resultId,
          }
        : null,
      full: unlocked && result ? buildFullAnalysis(result, session.lead_name) : null,
    };
  });

/** Cria o pedido de pagamento (pendente) e devolve a URL de checkout do gateway. */
export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ token: z.string().min(10), utm: utmSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const session = await loadSession(data.token);
    if (!session) throw new Error("Sessão não encontrada.");
    if (!session.result) throw new Error("A análise ainda não foi calculada.");

    const { data: payment, error } = await db
      .from("payments")
      .insert({
        session_id: session.id,
        result_id: session.result_id,
        provider: "cakto",
        product_id: PRODUCT.id,
        amount_cents: PRODUCT.amountCents,
        currency: PRODUCT.currency,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (error || !payment) throw new Error("Não foi possível iniciar o pagamento.");

    await db
      .from("quiz_sessions")
      .update({ current_stage: "checkout" })
      .eq("id", session.id);

    const base = process.env["CAKTO_CHECKOUT_URL"] ?? PRODUCT.checkoutUrl;
    const url = new URL(base);
    url.searchParams.set("ref", payment.id as string);
    if (session.lead_email) url.searchParams.set("email", session.lead_email);
    if (session.lead_name) url.searchParams.set("name", session.lead_name);
    for (const [key, value] of Object.entries(data.utm)) url.searchParams.set(key, value);

    return { paymentId: payment.id as string, checkoutUrl: url.toString() };
  });
