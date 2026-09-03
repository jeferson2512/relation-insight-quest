/**
 * Cálculo determinístico do resultado + geração do conteúdo premium.
 * Este módulo NUNCA vai para o navegador (sufixo .server).
 */
import {
  DIMENSION_LABELS,
  QUESTIONS,
  RESULT_LEVELS,
  type Dimension,
  type ResultLevel,
} from "./quiz-config";

export type Answers = Record<string, string>;

export type DimensionScore = {
  dimension: Dimension;
  label: string;
  /** 0–100 */
  intensity: number;
};

export type ComputedResult = {
  resultId: string;
  level: ResultLevel["level"];
  levelTitle: string;
  previewLead: string;
  intensity: number;
  dimensions: DimensionScore[];
  /** eixos de maior intensidade, usados na prévia */
  topDimensions: string[];
  computedAt: string;
};

export type FullAnalysis = {
  levelText: string;
  patterns: { label: string; intensity: number; note: string }[];
  explanation: string[];
  observe: string[];
  reflection: string;
};

const LEVEL_TEXT: Record<number, string> = {
  1: "Suas respostas apresentam poucos padrões comportamentais preocupantes neste momento. Isso não significa que todos os aspectos da relação estejam bem ou mal, mas os sinais relatados não indicam uma concentração elevada de comportamentos problemáticos.",
  2: "Suas respostas apresentam alguns comportamentos que merecem ser observados com mais cuidado, especialmente em situações de conflito, limites e comunicação.",
  3: "Suas respostas mostram uma concentração relevante de comportamentos que podem estar afetando a dinâmica da relação, especialmente relacionados à responsabilidade, limites, empatia e conflitos.",
  4: "Suas respostas apresentam uma concentração elevada de comportamentos preocupantes e um impacto emocional relevante. Isso não permite diagnosticar ninguém, mas indica que vale a pena olhar com bastante atenção para os padrões descritos.",
};

const LEVEL_OBSERVE: Record<number, string[]> = {
  1: [
    "Como cada um responde quando o outro levanta um incômodo.",
    "Se os combinados feitos em momentos calmos se sustentam nos momentos de conflito.",
    "Se você consegue falar o que sente sem ensaiar antes.",
  ],
  2: [
    "Com que frequência a conversa sai do assunto inicial.",
    "O que acontece nas primeiras horas depois de um desentendimento.",
    "Quantas vezes você reformula o que sente para evitar uma reação.",
    "Se pedir desculpas virou algo que parte só de um lado.",
  ],
  3: [
    "O que acontece imediatamente depois de você dizer um “não”.",
    "Se as discussões terminam com o assunto resolvido ou com você se explicando.",
    "Se sua leitura dos fatos costuma ser contestada depois.",
    "Como você se sente fisicamente após determinadas conversas.",
    "Quais assuntos você já parou de trazer para evitar desgaste.",
  ],
  4: [
    "Se você tem registrado, para si mesma, o que realmente foi dito nas conversas.",
    "Se existe alguém de confiança acompanhando o que você está vivendo.",
    "O que acontece com você nas horas seguintes a uma discussão.",
    "Se limites já comunicados continuam sendo ultrapassados.",
    "Quanto da sua energia diária vai para administrar a reação dele.",
    "Se existe algum momento em que você se sente insegura fisicamente.",
  ],
};

const DIMENSION_NOTES: Record<Dimension, { high: string; mid: string; low: string }> = {
  responsabilidade: {
    high: "Nas situações que você descreveu, o reconhecimento de erro raramente parte dele, e a reparação tende a ficar do seu lado.",
    mid: "Suas respostas sugerem que assumir responsabilidade acontece, mas com dificuldade e geralmente depois de bastante desgaste.",
    low: "Pelas situações que você relatou, existe abertura para reconhecer erros dos dois lados.",
  },
  empatia: {
    high: "Quando você expressa dor, suas respostas indicam que o foco tende a sair do que você sentiu.",
    mid: "A escuta aparece em alguns momentos, mas suas respostas sugerem que ela nem sempre alcança o que você sentiu.",
    low: "Suas respostas indicam espaço para que o que você sente seja escutado.",
  },
  limites: {
    high: "Esse padrão pode aparecer quando um limite deixa de ser tratado como decisão e passa a ser tratado como negociação — até você recuar.",
    mid: "Seus limites parecem ser questionados com frequência antes de serem aceitos.",
    low: "Os limites que você descreveu tendem a ser respeitados.",
  },
  controle: {
    high: "Suas respostas sugerem um ambiente em que você antecipa reações e ajusta o que diz para evitá-las.",
    mid: "Há momentos em que você mede as palavras para evitar uma reação negativa.",
    low: "Você relatou pouca necessidade de filtrar o que diz.",
  },
  inversao_culpa: {
    high: "Nas situações descritas, conversas iniciadas por você terminam com você se defendendo ou se desculpando.",
    mid: "Em alguns conflitos, a responsabilidade parece migrar para o seu lado ao longo da conversa.",
    low: "As conversas costumam permanecer no assunto original.",
  },
  conflitos: {
    high: "As discussões relatadas tendem a se expandir para outros temas e terminar sem resolução do ponto inicial.",
    mid: "Os conflitos às vezes desviam do assunto que motivou a conversa.",
    low: "Os conflitos descritos tendem a se manter no tema e chegar a algum desfecho.",
  },
  impacto_emocional: {
    high: "O custo emocional que você descreveu é relevante: confusão, cansaço e questionamento sobre si mesma aparecem com força.",
    mid: "Existe um desgaste emocional perceptível depois de determinadas discussões.",
    low: "O desgaste emocional relatado é pontual.",
  },
  duvida_percepcao: {
    high: "Suas respostas apontam para algo importante: você tem duvidado da sua própria leitura dos fatos com frequência.",
    mid: "Em alguns momentos você sai das conversas em dúvida sobre a própria percepção.",
    low: "Você relatou manter clareza sobre a sua percepção dos fatos.",
  },
};

function dimensionNote(dimension: Dimension, intensity: number): string {
  const notes = DIMENSION_NOTES[dimension];
  if (intensity >= 60) return notes.high;
  if (intensity >= 30) return notes.mid;
  return notes.low;
}

export function computeResult(answers: Answers, resultId: string): ComputedResult {
  const totals = new Map<Dimension, { score: number; max: number }>();
  let totalScore = 0;
  let totalMax = 0;

  for (const question of QUESTIONS) {
    const chosen = answers[String(question.id)];
    if (!chosen) continue;
    const option = question.options.find((o) => o.id === chosen);
    if (!option) continue;

    const weight = question.weight ?? 1;
    totalScore += option.score * weight;
    totalMax += 3 * weight;

    for (const dimension of question.dimensions ?? []) void dimension;
    for (const dimension of option.dimensions) {
      const current = totals.get(dimension) ?? { score: 0, max: 0 };
      current.score += option.score * weight;
      totals.set(dimension, current);
    }
    // O máximo por dimensão considera todas as alternativas possíveis daquela
    // pergunta, para que a intensidade seja comparável entre dimensões.
    const questionDimensions = new Set(question.options.flatMap((o) => o.dimensions));
    for (const dimension of questionDimensions) {
      const current = totals.get(dimension) ?? { score: 0, max: 0 };
      current.max += 3 * weight;
      totals.set(dimension, current);
    }
  }

  const intensity = totalMax === 0 ? 0 : Math.round((totalScore / totalMax) * 100);
  const levelConfig =
    RESULT_LEVELS.find((l) => intensity <= l.maxIntensity) ?? RESULT_LEVELS[RESULT_LEVELS.length - 1]!;

  const dimensions: DimensionScore[] = [...totals.entries()]
    .map(([dimension, { score, max }]) => ({
      dimension,
      label: DIMENSION_LABELS[dimension],
      intensity: max === 0 ? 0 : Math.round((score / max) * 100),
    }))
    .sort((a, b) => b.intensity - a.intensity);

  return {
    resultId,
    level: levelConfig.level,
    levelTitle: levelConfig.title,
    previewLead: levelConfig.previewLead,
    intensity,
    dimensions,
    topDimensions: dimensions.slice(0, 3).map((d) => d.label),
    computedAt: new Date().toISOString(),
  };
}

export function buildFullAnalysis(result: ComputedResult, firstName?: string | null): FullAnalysis {
  const patterns = result.dimensions.slice(0, 5).map((d) => ({
    label: d.label,
    intensity: d.intensity,
    note: dimensionNote(d.dimension, d.intensity),
  }));

  const strongest = result.dimensions[0];
  const second = result.dimensions[1];
  const greeting = firstName ? `${firstName}, ` : "";

  const explanation = [
    `${greeting}nas situações que você descreveu, o padrão que apareceu com mais força foi “${strongest?.label ?? "conflitos"}”. Isso não descreve quem ele é: descreve o que se repete nas cenas que você relatou.`,
    second
      ? `Logo em seguida aparece “${second.label}”. Quando esses dois pontos caminham juntos, é comum que uma conversa comece por um assunto e termine em outro — e que a sensação final seja de cansaço, não de solução.`
      : "Quando um único eixo concentra a maior parte dos sinais, costuma ser nele que a relação trava com mais frequência.",
    result.intensity >= 45
      ? "Suas respostas sugerem que esse conjunto já está cobrando um preço emocional de você: energia gasta em antecipar reações, dúvidas sobre a própria percepção e pouca sensação de resolução."
      : "Suas respostas sugerem que esses pontos ainda aparecem de forma pontual, o que costuma tornar mais viável nomear e conversar sobre eles.",
    "Esse padrão pode aparecer em relações muito diferentes entre si. O que importa aqui não é o rótulo, e sim a frequência com que essas cenas se repetem e o efeito delas em você.",
  ];

  return {
    levelText: LEVEL_TEXT[result.level]!,
    patterns,
    explanation,
    observe: LEVEL_OBSERVE[result.level]!,
    reflection:
      "Independentemente do rótulo, o mais importante é observar como esses comportamentos afetam você e a dinâmica da relação.",
  };
}
