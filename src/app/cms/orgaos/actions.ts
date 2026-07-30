"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { serializeDiasSemana } from "@/lib/orgao";

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim();
}

function textoOuNulo(formData: FormData, campo: string) {
  return texto(formData, campo) || null;
}

function marcado(formData: FormData, campo: string) {
  return formData.get(campo) === "on";
}

async function ensureUniqueSlug(base: string, excludeId?: number) {
  const clean = base || "orgao";
  let slug = clean;
  let attempt = 1;
  while (true) {
    const existing = await prisma.orgao.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    attempt += 1;
    slug = `${clean}-${attempt}`;
  }
}

function revalidarOrgao(id: number) {
  revalidatePath("/cms/orgaos");
  revalidatePath(`/cms/orgaos/${id}`);
}

// ---------------------------------------------------------------- Órgão

function parseOrgao(formData: FormData) {
  return {
    nome: texto(formData, "nome"),
    sigla: texto(formData, "sigla"),
    slugInput: texto(formData, "slug"),
    site: textoOuNulo(formData, "site"),
    informacoes: textoOuNulo(formData, "informacoes"),
    identificadorControlador: textoOuNulo(formData, "identificadorControlador"),
    ativo: marcado(formData, "ativo"),
    orgaoExterno: marcado(formData, "orgaoExterno"),
    atendenteMultiLocal: marcado(formData, "atendenteMultiLocal"),
    ignoraRegrasAgendamento: marcado(formData, "ignoraRegrasAgendamento"),
  };
}

function assertOrgao(v: ReturnType<typeof parseOrgao>) {
  if (!v.nome) throw new Error("Nome é obrigatório.");
  if (!v.sigla) throw new Error("Sigla é obrigatória.");
}

export async function createOrgao(formData: FormData) {
  const v = parseOrgao(formData);
  assertOrgao(v);
  const slug = await ensureUniqueSlug(slugify(v.slugInput || v.sigla));

  const orgao = await prisma.orgao.create({
    data: {
      nome: v.nome,
      sigla: v.sigla,
      slug,
      site: v.site,
      informacoes: v.informacoes,
      identificadorControlador: v.identificadorControlador,
      ativo: v.ativo,
      orgaoExterno: v.orgaoExterno,
      atendenteMultiLocal: v.atendenteMultiLocal,
      ignoraRegrasAgendamento: v.ignoraRegrasAgendamento,
    },
  });

  revalidatePath("/cms/orgaos");
  redirect(`/cms/orgaos/${orgao.id}`);
}

export async function updateOrgao(id: number, formData: FormData) {
  const v = parseOrgao(formData);
  assertOrgao(v);
  const slug = await ensureUniqueSlug(slugify(v.slugInput || v.sigla), id);

  await prisma.orgao.update({
    where: { id },
    data: {
      nome: v.nome,
      sigla: v.sigla,
      slug,
      site: v.site,
      informacoes: v.informacoes,
      identificadorControlador: v.identificadorControlador,
      ativo: v.ativo,
      orgaoExterno: v.orgaoExterno,
      atendenteMultiLocal: v.atendenteMultiLocal,
      ignoraRegrasAgendamento: v.ignoraRegrasAgendamento,
    },
  });

  revalidarOrgao(id);
  redirect(`/cms/orgaos/${id}`);
}

export async function deleteOrgao(id: number) {
  const unidades = await prisma.pontoAtendimento.count({
    where: { orgaoId: id },
  });
  if (unidades > 0) {
    throw new Error(
      `Este órgão possui ${unidades} unidade(s) vinculada(s). Remova ou realoque as unidades antes de excluir.`
    );
  }

  await prisma.orgao.delete({ where: { id } });
  revalidatePath("/cms/orgaos");
}

// -------------------------------------------------------------- Contato

export async function upsertContato(orgaoId: number, formData: FormData) {
  const telefone = texto(formData, "telefone");
  const email = texto(formData, "email");
  if (!telefone) throw new Error("Informe um número de telefone.");
  if (!email) throw new Error("Informe um email válido.");

  const dados = {
    telefone,
    email,
    whatsapp: textoOuNulo(formData, "whatsapp"),
    instagram: textoOuNulo(formData, "instagram"),
    facebook: textoOuNulo(formData, "facebook"),
    twitter: textoOuNulo(formData, "twitter"),
    youtube: textoOuNulo(formData, "youtube"),
  };

  await prisma.orgaoContato.upsert({
    where: { orgaoId },
    update: dados,
    create: { orgaoId, ...dados },
  });

  revalidarOrgao(orgaoId);
  redirect(`/cms/orgaos/${orgaoId}`);
}

// ------------------------------------------------------------- Endereço

export async function upsertEndereco(orgaoId: number, formData: FormData) {
  const logradouro = texto(formData, "logradouro");
  const bairro = texto(formData, "bairro");
  const cep = texto(formData, "cep");
  const iframeMapa = texto(formData, "iframeMapa");
  const municipioId = Number(formData.get("municipioId"));
  const dias = JSON.parse(String(formData.get("diasSemanaJson") ?? "[]"));
  const temIntervalo = marcado(formData, "temIntervalo");

  if (!logradouro) throw new Error("Informe o endereço.");
  if (!bairro) throw new Error("Informe o bairro.");
  if (!cep) throw new Error("Informe o CEP.");
  if (!iframeMapa) throw new Error("Informe o source do mapa.");
  if (Number.isNaN(municipioId)) throw new Error("Selecione a cidade.");
  if (!Array.isArray(dias) || dias.length === 0) {
    throw new Error("Escolha ao menos um dia da semana.");
  }

  const dados = {
    municipioId,
    logradouro,
    complemento: textoOuNulo(formData, "complemento"),
    bairro,
    cep,
    iframeMapa,
    diasSemana: serializeDiasSemana(dias),
    temIntervalo,
    funcInicioManha: texto(formData, "funcInicioManha"),
    funcFimManha: temIntervalo ? textoOuNulo(formData, "funcFimManha") : null,
    funcInicioTarde: temIntervalo
      ? textoOuNulo(formData, "funcInicioTarde")
      : null,
    funcFimTarde: texto(formData, "funcFimTarde"),
    atendInicioManha: texto(formData, "atendInicioManha"),
    atendFimManha: temIntervalo ? textoOuNulo(formData, "atendFimManha") : null,
    atendInicioTarde: temIntervalo
      ? textoOuNulo(formData, "atendInicioTarde")
      : null,
    atendFimTarde: texto(formData, "atendFimTarde"),
  };

  await prisma.orgaoEndereco.upsert({
    where: { orgaoId },
    update: dados,
    create: { orgaoId, ...dados },
  });

  revalidarOrgao(orgaoId);
  redirect(`/cms/orgaos/${orgaoId}`);
}

// ---------------------------------------------------------------- Setor

export async function createSetor(orgaoId: number, formData: FormData) {
  const sigla = texto(formData, "sigla");
  const nome = texto(formData, "nome");
  if (!sigla) throw new Error("Informe a sigla do setor.");
  if (!nome) throw new Error("Informe um nome para o setor.");

  const duplicado = await prisma.setor.findUnique({
    where: { orgaoId_sigla: { orgaoId, sigla } },
  });
  if (duplicado) {
    throw new Error(`Já existe um setor com a sigla "${sigla}" neste órgão.`);
  }

  await prisma.setor.create({ data: { orgaoId, sigla, nome } });
  revalidarOrgao(orgaoId);
}

export async function toggleSetor(orgaoId: number, setorId: number) {
  const setor = await prisma.setor.findUnique({ where: { id: setorId } });
  if (!setor) throw new Error("Setor não encontrado.");

  await prisma.setor.update({
    where: { id: setorId },
    data: { ativo: !setor.ativo },
  });
  revalidarOrgao(orgaoId);
}

export async function deleteSetor(orgaoId: number, setorId: number) {
  await prisma.setor.delete({ where: { id: setorId } });
  revalidarOrgao(orgaoId);
}

// --------------------------------------------------------------- Gestor

function parseGestor(formData: FormData) {
  const nome = texto(formData, "nome");
  const biografia = texto(formData, "biografia");
  if (!nome) throw new Error("Informe o nome do gestor.");
  if (!biografia) throw new Error("Informe a biografia do gestor.");

  return {
    nome,
    biografia,
    fotoUrl: textoOuNulo(formData, "fotoUrl"),
    ativo: marcado(formData, "ativo"),
  };
}

export async function createGestor(orgaoId: number, formData: FormData) {
  await prisma.gestor.create({ data: { orgaoId, ...parseGestor(formData) } });
  revalidarOrgao(orgaoId);
  redirect(`/cms/orgaos/${orgaoId}?aba=gestores`);
}

export async function updateGestor(
  orgaoId: number,
  gestorId: number,
  formData: FormData
) {
  await prisma.gestor.update({
    where: { id: gestorId },
    data: parseGestor(formData),
  });
  revalidarOrgao(orgaoId);
  redirect(`/cms/orgaos/${orgaoId}?aba=gestores`);
}

export async function deleteGestor(orgaoId: number, gestorId: number) {
  await prisma.gestor.delete({ where: { id: gestorId } });
  revalidarOrgao(orgaoId);
}

// -------------------------------------------------------------- Usuário

export async function createUsuario(orgaoId: number, formData: FormData) {
  const pessoaId = Number(formData.get("pessoaId"));
  const perfil = texto(formData, "perfil");
  if (Number.isNaN(pessoaId)) throw new Error("Selecione o usuário.");
  if (!perfil) throw new Error("Selecione o perfil do usuário.");

  const duplicado = await prisma.orgaoUsuario.findUnique({
    where: { orgaoId_pessoaId: { orgaoId, pessoaId } },
  });
  if (duplicado) {
    throw new Error("Este usuário já está vinculado ao órgão.");
  }

  await prisma.orgaoUsuario.create({ data: { orgaoId, pessoaId, perfil } });
  revalidarOrgao(orgaoId);
}

export async function deleteUsuario(orgaoId: number, usuarioId: number) {
  await prisma.orgaoUsuario.delete({ where: { id: usuarioId } });
  revalidarOrgao(orgaoId);
}

// ----------------------------------------------------- Site relacionado

function parseSite(formData: FormData) {
  const titulo = texto(formData, "titulo");
  const link = texto(formData, "link");
  if (!titulo) throw new Error("Informe o título do site.");
  if (!link) throw new Error("Informe o link do site.");

  return { titulo, link, ativo: marcado(formData, "ativo") };
}

export async function createSite(orgaoId: number, formData: FormData) {
  await prisma.siteRelacionado.create({
    data: { orgaoId, ...parseSite(formData) },
  });
  revalidarOrgao(orgaoId);
  redirect(`/cms/orgaos/${orgaoId}?aba=sites`);
}

export async function updateSite(
  orgaoId: number,
  siteId: number,
  formData: FormData
) {
  await prisma.siteRelacionado.update({
    where: { id: siteId },
    data: parseSite(formData),
  });
  revalidarOrgao(orgaoId);
  redirect(`/cms/orgaos/${orgaoId}?aba=sites`);
}

export async function deleteSite(orgaoId: number, siteId: number) {
  await prisma.siteRelacionado.delete({ where: { id: siteId } });
  revalidarOrgao(orgaoId);
}
