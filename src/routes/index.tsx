import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, BookOpen, GitBranch, ShieldCheck, Rocket } from "lucide-react";
import { CHECKOUT, EXCLUSIVE_CHECKOUT, essentialItems, completeItems } from "../lib/mapa-quiz";
import { offerContents, jobs, audiences, reasons, how } from "../lib/offer-content";
import { captureUtm, withUtm } from "../lib/analytics";
export const Route = createFileRoute("/")({ component: Index });
function Index() {
  const [notice, setNotice] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [checkoutUtm, setCheckoutUtm] = useState<Record<string, string>>({});
  const upgradeDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setCheckoutUtm(captureUtm());
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
    if (!upgradeOpen) return;
    const dialog = upgradeDialog.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [upgradeOpen]);
  function checkout(plan: keyof typeof CHECKOUT, skipOffer = false) {
    if (plan === "essential" && !skipOffer) {
      setUpgradeOpen(true);
      return;
    }
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
              DE R$ 0 A<br />
              <em>R$ 1.000/MÊS</em>
              <span className="hero-product-name">COM SIDE HUSTLE</span>
            </h1>
            <p className="hero-sub">USANDO FERRAMENTAS DE IA QUE VOCÊ JÁ TEM ACESSO</p>
            <p className="new-body">
              E se você pudesse lançar uma fonte de renda online lucrativa esta semana, sem precisar
              largar o emprego, sem um grande orçamento e sem ser um especialista em tecnologia?
              Este e-book mostra exatamente como!
            </p>
            <a href="#kits" className="gold-button">
              QUERO CONHECER A OFERTA <ArrowRight size={19} />
            </a>
          </div>
          <figure className="book-hero">
            <img
              src="/images/mockup-side-hustle-800.webp"
              srcSet="/images/mockup-side-hustle-480.webp 480w, /images/mockup-side-hustle-800.webp 800w, /images/mockup-side-hustle-1254.webp 1254w"
              sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1200px) 46vw, 560px"
              width={1254}
              height={1254}
              alt="Mockup do e-book Side Hustle com IA, com tablet, celular e materiais de apoio"
              fetchPriority="high"
            />
            <figcaption>Produto digital • Mockup ilustrativo</figcaption>
          </figure>
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
          <span className="gold-kicker">OS 10 TRABALHOS PARALELOS COM IA QUE VOCÊ DESCOBRIU</span>
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
          <span className="gold-kicker">PARA QUEM É ESTE INSTRUMENTO?</span>
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
          <span className="gold-kicker">POR QUE ESTE GUIA FUNCIONA</span>
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
                    ? "Para conhecer e consultar."
                    : "Para consultar e experimentar."}
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
                  Escolher {plan === "essential" ? "Básico" : "Completo"} <ArrowRight size={18} />
                </button>
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
      <dialog
        ref={upgradeDialog}
        className="upgrade-dialog"
        aria-labelledby="upgrade-title"
        aria-describedby="upgrade-description"
        onCancel={() => setUpgradeOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setUpgradeOpen(false);
        }}
      >
        <button
          className="upgrade-close"
          aria-label="Fechar oferta"
          onClick={() => setUpgradeOpen(false)}
        >
          ×
        </button>
        <span className="gold-kicker">UMA OPÇÃO ANTES DE CONTINUAR</span>
        <h2 id="upgrade-title">
          LEVE O<br />
          <em>KIT COMPLETO</em>
        </h2>
        <p id="upgrade-description">
          Adicione R$ 10 ao Kit Básico de R$ 17,90 e receba também os materiais do Completo.
        </p>
        <ul>
          {completeItems.slice(1).map((item) => (
            <li key={item}>
              <Check size={16} />
              {item}
            </li>
          ))}
        </ul>
        <div className="upgrade-price">
          <span>Total da oferta</span>
          <strong>R$ 27,90</strong>
          <small>Pagamento único • Acesso vitalício ao conteúdo</small>
        </div>
        <a className="gold-button" href={withUtm(EXCLUSIVE_CHECKOUT, checkoutUtm)}>
          QUERO O COMPLETO POR R$ 27,90 <ArrowRight size={17} />
        </a>
        <button className="upgrade-decline" onClick={() => checkout("essential", true)}>
          Continuar com o Básico por R$ 17,90
        </button>
      </dialog>
      <footer className="new-footer">
        SIDE HUSTLE COM IA<p>Produto digital. Mockup ilustrativo.</p>
      </footer>
    </div>
  );
}
