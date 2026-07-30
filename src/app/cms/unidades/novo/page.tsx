import { prisma } from "@/lib/prisma";
import UnidadeForm from "@/components/cms/UnidadeForm";
import { createUnidade } from "@/app/cms/unidades/actions";

export default async function NovaUnidadePage() {
  const [orgaos, tiposPonto, municipios, servicosCatalogo, tipoUnidadePadrao] =
    await Promise.all([
      prisma.orgao.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
      prisma.tipoPonto.findMany({ orderBy: { nome: "asc" } }),
      prisma.municipio.findMany({ orderBy: { nome: "asc" } }),
      prisma.servico.findMany({ orderBy: { nome: "asc" } }),
      prisma.tipoPonto.findFirst({ where: { nome: "Unidade" } }),
    ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">Nova Unidade / Local de Atendimento</h2>
        <p className="text-sm text-slate-500">
          Preencha os dados abaixo para cadastrar uma nova unidade.
        </p>
      </div>

      <UnidadeForm
        action={createUnidade}
        orgaos={orgaos}
        tiposPonto={tiposPonto}
        municipios={municipios}
        servicosCatalogo={servicosCatalogo}
        defaultTipoPontoId={tipoUnidadePadrao?.id}
        submitLabel="Cadastrar Unidade"
      />
    </div>
  );
}
