import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugify } from "../src/lib/slugify";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---------- Municípios ----------
  const municipios = await Promise.all(
    [
      { nome: "Campo Grande", uf: "MS", codigoIbge: "5002704" },
      { nome: "Dourados", uf: "MS", codigoIbge: "5003702" },
      { nome: "Três Lagoas", uf: "MS", codigoIbge: "5008305" },
    ].map((m) =>
      prisma.municipio.upsert({
        where: { slug: slugify(m.nome) },
        update: {},
        create: { ...m, slug: slugify(m.nome) },
      })
    )
  );
  const [campoGrande, dourados, tresLagoas] = municipios;

  // ---------- Órgãos ----------
  const orgaos = await Promise.all(
    [
      {
        nome: "Secretaria de Estado de Saúde",
        sigla: "SES",
        site: "https://www.saude.ms.gov.br",
      },
      {
        nome: "Secretaria de Estado de Justiça e Segurança Pública",
        sigla: "SEJUSP",
        site: "https://www.sejusp.ms.gov.br",
      },
      {
        nome: "Agência Estadual de Regulação de Serviços Públicos de MS",
        sigla: "AGEPAN",
        site: "https://www.agepan.ms.gov.br",
        orgaoExterno: true,
      },
    ].map((o) =>
      prisma.orgao.upsert({
        where: { slug: slugify(o.sigla) },
        update: {},
        create: { ...o, slug: slugify(o.sigla) },
      })
    )
  );
  const [ses, sejusp, agepan] = orgaos;

  // ---------- Tipos de Ponto ----------
  const tiposPonto = await Promise.all(
    [
      { nome: "Unidade", exigeEndereco: true },
      { nome: "Unidade Regional", exigeEndereco: true },
      { nome: "Departamento", exigeEndereco: true },
    ].map((t) =>
      prisma.tipoPonto.upsert({
        where: { slug: slugify(t.nome) },
        update: {},
        create: { ...t, slug: slugify(t.nome) },
      })
    )
  );
  const [tipoUnidade, tipoUnidadeRegional, tipoDepartamento] = tiposPonto;

  // ---------- Tipo de Horário ----------
  let tipoHorarioPadrao = await prisma.tipoHorario.findFirst({
    where: { nome: "Horário de Funcionamento" },
  });
  if (!tipoHorarioPadrao) {
    tipoHorarioPadrao = await prisma.tipoHorario.create({
      data: { nome: "Horário de Funcionamento" },
    });
  }

  // ---------- Serviços ----------
  const nomesServicos = [
    "Emissão de Carteira de Identidade (RG)",
    "Emissão de Certidão de Nascimento",
    "Atendimento ao Consumidor (Procon)",
    "Vacinação",
    "Agendamento de Consultas",
    "Emissão de Boletim de Ocorrência",
  ];
  const servicos = [];
  for (const nome of nomesServicos) {
    let s = await prisma.servico.findFirst({ where: { nome } });
    if (!s) s = await prisma.servico.create({ data: { nome } });
    servicos.push(s);
  }
  const [rg, certidao, procon, vacinacao, agendamentoConsultas, boletim] =
    servicos;

  // ---------- Pessoas (responsáveis) ----------
  const nomesPessoas = ["Maria da Silva", "João Pereira", "Ana Souza"];
  const pessoas = [];
  for (const nome of nomesPessoas) {
    let p = await prisma.pessoa.findFirst({ where: { nome } });
    if (!p) p = await prisma.pessoa.create({ data: { nome } });
    pessoas.push(p);
  }
  const [maria, joao, ana] = pessoas;

  // ---------- Unidades de exemplo ----------

  async function criarUnidade(params: {
    nome: string;
    orgaoId: number;
    tipoPontoId: number;
    ativo?: boolean;
    endereco: {
      municipioId: number;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cep: string;
      iframeMapa: string;
      urlMapa?: string;
      latitude?: number;
      longitude?: number;
    };
    responsavel: { pessoaId: number; cargo: string };
    canais: { tipo: string; rotulo: string; valor: string }[];
    horarios: {
      diaSemana: number;
      inicio: string;
      fim: string;
      periodo?: string;
    }[];
    servicos: { servicoId: number; agendamento: boolean; atendimento: boolean }[];
  }) {
    const slug = slugify(params.nome);
    const existente = await prisma.pontoAtendimento.findUnique({
      where: { slug },
    });
    if (existente) return existente;

    return prisma.pontoAtendimento.create({
      data: {
        nome: params.nome,
        slug,
        orgaoId: params.orgaoId,
        tipoPontoId: params.tipoPontoId,
        ativo: params.ativo ?? true,
        endereco: { create: params.endereco },
        responsaveis: {
          create: {
            pessoaId: params.responsavel.pessoaId,
            cargo: params.responsavel.cargo,
          },
        },
        canais: { create: params.canais },
        horarios: {
          create: params.horarios.map((h) => ({
            ...h,
            tipoHorarioId: tipoHorarioPadrao!.id,
          })),
        },
        servicos: { create: params.servicos },
      },
    });
  }

  await criarUnidade({
    nome: "Hospital Regional de Mato Grosso do Sul",
    orgaoId: ses.id,
    tipoPontoId: tipoUnidade.id,
    endereco: {
      municipioId: campoGrande.id,
      logradouro: "Rua Engenheiro Luthero Lopes",
      numero: "36",
      bairro: "Aero Rancho",
      cep: "79051-000",
      iframeMapa:
        '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3735.0!2d-54.6!3d-20.5" width="600" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>',
      urlMapa: "https://maps.app.goo.gl/exemplo-hospital-regional",
      latitude: -20.5186,
      longitude: -54.6357,
    },
    responsavel: { pessoaId: maria.id, cargo: "Diretora Geral" },
    canais: [
      { tipo: "telefone", rotulo: "Central", valor: "(67) 3378-2600" },
      { tipo: "whatsapp", rotulo: "Ouvidoria", valor: "(67) 99999-1234" },
      { tipo: "email", rotulo: "Contato", valor: "hrms@saude.ms.gov.br" },
    ],
    horarios: [
      { diaSemana: 1, inicio: "07:00", fim: "19:00" },
      { diaSemana: 2, inicio: "07:00", fim: "19:00" },
      { diaSemana: 3, inicio: "07:00", fim: "19:00" },
      { diaSemana: 4, inicio: "07:00", fim: "19:00" },
      { diaSemana: 5, inicio: "07:00", fim: "19:00" },
    ],
    servicos: [
      { servicoId: vacinacao.id, agendamento: true, atendimento: true },
      {
        servicoId: agendamentoConsultas.id,
        agendamento: true,
        atendimento: true,
      },
    ],
  });

  await criarUnidade({
    nome: "Procon Dourados",
    orgaoId: sejusp.id,
    tipoPontoId: tipoUnidadeRegional.id,
    endereco: {
      municipioId: dourados.id,
      logradouro: "Avenida Marcelino Pires",
      numero: "1520",
      complemento: "Centro",
      bairro: "Centro",
      cep: "79802-021",
      iframeMapa:
        '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.0!2d-54.8!3d-22.2" width="600" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>',
      urlMapa: "https://maps.app.goo.gl/exemplo-procon-dourados",
      latitude: -22.2211,
      longitude: -54.806,
    },
    responsavel: { pessoaId: joao.id, cargo: "Coordenador Regional" },
    canais: [
      { tipo: "telefone", rotulo: "Atendimento", valor: "(67) 3411-7700" },
      { tipo: "email", rotulo: "Contato", valor: "procon.dourados@sejusp.ms.gov.br" },
    ],
    horarios: [
      { diaSemana: 1, inicio: "07:30", fim: "11:30", periodo: "manha" },
      { diaSemana: 1, inicio: "13:00", fim: "17:00", periodo: "tarde" },
      { diaSemana: 2, inicio: "07:30", fim: "11:30", periodo: "manha" },
      { diaSemana: 2, inicio: "13:00", fim: "17:00", periodo: "tarde" },
      { diaSemana: 3, inicio: "07:30", fim: "11:30", periodo: "manha" },
      { diaSemana: 3, inicio: "13:00", fim: "17:00", periodo: "tarde" },
      { diaSemana: 4, inicio: "07:30", fim: "11:30", periodo: "manha" },
      { diaSemana: 4, inicio: "13:00", fim: "17:00", periodo: "tarde" },
      { diaSemana: 5, inicio: "07:30", fim: "11:30", periodo: "manha" },
      { diaSemana: 5, inicio: "13:00", fim: "17:00", periodo: "tarde" },
    ],
    servicos: [
      { servicoId: procon.id, agendamento: false, atendimento: true },
      { servicoId: boletim.id, agendamento: false, atendimento: true },
    ],
  });

  await criarUnidade({
    nome: "Agência Regulatória - Três Lagoas",
    orgaoId: agepan.id,
    tipoPontoId: tipoDepartamento.id,
    endereco: {
      municipioId: tresLagoas.id,
      logradouro: "Avenida Capitão Olinto Mancini",
      numero: "1230",
      bairro: "Vila Alegre",
      cep: "79641-020",
      iframeMapa:
        '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.0!2d-51.7!3d-20.7" width="600" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>',
      urlMapa: "https://maps.app.goo.gl/exemplo-agepan-tres-lagoas",
      latitude: -20.7511,
      longitude: -51.6784,
    },
    responsavel: { pessoaId: ana.id, cargo: "Gerente de Unidade" },
    canais: [
      { tipo: "telefone", rotulo: "Central", valor: "(67) 3521-4400" },
      { tipo: "whatsapp", rotulo: "Atendimento", valor: "(67) 99888-4321" },
    ],
    horarios: [
      { diaSemana: 1, inicio: "07:00", fim: "11:00", periodo: "manha" },
      { diaSemana: 1, inicio: "13:00", fim: "17:00", periodo: "tarde" },
      { diaSemana: 2, inicio: "07:00", fim: "11:00", periodo: "manha" },
      { diaSemana: 2, inicio: "13:00", fim: "17:00", periodo: "tarde" },
      { diaSemana: 3, inicio: "07:00", fim: "11:00", periodo: "manha" },
      { diaSemana: 3, inicio: "13:00", fim: "17:00", periodo: "tarde" },
      { diaSemana: 4, inicio: "07:00", fim: "11:00", periodo: "manha" },
      { diaSemana: 4, inicio: "13:00", fim: "17:00", periodo: "tarde" },
      { diaSemana: 5, inicio: "07:00", fim: "11:00", periodo: "manha" },
      { diaSemana: 5, inicio: "13:00", fim: "17:00", periodo: "tarde" },
    ],
    servicos: [{ servicoId: rg.id, agendamento: true, atendimento: true }],
  });

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
