import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrgaoForm from "@/components/cms/OrgaoForm";
import Trilha from "@/components/cms/Trilha";
import { updateOrgao } from "@/app/cms/orgaos/actions";

export default async function EditarOrgaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const orgao = await prisma.orgao.findUnique({ where: { id } });
  if (!orgao) notFound();

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
          Atualize os dados do órgão e salve as alterações.
        </p>
      </div>

      <OrgaoForm
        action={updateOrgaoComId}
        cancelHref={`/cms/orgaos/${id}`}
        submitLabel="Salvar"
        initialData={{
          nome: orgao.nome,
          sigla: orgao.sigla,
          slug: orgao.slug,
          site: orgao.site ?? "",
          informacoes: orgao.informacoes ?? "",
          identificadorControlador: orgao.identificadorControlador ?? "",
          ativo: orgao.ativo,
          orgaoExterno: orgao.orgaoExterno,
          atendenteMultiLocal: orgao.atendenteMultiLocal,
          ignoraRegrasAgendamento: orgao.ignoraRegrasAgendamento,
        }}
      />
    </div>
  );
}
