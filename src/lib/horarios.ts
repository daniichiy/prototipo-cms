export type PeriodoInput = {
  dias: number[];
  temIntervalo: boolean;
  inicioManha: string;
  fimManha: string;
  inicioTarde: string;
  fimTarde: string;
};

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
