"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildHorarioRows, parsePeriodos } from "@/lib/horarios";
import { getTipoHorarioId } from "@/lib/tipoHorario";

// Cadastra (ou atualiza, se o nome já existir) um horário reutilizável.
export async function salvarModeloHorario(nome: string, periodosJson: string) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Informe um nome para o horário.");

  const periodos = parsePeriodos(periodosJson).filter(
    (p) => p.dias.length > 0 && p.inicioManha && p.fimTarde
  );
  if (!periodos.length) {
    throw new Error(
      "Preencha ao menos um período completo (dias, início e fim) antes de salvar."
    );
  }

  await prisma.modeloHorario.upsert({
    where: { nome: nomeLimpo },
    update: { periodosJson: JSON.stringify(periodos) },
    create: { nome: nomeLimpo, periodosJson: JSON.stringify(periodos) },
  });

  revalidatePath("/cms/horarios");
  revalidatePath("/cms/unidades");
}

export async function excluirModeloHorario(id: number) {
  await prisma.modeloHorario.delete({ where: { id } });
  revalidatePath("/cms/horarios");
}

// O "igual do alarme": um horário aplicado de uma vez a vários locais.
export async function aplicarModeloEmLocais(
  modeloId: number,
  tipoSlug: string,
  pontoIds: number[]
) {
  if (!pontoIds.length) {
    throw new Error("Selecione ao menos um local de atendimento.");
  }

  const modelo = await prisma.modeloHorario.findUnique({
    where: { id: modeloId },
  });
  if (!modelo) throw new Error("Horário não encontrado.");

  const tipoHorarioId = await getTipoHorarioId(tipoSlug);
  const rows = buildHorarioRows(parsePeriodos(modelo.periodosJson), tipoHorarioId);

  await prisma.$transaction(async (tx) => {
    await tx.horario.deleteMany({
      where: { pontoAtendimentoId: { in: pontoIds }, tipoHorarioId },
    });
    if (rows.length) {
      await tx.horario.createMany({
        data: pontoIds.flatMap((pontoAtendimentoId) =>
          rows.map((h) => ({ ...h, pontoAtendimentoId }))
        ),
      });
    }
  });

  revalidatePath("/cms/horarios");
  revalidatePath("/cms/unidades");
}
