import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UnidadeForm from "@/components/cms/UnidadeForm";
import { updateUnidade } from "@/app/cms/unidades/actions";
import { reconstructPeriods } from "@/lib/horarios";

export default async function EditarUnidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const [ponto, orgaos, tiposPonto, municipios, servicosCatalogo] =
    await Promise.all([
      prisma.pontoAtendimento.findUnique({
        where: { id },
        include: {
          endereco: true,
          responsaveis: { include: { pessoa: true } },
          canais: true,
          horarios: true,
          servicos: true,
        },
      }),
      prisma.orgao.findMany({ orderBy: { nome: "asc" } }),
      prisma.tipoPonto.findMany({ orderBy: { nome: "asc" } }),
      prisma.municipio.findMany({ orderBy: { nome: "asc" } }),
      prisma.servico.findMany({ orderBy: { nome: "asc" } }),
    ]);

  if (!ponto) notFound();

  const telefoneCanal = ponto.canais.find(
    (c) => c.tipo === "telefone" && c.rotulo === "Telefone"
  );
  const canaisRestantes = ponto.canais
    .filter((c) => c.id !== telefoneCanal?.id)
    .map((c) => ({ tipo: c.tipo, rotulo: c.rotulo, valor: c.valor }));

  const updateUnidadeComId = updateUnidade.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">
          Editar Unidade — {ponto.nome}
        </h2>
        <p className="text-sm text-slate-500">
          Atualize os dados da unidade e salve as alterações.
        </p>
      </div>

      <UnidadeForm
        action={updateUnidadeComId}
        orgaos={orgaos}
        tiposPonto={tiposPonto}
        municipios={municipios}
        servicosCatalogo={servicosCatalogo}
        submitLabel="Salvar Alterações"
        initialData={{
          nome: ponto.nome,
          slug: ponto.slug,
          orgaoId: ponto.orgaoId,
          tipoPontoId: ponto.tipoPontoId,
          identificadorExterno: ponto.identificadorExterno ?? "",
          ativo: ponto.ativo,
          logradouro: ponto.endereco?.logradouro ?? "",
          numero: ponto.endereco?.numero ?? "",
          complemento: ponto.endereco?.complemento ?? "",
          bairro: ponto.endereco?.bairro ?? "",
          cep: ponto.endereco?.cep ?? "",
          municipioId: ponto.endereco?.municipioId ?? 0,
          iframeMapa: ponto.endereco?.iframeMapa ?? "",
          urlMapa: ponto.endereco?.urlMapa ?? "",
          latitude: ponto.endereco?.latitude?.toString() ?? "",
          longitude: ponto.endereco?.longitude?.toString() ?? "",
          responsavelNome: ponto.responsaveis[0]?.pessoa.nome ?? "",
          telefone: telefoneCanal?.valor ?? "",
          canais: canaisRestantes,
          periods: reconstructPeriods(ponto.horarios),
          servicos: ponto.servicos.map((s) => ({
            servicoId: s.servicoId,
            atendimento: s.atendimento,
            agendamento: s.agendamento,
          })),
        }}
      />
    </div>
  );
}
