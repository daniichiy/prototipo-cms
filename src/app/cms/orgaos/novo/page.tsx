import { prisma } from "@/lib/prisma";
import OrgaoForm from "@/components/cms/OrgaoForm";
import Trilha from "@/components/cms/Trilha";
import { createOrgao } from "@/app/cms/orgaos/actions";

export default async function NovoOrgaoPage() {
  const municipios = await prisma.municipio.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Órgãos", href: "/cms/orgaos" },
          { label: "Novo órgão" },
        ]}
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">Novo Órgão</h2>
        <p className="text-sm text-slate-500">
          Preencha os dados do órgão, os contatos e o endereço nesta mesma
          página. Contato e endereço podem ficar em branco e ser informados
          depois.
        </p>
      </div>

      <OrgaoForm
        action={createOrgao}
        cancelHref="/cms/orgaos"
        submitLabel="Cadastrar Órgão"
        municipios={municipios}
        // campo "Responsável" desativado neste formulário
        mostrarResponsavel={false}
      />
    </div>
  );
}
