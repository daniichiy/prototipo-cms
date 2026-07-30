"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const colecoes = [{ nome: "Unidades", href: "/cms/unidades" }];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-navy-900 text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-500 text-sm font-bold text-navy-950">
          MS
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">CMS Unidades</p>
          <p className="text-xs text-white/50 leading-tight">Governo de MS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          Coleções
        </p>
        <ul className="space-y-1">
          {colecoes.map((c) => {
            const active = pathname?.startsWith(c.href);
            return (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-gold-500 text-navy-950 font-medium"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active ? "bg-navy-950" : "bg-white/40"
                    }`}
                  />
                  {c.nome}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-white/40">
        Protótipo — sem autenticação
      </div>
    </aside>
  );
}
