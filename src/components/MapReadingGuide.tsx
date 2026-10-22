import { ArrowRight, Compass, GitBranch, Lightbulb } from "lucide-react";
export function MapReadingGuide({ overview = false }: { overview?: boolean }) {
  const nodes = overview
    ? [
        [
          "01",
          "O centro mostra o assunto",
          "Leia o título para saber o que aquele mapa ensina.",
          "Exemplo: “Conteúdo para empresas” reúne aplicações voltadas a negócios.",
        ],
        [
          "02",
          "Os ramos dividem o caminho",
          "Cada caixa apresenta uma parte do trabalho. Leia os números na ordem.",
          "Você pode voltar a uma etapa sem precisar reler o mapa inteiro.",
        ],
        [
          "03",
          "As etiquetas mostram as opções",
          "Os nomes das ferramentas aparecem junto da tarefa que elas podem ajudar a fazer.",
          "Escolha uma opção adequada à etapa. Não é necessário usar todas.",
        ],
        [
          "04",
          "O exemplo aproxima da prática",
          "Use a situação demonstrativa para entender o pedido e adaptar ao seu caso.",
          "Os exemplos são pontos de partida: você confere e ajusta o resultado.",
        ],
      ]
    : [
        [
          "01",
          "Escolha um mapa para sua tarefa",
          "Comece pelo que você quer fazer agora. Depois, leia o assunto no centro.",
          "Quer preparar uma apresentação? Procure o mapa de conteúdo para empresas.",
        ],
        [
          "02",
          "Siga os ramos numerados",
          "Leia uma caixa por vez: ação → explicação → ferramentas → exemplo.",
          "As etapas mostram a sequência. As etiquetas são alternativas, não novas tarefas.",
        ],
        [
          "03",
          "Escolha uma ferramenta",
          "Veja a função indicada ao lado do nome e abra a ferramenta escolhida.",
          "Use uma opção por tarefa. Confira acesso, limites e custos antes de começar.",
        ],
        [
          "04",
          "Adapte o pedido à sua realidade",
          "Informe o assunto, para quem é, os dados reais e o formato que você precisa.",
          "Troque “uma empresa” pelo seu contexto: “uma padaria que quer apresentar seus produtos”.",
        ],
        [
          "05",
          "Experimente e confira",
          "Leia a resposta, confira os fatos e ajuste texto, imagem ou estrutura.",
          "Se faltar algo, peça uma alteração específica. Nunca publique sem revisar.",
        ],
        [
          "06",
          "Retome o mapa quando precisar",
          "Concluiu uma etapa? Vá à próxima. Surgiu uma dúvida? Volte à caixa correspondente.",
          "Você pode consultar na tela ou imprimir. Não precisa memorizar as ferramentas.",
        ],
      ];
  return (
    <section
      className="map-preview reading-guide"
      aria-label={
        overview ? "Conheça as partes do mapa mental" : "Guia visual de como consultar os mapas"
      }
    >
      <div className="map-kicker">
        <span>MAPA</span>
        <span>MENTAL</span>
      </div>
      <div className="map-center">
        <Compass size={35} />
        <strong>
          {overview ? "ENTENDA AS PARTES" : "COMO USAR"}
          <br />
          {overview ? "DO SEU MAPA" : "SEUS MAPAS"}
        </strong>
      </div>
      <p className="map-subtitle">
        {overview
          ? "Um assunto no centro. Um caminho em cada ramo."
          : "Uma tarefa por vez, do primeiro olhar à revisão."}
      </p>
      <div className="reading-legend">
        <span>
          🧭 <b>Centro</b> = assunto
        </span>
        <span>
          🔢 <b>Número</b> = ordem
        </span>
        <span>
          🛠️ <b>Etiqueta</b> = ferramenta
        </span>
        <span>
          💡 <b>Exemplo</b> = aplicação
        </span>
      </div>
      <div className="map-route-note">
        <span>LER</span>
        <ArrowRight size={18} />
        <span>EXPERIMENTAR</span>
        <ArrowRight size={18} />
        <span>REVISAR</span>
      </div>
      <div className="map-branches">
        {nodes.map(([number, title, body, example]) => (
          <div className="map-node" key={number}>
            <span className="map-step-icon">
              <GitBranch size={22} />
            </span>
            <div>
              <b>
                {number}. {title}
              </b>
              <small>{body}</small>
              <small className="tool-example">{example}</small>
            </div>
          </div>
        ))}
      </div>
      {!overview && (
        <div className="reading-example">
          <h3>📝 Veja um pedido tomando forma</h3>
          <p>
            <span>Em vez de:</span> “Faça um texto.”
          </p>
          <p>
            <span>Experimente:</span> “Escreva uma apresentação de 5 slides para minha padaria. O
            público são empresas do bairro. Use estas informações reais: [produtos, diferenciais e
            contato]. Termine com um convite para conversar.”
          </p>
          <p className="reading-followup">↳ Confira as informações e peça ajustes antes de usar.</p>
        </div>
      )}
      <aside className="map-tip">
        <Lightbulb size={23} />
        <p>
          <strong>LEMBRETE</strong> O mapa orienta o caminho. Você escolhe a ferramenta, adapta o
          pedido e aprova o resultado.
        </p>
      </aside>
    </section>
  );
}
