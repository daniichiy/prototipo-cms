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

  // ---------- Tipos de Horário (funcionamento e atendimento) ----------
  const [tipoFuncionamento, tipoAtendimento] = await Promise.all(
    [
      { slug: "funcionamento", nome: "Horário de funcionamento" },
      { slug: "atendimento", nome: "Horário de atendimento" },
    ].map((t) =>
      prisma.tipoHorario.upsert({
        where: { slug: t.slug },
        update: { nome: t.nome },
        create: t,
      })
    )
  );

  // ---------- Horários reutilizáveis ----------
  const modelosHorario = [
    {
      nome: "Expediente padrão — 07:30 às 17:30",
      periodos: [
        {
          dias: [1, 2, 3, 4, 5],
          temIntervalo: true,
          inicioManha: "07:30",
          fimManha: "11:30",
          inicioTarde: "13:30",
          fimTarde: "17:30",
        },
      ],
    },
    {
      nome: "Atendimento ao público — 08:00 às 16:00",
      periodos: [
        {
          dias: [1, 2, 3, 4, 5],
          temIntervalo: false,
          inicioManha: "08:00",
          fimManha: "",
          inicioTarde: "",
          fimTarde: "16:00",
        },
      ],
    },
  ];
  for (const modelo of modelosHorario) {
    await prisma.modeloHorario.upsert({
      where: { nome: modelo.nome },
      update: { periodosJson: JSON.stringify(modelo.periodos) },
      create: {
        nome: modelo.nome,
        periodosJson: JSON.stringify(modelo.periodos),
      },
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

  // ---------- Pessoas (responsáveis / usuários) ----------
  const dadosPessoas = [
    { nome: "Maria da Silva", cpf: "123.456.789-00" },
    { nome: "João Pereira", cpf: "234.567.890-11" },
    { nome: "Ana Souza", cpf: "345.678.901-22" },
  ];
  const pessoas = [];
  for (const dados of dadosPessoas) {
    let p = await prisma.pessoa.findFirst({ where: { nome: dados.nome } });
    if (!p) {
      p = await prisma.pessoa.create({ data: dados });
    } else if (!p.cpf) {
      p = await prisma.pessoa.update({
        where: { id: p.id },
        data: { cpf: dados.cpf },
      });
    }
    pessoas.push(p);
  }
  const [maria, joao, ana] = pessoas;

  // ---------- Detalhes do órgão (contato, endereço, associações) ----------
  await prisma.orgao.update({
    where: { id: ses.id },
    data: {
      identificadorControlador: "39",
      informacoes:
        "<p>A Secretaria de Estado de Saúde é responsável por planejar, coordenar e executar a política estadual de saúde de Mato Grosso do Sul.</p>",
    },
  });

  await prisma.orgaoContato.upsert({
    where: { orgaoId: ses.id },
    update: {},
    create: {
      orgaoId: ses.id,
      responsavel: "Gabinete da Secretaria",
      telefone: "(67) 3318-1700",
      email: "gabinete@saude.ms.gov.br",
    },
  });

  await prisma.orgaoCanalContato.deleteMany({ where: { orgaoId: ses.id } });
  await prisma.orgaoCanalContato.createMany({
    data: [
      {
        orgaoId: ses.id,
        tipo: "whatsapp",
        rotulo: "WhatsApp",
        valor: "(67) 99900-1700",
      },
      {
        orgaoId: ses.id,
        tipo: "outro",
        rotulo: "Instagram",
        valor: "https://www.instagram.com/sesms",
      },
      {
        orgaoId: ses.id,
        tipo: "outro",
        rotulo: "Facebook",
        valor: "https://www.facebook.com/sesms",
      },
    ],
  });

  await prisma.orgaoEndereco.upsert({
    where: { orgaoId: ses.id },
    update: {},
    create: {
      orgaoId: ses.id,
      municipioId: campoGrande.id,
      logradouro: "Avenida do Poeta, s/n — Bloco 7, Parque dos Poderes",
      sourceMapa:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3735.0!2d-54.55!3d-20.46",
      diasSemana: "1,2,3,4,5",
      temIntervalo: true,
      funcInicioManha: "07:30",
      funcFimManha: "11:30",
      funcInicioTarde: "13:30",
      funcFimTarde: "17:30",
      atendInicioManha: "07:30",
      atendFimManha: "11:30",
      atendInicioTarde: "13:30",
      atendFimTarde: "17:30",
    },
  });

  const setoresSes = [
    { sigla: "ASCOM", nome: "Assessoria de Comunicação" },
    { sigla: "GEJUR", nome: "Gerência Jurídica" },
    { sigla: "SUPAT", nome: "Superintendência de Atenção à Saúde" },
    { sigla: "OUVID", nome: "Ouvidoria" },
  ];
  for (const setor of setoresSes) {
    await prisma.setor.upsert({
      where: { orgaoId_sigla: { orgaoId: ses.id, sigla: setor.sigla } },
      update: {},
      create: { orgaoId: ses.id, ...setor },
    });
  }

  const gestorExistente = await prisma.gestor.findFirst({
    where: { orgaoId: ses.id },
  });
  if (!gestorExistente) {
    await prisma.gestor.create({
      data: {
        orgaoId: ses.id,
        nome: "Maria da Silva",
        biografia:
          "<p>Graduada em Medicina, atua na gestão pública de saúde há mais de 20 anos.</p>",
      },
    });
  }

  await prisma.orgaoUsuario.upsert({
    where: { orgaoId_pessoaId: { orgaoId: ses.id, pessoaId: maria.id } },
    update: {},
    create: { orgaoId: ses.id, pessoaId: maria.id, perfil: "Gerente" },
  });

  const siteExistente = await prisma.siteRelacionado.findFirst({
    where: { orgaoId: ses.id },
  });
  if (!siteExistente) {
    await prisma.siteRelacionado.create({
      data: {
        orgaoId: ses.id,
        titulo: "Portal do Paciente",
        link: "https://www.saude.ms.gov.br/portal-do-paciente",
      },
    });
  }

  // ---------- Unidades de exemplo ----------

  async function criarUnidade(params: {
    nome: string;
    orgaoId: number;
    tipoPontoId: number;
    ativo?: boolean;
    endereco: {
      municipioId: number;
      logradouro: string;
      complemento?: string;
      bairro: string;
      cep: string;
      sourceMapa: string;
    };
    responsavel: { pessoaId: number; cargo: string };
    canais: { tipo: string; rotulo: string; valor: string }[];
    horarios: {
      diaSemana: number;
      inicio: string;
      fim: string;
      periodo?: string;
    }[];
    // quando omitido, o atendimento segue o mesmo horário do funcionamento
    horariosAtendimento?: {
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
    if (existente) {
      // unidade criada antes da separação dos dois horários: garante o
      // horário de atendimento
      const jaTemAtendimento = await prisma.horario.count({
        where: {
          pontoAtendimentoId: existente.id,
          tipoHorarioId: tipoAtendimento.id,
        },
      });
      if (!jaTemAtendimento) {
        await prisma.horario.createMany({
          data: (params.horariosAtendimento ?? params.horarios).map((h) => ({
            ...h,
            pontoAtendimentoId: existente.id,
            tipoHorarioId: tipoAtendimento.id,
          })),
        });
      }
      return existente;
    }

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
          create: [
            ...params.horarios.map((h) => ({
              ...h,
              tipoHorarioId: tipoFuncionamento.id,
            })),
            ...(params.horariosAtendimento ?? params.horarios).map((h) => ({
              ...h,
              tipoHorarioId: tipoAtendimento.id,
            })),
          ],
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
      logradouro: "Rua Engenheiro Luthero Lopes, 36",
      bairro: "Aero Rancho",
      cep: "79051-000",
      sourceMapa:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3735.0!2d-54.6!3d-20.5",
    },
    responsavel: { pessoaId: maria.id, cargo: "Diretora Geral" },
    canais: [
      {
        tipo: "telefone",
        rotulo: "Central de Atendimento Principal",
        valor: "(67) 3378-2600",
      },
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
    // o hospital funciona das 07h às 19h, mas atende o cidadão até as 17h
    horariosAtendimento: [
      { diaSemana: 1, inicio: "07:00", fim: "17:00" },
      { diaSemana: 2, inicio: "07:00", fim: "17:00" },
      { diaSemana: 3, inicio: "07:00", fim: "17:00" },
      { diaSemana: 4, inicio: "07:00", fim: "17:00" },
      { diaSemana: 5, inicio: "07:00", fim: "17:00" },
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
      logradouro: "Avenida Marcelino Pires, 1520",
      complemento: "Centro",
      bairro: "Centro",
      cep: "79802-021",
      sourceMapa:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.0!2d-54.8!3d-22.2",
    },
    responsavel: { pessoaId: joao.id, cargo: "Coordenador Regional" },
    canais: [
      {
        tipo: "telefone",
        rotulo: "Central de Atendimento Principal",
        valor: "(67) 3411-7700",
      },
      {
        tipo: "email",
        rotulo: "Central de Atendimento Principal",
        valor: "procon.dourados@sejusp.ms.gov.br",
      },
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
      logradouro: "Avenida Capitão Olinto Mancini, 1230",
      bairro: "Vila Alegre",
      cep: "79641-020",
      sourceMapa:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.0!2d-51.7!3d-20.7",
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
