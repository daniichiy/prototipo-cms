"use client";

import { useState, useTransition } from "react";

/**
 * Botão que dispara uma server action já vinculada (bind) com confirmação
 * opcional e exibição do erro devolvido pela action.
 */
export default function ConfirmActionButton({
  action,
  label,
  pendingLabel,
  confirmMessage,
  className = "text-sm text-red-600 hover:underline disabled:opacity-50",
}: {
  action: () => Promise<void>;
  label: string;
  pendingLabel?: string;
  confirmMessage?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleClick() {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setErro(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className={className}
      >
        {isPending ? (pendingLabel ?? "Aguarde...") : label}
      </button>
      {erro && <span className="mt-1 text-xs text-red-600">{erro}</span>}
    </span>
  );
}
