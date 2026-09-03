/**
 * Configuração central do quiz.
 *
 * TODAS as regras de negócio (perguntas, alternativas, pontuação, faixas de
 * resultado, textos, CTAs, preço e URLs) vivem aqui — nada disso deve ser
 * espalhado pelo frontend. Um painel administrativo futuro só precisa ler e
 * escrever este arquivo (ou uma tabela com o mesmo formato).
 */

export type Dimension =
  | "responsabilidade"
  | "empatia"
  | "limites"
  | "controle"
  | "inversao_culpa"
  | "conflitos"
  | "impacto_emocional"
  | "duvida_percepcao";

export const DIMENSION_LABELS: Record<Dimension, string> = {
  responsabilidade: "Responsabilidade nos conflitos",
  empatia: "Empatia",
  limites: "Reação aos seus limites",
  controle: "Controle e pressão",
  inversao_culpa: "Inversão de culpa",
  conflitos: "Condução dos conflitos",
  impacto_emocional: "Impacto emocional em você",
  duvida_percepcao: "Dúvida sobre a própria percepção",
};

export type Option = {
  id: "A" | "B" | "C" | "D" | "E";
  label: string;
  /** 0 = baixo · 1 = leve · 2 = moderado · 3 = elevado */
  score: number;
  dimensions: Dimension[];
};

export type Question = {
  id: number;
  stage: "core" | "refinement" | "crucial";
  text: string;
  /** Frase de continuidade exibida ANTES desta pergunta (uso estratégico). */
  interlude?: string;
  weight?: number;
  options: Option[];
};

const opt = (
  id: Option["id"],
  label: string,
  score: number,
  dimensions: Dimension[],
): Option => ({ id, label, score, dimensions });

export const QUESTIONS: Question[] = [
  {
    id: 1,
    stage: "core",
    text: "Quando algo dá errado na relação, como ele costuma reagir?",
    options: [
      opt("A", "Tenta conversar e entender o que aconteceu.", 0, ["responsabilidade"]),
      opt("B", "Fica irritado e coloca a responsabilidade em alguém.", 2, [
        "responsabilidade",
        "conflitos",
      ]),
      opt("C", "Costuma dizer que a culpa é minha.", 3, ["responsabilidade", "inversao_culpa"]),
      opt("D", "Muda completamente o assunto ou evita assumir responsabilidade.", 2, [
        "responsabilidade",
      ]),
    ],
  },
  {
    id: 2,
    stage: "core",
    text: "Quando você expressa que alguma atitude dele machucou você, o que normalmente acontece?",
    options: [
      opt("A", "Ele escuta e tenta compreender.", 0, ["empatia"]),
      opt("B", "Ele minimiza o que aconteceu.", 2, ["empatia"]),
      opt("C", "Diz que estou exagerando.", 3, ["empatia", "duvida_percepcao"]),
      opt("D", "Acaba fazendo a situação parecer culpa minha.", 3, ["inversao_culpa", "empatia"]),
    ],
  },
  {
    id: 3,
    stage: "core",
    text: "Quando você discorda dele, como ele geralmente reage?",
    interlude: "Entendi.",
    options: [
      opt("A", "Aceita que podemos pensar diferente.", 0, ["controle"]),
      opt("B", "Tenta insistir até eu concordar.", 2, ["controle"]),
      opt("C", "Fica irritado ou hostil.", 3, ["controle", "conflitos"]),
      opt("D", "Faz com que eu me sinta culpada por discordar.", 3, [
        "inversao_culpa",
        "controle",
      ]),
    ],
  },
  {
    id: 4,
    stage: "core",
    text: "Quando você estabelece um limite, o que costuma acontecer?",
    options: [
      opt("A", "Ele respeita.", 0, ["limites"]),
      opt("B", "Questiona bastante o limite.", 1, ["limites"]),
      opt("C", "Fica irritado ou tenta ultrapassá-lo.", 3, ["limites", "controle"]),
      opt("D", "Faz pressão até eu acabar cedendo.", 3, ["limites", "controle"]),
    ],
  },
  {
    id: 5,
    stage: "core",
    text: "Durante uma discussão, ele costuma reconhecer quando erra?",
    options: [
      opt("A", "Sim, com frequência.", 0, ["responsabilidade"]),
      opt("B", "Às vezes, mas geralmente com dificuldade.", 1, ["responsabilidade"]),
      opt("C", "Raramente.", 2, ["responsabilidade"]),
      opt("D", "Quase nunca e normalmente encontra uma justificativa.", 3, [
        "responsabilidade",
        "inversao_culpa",
      ]),
    ],
  },
  {
    id: 6,
    stage: "core",
    text: "Você já saiu de uma conversa com ele se perguntando se talvez estivesse exagerando?",
    interlude: "Vamos aprofundar um pouco mais.",
    options: [
      opt("A", "Nunca.", 0, ["duvida_percepcao"]),
      opt("B", "Algumas vezes.", 1, ["duvida_percepcao"]),
      opt("C", "Muitas vezes.", 2, ["duvida_percepcao", "impacto_emocional"]),
      opt("D", "Isso acontece frequentemente.", 3, ["duvida_percepcao", "impacto_emocional"]),
    ],
  },
  {
    id: 7,
    stage: "core",
    text: "Quando você tenta conversar sobre um problema específico, o que geralmente acontece?",
    options: [
      opt("A", "Conseguimos conversar sobre o problema.", 0, ["conflitos"]),
      opt("B", "A conversa acaba desviando.", 1, ["conflitos"]),
      opt("C", "Ele traz outros erros meus para a discussão.", 3, [
        "conflitos",
        "inversao_culpa",
      ]),
      opt("D", "No final, eu acabo me defendendo de coisas que nem eram o assunto inicial.", 3, [
        "conflitos",
        "inversao_culpa",
      ]),
    ],
  },
  {
    id: 8,
    stage: "core",
    text: "Como ele reage quando recebe uma crítica ou é contrariado?",
    options: [
      opt("A", "Escuta e conversa.", 0, ["responsabilidade"]),
      opt("B", "Fica defensivo.", 1, ["responsabilidade", "conflitos"]),
      opt("C", "Fica muito irritado.", 2, ["conflitos"]),
      opt("D", "Ataca, desqualifica ou tenta inverter a situação.", 3, [
        "conflitos",
        "inversao_culpa",
      ]),
    ],
  },
  {
    id: 9,
    stage: "core",
    text: "Você sente que precisa escolher cuidadosamente as palavras para evitar uma reação negativa dele?",
    interlude: "Agora queremos entender como ele reage.",
    options: [
      opt("A", "Não.", 0, ["controle"]),
      opt("B", "Às vezes.", 1, ["controle"]),
      opt("C", "Frequentemente.", 2, ["controle", "impacto_emocional"]),
      opt("D", "Quase sempre.", 3, ["controle", "impacto_emocional"]),
    ],
  },
  {
    id: 10,
    stage: "core",
    text: "Quando ele faz algo que machuca você, ele costuma demonstrar empatia pelo que você sentiu?",
    options: [
      opt("A", "Sim.", 0, ["empatia"]),
      opt("B", "Às vezes.", 1, ["empatia"]),
      opt("C", "Pouco.", 2, ["empatia"]),
      opt("D", "Quase nunca.", 3, ["empatia", "impacto_emocional"]),
    ],
  },
  {
    id: 11,
    stage: "core",
    text: "Depois de uma discussão, quem normalmente acaba pedindo desculpas?",
    options: [
      opt("A", "Ambos, quando necessário.", 0, ["responsabilidade"]),
      opt("B", "Às vezes eu.", 1, ["responsabilidade"]),
      opt("C", "Na maioria das vezes eu.", 2, ["responsabilidade", "inversao_culpa"]),
      opt("D", "Quase sempre sou eu.", 3, ["responsabilidade", "inversao_culpa"]),
    ],
  },
  {
    id: 12,
    stage: "core",
    text: "Você já sentiu que precisava provar ou explicar várias vezes aquilo que realmente aconteceu?",
    interlude: "Essa resposta é importante para a análise.",
    options: [
      opt("A", "Nunca.", 0, ["duvida_percepcao"]),
      opt("B", "Algumas vezes.", 1, ["duvida_percepcao"]),
      opt("C", "Muitas vezes.", 2, ["duvida_percepcao"]),
      opt("D", "Isso acontece com frequência.", 3, ["duvida_percepcao", "impacto_emocional"]),
    ],
  },
  {
    id: 13,
    stage: "core",
    text: "Como você se sente depois de determinadas discussões?",
    options: [
      opt("A", "Geralmente conseguimos resolver.", 0, ["impacto_emocional"]),
      opt("B", "Fico chateada, mas passa.", 1, ["impacto_emocional"]),
      opt("C", "Fico confusa ou emocionalmente esgotada.", 2, ["impacto_emocional"]),
      opt("D", "Fico questionando minha própria percepção da situação.", 3, [
        "impacto_emocional",
        "duvida_percepcao",
      ]),
    ],
  },
  {
    id: 14,
    stage: "core",
    text: "Você sente que, ao longo do relacionamento, começou a duvidar mais de si mesma?",
    options: [
      opt("A", "Não.", 0, ["duvida_percepcao"]),
      opt("B", "Um pouco.", 1, ["duvida_percepcao"]),
      opt("C", "Sim, em algumas áreas.", 2, ["duvida_percepcao", "impacto_emocional"]),
      opt("D", "Sim, percebo uma mudança significativa.", 3, [
        "duvida_percepcao",
        "impacto_emocional",
      ]),
    ],
  },
  {
    id: 15,
    stage: "core",
    text: "Se você pudesse entender uma única coisa sobre essa relação agora, o que seria?",
    interlude: "Continue. Estamos cruzando os padrões das suas respostas.",
    options: [
      opt("A", "Como melhorar nossa comunicação.", 0, ["conflitos"]),
      opt("B", "Por que determinadas situações sempre se repetem.", 1, ["conflitos"]),
      opt("C", "Se alguns comportamentos dele realmente merecem atenção.", 2, [
        "conflitos",
        "duvida_percepcao",
      ]),
      opt("D", "Por que essa relação tem afetado tanto a forma como me sinto.", 3, [
        "impacto_emocional",
      ]),
    ],
  },

  // ---------- Refinamento ----------
  {
    id: 16,
    stage: "refinement",
    text: "Quando você estabelece um limite claro, como ele costuma reagir?",
    options: [
      opt("A", "Respeita mesmo que não concorde.", 0, ["limites"]),
      opt("B", "Questiona ou tenta negociar.", 1, ["limites"]),
      opt("C", "Fica irritado ou insiste.", 2, ["limites", "controle"]),
      opt("D", "Faz pressão até que eu recue.", 3, ["limites", "controle"]),
    ],
  },
  {
    id: 17,
    stage: "refinement",
    text: "Quando acontece uma discussão, quem normalmente acaba assumindo a maior parte da culpa?",
    options: [
      opt("A", "Nós dois reconhecemos nossa parte.", 0, ["responsabilidade"]),
      opt("B", "Às vezes eu assumo mais culpa.", 1, ["responsabilidade"]),
      opt("C", "Frequentemente sinto que a culpa acaba ficando comigo.", 2, [
        "inversao_culpa",
        "responsabilidade",
      ]),
      opt("D", "Quase sempre termino acreditando que fui responsável pelo problema.", 3, [
        "inversao_culpa",
        "duvida_percepcao",
      ]),
    ],
  },
  {
    id: 18,
    stage: "refinement",
    text: "Você já começou uma conversa tentando explicar algo que ele fez e terminou se desculpando por alguma coisa que você fez?",
    options: [
      opt("A", "Nunca.", 0, ["inversao_culpa"]),
      opt("B", "Uma ou duas vezes.", 1, ["inversao_culpa"]),
      opt("C", "Isso já aconteceu várias vezes.", 2, ["inversao_culpa", "conflitos"]),
      opt("D", "Isso acontece com frequência.", 3, ["inversao_culpa", "conflitos"]),
    ],
  },
  {
    id: 19,
    stage: "refinement",
    text: "Quando você está magoada com uma atitude dele, como ele costuma responder?",
    options: [
      opt("A", "Procura entender o que senti.", 0, ["empatia"]),
      opt("B", "Fica defensivo.", 1, ["empatia"]),
      opt("C", "Diz que estou exagerando ou interpretando errado.", 3, [
        "empatia",
        "duvida_percepcao",
      ]),
      opt("D", "Transforma a situação em uma discussão sobre meus defeitos.", 3, [
        "empatia",
        "inversao_culpa",
      ]),
    ],
  },
  {
    id: 20,
    stage: "refinement",
    text: "Depois de determinadas discussões, você costuma ficar pensando se realmente aconteceu algo errado ou se você está exagerando?",
    options: [
      opt("A", "Nunca.", 0, ["duvida_percepcao"]),
      opt("B", "Raramente.", 1, ["duvida_percepcao"]),
      opt("C", "Às vezes.", 2, ["duvida_percepcao"]),
      opt("D", "Frequentemente.", 3, ["duvida_percepcao", "impacto_emocional"]),
    ],
  },

  // ---------- Pergunta crucial ----------
  {
    id: 21,
    stage: "crucial",
    weight: 2,
    text: "Pensando em tudo o que você vive ao lado dele, qual dessas frases mais representa o que você sente hoje?",
    options: [
      opt("A", "Eu ainda acredito que ele pode mudar, só não sei mais como lidar com isso.", 1, [
        "impacto_emocional",
      ]),
      opt("B", "Muitas vezes sinto que estou sempre tentando entender o que fiz de errado.", 2, [
        "impacto_emocional",
        "inversao_culpa",
      ]),
      opt(
        "C",
        "Já percebi comportamentos que me machucam, mas às vezes fico em dúvida se estou exagerando.",
        2,
        ["impacto_emocional", "duvida_percepcao"],
      ),
      opt(
        "D",
        "Sinto que essa relação mudou a forma como eu me enxergo e como me sinto comigo mesma.",
        3,
        ["impacto_emocional", "duvida_percepcao"],
      ),
      opt(
        "E",
        "Não sei exatamente o que está acontecendo, mas alguma coisa nessa relação não parece normal.",
        2,
        ["impacto_emocional"],
      ),
    ],
  },
];

export const CORE_QUESTIONS = QUESTIONS.filter((q) => q.stage === "core");
export const REFINEMENT_QUESTIONS = QUESTIONS.filter((q) => q.stage === "refinement");
export const CRUCIAL_QUESTION = QUESTIONS.find((q) => q.stage === "crucial")!;

export type ResultLevel = {
  level: 1 | 2 | 3 | 4;
  /** limite superior de intensidade (0–100), inclusivo */
  maxIntensity: number;
  title: string;
  text: string;
  previewLead: string;
  observe: string[];
};

export const RESULT_LEVELS: ResultLevel[] = [
  {
    level: 1,
    maxIntensity: 24,
    title: "Poucos sinais identificados",
    text: "Suas respostas apresentam poucos padrões comportamentais preocupantes neste momento. Isso não significa que todos os aspectos da relação estejam bem ou mal, mas os sinais relatados não indicam uma concentração elevada de comportamentos problemáticos.",
    previewLead: "Identificamos poucos padrões de risco, e alguns pontos que ainda merecem observação.",
    observe: [
      "Como cada um responde quando o outro levanta um incômodo.",
      "Se os combinados feitos em momentos calmos se sustentam nos momentos de conflito.",
      "Se você consegue falar o que sente sem ensaiar antes.",
    ],
  },
  {
    level: 2,
    maxIntensity: 44,
    title: "Alguns padrões merecem atenção",
    text: "Suas respostas apresentam alguns comportamentos que merecem ser observados com mais cuidado, especialmente em situações de conflito, limites e comunicação.",
    previewLead: "Identificamos um padrão que merece sua atenção.",
    observe: [
      "Com que frequência a conversa sai do assunto inicial.",
      "O que acontece nas primeiras horas depois de um desentendimento.",
      "Quantas vezes você reformula o que sente para evitar uma reação.",
      "Se pedir desculpas virou algo que só parte de um lado.",
    ],
  },
  {
    level: 3,
    maxIntensity: 66,
    title: "Padrões significativos merecem atenção",
    text: "Suas respostas mostram uma concentração relevante de comportamentos que podem estar afetando a dinâmica da relação, especialmente relacionados à responsabilidade, limites, empatia e conflitos.",
    previewLead: "Identificamos uma concentração relevante de padrões que merecem sua atenção.",
    observe: [
      "O que acontece imediatamente depois de você dizer um 'não'.",
      "Se as discussões terminam com o assunto resolvido ou com você se explicando.",
      "Se sua leitura dos fatos costuma ser contestada depois.",
      "Como você se sente fisicamente após determinadas conversas.",
      "Quais assuntos você já parou de trazer para evitar desgaste.",
    ],
  },
  {
    level: 4,
    maxIntensity: 100,
    title: "Um padrão intenso merece atenção",
    text: "Suas respostas apresentam uma concentração elevada de comportamentos preocupantes e um impacto emocional relevante. Isso não permite diagnosticar ninguém, mas indica que vale a pena olhar com bastante atenção para os padrões descritos.",
    previewLead: "Identificamos um padrão intenso, com impacto emocional relevante.",
    observe: [
      "Se você tem registrado (para si mesma) o que realmente foi dito nas conversas.",
      "Se existe alguém de confiança acompanhando o que você está vivendo.",
      "O que acontece com você nas horas seguintes a uma discussão.",
      "Se limites já comunicados continuam sendo ultrapassados.",
      "Quanto da sua energia diária vai para administrar a reação dele.",
      "Se existe algum momento em que você se sente insegura fisicamente.",
    ],
  },
];

export const PRODUCT = {
  id: "analise-completa-v1",
  name: "Análise completa personalizada",
  amountCents: 1990,
  currency: "BRL",
  /** URL de checkout do gateway (Cakto). Trocável sem tocar no restante do código. */
  checkoutUrl: "https://pay.cakto.com.br/",
  salesPageUrl: "https://manualdonarcisista2.netlify.app/",
} as const;

export const COPY = {
  brand: "Além do Espelho",
  headline: "Será que os comportamentos dele estão dizendo mais do que você imagina?",
  subheadline:
    "Responda algumas perguntas sobre a sua relação e descubra quais padrões de comportamento aparecem com mais força nas situações que você vive.",
  ctaStart: "COMEÇAR MINHA ANÁLISE",
  microcopy: "Leva poucos minutos • Respostas confidenciais",
  expectation: "Você receberá uma análise personalizada com base nas suas respostas.",
  disclaimer:
    "Esta análise é uma ferramenta educativa de reflexão baseada nas respostas fornecidas. Ela não constitui diagnóstico psicológico ou psiquiátrico e não substitui avaliação profissional.",
  safety:
    "Se você estiver vivendo situações de abuso, ameaça ou risco à sua segurança, procure apoio profissional e serviços locais de proteção. No Brasil, a Central de Atendimento à Mulher atende pelo número 180, 24 horas por dia.",
  reflection:
    "Independentemente do rótulo, o mais importante é observar como esses comportamentos afetam você e a dinâmica da relação.",
} as const;

export const ANALYSIS_CHECKS = [
  "Comunicação",
  "Responsabilidade",
  "Respeito aos limites",
  "Empatia",
  "Conflitos",
  "Impacto emocional",
] as const;
