import OrgaoCadastroForm from "@/components/cms/OrgaoCadastroForm";
import Trilha from "@/components/cms/Trilha";
import { createOrgaoCadastro } from "@/app/cms/cadastrar-orgaos/actions";

export default function NovoOrgaoCadastroPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Cadastrar Órgãos", href: "/cms/cadastrar-orgaos" },
          { label: "Novo órgão" },
        ]}
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">Novo Órgão</h2>
        <p className="text-sm text-slate-500">
          Informe a sigla, o nome do órgão e se ele está ativo.
        </p>
      </div>

      <OrgaoCadastroForm
        action={createOrgaoCadastro}
        cancelHref="/cms/cadastrar-orgaos"
        submitLabel="Cadastrar Órgão"
      />
    </div>
  );
}
