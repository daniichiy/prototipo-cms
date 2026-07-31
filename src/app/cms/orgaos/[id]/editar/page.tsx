import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrgaoForm from "@/components/cms/OrgaoForm";
import Trilha from "@/components/cms/Trilha";
import { updateOrgao } from "@/app/cms/orgaos/actions";
import { parseDiasSemana } from "@/lib/orgao";

export default async function EditarOrgaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const [orgao, municipios] = await Promise.all([
    prisma.orgao.findUnique({
      where: { id },
      include: { contato: true, endereco: true },
    }),
    prisma.municipio.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!orgao) notFound();

  const c = orgao.contato;
  const e = orgao.endereco;

  const updateOrgaoComId = updateOrgao.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Órgãos", href: "/cms/orgaos" },
          { label: "Informações do Órgão", href: `/cms/orgaos/${id}` },
          { label: "Gerenciar Órgão" },
        ]}
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">
          Gerenciar Órgão — {orgao.sigla}
        </h2>
        <p className="text-sm text-slate-500">
          Atualize os dados do órgão, os contatos e o endereço e salve as
          alterações.
        </p>
      </div>

      <OrgaoForm
        action={updateOrgaoComId}
        cancelHref={`/cms/orgaos/${id}`}
        submitLabel="Salvar"
        initialData={{ sigla: orgao.sigla }}
        municipios={municipios}
        contatoInitial={{
          telefone: c?.telefone ?? "",
          email: c?.email ?? "",
          instagram: c?.instagram ?? "",
          whatsapp: c?.whatsapp ?? "",
          facebook: c?.facebook ?? "",
          twitter: c?.twitter ?? "",
          youtube: c?.youtube ?? "",
        }}
        enderecoInitial={{
          logradouro: e?.logradouro ?? "",
          sourceMapa: e?.sourceMapa ?? "",
          municipioId: e?.municipioId ?? null,
          dias: e ? parseDiasSemana(e.diasSemana) : [],
          temIntervalo: e?.temIntervalo ?? false,
          funcInicioManha: e?.funcInicioManha ?? "",
          funcFimManha: e?.funcFimManha ?? "",
          funcInicioTarde: e?.funcInicioTarde ?? "",
          funcFimTarde: e?.funcFimTarde ?? "",
          atendInicioManha: e?.atendInicioManha ?? "",
          atendFimManha: e?.atendFimManha ?? "",
          atendInicioTarde: e?.atendInicioTarde ?? "",
          atendFimTarde: e?.atendFimTarde ?? "",
        }}
      />
    </div>
  );
}
