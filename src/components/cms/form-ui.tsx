"use client";

export function Secao({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-base font-semibold text-navy-900">{titulo}</h3>
        {subtitulo && <p className="text-xs text-slate-400">{subtitulo}</p>}
      </div>
      {children}
    </section>
  );
}

export function Campo({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-gold-600"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-700";

export const botaoAdicionarClass =
  "self-start rounded-md border border-dashed border-navy-300 px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-navy-50";

export const botaoPrimarioClass =
  "rounded-md bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-700";

export const botaoSecundarioClass =
  "rounded-md border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50";
