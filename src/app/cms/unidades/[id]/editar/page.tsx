import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UnidadeForm from "@/components/cms/UnidadeForm";
import { updateUnidade } from "@/app/cms/unidades/actions";
import { salvarModeloHorario } from "@/app/cms/horarios/actions";
import {
  parsePeriodos,
  periodosDoOrgao,
  reconstructPeriods,
  TIPO_ATENDIMENTO,
  TIPO_FUNCIONAMENTO,
} from "@/lib/horarios";
import { ROTULO_CENTRAL } from "@/lib/contato";

export default async function EditarUnidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const [ponto, orgaos, municipios, modelos, outrosLocais] =
    await Promise.all([
      prisma.pontoAtendimento.findUnique({
        where: { id },
        include: {
          endereco: true,
          responsaveis: { include: { pessoa: true } },
          canais: true,
          horarios: { include: { tipoHorario: true } },
        },
      }),
      prisma.orgao.findMany({
        orderBy: { nome: "asc" },
        include: { endereco: true },
      }),
      prisma.municipio.findMany({ orderBy: { nome: "asc" } }),
      prisma.modeloHorario.findMany({ orderBy: { nome: "asc" } }),
      prisma.pontoAtendimento.findMany({
        where: { id: { not: id } },
        orderBy: { nome: "asc" },
        include: { orgao: true },
      }),
    ]);

  if (!ponto) notFound();

  const canalCentralTelefone = ponto.canais.find(
    (c) => c.rotulo === ROTULO_CENTRAL && c.tipo === "telefone"
  );
  const canalCentralEmail = ponto.canais.find(
    (c) => c.rotulo === ROTULO_CENTRAL && c.tipo === "email"
  );
  const canaisAdicionais = ponto.canais
    .filter((c) => c.rotulo !== ROTULO_CENTRAL)
    .map((c) => ({ tipo: c.tipo, rotulo: c.rotulo, valor: c.valor }));

  const horariosDoTipo = (slug: string) =>
    ponto.horarios.filter((h) => h.tipoHorario.slug === slug);

  const updateUnidadeComId = updateUnidade.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">
          Editar Local de Atendimento — {ponto.nome}
        </h2>
        <p className="text-sm text-slate-500">
          Atualize os dados do local e salve as alterações.
        </p>
      </div>

      <UnidadeForm
        action={updateUnidadeComId}
        orgaos={orgaos.map((o) => {
          const horarios = periodosDoOrgao(o.endereco);
          return {
            id: o.id,
            nome: o.nome,
            sigla: o.sigla,
            periodosFuncionamento: horarios.funcionamento,
            periodosAtendimento: horarios.atendimento,
          };
        })}
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
        submitLabel="Salvar Alterações"
        initialData={{
          nome: ponto.nome,
          orgaoId: ponto.orgaoId,
          ativo: ponto.ativo,
          endereco: ponto.endereco?.logradouro ?? "",
          complemento: ponto.endereco?.complemento ?? "",
          bairro: ponto.endereco?.bairro ?? "",
          cep: ponto.endereco?.cep ?? "",
          municipioId: ponto.endereco?.municipioId ?? 0,
          sourceMapa: ponto.endereco?.sourceMapa ?? "",
          responsavelNome: ponto.responsaveis[0]?.pessoa.nome ?? "",
          centralAtendimento: Boolean(canalCentralTelefone || canalCentralEmail),
          telefone: canalCentralTelefone?.valor ?? "",
          email: canalCentralEmail?.valor ?? "",
          canais: canaisAdicionais,
          periodosFuncionamento: reconstructPeriods(
            horariosDoTipo(TIPO_FUNCIONAMENTO)
          ),
          periodosAtendimento: reconstructPeriods(
            horariosDoTipo(TIPO_ATENDIMENTO)
          ),
        }}
      />
    </div>
  );
}
