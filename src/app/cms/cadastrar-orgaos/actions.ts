"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim();
}

function parseOrgaoCadastro(formData: FormData) {
  const sigla = texto(formData, "sigla").toUpperCase();
  const nome = texto(formData, "nome");
  if (!sigla) throw new Error("Informe a sigla do órgão.");
  if (!nome) throw new Error("Informe o nome do órgão.");

  return { sigla, nome, ativo: formData.get("ativo") === "on" };
}

/** A sigla identifica o órgão no catálogo — não pode se repetir. */
async function garantirSiglaLivre(sigla: string, excludeId?: number) {
  const existente = await prisma.orgaoCadastro.findUnique({ where: { sigla } });
  if (existente && existente.id !== excludeId) {
    throw new Error(`Já existe um órgão cadastrado com a sigla "${sigla}".`);
  }
}

export async function createOrgaoCadastro(formData: FormData) {
  const v = parseOrgaoCadastro(formData);
  await garantirSiglaLivre(v.sigla);

  await prisma.orgaoCadastro.create({ data: v });

  revalidatePath("/cms/cadastrar-orgaos");
  redirect("/cms/cadastrar-orgaos");
}

export async function updateOrgaoCadastro(id: number, formData: FormData) {
  const v = parseOrgaoCadastro(formData);
  await garantirSiglaLivre(v.sigla, id);

  await prisma.orgaoCadastro.update({ where: { id }, data: v });

  revalidatePath("/cms/cadastrar-orgaos");
  redirect("/cms/cadastrar-orgaos");
}

export async function deleteOrgaoCadastro(id: number) {
  await prisma.orgaoCadastro.delete({ where: { id } });
  revalidatePath("/cms/cadastrar-orgaos");
}
