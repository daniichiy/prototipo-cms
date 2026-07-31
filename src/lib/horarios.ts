import { DIAS_SEMANA } from "@/lib/masks";

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
