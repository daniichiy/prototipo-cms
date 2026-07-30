import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteUnidadeButton from "@/components/cms/DeleteUnidadeButton";

export default async function UnidadesPage() {
  const unidades = await prisma.pontoAtendimento.findMany({
    orderBy: { nome: "asc" },
    include: {
      orgao: true,
      endereco: { include: { municipio: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy-900">Unidades</h2>
          <p className="text-sm text-slate-500">
            Locais de atendimento cadastrados ({unidades.length})
          </p>
        </div>
        <Link
          href="/cms/unidades/novo"
          className="rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-navy-700"
        >
          + Nova Unidade
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Órgão</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-navy-900">
                  {u.nome}
                  <p className="text-xs font-normal text-slate-400">/{u.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {u.orgao.sigla}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {u.endereco?.municipio.nome ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/cms/unidades/${u.id}/editar`}
                      className="text-sm text-navy-800 hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteUnidadeButton id={u.id} nome={u.nome} />
                  </div>
                </td>
              </tr>
            ))}
            {unidades.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  Nenhuma unidade cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
