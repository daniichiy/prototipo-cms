"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Horários (/cms/horarios) continua funcionando, mas fica fora do menu: é
// acessada apenas pela URL.
const colecoes = [
  { nome: "Cadastrar Órgãos", href: "/cms/cadastrar-orgaos" },
  { nome: "Órgãos", href: "/cms/orgaos" },
  { nome: "Unidades", href: "/cms/unidades" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-brand-600 text-white">
      <div className="flex items-center gap-2 border-b border-white/20 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-bold text-brand-600">
          MS
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">CMS Unidades</p>
          <p className="text-xs text-white/70 leading-tight">Governo de MS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
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
                      ? "bg-white text-brand-600 font-medium"
                      : "text-white/80 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active ? "bg-brand-600" : "bg-white/50"
                    }`}
                  />
                  {c.nome}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/20 px-5 py-4 text-xs text-white/60">
        Protótipo — sem autenticação
      </div>
    </aside>
  );
}
