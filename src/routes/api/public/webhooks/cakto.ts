import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook do gateway de pagamento (Cakto).
 *
 * O desbloqueio do resultado acontece EXCLUSIVAMENTE aqui, após confirmação
 * real do pagamento. O frontend nunca libera nada por conta própria.
 *
 * Configure no painel do gateway:
 *   URL: https://<seu-dominio>/api/public/webhooks/cakto
 *   Header: x-cakto-secret: <valor do segredo CAKTO_WEBHOOK_SECRET>
 */

type CaktoEvent = {
  event?: string;
  status?: string;
  data?: {
    id?: string;
    status?: string;
    ref?: string;
    metadata?: Record<string, unknown>;
    customer?: { email?: string; name?: string };
  };
  ref?: string;
};

function mapStatus(raw: string | undefined): "pending" | "approved" | "failed" | "expired" {
  const value = (raw ?? "").toLowerCase();
  if (["paid", "approved", "aprovado", "purchase_approved", "completed"].includes(value)) {
    return "approved";
  }
  if (["refused", "failed", "declined", "chargeback", "refunded", "cancelled"].includes(value)) {
    return "failed";
  }
  if (["expired", "expirado"].includes(value)) return "expired";
  return "pending";
}

export const Route = createFileRoute("/api/public/webhooks/cakto")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CAKTO_WEBHOOK_SECRET"];
        if (!secret) {
          return new Response(JSON.stringify({ error: "webhook not configured" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }

        const provided =
          request.headers.get("x-cakto-secret") ??
          request.headers.get("x-webhook-secret") ??
          new URL(request.url).searchParams.get("secret");

        if (provided !== secret) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: CaktoEvent;
        try {
          payload = (await request.json()) as CaktoEvent;
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        const paymentId =
          payload.data?.ref ??
          payload.ref ??
          (payload.data?.metadata?.["ref"] as string | undefined);

        if (!paymentId) return new Response("Missing payment reference", { status: 400 });

        const status = mapStatus(payload.data?.status ?? payload.status ?? payload.event);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id, session_id")
          .eq("id", paymentId)
          .maybeSingle();

        if (!payment) return new Response("Unknown payment", { status: 404 });

        await supabaseAdmin
          .from("payments")
          .update({
            payment_status: status,
            provider_payment_id: payload.data?.id ?? null,
            raw_event: payload as unknown as Record<string, unknown>,
            paid_at: status === "approved" ? new Date().toISOString() : null,
          })
          .eq("id", payment.id);

        if (status === "approved") {
          await supabaseAdmin
            .from("quiz_sessions")
            .update({ result_unlocked: true, current_stage: "result" })
            .eq("id", payment.session_id);
        }

        return new Response(JSON.stringify({ received: true, status }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
