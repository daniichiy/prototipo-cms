"use client";

import Link from "next/link";
import {
  Campo,
  inputClass,
  botaoPrimarioClass,
} from "@/components/cms/form-ui";

export type SiteInitialData = {
  titulo: string;
  link: string;
  ativo: boolean;
};

export default function SiteForm({
  action,
  cancelHref,
  initialData,
}: {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  initialData?: SiteInitialData;
}) {
  return (
    <form action={action}>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-base font-semibold text-navy-900">
          Gerenciar Site Relacionado - Órgão
        </h3>

        <div className="space-y-5">
          <Campo label="Título" required hint="Informe o título do site">
            <input
              type="text"
              name="titulo"
              defaultValue={initialData?.titulo ?? ""}
              required
              className={inputClass}
            />
          </Campo>

          <Campo label="Link" required hint="Informe o link do site">
            <input
              type="url"
              name="link"
              defaultValue={initialData?.link ?? ""}
              placeholder="https://..."
              required
              className={inputClass}
            />
          </Campo>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="ativo"
                defaultChecked={initialData?.ativo ?? true}
                className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
              Ativo?
            </label>
            <p className="ml-6 mt-0.5 text-xs text-slate-400">
              Informe se está ativo ou inativo
            </p>
          </div>
        </div>
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
