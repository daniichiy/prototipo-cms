// Rótulo fixo dos canais criados pelo bloco "Central de Atendimento" do
// formulário de local de atendimento — usado para separá-los dos canais
// adicionais na hora de reabrir o formulário.
export const ROTULO_CENTRAL = "Central de Atendimento";

// O tipo do canal já serve de rótulo; só "Outro" pede um rótulo digitado
// (ex.: "WhatsApp da Glória").
export const TIPO_CANAL_OUTRO = "outro";

export const TIPOS_CANAL = [
  { valor: "telefone", label: "Telefone" },
  { valor: "whatsapp", label: "WhatsApp" },
  { valor: "email", label: "E-mail" },
  { valor: "ouvidoria", label: "Ouvidoria" },
  { valor: TIPO_CANAL_OUTRO, label: "Outro" },
];

export function rotuloDoTipoCanal(tipo: string): string {
  return TIPOS_CANAL.find((t) => t.valor === tipo)?.label ?? tipo;
}

export type CanalInput = { tipo: string; rotulo: string; valor: string };

/**
 * Todo campo do canal precisa chegar definido nos inputs: um `undefined` num
 * campo controlado faz o React reclamar que o input virou não controlado.
 */
export function normalizarCanal(canal: Partial<CanalInput>): CanalInput {
  return {
    tipo: canal.tipo || "telefone",
    rotulo: canal.rotulo ?? "",
    valor: canal.valor ?? "",
  };
}
