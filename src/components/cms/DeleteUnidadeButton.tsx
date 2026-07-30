"use client";

import { useTransition } from "react";
import { deleteUnidade } from "@/app/cms/unidades/actions";

export default function DeleteUnidadeButton({
  id,
  nome,
}: {
  id: number;
  nome: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Excluir a unidade "${nome}"? Essa ação não pode ser desfeita.`)) {
          startTransition(() => {
            deleteUnidade(id);
          });
        }
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Excluindo..." : "Excluir"}
    </button>
  );
}
