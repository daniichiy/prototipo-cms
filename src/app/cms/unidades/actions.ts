"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type CanalInput = { tipo: string; rotulo: string; valor: string };

type PeriodoInput = {
  dias: number[];
  temIntervalo: boolean;
  inicioManha: string;
  fimManha: string;
  inicioTarde: string;
  fimTarde: string;
};

type ServicoInput = {
  servicoId: number;
  atendimento: boolean;
  agendamento: boolean;
};

async function getDefaultTipoHorarioId() {
  const tipoHorario = await prisma.tipoHorario.findFirst();
  if (!tipoHorario) {
    throw new Error("Nenhum TipoHorario cadastrado. Rode o seed do banco.");
  }
  return tipoHorario.id;
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

function buildHorarioRows(periods: PeriodoInput[], tipoHorarioId: number) {
  const rows: {
    diaSemana: number;
    inicio: string;
    fim: string;
    periodo: string | null;
    tipoHorarioId: number;
  }[] = [];

  for (const periodo of periods) {
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

function parseFormValues(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const orgaoId = Number(formData.get("orgaoId"));
  const tipoPontoId = Number(formData.get("tipoPontoId"));
  const identificadorExterno =
    String(formData.get("identificadorExterno") ?? "").trim() || null;
  const ativo = formData.get("ativo") === "on";

  const logradouro = String(formData.get("logradouro") ?? "").trim();
  const numero = String(formData.get("numero") ?? "").trim();
  const complemento = String(formData.get("complemento") ?? "").trim() || null;
  const bairro = String(formData.get("bairro") ?? "").trim();
  const cep = String(formData.get("cep") ?? "").trim();
  const municipioId = Number(formData.get("municipioId"));
  const iframeMapa = String(formData.get("iframeMapa") ?? "").trim();
  const urlMapa = String(formData.get("urlMapa") ?? "").trim() || null;
  const latitudeRaw = String(formData.get("latitude") ?? "").trim();
  const longitudeRaw = String(formData.get("longitude") ?? "").trim();
  const latitude = latitudeRaw ? Number(latitudeRaw) : null;
  const longitude = longitudeRaw ? Number(longitudeRaw) : null;

  const responsavelNome =
    String(formData.get("responsavelNome") ?? "").trim() || null;
  const telefone = String(formData.get("telefone") ?? "").trim() || null;
  const canais: CanalInput[] = JSON.parse(
    String(formData.get("canaisJson") ?? "[]")
  );
  const periods: PeriodoInput[] = JSON.parse(
    String(formData.get("periodsJson") ?? "[]")
  );
  const servicos: ServicoInput[] = JSON.parse(
    String(formData.get("servicosJson") ?? "[]")
  );

  return {
    nome,
    slugInput,
    orgaoId,
    tipoPontoId,
    identificadorExterno,
    ativo,
    logradouro,
    numero,
    complemento,
    bairro,
    cep,
    municipioId,
    iframeMapa,
    urlMapa,
    latitude,
    longitude,
    responsavelNome,
    telefone,
    canais,
    periods,
    servicos,
  };
}

function assertValid(v: ReturnType<typeof parseFormValues>) {
  if (!v.nome) throw new Error("Nome é obrigatório.");
  if (Number.isNaN(v.orgaoId)) throw new Error("Selecione um órgão.");
  if (Number.isNaN(v.tipoPontoId)) throw new Error("Selecione o tipo de local.");
  if (Number.isNaN(v.municipioId)) throw new Error("Selecione a cidade.");
}

export async function createUnidade(formData: FormData) {
  const v = parseFormValues(formData);
  assertValid(v);
  const slug = await ensureUniqueSlug(slugify(v.slugInput || v.nome));
  const tipoHorarioId = await getDefaultTipoHorarioId();

  const canais = [...v.canais];
  if (v.telefone) {
    canais.unshift({ tipo: "telefone", rotulo: "Telefone", valor: v.telefone });
  }
  const horarioRows = buildHorarioRows(v.periods, tipoHorarioId);

  await prisma.$transaction(async (tx) => {
    const ponto = await tx.pontoAtendimento.create({
      data: {
        nome: v.nome,
        slug,
        orgaoId: v.orgaoId,
        tipoPontoId: v.tipoPontoId,
        identificadorExterno: v.identificadorExterno,
        ativo: v.ativo,
      },
    });

    await tx.endereco.create({
      data: {
        pontoAtendimentoId: ponto.id,
        municipioId: v.municipioId,
        logradouro: v.logradouro,
        numero: v.numero,
        complemento: v.complemento,
        bairro: v.bairro,
        cep: v.cep,
        iframeMapa: v.iframeMapa,
        urlMapa: v.urlMapa,
        latitude: v.latitude,
        longitude: v.longitude,
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

    if (horarioRows.length) {
      await tx.horario.createMany({
        data: horarioRows.map((h) => ({ ...h, pontoAtendimentoId: ponto.id })),
      });
    }

    if (v.servicos.length) {
      await tx.servicoUnidade.createMany({
        data: v.servicos.map((s) => ({ ...s, pontoAtendimentoId: ponto.id })),
      });
    }
  });

  revalidatePath("/cms/unidades");
  redirect("/cms/unidades");
}

export async function updateUnidade(id: number, formData: FormData) {
  const v = parseFormValues(formData);
  assertValid(v);
  const slug = await ensureUniqueSlug(slugify(v.slugInput || v.nome), id);
  const tipoHorarioId = await getDefaultTipoHorarioId();

  const canais = [...v.canais];
  if (v.telefone) {
    canais.unshift({ tipo: "telefone", rotulo: "Telefone", valor: v.telefone });
  }
  const horarioRows = buildHorarioRows(v.periods, tipoHorarioId);

  await prisma.$transaction(async (tx) => {
    await tx.pontoAtendimento.update({
      where: { id },
      data: {
        nome: v.nome,
        slug,
        orgaoId: v.orgaoId,
        tipoPontoId: v.tipoPontoId,
        identificadorExterno: v.identificadorExterno,
        ativo: v.ativo,
      },
    });

    const enderecoData = {
      municipioId: v.municipioId,
      logradouro: v.logradouro,
      numero: v.numero,
      complemento: v.complemento,
      bairro: v.bairro,
      cep: v.cep,
      iframeMapa: v.iframeMapa,
      urlMapa: v.urlMapa,
      latitude: v.latitude,
      longitude: v.longitude,
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
    if (horarioRows.length) {
      await tx.horario.createMany({
        data: horarioRows.map((h) => ({ ...h, pontoAtendimentoId: id })),
      });
    }

    await tx.servicoUnidade.deleteMany({ where: { pontoAtendimentoId: id } });
    if (v.servicos.length) {
      await tx.servicoUnidade.createMany({
        data: v.servicos.map((s) => ({ ...s, pontoAtendimentoId: id })),
      });
    }
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
