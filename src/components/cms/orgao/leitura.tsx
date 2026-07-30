import Link from "next/link";

/** Rótulo + valor, no padrão em caixa alta do detalhe do órgão. */
export function Dado({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-navy-900">
        {label}
      </dt>
      <dd className="mt-1 text-sm uppercase text-slate-500">{children}</dd>
    </div>
  );
}

/** Valor booleano com marcador colorido, como no AS IS (• SIM / • NÃO). */
export function Booleano({ valor }: { valor: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          valor ? "bg-green-500" : "bg-red-400"
        }`}
      />
      {valor ? "SIM" : "NÃO"}
    </span>
  );
}

/** Texto padrão do AS IS para campo opcional vazio. */
export function NaoCadastrado() {
  return <span className="text-slate-400">NÃO CADASTRADO!</span>;
}

/** Cabeçalho de card com título e ação de editar opcional. */
export function Card({
  titulo,
  acaoHref,
  acaoLabel = "Editar",
  extraHeader,
  children,
}: {
  titulo: React.ReactNode;
  acaoHref?: string;
  acaoLabel?: string;
  extraHeader?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-navy-900">{titulo}</h3>
        <div className="flex items-center gap-2">
          {extraHeader}
          {acaoHref && (
            <Link
              href={acaoHref}
              className="rounded-md bg-navy-800 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-navy-700"
            >
              {acaoLabel}
            </Link>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Status Ativo/Inativo usado nas tabelas de associações. */
export function EtiquetaStatus({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium uppercase ${
        ativo ? "text-green-700" : "text-slate-500"
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          ativo ? "bg-green-500" : "bg-slate-400"
        }`}
      />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}
