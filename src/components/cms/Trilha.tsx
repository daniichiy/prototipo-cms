import Link from "next/link";

export type ItemTrilha = { label: string; href?: string };

/** Breadcrumb do CMS — último item é sempre a página atual. */
export default function Trilha({ itens }: { itens: ItemTrilha[] }) {
  return (
    <nav
      aria-label="Trilha de navegação"
      className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm"
    >
      {itens.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-slate-300">/</span>}
          {item.href ? (
            <Link href={item.href} className="text-navy-800 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-500">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
