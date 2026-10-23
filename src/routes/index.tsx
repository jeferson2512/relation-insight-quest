import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { captureUtm, track, withUtm } from "@/lib/analytics";
import {
  ANALYSIS_CHECKS,
  COPY,
  CORE_QUESTIONS,
  CRUCIAL_QUESTION,
  PRODUCT,
  REFINEMENT_QUESTIONS,
  type Question,
} from "@/lib/quiz-config";
import {
  createCheckout,
  finalizeResult,
  getSessionState,
  saveLead,
  saveProgress,
  startSession,
} from "@/lib/quiz.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Análise de comportamentos na relação — Além do Espelho" },
      {
        name: "description",
        content:
          "Responda perguntas sobre a sua relação e veja quais padrões de comportamento aparecem com mais força nas situações que você vive.",
      },
      { property: "og:title", content: "Será que os comportamentos dele dizem mais do que você imagina?" },
      {
        property: "og:description",
        content: "Uma análise de reflexão comportamental baseada nas suas respostas. Leva poucos minutos.",
      },
    ],
  }),
  component: QuizPage,
});

type Stage =
  | "intro"
  | "core"
  | "analysis1"
  | "refinement"
  | "analysis2"
  | "crucial"
  | "analysis3"
  | "preview"
  | "checkout"
  | "result";

type Preview = { levelTitle: string; previewLead: string; topDimensions: string[]; resultId: string };
type Full = {
  levelText: string;
  patterns: { label: string; intensity: number; note: string }[];
  explanation: string[];
  observe: string[];
  reflection: string;
};

const LS_KEY = "quiz_state_v1";

function QuizPage() {
  const start = useServerFn(startSession);
  const save = useServerFn(saveProgress);
  const finalize = useServerFn(finalizeResult);
  const getState = useServerFn(getSessionState);
  const checkout = useServerFn(createCheckout);
  const lead = useServerFn(saveLead);

  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [full, setFull] = useState<Full | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utmRef = useRef<Record<string, string>>({});

  // ---------- restore session ----------
  useEffect(() => {
    utmRef.current = captureUtm();
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return setReady(true);
    try {
      const saved = JSON.parse(raw) as { token: string; stage: Stage; answers: Record<string, string>; index: number };
      setToken(saved.token);
      setAnswers(saved.answers ?? {});
      setIndex(saved.index ?? 0);
      setStage(saved.stage ?? "intro");
      getState({ data: { token: saved.token } })
        .then((s) => {
          if (!s) {
            localStorage.removeItem(LS_KEY);
            setToken(null);
            setStage("intro");
            return;
          }
          setPaymentStatus(s.paymentStatus);
          if (s.preview) setPreview(s.preview);
          if (s.unlocked && s.full) {
            setFull(s.full);
            setStage("result");
          } else if (s.preview && ["analysis3", "preview", "checkout", "result"].includes(saved.stage)) {
            setStage(saved.stage === "result" ? "preview" : saved.stage);
          } else if (saved.stage.startsWith("analysis")) {
            // retomar após a tela de transição
            setStage(saved.stage === "analysis1" ? "refinement" : saved.stage === "analysis2" ? "crucial" : "analysis3");
            setIndex(0);
          }
        })
        .finally(() => setReady(true));
    } catch {
      setReady(true);
    }
  }, [getState]);

  useEffect(() => {
    if (!token) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ token, stage, answers, index }));
  }, [token, stage, answers, index]);

  const go = useCallback(
    (next: Stage, nextAnswers = answers) => {
      setStage(next);
      setIndex(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (token) void save({ data: { token, answers: nextAnswers, stage: next } }).catch(() => {});
    },
    [answers, token, save],
  );

  // ---------- actions ----------
  const begin = async () => {
    setBusy(true);
    setError(null);
    try {
      const { token: t } = await start({ data: { utm: utmRef.current } });
      setToken(t);
      setAnswers({});
      setStage("core");
      setIndex(0);
      track("quiz_started");
    } catch {
      setError("Não conseguimos iniciar agora. Tente novamente em instantes.");
    } finally {
      setBusy(false);
    }
  };

  const answer = (q: Question, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [String(q.id)]: optionId }));
  };

  const advance = (list: Question[], q: Question) => {
    track("question_answered", { question: q.id, option: answers[String(q.id)] });
    if (index < list.length - 1) {
      setIndex(index + 1);
      if (token && (index + 1) % 3 === 0) void save({ data: { token, answers, stage } }).catch(() => {});
      return;
    }
    if (stage === "core") {
      track("quiz_step_15_completed");
      track("analysis_started", { step: 1 });
      go("analysis1");
    } else if (stage === "refinement") {
      track("refinement_completed");
      track("analysis_started", { step: 2 });
      go("analysis2");
    }
  };

  const finishCrucial = async () => {
    if (!token) return;
    track("question_21_completed");
    track("analysis_started", { step: 3 });
    go("analysis3");
    try {
      const { preview: p } = await finalize({ data: { token, answers } });
      setPreview(p);
    } catch {
      setError("Não conseguimos concluir a análise. Tente novamente.");
    }
  };

  const startCheckout = async (name?: string, email?: string) => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      if (name || email) await lead({ data: { token, name: name || undefined, email: email || undefined } });
      const res = await checkout({ data: { token, utm: utmRef.current } });
      setCheckoutUrl(res.checkoutUrl);
      setPaymentStatus("pending");
      track("checkout_started", { value: PRODUCT.amountCents / 100, currency: PRODUCT.currency, eventId: res.paymentId });
      track("payment_pending");
      setStage("checkout");
      window.open(res.checkoutUrl, "_blank", "noopener");
    } catch {
      setError("Não conseguimos abrir o pagamento. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  // ---------- poll payment ----------
  useEffect(() => {
    if (stage !== "checkout" || !token) return;
    let alive = true;
    const tick = async () => {
      const s = await getState({ data: { token } }).catch(() => null);
      if (!alive || !s) return;
      setPaymentStatus(s.paymentStatus);
      if (s.unlocked && s.full) {
        setFull(s.full);
        track("payment_approved");
        track("result_unlocked", {
          value: PRODUCT.amountCents / 100,
          currency: PRODUCT.currency,
          eventId: s.paymentId,
        });
        setStage("result");
      }
    };
    void tick();
    const id = window.setInterval(tick, 5000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [stage, token, getState]);

  useEffect(() => {
    if (stage === "preview" && preview) track("result_preview_viewed", { level: preview.levelTitle });
  }, [stage, preview]);

  if (!ready) return <Shell><div className="h-[60vh]" /></Shell>;

  return (
    <Shell>
      {stage === "intro" && <Intro onStart={begin} busy={busy} error={error} />}

      {stage === "core" && (
        <QuestionStep
          key={`core-${index}`}
          eyebrow={`Pergunta ${index + 1} de ${CORE_QUESTIONS.length}`}
          progress={(index + 1) / CORE_QUESTIONS.length}
          question={CORE_QUESTIONS[index]!}
          selected={answers[String(CORE_QUESTIONS[index]!.id)]}
          onSelect={(o) => answer(CORE_QUESTIONS[index]!, o)}
          onNext={() => advance(CORE_QUESTIONS, CORE_QUESTIONS[index]!)}
          onBack={index > 0 ? () => setIndex(index - 1) : undefined}
          nextLabel={index === CORE_QUESTIONS.length - 1 ? "VER MINHA PRIMEIRA ANÁLISE" : "CONTINUAR"}
        />
      )}

      {stage === "analysis1" && (
        <Processing
          title="Estamos analisando suas respostas..."
          text="Suas respostas estão sendo cruzadas para identificar padrões relacionados à comunicação, responsabilidade, limites, empatia e impacto emocional."
          doneTitle="Identificamos alguns pontos importantes."
          doneText="Para aumentar a precisão da sua análise, precisamos refinar algumas respostas."
          cta="CONTINUAR ANÁLISE"
          onDone={() => {
            track("analysis_completed", { step: 1 });
            track("refinement_started");
            go("refinement");
          }}
        />
      )}

      {stage === "refinement" && (
        <>
          {index === 0 && (
            <div className="mb-6 animate-rise text-center">
              <p className="eyebrow text-dawn">Refinando sua análise</p>
              <p className="mt-2 text-sm text-ink-soft">
                Essas próximas perguntas ajudam a entender situações mais específicas.
              </p>
            </div>
          )}
          <QuestionStep
            key={`ref-${index}`}
            eyebrow={`Refinamento ${index + 1} de ${REFINEMENT_QUESTIONS.length}`}
            progress={(index + 1) / REFINEMENT_QUESTIONS.length}
            question={REFINEMENT_QUESTIONS[index]!}
            selected={answers[String(REFINEMENT_QUESTIONS[index]!.id)]}
            onSelect={(o) => answer(REFINEMENT_QUESTIONS[index]!, o)}
            onNext={() => advance(REFINEMENT_QUESTIONS, REFINEMENT_QUESTIONS[index]!)}
            onBack={index > 0 ? () => setIndex(index - 1) : undefined}
            nextLabel={index === REFINEMENT_QUESTIONS.length - 1 ? "APROFUNDAR MINHA ANÁLISE" : "CONTINUAR"}
          />
        </>
      )}

      {stage === "analysis2" && (
        <Processing
          title="Refinando seu resultado..."
          text="Agora estamos cruzando suas respostas iniciais com as respostas desta segunda etapa."
          checks
          cta="CONTINUAR"
          onDone={() => {
            track("analysis_completed", { step: 2 });
            go("crucial");
          }}
        />
      )}

      {stage === "crucial" && (
        <Crucial
          selected={answers[String(CRUCIAL_QUESTION.id)]}
          onSelect={(o) => answer(CRUCIAL_QUESTION, o)}
          onNext={finishCrucial}
        />
      )}

      {stage === "analysis3" && (
        <Processing
          title="Análise concluída"
          text="Cruzamos suas respostas iniciais, suas respostas de refinamento e a última informação que você compartilhou."
          doneTitle="Seu resultado está pronto."
          cta="VER MEU RESULTADO"
          waitFor={!!preview}
          onDone={() => {
            track("analysis_completed", { step: 3 });
            go("preview");
          }}
        />
      )}

      {stage === "preview" && preview && (
        <PreviewLocked preview={preview} busy={busy} error={error} onUnlock={startCheckout} />
      )}

      {stage === "checkout" && (
        <CheckoutWaiting status={paymentStatus} url={checkoutUrl} onRetry={() => setStage("preview")} />
      )}

      {stage === "result" && preview && full && <FullResult preview={preview} full={full} utm={utmRef.current} />}

      {error && stage !== "intro" && stage !== "preview" && (
        <p className="mt-6 text-center text-sm text-destructive">{error}</p>
      )}
    </Shell>
  );
}

/* ================= UI ================= */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="surface-fog">
        <div className="mx-auto flex max-w-2xl items-center justify-center px-5 py-4">
          <span className="font-display text-xs font-medium uppercase tracking-[0.22em] text-dawn">
            {COPY.brand}
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-8 sm:pt-12">{children}</main>
      <footer className="mx-auto max-w-2xl px-5 pb-10 text-center text-xs leading-relaxed text-ink-faint">
        {COPY.disclaimer}
      </footer>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-[15px] font-bold tracking-wide text-primary-foreground transition-[transform,background-color,opacity] duration-200 hover:-translate-y-0.5 hover:bg-dawn-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Intro({ onStart, busy, error }: { onStart: () => void; busy: boolean; error: string | null }) {
  return (
    <section className="-mx-5 -mt-8 sm:-mt-12 surface-fog relative overflow-hidden px-6 pb-16 pt-14 sm:rounded-b-xl">
      <div className="pointer-events-none absolute inset-0 surface-glow" />
      <div className="relative animate-rise">
        <p className="eyebrow flex items-center gap-3 text-dawn-soft">
          <span className="inline-block h-px w-6 bg-dawn-soft" /> Análise comportamental
        </p>
        <h1 className="mt-6 text-[2.15rem] font-semibold leading-[1.08] sm:text-5xl">
          Será que os comportamentos dele estão dizendo <em className="font-medium text-dawn-soft">mais</em> do que
          você imagina?
        </h1>
        <p className="mt-6 text-[1.05rem] leading-relaxed text-paper/80">{COPY.subheadline}</p>
        <div className="mt-10">
          <PrimaryButton onClick={onStart} disabled={busy}>
            {busy ? "Preparando..." : COPY.ctaStart}
          </PrimaryButton>
          <p className="mt-4 text-center text-sm text-paper/60">{COPY.microcopy}</p>
        </div>
        <p className="mt-10 border-t border-paper/15 pt-6 text-sm leading-relaxed text-paper/75">
          {COPY.expectation}
        </p>
        {error && <p className="mt-4 text-sm text-dawn-soft">{error}</p>}
      </div>
    </section>
  );
}

function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="eyebrow text-sage">{label}</span>
        <span className="text-xs text-ink-faint">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-paper-warm">
        <div
          className="h-full rounded-full bg-fog-600 transition-[width] duration-500 ease-out"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

function OptionButton({
  id,
  label,
  active,
  onClick,
  large,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex w-full items-start gap-4 rounded-md border text-left transition-all duration-200 ${
        large ? "px-5 py-5" : "px-4 py-4"
      } ${
        active
          ? "border-fog-700 bg-fog-700 text-paper shadow-[var(--shadow-lift)]"
          : "border-border bg-card text-ink hover:border-fog-600/50 hover:bg-paper-warm/50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border font-display text-sm ${
          active ? "border-dawn bg-dawn text-fog" : "border-border text-ink-soft"
        }`}
      >
        {id}
      </span>
      <span className={`leading-snug ${large ? "font-display text-[1.05rem] italic" : "text-[15px]"}`}>{label}</span>
    </button>
  );
}

function QuestionStep({
  eyebrow,
  progress,
  question,
  selected,
  onSelect,
  onNext,
  onBack,
  nextLabel,
}: {
  eyebrow: string;
  progress: number;
  question: Question;
  selected?: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack?: () => void;
  nextLabel: string;
}) {
  return (
    <section>
      <Progress value={progress} label={eyebrow} />
      <div className="animate-rise">
        {question.interlude && (
          <p className="mb-3 font-display text-base italic text-fog-600">{question.interlude}</p>
        )}
        <h2 className="text-[1.6rem] font-semibold leading-tight text-ink sm:text-3xl">{question.text}</h2>
        <div className="mt-7 space-y-3">
          {question.options.map((o) => (
            <OptionButton key={o.id} id={o.id} label={o.label} active={selected === o.id} onClick={() => onSelect(o.id)} />
          ))}
        </div>
        <div className="mt-8 space-y-3">
          <PrimaryButton onClick={onNext} disabled={!selected}>
            {nextLabel}
          </PrimaryButton>
          {onBack && (
            <button type="button" onClick={onBack} className="w-full py-2 text-sm text-ink-faint hover:text-ink-soft">
              ← Voltar
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Processing({
  title,
  text,
  doneTitle,
  doneText,
  cta,
  checks,
  waitFor = true,
  onDone,
}: {
  title: string;
  text: string;
  doneTitle?: string;
  doneText?: string;
  cta: string;
  checks?: boolean;
  waitFor?: boolean;
  onDone: () => void;
}) {
  const [tick, setTick] = useState(0);
  const total = checks ? ANALYSIS_CHECKS.length : 4;
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => Math.min(t + 1, total)), 700);
    return () => window.clearInterval(id);
  }, [total]);
  const done = tick >= total && waitFor;

  return (
    <section className="surface-fog relative overflow-hidden rounded-xl px-6 py-12 text-center shadow-[var(--shadow-lift)]">
      <div className="pointer-events-none absolute inset-0 surface-glow" />
      <div className="relative">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center">
          <span
            className={`block h-14 w-14 rounded-full border-2 border-dawn/30 border-t-dawn ${
              done ? "" : "animate-spin"
            }`}
          />
        </div>
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-paper/75">{text}</p>

        {checks && (
          <ul className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3 text-left text-sm">
            {ANALYSIS_CHECKS.map((c, i) => (
              <li
                key={c}
                className={`flex items-center gap-2 transition-opacity duration-300 ${
                  i < tick ? "opacity-100" : "opacity-25"
                }`}
              >
                <span className="text-dawn">✓</span> {c}
              </li>
            ))}
          </ul>
        )}

        {done && (doneTitle || doneText) && (
          <div className="mt-8 animate-rise">
            {doneTitle && <p className="font-display text-xl text-dawn-soft">{doneTitle}</p>}
            {doneText && <p className="mx-auto mt-2 max-w-md text-sm text-paper/75">{doneText}</p>}
          </div>
        )}

        <div className={`mx-auto mt-10 max-w-sm transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0"}`}>
          <PrimaryButton onClick={onDone} disabled={!done}>
            {cta}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function Crucial({
  selected,
  onSelect,
  onNext,
}: {
  selected?: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <section className="animate-rise">
      <div className="mb-6 text-center">
        <p className="eyebrow flex items-center justify-center gap-2 text-dawn">
          <span className="text-[8px]">◆</span> Última etapa <span className="text-[8px]">◆</span>
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Uma última pergunta...</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-soft">
          Antes de revelar sua análise final, precisamos entender uma última coisa.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8">
        <h3 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">{CRUCIAL_QUESTION.text}</h3>
        <div className="mt-6 space-y-3">
          {CRUCIAL_QUESTION.options.map((o) => (
            <OptionButton
              key={o.id}
              id={o.id}
              label={`“${o.label}”`}
              active={selected === o.id}
              onClick={() => onSelect(o.id)}
              large
            />
          ))}
        </div>
        <div className="mt-8">
          <PrimaryButton onClick={onNext} disabled={!selected}>
            VER MEU RESULTADO
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function PreviewLocked({
  preview,
  busy,
  error,
  onUnlock,
}: {
  preview: Preview;
  busy: boolean;
  error: string | null;
  onUnlock: (name?: string, email?: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const price = useMemo(
    () => (PRODUCT.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: PRODUCT.currency }),
    [],
  );

  return (
    <section className="animate-rise space-y-6">
      <div className="text-center">
        <p className="eyebrow text-dawn">Seu resultado está pronto</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{preview.levelTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-soft">{preview.previewLead}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <p className="eyebrow text-sage">Pontos que apareceram com mais força</p>
        <ul className="mt-4 space-y-3">
          {preview.topDimensions.map((d) => (
            <li key={d} className="flex items-center gap-3 text-[15px] text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-fog-700 text-xs text-dawn">✓</span>
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-fog relative overflow-hidden rounded-xl p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 surface-glow" />
        <div className="relative">
          <div aria-hidden className="space-y-2 opacity-60 blur-[3px] select-none">
            <div className="h-3 w-4/5 rounded bg-paper/25" />
            <div className="h-3 w-3/5 rounded bg-paper/20" />
            <div className="h-3 w-2/3 rounded bg-paper/25" />
            <div className="h-3 w-1/2 rounded bg-paper/20" />
          </div>
          <p className="mt-6 flex items-center gap-2 font-display text-lg text-dawn-soft">🔒 Análise completa</p>
          <p className="mt-2 text-[15px] leading-relaxed text-paper/85">
            Existe uma parte importante da sua análise que ainda não foi desbloqueada.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-paper/70">
            Ela mostra quais padrões apareceram com maior intensidade nas suas respostas e o que vale a pena observar
            daqui para frente.
          </p>

          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              onUnlock(name.trim(), email.trim());
            }}
          >
            <p className="text-xs text-paper/60">
              Opcional: deixe seu nome para personalizar a análise e seu e-mail para recuperar o acesso ao resultado.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu primeiro nome"
              maxLength={80}
              className="w-full rounded-md border border-paper/20 bg-paper/10 px-4 py-3 text-[15px] text-paper placeholder:text-paper/45 focus:border-dawn focus:outline-none"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Seu e-mail"
              maxLength={160}
              className="w-full rounded-md border border-paper/20 bg-paper/10 px-4 py-3 text-[15px] text-paper placeholder:text-paper/45 focus:border-dawn focus:outline-none"
            />
            <div className="pt-2">
              <PrimaryButton type="submit" disabled={busy}>
                {busy ? "Abrindo pagamento..." : "DESBLOQUEAR MINHA ANÁLISE COMPLETA"}
              </PrimaryButton>
            </div>
            <p className="text-center text-sm text-paper/70">Desbloqueio único de {price}</p>
            {error && <p className="text-center text-sm text-dawn-soft">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

function CheckoutWaiting({ status, url, onRetry }: { status: string | null; url: string | null; onRetry: () => void }) {
  const failed = status === "failed" || status === "expired";
  return (
    <section className="animate-rise rounded-xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
      {!failed ? (
        <>
          <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-2 border-fog-600/25 border-t-fog-600" />
          <h2 className="mt-6 text-2xl font-semibold text-ink">Aguardando a confirmação do pagamento</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-soft">
            Assim que o pagamento for confirmado, sua análise completa aparece aqui automaticamente. Você pode fechar e
            voltar depois: o acesso fica salvo.
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block text-sm font-semibold text-fog-600 underline underline-offset-4"
            >
              Abrir a página de pagamento novamente
            </a>
          )}
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-ink">
            {status === "expired" ? "O pagamento expirou" : "O pagamento não foi aprovado"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-soft">Suas respostas continuam salvas.</p>
          <div className="mx-auto mt-6 max-w-sm">
            <PrimaryButton onClick={onRetry}>TENTAR NOVAMENTE</PrimaryButton>
          </div>
        </>
      )}
    </section>
  );
}

function FullResult({ preview, full, utm }: { preview: Preview; full: Full; utm: Record<string, string> }) {
  const salesUrl = withUtm(PRODUCT.salesPageUrl, utm);
  return (
    <article className="animate-rise space-y-8">
      <header className="text-center">
        <p className="eyebrow text-dawn">Seu resultado completo está aqui</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{preview.levelTitle}</h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">{full.levelText}</p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <p className="eyebrow text-sage">Principais padrões encontrados</p>
        <ul className="mt-5 space-y-6">
          {full.patterns.map((p) => (
            <li key={p.label}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-display text-lg font-semibold text-ink">{p.label}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-warm">
                <div className="h-full rounded-full bg-fog-600" style={{ width: `${Math.max(p.intensity, 4)}%` }} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-ink">O que suas respostas sugerem</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
          {full.explanation.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-paper-warm p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">O que observar daqui para frente</h2>
        <ul className="mt-4 space-y-3">
          {full.observe.map((o) => (
            <li key={o} className="flex gap-3 text-[15px] text-ink">
              <span className="mt-1 text-[8px] text-dawn">◆</span>
              {o}
            </li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-2 border-dawn pl-5 font-display text-xl italic leading-snug text-fog-700">
        {full.reflection}
      </blockquote>

      <section className="rounded-md border border-border p-5 text-sm leading-relaxed text-ink-soft">
        <p>{COPY.disclaimer}</p>
        <p className="mt-3">{COPY.safety}</p>
      </section>

      <section className="surface-fog relative overflow-hidden rounded-xl px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute inset-0 surface-glow" />
        <div className="relative">
          <p className="eyebrow text-dawn-soft">O próximo passo</p>
          <h2 className="mt-4 text-2xl font-semibold leading-snug sm:text-3xl">
            Agora que você entende melhor os padrões que apareceram, existe uma próxima pergunta natural:{" "}
            <em className="font-medium text-dawn-soft">o que fazer com tudo isso?</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-paper/80">
            Foi por isso que criamos o material complementar: um guia de 30 dias para entender esses padrões a fundo e
            aprender a lidar com eles, no seu ritmo.
          </p>
          <div className="mt-8">
            <a
              href={salesUrl}
              onClick={() => track("sales_page_clicked")}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-4 text-[15px] font-bold tracking-wide text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-dawn-soft"
            >
              CONTINUAR PARA O MATERIAL COMPLETO
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
