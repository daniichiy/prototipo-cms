import { DIAS_SEMANA } from "@/lib/masks";

/** Órgãos disponíveis no cadastro — o formulário só oferece estas opções. */
export const ORGAOS_DISPONIVEIS = [
  {
    sigla: "AGEPEN",
    nome: "Agência Estadual de Administração do Sistema Penitenciário",
  },
  { sigla: "DETRAN", nome: "Departamento Estadual de Trânsito" },
  {
    sigla: "SEJUSP",
    nome: "Secretaria de Estado de Justiça e Segurança Pública",
  },
  { sigla: "SES", nome: "Secretaria de Estado de Saúde" },
];

/** Nome completo a partir da sigla escolhida no select. */
export function nomeDoOrgao(sigla: string): string | null {
  return ORGAOS_DISPONIVEIS.find((o) => o.sigla === sigla)?.nome ?? null;
}

export const PERFIS_USUARIO = [
  "Gerente",
  "Administrador",
  "Atendente",
  "Gestor de conteúdo",
];

/** "1,2,3" -> [1, 2, 3] */
export function parseDiasSemana(csv: string): number[] {
  return csv
    .split(",")
    .map((d) => Number(d.trim()))
    .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7);
}

/** [3, 1, 2] -> "1,2,3" */
export function serializeDiasSemana(dias: number[]): string {
  return [...new Set(dias)].sort((a, b) => a - b).join(",");
}

/** [1, 2, 5] -> "Segunda, Terça, Sexta" */
export function formatDiasSemana(dias: number[]): string {
  return dias
    .map((d) => DIAS_SEMANA.find((ds) => ds.valor === d)?.label)
    .filter(Boolean)
    .join(", ");
}

/** ("07:30", "11:30") -> "07:30 às 11:30" */
export function formatFaixaHorario(
  inicio?: string | null,
  fim?: string | null
): string | null {
  if (!inicio || !fim) return null;
  return `${inicio} às ${fim}`;
}

/**
 * Monta as linhas de horário exibidas no detalhe do órgão.
 * Com intervalo: duas faixas (manhã e tarde). Sem intervalo: uma faixa corrida.
 */
export function formatHorario(faixa: {
  temIntervalo: boolean;
  inicioManha: string;
  fimManha?: string | null;
  inicioTarde?: string | null;
  fimTarde: string;
}): string[] {
  if (!faixa.temIntervalo) {
    const corrido = formatFaixaHorario(faixa.inicioManha, faixa.fimTarde);
    return corrido ? [corrido] : [];
  }
  return [
    formatFaixaHorario(faixa.inicioManha, faixa.fimManha),
    formatFaixaHorario(faixa.inicioTarde, faixa.fimTarde),
  ].filter((f): f is string => f !== null);
}

export function formatDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
