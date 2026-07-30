import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CmsHomePage() {
  const totalUnidades = await prisma.pontoAtendimento.count();
  const totalAtivas = await prisma.pontoAtendimento.count({
    where: { ativo: true },
  });
  const totalOrgaos = await prisma.orgao.count();

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-semibold text-navy-900">
        Bem-vindo ao CMS de Unidades
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Protótipo de cadastro unificado de Unidades / Locais de Atendimento
        dos órgãos públicos do Estado de Mato Grosso do Sul. Selecione uma
        coleção no menu à esquerda para começar.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Unidades cadastradas
          </p>
          <p className="mt-2 text-3xl font-semibold text-navy-900">
            {totalUnidades}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Unidades ativas
          </p>
          <p className="mt-2 text-3xl font-semibold text-navy-900">
            {totalAtivas}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Órgãos
          </p>
          <p className="mt-2 text-3xl font-semibold text-navy-900">
            {totalOrgaos}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-navy-900">Coleções</h3>
        <Link
          href="/cms/unidades"
          className="mt-3 flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-sm hover:border-gold-500 hover:bg-gold-100/40"
        >
          <span>
            <span className="font-medium text-navy-800">Unidades</span>
            <span className="ml-2 text-slate-400">
              Locais de atendimento (Carta de Serviço / Fale Conosco)
            </span>
          </span>
          <span className="text-gold-600">Abrir →</span>
        </Link>
      </div>
    </div>
  );
}
