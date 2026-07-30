import OrgaoForm from "@/components/cms/OrgaoForm";
import Trilha from "@/components/cms/Trilha";
import { createOrgao } from "@/app/cms/orgaos/actions";

export default function NovoOrgaoPage() {
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
          Cadastre o órgão. Contatos, endereço e associações são informados em
          seguida, na página de informações.
        </p>
      </div>

      <OrgaoForm
        action={createOrgao}
        cancelHref="/cms/orgaos"
        submitLabel="Cadastrar Órgão"
      />
    </div>
  );
}
