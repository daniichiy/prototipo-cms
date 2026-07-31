"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import {
  buildHorarioRows,
  parsePeriodos,
  TIPO_ATENDIMENTO,
  TIPO_FUNCIONAMENTO,
} from "@/lib/horarios";
import { getTipoHorarioId } from "@/lib/tipoHorario";
import { ROTULO_CENTRAL } from "@/lib/contato";

type CanalInput = { tipo: string; rotulo: string; valor: string };
type ServicoInput = { servicoId: number };

// O tipo de ponto deixou de ser preenchido no formulário; todo local cadastrado
// pelo CMS entra como "Unidade".
async function getDefaultTipoPontoId() {
  const existente =
    (await prisma.tipoPonto.findUnique({ where: { slug: "unidade" } })) ??
    (await prisma.tipoPonto.findFirst());
  if (existente) return existente.id;

  const criado = await prisma.tipoPonto.create({
    data: { nome: "Unidade", slug: "unidade" },
  });
  return criado.id;
}

async function ensureUniqueSlug(base: string, excludeId?: number) {
  const clean = base || "unidade";
  let slug = clean;
  let attempt = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.pontoAtendimento.findUnique({
      where: { slug },
    });
    if (!existing || existing.id === excludeId) return slug;
    attempt += 1;
    slug = `${clean}-${attempt}`;
  }
}

function parseIds(raw: FormDataEntryValue | null): number[] {
  try {
    const dados = JSON.parse(String(raw ?? "[]"));
    return Array.isArray(dados) ? dados.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function parseFormValues(formData: FormData) {
  const centralAtendimento = formData.get("centralAtendimento") === "on";

  return {
    nome: String(formData.get("nome") ?? "").trim(),
    orgaoId: Number(formData.get("orgaoId")),
    ativo: formData.get("ativo") === "on",

    endereco: String(formData.get("endereco") ?? "").trim(),
    complemento: String(formData.get("complemento") ?? "").trim() || null,
    bairro: String(formData.get("bairro") ?? "").trim(),
    cep: String(formData.get("cep") ?? "").trim(),
    municipioId: Number(formData.get("municipioId")),
    sourceMapa: String(formData.get("sourceMapa") ?? "").trim(),

    responsavelNome: String(formData.get("responsavelNome") ?? "").trim() || null,
    centralAtendimento,
    telefone: centralAtendimento
      ? String(formData.get("telefone") ?? "").trim()
      : "",
    email: centralAtendimento ? String(formData.get("email") ?? "").trim() : "",

    canais: JSON.parse(
      String(formData.get("canaisJson") ?? "[]")
    ) as CanalInput[],
    periodosFuncionamento: parsePeriodos(
      String(formData.get("funcionamentoJson") ?? "[]")
    ),
    periodosAtendimento: parsePeriodos(
      String(formData.get("atendimentoJson") ?? "[]")
    ),
    replicarFuncionamento: parseIds(formData.get("replicarFuncionamentoJson")),
    replicarAtendimento: parseIds(formData.get("replicarAtendimentoJson")),
    servicos: JSON.parse(
      String(formData.get("servicosJson") ?? "[]")
    ) as ServicoInput[],
  };
}

type Valores = ReturnType<typeof parseFormValues>;

function assertValid(v: Valores) {
  if (!v.nome) throw new Error("Nome é obrigatório.");
  if (!v.endereco) throw new Error("Endereço é obrigatório.");
  if (!v.bairro) throw new Error("Bairro é obrigatório.");
  if (!v.cep) throw new Error("CEP é obrigatório.");
  if (!v.sourceMapa) throw new Error("Source do mapa é obrigatório.");
  if (Number.isNaN(v.orgaoId)) throw new Error("Selecione um órgão.");
  if (Number.isNaN(v.municipioId)) throw new Error("Selecione a cidade.");
}

// Telefone e e-mail da Central de Atendimento são guardados como canais, com
// rótulo fixo, para o formulário conseguir separá-los dos canais adicionais.
function montarCanais(v: Valores): CanalInput[] {
  const canais = v.canais.filter((c) => c.valor.trim());
  const central: CanalInput[] = [];
  if (v.telefone) {
    central.push({ tipo: "telefone", rotulo: ROTULO_CENTRAL, valor: v.telefone });
  }
  if (v.email) {
    central.push({ tipo: "email", rotulo: ROTULO_CENTRAL, valor: v.email });
  }
  return [...central, ...canais];
}

async function montarHorarios(v: Valores) {
  const [idFuncionamento, idAtendimento] = await Promise.all([
    getTipoHorarioId(TIPO_FUNCIONAMENTO),
    getTipoHorarioId(TIPO_ATENDIMENTO),
  ]);

  return {
    idFuncionamento,
    idAtendimento,
    funcionamento: buildHorarioRows(v.periodosFuncionamento, idFuncionamento),
    atendimento: buildHorarioRows(v.periodosAtendimento, idAtendimento),
  };
}

// "Adicionar o mesmo horário para vários locais": replica as linhas geradas
// para os locais escolhidos, substituindo o horário daquele tipo.
async function replicarHorarios(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  pontoIds: number[],
  tipoHorarioId: number,
  rows: Awaited<ReturnType<typeof montarHorarios>>["funcionamento"],
  excluirId: number
) {
  const alvos = pontoIds.filter((id) => id !== excluirId);
  if (!alvos.length) return;

  await tx.horario.deleteMany({
    where: { pontoAtendimentoId: { in: alvos }, tipoHorarioId },
  });
  if (rows.length) {
    await tx.horario.createMany({
      data: alvos.flatMap((pontoAtendimentoId) =>
        rows.map((h) => ({ ...h, pontoAtendimentoId }))
      ),
    });
  }
}

export async function createUnidade(formData: FormData) {
  const v = parseFormValues(formData);
  assertValid(v);

  const slug = await ensureUniqueSlug(slugify(v.nome));
  const tipoPontoId = await getDefaultTipoPontoId();
  const canais = montarCanais(v);
  const horarios = await montarHorarios(v);

  await prisma.$transaction(async (tx) => {
    const ponto = await tx.pontoAtendimento.create({
      data: {
        nome: v.nome,
        slug,
        orgaoId: v.orgaoId,
        tipoPontoId,
        ativo: v.ativo,
      },
    });

    await tx.endereco.create({
      data: {
        pontoAtendimentoId: ponto.id,
        municipioId: v.municipioId,
        logradouro: v.endereco,
        complemento: v.complemento,
        bairro: v.bairro,
        cep: v.cep,
        sourceMapa: v.sourceMapa,
      },
    });

    if (v.responsavelNome) {
      const pessoa = await findOrCreatePessoa(tx, v.responsavelNome);
      await tx.pontoResponsavel.create({
        data: { pontoAtendimentoId: ponto.id, pessoaId: pessoa.id },
      });
    }

    if (canais.length) {
      await tx.canalContato.createMany({
        data: canais.map((c) => ({ ...c, pontoAtendimentoId: ponto.id })),
      });
    }

    const linhas = [...horarios.funcionamento, ...horarios.atendimento];
    if (linhas.length) {
      await tx.horario.createMany({
        data: linhas.map((h) => ({ ...h, pontoAtendimentoId: ponto.id })),
      });
    }

    if (v.servicos.length) {
      await tx.servicoUnidade.createMany({
        data: v.servicos.map((s) => ({
          servicoId: s.servicoId,
          pontoAtendimentoId: ponto.id,
        })),
      });
    }

    await replicarHorarios(
      tx,
      v.replicarFuncionamento,
      horarios.idFuncionamento,
      horarios.funcionamento,
      ponto.id
    );
    await replicarHorarios(
      tx,
      v.replicarAtendimento,
      horarios.idAtendimento,
      horarios.atendimento,
      ponto.id
    );
  });

  revalidatePath("/cms/unidades");
  redirect("/cms/unidades");
}

export async function updateUnidade(id: number, formData: FormData) {
  const v = parseFormValues(formData);
  assertValid(v);

  const slug = await ensureUniqueSlug(slugify(v.nome), id);
  const canais = montarCanais(v);
  const horarios = await montarHorarios(v);

  await prisma.$transaction(async (tx) => {
    await tx.pontoAtendimento.update({
      where: { id },
      data: {
        nome: v.nome,
        slug,
        orgaoId: v.orgaoId,
        ativo: v.ativo,
      },
    });

    const enderecoData = {
      municipioId: v.municipioId,
      logradouro: v.endereco,
      complemento: v.complemento,
      bairro: v.bairro,
      cep: v.cep,
      sourceMapa: v.sourceMapa,
    };
    await tx.endereco.upsert({
      where: { pontoAtendimentoId: id },
      update: enderecoData,
      create: { pontoAtendimentoId: id, ...enderecoData },
    });

    await tx.pontoResponsavel.deleteMany({ where: { pontoAtendimentoId: id } });
    if (v.responsavelNome) {
      const pessoa = await findOrCreatePessoa(tx, v.responsavelNome);
      await tx.pontoResponsavel.create({
        data: { pontoAtendimentoId: id, pessoaId: pessoa.id },
      });
    }

    await tx.canalContato.deleteMany({ where: { pontoAtendimentoId: id } });
    if (canais.length) {
      await tx.canalContato.createMany({
        data: canais.map((c) => ({ ...c, pontoAtendimentoId: id })),
      });
    }

    await tx.horario.deleteMany({ where: { pontoAtendimentoId: id } });
    const linhas = [...horarios.funcionamento, ...horarios.atendimento];
    if (linhas.length) {
      await tx.horario.createMany({
        data: linhas.map((h) => ({ ...h, pontoAtendimentoId: id })),
      });
    }

    await tx.servicoUnidade.deleteMany({ where: { pontoAtendimentoId: id } });
    if (v.servicos.length) {
      await tx.servicoUnidade.createMany({
        data: v.servicos.map((s) => ({
          servicoId: s.servicoId,
          pontoAtendimentoId: id,
        })),
      });
    }

    await replicarHorarios(
      tx,
      v.replicarFuncionamento,
      horarios.idFuncionamento,
      horarios.funcionamento,
      id
    );
    await replicarHorarios(
      tx,
      v.replicarAtendimento,
      horarios.idAtendimento,
      horarios.atendimento,
      id
    );
  });

  revalidatePath("/cms/unidades");
  redirect("/cms/unidades");
}

export async function deleteUnidade(id: number) {
  await prisma.pontoAtendimento.delete({ where: { id } });
  revalidatePath("/cms/unidades");
}

async function findOrCreatePessoa(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  nome: string
) {
  const existente = await tx.pessoa.findFirst({ where: { nome } });
  if (existente) return existente;
  return tx.pessoa.create({ data: { nome } });
}
