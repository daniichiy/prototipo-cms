"use client";

import Link from "next/link";
import ContatoCampos, {
  type ContatoInitialData,
} from "@/components/cms/orgao/ContatoCampos";
import { botaoPrimarioClass } from "@/components/cms/form-ui";

export type { ContatoInitialData };

export default function ContatoForm({
  action,
  cancelHref,
  initialData,
}: {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  initialData?: ContatoInitialData;
}) {
  return (
    <form action={action}>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-base font-semibold text-navy-900">
          Gerenciar Contato do órgão
        </h3>

        <ContatoCampos initialData={initialData} />
      </div>

      <div className="mt-4 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
        <button type="submit" className={botaoPrimarioClass}>
          Salvar
        </button>
        <Link
          href={cancelHref}
          className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
