import { prisma } from "@/lib/prisma";
import { TIPOS_HORARIO } from "@/lib/horarios";

// Garante que os tipos "funcionamento" e "atendimento" existam e devolve o id
// do tipo pedido.
export async function getTipoHorarioId(slug: string): Promise<number> {
  const existente = await prisma.tipoHorario.findUnique({ where: { slug } });
  if (existente) return existente.id;

  const nome =
    TIPOS_HORARIO.find((t) => t.slug === slug)?.nome ?? `Horário ${slug}`;
  const criado = await prisma.tipoHorario.create({ data: { nome, slug } });
  return criado.id;
}
