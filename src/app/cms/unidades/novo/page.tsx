import { prisma } from "@/lib/prisma";
import UnidadeForm from "@/components/cms/UnidadeForm";
import { createUnidade } from "@/app/cms/unidades/actions";
import { salvarModeloHorario } from "@/app/cms/horarios/actions";
import { parsePeriodos } from "@/lib/horarios";

export default async function NovaUnidadePage() {
  const [orgaos, municipios, modelos, outrosLocais] =
    await Promise.all([
      prisma.orgao.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
      prisma.municipio.findMany({ orderBy: { nome: "asc" } }),
      prisma.modeloHorario.findMany({ orderBy: { nome: "asc" } }),
      prisma.pontoAtendimento.findMany({
        orderBy: { nome: "asc" },
        include: { orgao: true },
      }),
    ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">
          Novo Local de Atendimento
        </h2>
        <p className="text-sm text-slate-500">
          Preencha os dados abaixo para cadastrar um novo local de atendimento.
        </p>
      </div>

      <UnidadeForm
        action={createUnidade}
        orgaos={orgaos}
        municipios={municipios}
        modelosHorario={modelos.map((m) => ({
          id: m.id,
          nome: m.nome,
          periodos: parsePeriodos(m.periodosJson),
        }))}
        outrosLocais={outrosLocais.map((u) => ({
          id: u.id,
          nome: u.nome,
          sublabel: u.orgao.sigla,
        }))}
        salvarModeloHorario={salvarModeloHorario}
        submitLabel="Cadastrar Local de Atendimento"
      />
    </div>
  );
}
