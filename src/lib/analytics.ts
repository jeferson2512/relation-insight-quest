/**
 * Camada de analytics. Hoje empurra os eventos para o dataLayer / Meta Pixel
 * quando existirem; sem eles, apenas registra em memória (e no console em dev).
 * Basta plugar o Pixel ou o GA4 no `__root.tsx` para os eventos passarem a fluir.
 */
export type QuizEvent =
  | "quiz_started"
  | "question_answered"
  | "quiz_step_15_completed"
  | "refinement_started"
  | "refinement_completed"
  | "question_21_completed"
  | "analysis_started"
  | "analysis_completed"
  | "result_preview_viewed"
  | "checkout_started"
  | "payment_pending"
  | "payment_approved"
  | "result_unlocked"
  | "sales_page_clicked";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: QuizEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...params, ts: Date.now() };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  window.gtag?.("event", event, params);
  window.fbq?.("trackCustom", event, params);
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const UTM_STORAGE_KEY = "quiz_utm";

export function captureUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  if (Object.keys(found).length > 0) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
    return found;
  }
  try {
    return JSON.parse(localStorage.getItem(UTM_STORAGE_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function withUtm(url: string, utm: Record<string, string>): string {
  const target = new URL(url);
  for (const [key, value] of Object.entries(utm)) target.searchParams.set(key, value);
  return target.toString();
}
