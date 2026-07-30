"use client";

import { useEffect } from "react";

/** Modal do CMS — cabeçalho azul com título e botão de fechar, como no AS IS. */
export default function Modal({
  titulo,
  onClose,
  children,
  larguraMaxima = "max-w-lg",
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
  larguraMaxima?: string;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 py-16"
    >
      <div
        className={`w-full ${larguraMaxima} overflow-hidden rounded-md bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between bg-brand-600 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            {titulo}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-xl leading-none text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
