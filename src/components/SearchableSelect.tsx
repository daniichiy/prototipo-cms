"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableOption = {
  id: number;
  label: string;
  sublabel?: string;
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  required,
  name,
}: {
  options: SearchableOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) ?? null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.sublabel?.toLowerCase().includes(q)
    );
  }, [query, options]);

  return (
    <div className="relative" ref={containerRef}>
      {name && <input type="hidden" name={name} value={value ?? ""} required={required} />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
      >
        {selected ? (
          <span>
            {selected.label}
            {selected.sublabel && (
              <span className="text-slate-400"> — {selected.sublabel}</span>
            )}
          </span>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full border-b border-slate-200 px-3 py-2 text-sm focus:outline-none"
          />
          <ul className="max-h-56 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-slate-400">Nenhum resultado</li>
            )}
            {filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`block w-full px-3 py-2 text-left hover:bg-navy-50 ${
                    o.id === value ? "bg-navy-50 font-medium text-navy-800" : ""
                  }`}
                >
                  {o.label}
                  {o.sublabel && (
                    <span className="text-slate-400"> — {o.sublabel}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
