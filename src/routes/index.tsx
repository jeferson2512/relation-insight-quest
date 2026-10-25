import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, BookOpen, GitBranch, ShieldCheck, Rocket } from "lucide-react";
import { CHECKOUT, essentialItems, completeItems } from "../lib/mapa-quiz";
import { faqs, offerContents, jobs, audiences, reasons, how } from "../lib/offer-content";
import { captureUtm, withUtm } from "../lib/analytics";
const samples = [
  { slug: "ferramentas", title: "Ferramentas de IA" },
  { slug: "textos", title: "Serviços de texto" },
  { slug: "design", title: "Design e criativos" },
  { slug: "videos", title: "Vídeos curtos" },
  { slug: "produtos", title: "Produtos digitais" },
  { slug: "oferta", title: "Como montar sua oferta" },
  { slug: "clientes", title: "Como encontrar clientes" },
  { slug: "precos", title: "Como pensar no preço" },
  { slug: "plano", title: "Plano de sete dias" },
  { slug: "erros", title: "Erros para evitar" },
  { slug: "checklist", title: "Checklist para começar" },
];
export const Route = createFileRoute("/")({ component: Index });
function Index() {
  const [notice, setNotice] = useState("");
  const sampleTrack = useRef<HTMLDivElement>(null);
  const sampleDialog = useRef<HTMLDialogElement>(null);
  const [activeSample, setActiveSample] = useState<(typeof samples)[number] | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [samplesPaused, setSamplesPaused] = useState(false);
  const sampleInteractionUntil = useRef(0);
  useEffect(() => {
    if (
      samplesPaused ||
      activeSample ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(() => {
      const track = sampleTrack.current;
      const card = track?.firstElementChild as HTMLElement | null;
      if (!track || !card || document.hidden || Date.now() < sampleInteractionUntil.current) return;
      const bounds = track.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      track.scrollTo({
        left: atEnd ? 0 : track.scrollLeft + card.offsetWidth + 20,
        behavior: "smooth",
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [samplesPaused, activeSample]);
  useEffect(() => {
    captureUtm();
    window.history.scrollRestoration = "manual";
    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
    function resetOnRestore(event: PageTransitionEvent) {
      if (event.persisted) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.addEventListener("pageshow", resetOnRestore);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", resetOnRestore);
    };
  }, []);
  useEffect(() => {
    if (!activeSample) return;
    const dialog = sampleDialog.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [activeSample]);
  function moveSample(direction: number) {
    sampleInteractionUntil.current = Date.now() + 10000;
    const track = sampleTrack.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (track && card)
      track.scrollBy({ left: direction * (card.offsetWidth + 20), behavior: "smooth" });
  }
  function checkout(plan: keyof typeof CHECKOUT) {
    const url = CHECKOUT[plan];
    if (!url) {
      setNotice("Checkout indisponível.");
      return;
    }
    window.location.assign(withUtm(url, captureUtm()));
  }
  return (
    <div className="new-site">
      <header className="new-header">
        <a href="#inicio" className="new-brand">
          <Rocket size={26} />
          <span>
            SIDE HUSTLE <b>COM IA</b>
            <small>Um guia de renda extra usando inteligência artificial</small>
          </span>
        </a>
        <a href="#kits" className="header-cta">
          Ver a oferta <ArrowRight size={16} />
        </a>
      </header>
      <main>
        <section className="new-hero" id="inicio">
          <div>
            <span className="gold-kicker">🚀 SIDE HUSTLE COM IA</span>
            <h1>
              SAIBA O QUE <em>OFERECER COM IA.</em>
              <span className="hero-product-name">E COMO DAR O PRIMEIRO PASSO.</span>
            </h1>
            <p className="hero-sub">
              Ideias de serviços, ferramentas e próximos passos em mapas mentais.
            </p>
            <p className="new-body">
              Explore textos, artes e vídeos para pequenos negócios. O Side Hustle com IA ajuda você
              a escolher uma atividade, organizar sua oferta e começar a divulgá-la.
            </p>
            <a href="#amostras" className="gold-button">
              VER OS MAPAS POR DENTRO <ArrowRight size={19} />
            </a>
            <p className="hero-buyline">
              Kits a partir de <b>R$ 17,90</b> • Pagamento único
            </p>
            <a href="#kits" className="text-cta">
              Já quero escolher meu kit →
            </a>
            <p className="hero-reassurance">
              📱 Material digital · ♾️ Acesso vitalício · 🛡️ 7 dias de garantia
            </p>
          </div>
          <figure className="book-hero real-hero">
            <span className="real-hero-label">SIDE HUSTLE COM IA · MAPAS MENTAIS</span>
            <div className="real-hero-pages">
              <img
                className="hero-page-back"
                src="/images/amostras/oferta-560.webp"
                width={560}
                height={700}
                alt="Mapa real sobre como montar sua oferta"
                decoding="async"
              />
              <img
                className="hero-page-front"
                src="/images/amostras/ferramentas-560.webp"
                srcSet="/images/amostras/ferramentas-560.webp 560w, /images/amostras/ferramentas-1122.webp 1122w"
                sizes="(max-width: 760px) 70vw, 340px"
                width={560}
                height={700}
                alt="Página real do Side Hustle com IA: ferramentas e suas aplicações"
                fetchPriority="high"
              />
            </div>
            <figcaption>Páginas reais do material digital • Amplie as amostras abaixo</figcaption>
          </figure>
        </section>
        <section
          className="new-section real-samples"
          id="amostras"
          aria-labelledby="samples-heading"
          onMouseEnter={() => setSamplesPaused(true)}
          onMouseLeave={() => setSamplesPaused(false)}
          onFocusCapture={() => setSamplesPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null))
              setSamplesPaused(false);
          }}
          onTouchStart={() => {
            sampleInteractionUntil.current = Date.now() + 10000;
          }}
        >
          <div className="sample-heading-row">
            <div>
              <span className="gold-kicker">PÁGINAS REAIS DO MATERIAL</span>
              <h2 id="samples-heading">
                VEJA COMO É<br />
                <em>POR DENTRO.</em>
              </h2>
            </div>
            <div className="sample-controls">
              <button onClick={() => moveSample(-1)} aria-label="Amostra anterior">
                ←
              </button>
              <button onClick={() => moveSample(1)} aria-label="Próxima amostra">
                →
              </button>
            </div>
          </div>
          <p className="section-intro">
            Explore as amostras e toque em um mapa para ampliar e ler. Confira na oferta os itens
            incluídos em cada kit.
          </p>
          <div
            className="sample-track"
            ref={sampleTrack}
            role="region"
            aria-label="Carrossel de amostras reais"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                moveSample(event.key === "ArrowRight" ? 1 : -1);
              }
            }}
            onScroll={() => {
              const track = sampleTrack.current;
              const card = track?.firstElementChild as HTMLElement | null;
              if (track && card)
                setSampleIndex(Math.round(track.scrollLeft / (card.offsetWidth + 20)));
            }}
          >
            {samples.map((sample) => (
              <article className="sample-card" key={sample.slug}>
                <button
                  onClick={() => setActiveSample(sample)}
                  aria-label={`Ampliar mapa: ${sample.title}`}
                >
                  <img
                    src={`/images/amostras/${sample.slug}-560.webp`}
                    width={560}
                    height={700}
                    loading="lazy"
                    decoding="async"
                    alt={`Página real do material: ${sample.title}`}
                  />
                  <span>AMPLIAR MAPA ↗</span>
                </button>
                <h3>{sample.title}</h3>
              </article>
            ))}
          </div>
          <p className="sample-counter">
            {Math.min(sampleIndex + 1, samples.length)} / {samples.length} · Passagem automática ·
            Deslize para explorar
          </p>
          <a href="#kits" className="gold-button">
            QUERO ESCOLHER MEU KIT <ArrowRight size={18} />
          </a>
        </section>
        <section className="new-section">
          <span className="gold-kicker">O QUE HÁ DENTRO</span>
          <h2>
            CONHEÇA O<br />
            <em>CONTEÚDO DO GUIA.</em>
          </h2>
          <ul className="gold-feature-list offer-full-list">
            {offerContents.map((item) => (
              <li key={item}>
                <Check />
                <div>
                  <b>{item}</b>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="new-section">
          <span className="gold-kicker">POSSIBILIDADES PARA EXPLORAR</span>
          <h2>
            10 CAMINHOS
            <br />
            <em>COM INTELIGÊNCIA ARTIFICIAL.</em>
          </h2>
          <div className="jobs-list">
            {jobs.map(([title, amount], index) => (
              <article key={title}>
                <span className="opportunity-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <strong>{amount}</strong>
              </article>
            ))}
          </div>
        </section>
        <section className="new-section">
          <span className="gold-kicker">PARA QUEM É O MATERIAL?</span>
          <h2>
            ESSE GUIA
            <br />
            <em>É PARA VOCÊ?</em>
          </h2>
          <ul className="gold-feature-list offer-full-list">
            {audiences.map((item) => (
              <li key={item}>
                <Check />
                <div>
                  <b>{item}</b>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="new-section">
          <span className="gold-kicker">PARA COMEÇAR COM MAIS CLAREZA</span>
          <h2>
            UM PLANO PARA
            <br />
            <em>COLOCAR EM PRÁTICA.</em>
          </h2>
          <ul className="gold-feature-list offer-full-list">
            {reasons.map((item) => (
              <li key={item}>
                <Check />
                <div>
                  <b>{item}</b>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="new-section">
          <span className="gold-kicker">COMO FUNCIONA</span>
          <h2>
            SEU CAMINHO
            <br />
            <em>EM QUATRO PASSOS.</em>
          </h2>
          <ol className="week-list offer-full-list">
            {how.map((item, i) => (
              <li key={item}>
                <span>
                  PASSO<b>{i + 1}</b>
                </span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="new-section purchase-section" id="kits">
          <span className="gold-kicker">ESCOLHA SUA OFERTA</span>
          <h2>
            COMECE
            <br />
            <em>COM SEU SIDE HUSTLE COM IA.</em>
          </h2>
          <div className="pricing">
            {(["essential", "complete"] as const).map((plan) => (
              <section className={`price-card ${plan === "complete" ? "featured" : ""}`} key={plan}>
                {plan === "complete" && (
                  <span className="price-tag">✨ MAIS RECURSOS PARA PRATICAR</span>
                )}
                <div className="plan-symbol" aria-hidden="true">
                  {plan === "essential" ? <BookOpen size={24} /> : <GitBranch size={24} />}
                </div>
                <h3 className="plan-name">
                  {plan === "essential" ? "Kit Básico" : "Kit Completo"}
                </h3>
                <p>
                  {plan === "essential"
                    ? "Para entender as possibilidades e escolher por onde começar."
                    : "Para aprofundar a consulta e praticar com materiais extras."}
                </p>
                <div className="plan-includes">
                  {plan === "essential"
                    ? "O SEU PONTO DE PARTIDA"
                    : "BÁSICO + MATERIAIS PARA APLICAR"}
                </div>
                <ul>
                  {(plan === "essential" ? essentialItems : completeItems).map((x) => (
                    <li key={x}>
                      <Check size={17} />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="plan-price">
                  <span>Pagamento único</span>
                  <strong className="price">
                    <small>R$</small> {plan === "essential" ? "17,90" : "37,90"}
                  </strong>
                </div>
                <small>📥 Material digital • PDF para tela e impressão</small>
                <div className="plan-access">
                  <span>⚡ Acesso imediato após a confirmação do pagamento</span>
                  <span>♾️ Acesso vitalício ao conteúdo</span>
                </div>
                <button className="primary" onClick={() => checkout(plan)}>
                  Quero o {plan === "essential" ? "Básico" : "Completo"} <ArrowRight size={18} />
                </button>
                <p className="checkout-fee">
                  A Cakto acrescenta R$ 0,99 de taxa de serviço. Total no checkout: R${" "}
                  {plan === "essential" ? "18,89" : "38,89"}.
                </p>
              </section>
            ))}
          </div>
          {notice && (
            <p role="status" className="checkout-notice">
              {notice}
            </p>
          )}
          <section className="guarantee">
            <ShieldCheck size={32} />
            <div>
              <h2>7 dias de garantia</h2>
              <p>
                Solicite o reembolso em até 7 dias após a compra pelo canal indicado no checkout.
              </p>
            </div>
          </section>
        </section>
      </main>
      <section className="new-section faq-section">
        <span className="gold-kicker">ANTES DE ESCOLHER</span>
        <h2>
          DÚVIDAS <em>FREQUENTES.</em>
        </h2>
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <dialog
        ref={sampleDialog}
        className="sample-dialog"
        aria-label={activeSample ? `Mapa ampliado: ${activeSample.title}` : "Mapa ampliado"}
        onCancel={() => setActiveSample(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setActiveSample(null);
        }}
      >
        <button
          className="sample-close"
          onClick={() => setActiveSample(null)}
          aria-label="Fechar mapa ampliado"
        >
          Fechar ×
        </button>
        {activeSample && (
          <img
            src={`/images/amostras/${activeSample.slug}-1122.webp`}
            alt={`Mapa ampliado: ${activeSample.title}`}
            width={1122}
            height={1402}
          />
        )}
      </dialog>
      <footer className="new-footer">
        SIDE HUSTLE COM IA
        <p>
          Material educativo digital. Resultados dependem da aplicação, da oferta e do mercado. Não
          há garantia de renda.
        </p>
      </footer>
    </div>
  );
}
