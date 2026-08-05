import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrgaoCadastroForm from "@/components/cms/OrgaoCadastroForm";
import Trilha from "@/components/cms/Trilha";
import { updateOrgaoCadastro } from "@/app/cms/cadastrar-orgaos/actions";

export default async function EditarOrgaoCadastroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const orgao = await prisma.orgaoCadastro.findUnique({ where: { id } });
  if (!orgao) notFound();

  const updateComId = updateOrgaoCadastro.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Cadastrar Órgãos", href: "/cms/cadastrar-orgaos" },
          { label: "Gerenciar Órgão" },
        ]}
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">
          Gerenciar Órgão — {orgao.sigla}
        </h2>
        <p className="text-sm text-slate-500">
          Atualize a sigla, o nome do órgão ou a situação.
        </p>
      </div>

      <OrgaoCadastroForm
        action={updateComId}
        cancelHref="/cms/cadastrar-orgaos"
        submitLabel="Salvar Alterações"
        initialData={{
          sigla: orgao.sigla,
          nome: orgao.nome,
          ativo: orgao.ativo,
        }}
      />
    </div>
  );
}
