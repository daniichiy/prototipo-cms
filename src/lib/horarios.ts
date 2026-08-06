import { DIAS_SEMANA } from "@/lib/masks";
import { parseDiasSemana } from "@/lib/orgao";

export type PeriodoInput = {
  dias: number[];
  temIntervalo: boolean;
  inicioManha: string;
  fimManha: string;
  inicioTarde: string;
  fimTarde: string;
};

export const PERIODO_VAZIO: PeriodoInput = {
  dias: [],
  temIntervalo: false,
  inicioManha: "",
  fimManha: "",
  inicioTarde: "",
  fimTarde: "",
};

// Os dois horários pedidos na pesquisa: o local pode estar em funcionamento
// (portas abertas) em uma faixa e atender o cidadão em outra.
export const TIPO_FUNCIONAMENTO = "funcionamento";
export const TIPO_ATENDIMENTO = "atendimento";

export const TIPOS_HORARIO = [
  { slug: TIPO_FUNCIONAMENTO, nome: "Horário de funcionamento" },
  { slug: TIPO_ATENDIMENTO, nome: "Horário de atendimento" },
];

type HorarioRow = {
  diaSemana: number;
  inicio: string;
  fim: string;
  periodo: string | null;
};

export function reconstructPeriods(horarios: HorarioRow[]): PeriodoInput[] {
  const semIntervalo = horarios.filter((h) => !h.periodo);
  const comIntervalo = horarios.filter((h) => h.periodo);

  const periods: PeriodoInput[] = [];

  const gruposSemIntervalo = new Map<string, number[]>();
  for (const h of semIntervalo) {
    const key = `${h.inicio}|${h.fim}`;
    const dias = gruposSemIntervalo.get(key) ?? [];
    dias.push(h.diaSemana);
    gruposSemIntervalo.set(key, dias);
  }
  for (const [key, dias] of gruposSemIntervalo) {
    const [inicio, fim] = key.split("|");
    periods.push({
      dias: dias.sort(),
      temIntervalo: false,
      inicioManha: inicio,
      fimManha: "",
      inicioTarde: "",
      fimTarde: fim,
    });
  }

  const porDia = new Map<
    number,
    { manha?: { inicio: string; fim: string }; tarde?: { inicio: string; fim: string } }
  >();
  for (const h of comIntervalo) {
    const entry = porDia.get(h.diaSemana) ?? {};
    if (h.periodo === "manha") entry.manha = { inicio: h.inicio, fim: h.fim };
    if (h.periodo === "tarde") entry.tarde = { inicio: h.inicio, fim: h.fim };
    porDia.set(h.diaSemana, entry);
  }

  const gruposComIntervalo = new Map<string, number[]>();
  for (const [dia, entry] of porDia) {
    const key = `${entry.manha?.inicio ?? ""}|${entry.manha?.fim ?? ""}|${
      entry.tarde?.inicio ?? ""
    }|${entry.tarde?.fim ?? ""}`;
    const dias = gruposComIntervalo.get(key) ?? [];
    dias.push(dia);
    gruposComIntervalo.set(key, dias);
  }
  for (const [key, dias] of gruposComIntervalo) {
    const [inicioManha, fimManha, inicioTarde, fimTarde] = key.split("|");
    periods.push({
      dias: dias.sort(),
      temIntervalo: true,
      inicioManha,
      fimManha,
      inicioTarde,
      fimTarde,
    });
  }

  return periods;
}

// O órgão guarda uma única faixa de horário por tipo (dias como CSV, direto em
// OrgaoEndereco); aqui ela vira o mesmo formato de períodos usado no formulário
// do local de atendimento, para poder ser oferecida como horário já cadastrado.
export type FaixaHorarioOrgao = {
  diasSemana: string;
  temIntervalo: boolean;
  inicioManha: string;
  fimManha?: string | null;
  inicioTarde?: string | null;
  fimTarde: string;
};

type EnderecoOrgaoHorarios = {
  diasSemana: string;
  temIntervalo: boolean;
  funcInicioManha: string;
  funcFimManha: string | null;
  funcInicioTarde: string | null;
  funcFimTarde: string;
  atendInicioManha: string;
  atendFimManha: string | null;
  atendInicioTarde: string | null;
  atendFimTarde: string;
};

/** Os dois horários do órgão no formato de períodos do formulário. */
export function periodosDoOrgao(
  endereco: EnderecoOrgaoHorarios | null | undefined
): { funcionamento: PeriodoInput[]; atendimento: PeriodoInput[] } {
  if (!endereco) return { funcionamento: [], atendimento: [] };
  const { diasSemana, temIntervalo } = endereco;
  return {
    funcionamento: periodosDaFaixaOrgao({
      diasSemana,
      temIntervalo,
      inicioManha: endereco.funcInicioManha,
      fimManha: endereco.funcFimManha,
      inicioTarde: endereco.funcInicioTarde,
      fimTarde: endereco.funcFimTarde,
    }),
    atendimento: periodosDaFaixaOrgao({
      diasSemana,
      temIntervalo,
      inicioManha: endereco.atendInicioManha,
      fimManha: endereco.atendFimManha,
      inicioTarde: endereco.atendInicioTarde,
      fimTarde: endereco.atendFimTarde,
    }),
  };
}

export function periodosDaFaixaOrgao(
  faixa: FaixaHorarioOrgao | null | undefined
): PeriodoInput[] {
  if (!faixa) return [];
  const dias = parseDiasSemana(faixa.diasSemana);
  if (!dias.length || !faixa.inicioManha || !faixa.fimTarde) return [];
  return [
    {
      dias,
      temIntervalo: faixa.temIntervalo,
      inicioManha: faixa.inicioManha,
      fimManha: faixa.temIntervalo ? faixa.fimManha ?? "" : "",
      inicioTarde: faixa.temIntervalo ? faixa.inicioTarde ?? "" : "",
      fimTarde: faixa.fimTarde,
    },
  ];
}

export function buildHorarioRows(
  periods: PeriodoInput[],
  tipoHorarioId: number
) {
  const rows: {
    diaSemana: number;
    inicio: string;
    fim: string;
    periodo: string | null;
    tipoHorarioId: number;
  }[] = [];

  for (const periodo of periods) {
    if (!periodo.inicioManha || !periodo.fimTarde) continue;
    for (const dia of periodo.dias) {
      if (periodo.temIntervalo) {
        rows.push({
          diaSemana: dia,
          inicio: periodo.inicioManha,
          fim: periodo.fimManha,
          periodo: "manha",
          tipoHorarioId,
        });
        rows.push({
          diaSemana: dia,
          inicio: periodo.inicioTarde,
          fim: periodo.fimTarde,
          periodo: "tarde",
          tipoHorarioId,
        });
      } else {
        rows.push({
          diaSemana: dia,
          inicio: periodo.inicioManha,
          fim: periodo.fimTarde,
          periodo: null,
          tipoHorarioId,
        });
      }
    }
  }

  return rows;
}

// Todo campo precisa chegar definido nos inputs do formulário: um objeto vindo
// de JSON sem alguma chave tornaria o input não controlado no primeiro render.
export function normalizarPeriodo(periodo: Partial<PeriodoInput>): PeriodoInput {
  return {
    dias: Array.isArray(periodo.dias) ? periodo.dias.map(Number) : [],
    temIntervalo: Boolean(periodo.temIntervalo),
    inicioManha: periodo.inicioManha ?? "",
    fimManha: periodo.fimManha ?? "",
    inicioTarde: periodo.inicioTarde ?? "",
    fimTarde: periodo.fimTarde ?? "",
  };
}

// ------------------------------------------- horário dia a dia x agrupado
//
// O formulário guarda sempre PeriodoInput[]. No modo "um horário por dia" cada
// item tem exatamente um dia; no modo agrupado, os dias que compartilham a
// mesma faixa ficam juntos no mesmo item. As duas funções abaixo convertem
// entre os dois formatos quando o usuário alterna o modo.

function chaveHorario(p: PeriodoInput): string {
  return [
    p.temIntervalo ? 1 : 0,
    p.inicioManha,
    p.fimManha,
    p.inicioTarde,
    p.fimTarde,
  ].join("|");
}

/** Um período por dia da semana, na ordem da semana. */
export function explodirPorDia(periodos: PeriodoInput[]): PeriodoInput[] {
  const porDia = new Map<number, PeriodoInput>();
  for (const periodo of periodos) {
    for (const dia of periodo.dias) {
      porDia.set(dia, { ...normalizarPeriodo(periodo), dias: [dia] });
    }
  }
  return [...porDia.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, periodo]) => periodo);
}

/** Junta em um único período os dias que têm exatamente o mesmo horário. */
export function agruparPorHorario(periodos: PeriodoInput[]): PeriodoInput[] {
  const grupos = new Map<string, PeriodoInput>();
  for (const periodo of periodos) {
    if (!periodo.dias.length) continue;
    const chave = chaveHorario(periodo);
    const grupo = grupos.get(chave);
    if (grupo) {
      grupo.dias = [...new Set([...grupo.dias, ...periodo.dias])].sort(
        (a, b) => a - b
      );
      continue;
    }
    grupos.set(chave, {
      ...normalizarPeriodo(periodo),
      dias: [...periodo.dias].sort((a, b) => a - b),
    });
  }
  const lista = [...grupos.values()];
  return lista.length ? lista : [{ ...PERIODO_VAZIO }];
}

/** Só faz sentido tratar como "por dia" quando cada item tem um único dia. */
export function pareceHorarioPorDia(periodos: PeriodoInput[]): boolean {
  return periodos.length > 1 && periodos.every((p) => p.dias.length === 1);
}

export function parsePeriodos(json: string): PeriodoInput[] {
  try {
    const dados = JSON.parse(json);
    return Array.isArray(dados) ? dados.map(normalizarPeriodo) : [];
  } catch {
    return [];
  }
}

function rotuloDias(dias: number[]): string {
  if (dias.length === 0) return "sem dias";
  const ordenados = [...dias].sort((a, b) => a - b);
  const nomes = ordenados.map(
    (d) => DIAS_SEMANA.find((x) => x.valor === d)?.label ?? String(d)
  );
  const sequencial = ordenados.every(
    (d, i) => i === 0 || d === ordenados[i - 1] + 1
  );
  if (sequencial && ordenados.length > 2) {
    return `${nomes[0]} a ${nomes[nomes.length - 1]}`;
  }
  return nomes.join(", ");
}

// Ex.: "Segunda a Sexta, 07:30–11:30 e 13:30–17:30"
export function resumoPeriodo(periodo: PeriodoInput): string {
  const faixas = periodo.temIntervalo
    ? `${periodo.inicioManha}–${periodo.fimManha} e ${periodo.inicioTarde}–${periodo.fimTarde}`
    : `${periodo.inicioManha}–${periodo.fimTarde}`;
  return `${rotuloDias(periodo.dias)}, ${faixas}`;
}

export function resumoPeriodos(periodos: PeriodoInput[]): string {
  return periodos.map(resumoPeriodo).join(" | ");
}
