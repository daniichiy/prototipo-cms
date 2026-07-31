"use client";

import { useMemo, useState } from "react";

export type MultiSelectOption = {
  id: number;
  label: string;
  sublabel?: string;
};

export default function MultiSelect({
  options,
  values,
  onChange,
  placeholder = "Buscar...",
  vazio = "Nenhum item disponível",
}: {
  options: MultiSelectOption[];
  values: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  vazio?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.sublabel?.toLowerCase().includes(q)
    );
  }, [query, options]);

  function toggle(id: number) {
    onChange(
      values.includes(id) ? values.filter((v) => v !== id) : [...values, id]
    );
  }

  const todosFiltradosSelecionados =
    filtered.length > 0 && filtered.every((o) => values.includes(o.id));

  return (
    <div className="rounded-md border border-slate-300 bg-white shadow-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-t-md border-b border-slate-200 px-3 py-2 text-sm focus:outline-none"
      />

      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5 text-xs text-slate-500">
        <span>{values.length} selecionado(s)</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              onChange(
                todosFiltradosSelecionados
                  ? values.filter((v) => !filtered.some((o) => o.id === v))
                  : [
                      ...values,
                      ...filtered
                        .map((o) => o.id)
                        .filter((id) => !values.includes(id)),
                    ]
              )
            }
            className="font-medium text-navy-800 hover:underline"
          >
            {todosFiltradosSelecionados ? "Limpar seleção" : "Selecionar todos"}
          </button>
        </div>
      </div>

      <ul className="max-h-56 overflow-y-auto py-1 text-sm">
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-slate-400">{vazio}</li>
        )}
        {filtered.map((o) => (
          <li key={o.id}>
            <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-navy-50">
              <input
                type="checkbox"
                checked={values.includes(o.id)}
                onChange={() => toggle(o.id)}
                className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
              <span className="text-slate-700">
                {o.label}
                {o.sublabel && (
                  <span className="text-slate-400"> — {o.sublabel}</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
