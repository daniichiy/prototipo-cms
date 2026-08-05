import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ConfirmActionButton from "@/components/cms/ConfirmActionButton";
import { deleteOrgaoCadastro } from "@/app/cms/cadastrar-orgaos/actions";

export default async function CadastrarOrgaosPage() {
  const orgaos = await prisma.orgaoCadastro.findMany({
    orderBy: { sigla: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy-900">
            Cadastrar Órgãos
          </h2>
          <p className="text-sm text-slate-500">
            Órgãos cadastrados ({orgaos.length})
          </p>
        </div>
        <Link
          href="/cms/cadastrar-orgaos/novo"
          className="rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-navy-700"
        >
          + Novo Órgão
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Sigla</th>
              <th className="px-4 py-3">Nome do órgão</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orgaos.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-navy-900">
                  {o.sigla}
                </td>
                <td className="px-4 py-3 text-slate-600">{o.nome}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      o.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {o.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start justify-end gap-4">
                    <Link
                      href={`/cms/cadastrar-orgaos/${o.id}/editar`}
                      className="text-sm text-navy-800 hover:underline"
                    >
                      Editar
                    </Link>
                    <ConfirmActionButton
                      action={deleteOrgaoCadastro.bind(null, o.id)}
                      label="Excluir"
                      pendingLabel="Excluindo..."
                      confirmMessage={`Excluir o órgão "${o.sigla}"? Essa ação não pode ser desfeita.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {orgaos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  Nenhum órgão cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
