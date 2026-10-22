export type QuizStep = {
  kind: "question" | "info" | "name" | "demo";
  title: string;
  description?: string;
  options?: string[];
  multi?: boolean;
  tag?: string;
};
export const CHECKOUT = {
  essential: "https://pay.cakto.com.br/s9g43s8",
  complete: "https://pay.cakto.com.br/5c4hit7",
};
export const steps: QuizStep[] = [
  {
    kind: "question",
    title: "Qual é seu principal objetivo com IA?",
    options: [
      "Ganhar uma renda complementar",
      "Trabalhar de casa",
      "Oferecer serviços",
      "Criar um produto digital",
    ],
  },
  {
    kind: "question",
    title: "Quanto tempo você tem por dia?",
    options: ["Até 30 minutos", "Cerca de 1 hora", "2 horas ou mais"],
  },
  {
    kind: "question",
    title: "Qual forma de trabalhar combina mais com você?",
    options: [
      "Aparecer nas redes sociais",
      "Trabalhar nos bastidores",
      "Oferecer serviços para empresas locais",
      "Criar materiais digitais",
    ],
  },
  {
    kind: "demo",
    title: "Seu caminho pode ficar mais fácil de visualizar.",
    description:
      "Seu resultado vai indicar um ponto de partida. Os mapas mostram como transformar uma tarefa em etapas e escolher uma ferramenta.",
  },
  {
    kind: "question",
    title: "Qual ferramenta você já conhece melhor?",
    options: ["ChatGPT", "Canva", "Instagram", "Ainda não conheço nenhuma"],
  },
  {
    kind: "question",
    title: "Qual é sua maior dificuldade hoje?",
    options: [
      "Não sei por onde começar",
      "Não sei o que oferecer",
      "Não sei encontrar clientes",
      "Tenho muitas ideias e não consigo organizar",
    ],
  },
];
export const topicOrder = [
  "Serviços com ajuda da IA",
  "Produtos digitais",
  "Produção de conteúdo",
  "Tarefas do dia a dia",
  "Organização e automação",
  "Uso para estudos e revisão",
];
export function recommendProfile(answers: Record<number, string[]>) {
  const goal = answers[0]?.[0],
    preference = answers[2]?.[0];
  const scores = { services: 0, products: 0, content: 0 };
  if (goal === "Oferecer serviços") scores.services += 3;
  if (goal === "Criar um produto digital") scores.products += 3;
  if (preference === "Aparecer nas redes sociais") scores.content += 5;
  if (preference === "Trabalhar nos bastidores") scores.services += 3;
  if (preference === "Oferecer serviços para empresas locais") scores.services += 5;
  if (preference === "Criar materiais digitais") scores.products += 5;
  const key = (Object.keys(scores) as (keyof typeof scores)[]).sort(
    (a, b) => scores[b] - scores[a],
  )[0]!;
  const profiles = {
    services: {
      title: "Prestador de Serviços com IA",
      topic: "Serviços com ajuda da IA",
      description:
        "Explore serviços para pequenos negócios, como posts, cardápios, descrições de produtos e mensagens de atendimento.",
      task: "Crie uma amostra de descrição de produto ou apresentação para um negócio fictício.",
      reason:
        preference === "Oferecer serviços para empresas locais"
          ? "Você escolheu oferecer serviços para empresas locais."
          : "Você indicou interesse em serviços ou em trabalhar nos bastidores.",
    },
    products: {
      title: "Criador de Produtos Digitais com IA",
      topic: "Produtos digitais",
      description:
        "Explore materiais digitais como guias, checklists e modelos que ajudem alguém a realizar uma tarefa.",
      task: "Escolha uma dúvida específica e monte o rascunho de um checklist para resolvê-la.",
      reason:
        preference === "Criar materiais digitais"
          ? "Você prefere criar materiais digitais."
          : "Seu objetivo é criar um produto digital.",
    },
    content: {
      title: "Criador de Conteúdo com IA",
      topic: "Produção de conteúdo",
      description: "Explore ideias, roteiros e peças para Instagram, TikTok, Facebook e Kwai.",
      task: "Escolha um assunto e prepare o roteiro de um vídeo curto ou de um carrossel.",
      reason: "Você escolheu aparecer nas redes sociais.",
    },
  };
  const profile = profiles[key];
  const difficulty = answers[5]?.[0];
  const next =
    difficulty === "Não sei o que oferecer"
      ? "Use sua primeira amostra para definir uma entrega pequena e clara."
      : difficulty === "Não sei encontrar clientes"
        ? "Depois de criar sua amostra, defina quem poderia precisar dela e prepare uma apresentação do seu trabalho."
        : difficulty === "Tenho muitas ideias e não consigo organizar"
          ? "Anote suas ideias e escolha apenas uma para experimentar primeiro."
          : "Comece pela visão geral e execute uma tarefa simples, uma etapa de cada vez.";
  return {
    ...profile,
    next,
    tool: answers[4]?.[0] || "Ainda não conheço nenhuma",
    time: answers[1]?.[0] || "Até 30 minutos",
  };
}
export const essentialItems = [
  "1 mapa geral das possibilidades da IA",
  "6 mapas temáticos de visão geral",
  "6 fichas de ferramentas",
  "1 glossário visual com 20 termos",
  "Instruções de uso • PDF A4 e US Letter",
];
export const completeItems = [
  "Tudo do Kit Básico",
  "12 mapas de aplicação com exemplos",
  "30 comandos para experimentar",
  "6 atividades guiadas",
  "1 checklist de revisão",
  "Bônus: roteiro de exploração de 7 dias",
];

export const topicSubtitles: Record<string, string> = {
  "Serviços com ajuda da IA":
    "Ofereça serviços para outras empresas com o apoio da inteligência artificial.",
  "Produtos digitais": "Crie seus próprios produtos e venda na internet.",
  "Produção de conteúdo": "Crie conteúdo para Instagram, TikTok, Facebook e Kwai.",
  "Tarefas do dia a dia": "Aprenda como a IA pode ajudar nas suas tarefas diárias.",
  "Organização e automação":
    "Explore organização e automação para empresas de pequeno, médio e grande porte.",
  "Uso para estudos e revisão":
    "Para estudantes e quem quer apoio para estudar e revisar conteúdos.",
};

export const EXCLUSIVE_CHECKOUT = "https://pay.cakto.com.br/uuf68y3";
