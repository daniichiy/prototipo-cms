"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { nomeDoOrgao, serializeDiasSemana } from "@/lib/orgao";
import { TIPO_CANAL_OUTRO, rotuloDoTipoCanal } from "@/lib/contato";

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

// O formulário oferece apenas as siglas de ORGAOS_DISPONIVEIS; o nome completo
// vem da própria lista.
function parseOrgao(formData: FormData) {
  const sigla = texto(formData, "sigla");
  if (!sigla) throw new Error("Selecione o órgão.");

  const nome = nomeDoOrgao(sigla);
  if (!nome) throw new Error(`Órgão "${sigla}" não está na lista de opções.`);

  return { nome, sigla };
}

export async function createOrgao(formData: FormData) {
  const v = parseOrgao(formData);
  // o slug deixou de ser preenchido no formulário: sai da sigla
  const slug = await ensureUniqueSlug(slugify(v.sigla));

  // contato e endereço vêm no mesmo formulário; ficam nulos quando não preenchidos
  const contato = parseContato(formData);
  const endereco = parseEndereco(formData);

  const orgao = await prisma.orgao.create({
    data: {
      nome: v.nome,
      sigla: v.sigla,
      slug,
      contato: contato ? { create: contato.contato } : undefined,
      canais: contato?.canais.length ? { create: contato.canais } : undefined,
      endereco: endereco ? { create: endereco } : undefined,
    },
  });

  revalidatePath("/cms/orgaos");
  redirect(`/cms/orgaos/${orgao.id}`);
}

export async function updateOrgao(id: number, formData: FormData) {
  const v = parseOrgao(formData);
  const slug = await ensureUniqueSlug(slugify(v.sigla), id);

  const contato = parseContato(formData);
  const endereco = parseEndereco(formData);

  await prisma.orgao.update({
    where: { id },
    data: {
      nome: v.nome,
      sigla: v.sigla,
      slug,
      contato: contato
        ? { upsert: { create: contato.contato, update: contato.contato } }
        : undefined,
      // os canais são substituídos por inteiro a cada salvamento
      canais: contato
        ? { deleteMany: {}, create: contato.canais }
        : undefined,
      endereco: endereco
        ? { upsert: { create: endereco, update: endereco } }
        : undefined,
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

type CanalInput = { tipo: string; rotulo: string; valor: string };

/** Canais adicionais do órgão; fora de "Outro", o tipo é o próprio rótulo. */
function parseCanais(formData: FormData): CanalInput[] {
  let dados: unknown;
  try {
    dados = JSON.parse(String(formData.get("canaisContatoJson") ?? "[]"));
  } catch {
    return [];
  }
  if (!Array.isArray(dados)) return [];

  return (dados as CanalInput[])
    .filter((c) => String(c?.valor ?? "").trim())
    .map((c) => ({
      tipo: String(c.tipo ?? "").trim() || TIPO_CANAL_OUTRO,
      rotulo:
        c.tipo === TIPO_CANAL_OUTRO
          ? String(c.rotulo ?? "").trim()
          : rotuloDoTipoCanal(String(c.tipo ?? "")),
      valor: String(c.valor).trim(),
    }));
}

/** Retorna null quando nenhum campo de contato foi preenchido (seção opcional). */
function parseContato(formData: FormData) {
  const responsavel = texto(formData, "responsavel");
  const telefone = texto(formData, "telefone");
  const email = texto(formData, "email");
  const canais = parseCanais(formData);

  if (!responsavel && !telefone && !email && canais.length === 0) return null;

  if (!telefone) throw new Error("Informe um número de telefone.");
  if (!email) throw new Error("Informe um email válido.");

  return {
    contato: { responsavel: responsavel || null, telefone, email },
    canais,
  };
}

export async function upsertContato(orgaoId: number, formData: FormData) {
  const dados = parseContato(formData);
  if (!dados) throw new Error("Informe ao menos telefone e email.");

  await prisma.$transaction([
    prisma.orgaoContato.upsert({
      where: { orgaoId },
      update: dados.contato,
      create: { orgaoId, ...dados.contato },
    }),
    prisma.orgaoCanalContato.deleteMany({ where: { orgaoId } }),
    prisma.orgaoCanalContato.createMany({
      data: dados.canais.map((c) => ({ orgaoId, ...c })),
    }),
  ]);

  revalidarOrgao(orgaoId);
  redirect(`/cms/orgaos/${orgaoId}`);
}

// ------------------------------------------------------------- Endereço

const HORARIOS_OBRIGATORIOS = [
  ["funcInicioManha", "o início do funcionamento pela manhã"],
  ["funcFimTarde", "o fim do funcionamento pela tarde"],
  ["atendInicioManha", "o início do atendimento pela manhã"],
  ["atendFimTarde", "o fim do atendimento pela tarde"],
] as const;

/** Retorna null quando nenhum campo de endereço foi preenchido (seção opcional). */
function parseEndereco(formData: FormData) {
  const logradouro = texto(formData, "logradouro");
  const complemento = texto(formData, "complemento");
  const bairro = texto(formData, "bairro");
  const cep = texto(formData, "cep");
  const sourceMapa = texto(formData, "sourceMapa");
  const municipioId = Number(formData.get("municipioId"));
  const dias = JSON.parse(String(formData.get("diasSemanaJson") ?? "[]"));
  const temIntervalo = marcado(formData, "temIntervalo");
  const horarios = HORARIOS_OBRIGATORIOS.map(([campo]) => texto(formData, campo));

  const preenchido =
    logradouro ||
    complemento ||
    bairro ||
    cep ||
    sourceMapa ||
    municipioId ||
    (Array.isArray(dias) && dias.length > 0) ||
    horarios.some(Boolean);
  if (!preenchido) return null;

  if (!logradouro) throw new Error("Informe o endereço.");
  if (!sourceMapa) throw new Error("Informe o source do mapa.");
  if (!municipioId || Number.isNaN(municipioId)) {
    throw new Error("Selecione a cidade.");
  }
  if (!Array.isArray(dias) || dias.length === 0) {
    throw new Error("Escolha ao menos um dia da semana.");
  }
  HORARIOS_OBRIGATORIOS.forEach(([campo, rotulo]) => {
    if (!texto(formData, campo)) throw new Error(`Informe ${rotulo}.`);
  });

  return {
    municipioId,
    logradouro,
    complemento: complemento || null,
    bairro: bairro || null,
    cep: cep || null,
    sourceMapa,
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
}

export async function upsertEndereco(orgaoId: number, formData: FormData) {
  const dados = parseEndereco(formData);
  if (!dados) throw new Error("Preencha os dados do endereço.");

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
