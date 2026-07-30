"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Campo,
  inputClass,
  botaoPrimarioClass,
} from "@/components/cms/form-ui";

export type GestorInitialData = {
  nome: string;
  biografia: string;
  fotoUrl: string;
  ativo: boolean;
};

export default function GestorForm({
  action,
  cancelHref,
  initialData,
}: {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  initialData?: GestorInitialData;
}) {
  const [fotoUrl, setFotoUrl] = useState(initialData?.fotoUrl ?? "");

  return (
    <form action={action}>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-base font-semibold text-navy-900">
          Gerenciar Gestor do órgão
        </h3>

        <div className="space-y-5">
          <Campo
            label="Foto do gestor"
            hint="Insira a URL da foto do gestor (o protótipo não faz upload de arquivos)"
          >
            <input
              type="url"
              name="fotoUrl"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            {fotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoUrl}
                alt="Pré-visualização da foto do gestor"
                className="mt-3 h-24 w-24 rounded-md border border-slate-200 object-cover"
              />
            )}
          </Campo>

          <Campo label="Nome" required hint="Informe o nome do gestor">
            <input
              type="text"
              name="nome"
              defaultValue={initialData?.nome ?? ""}
              required
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Biografia"
            required
            hint="Informe a biografia do gestor. Aceita HTML."
          >
            <textarea
              name="biografia"
              defaultValue={initialData?.biografia ?? ""}
              rows={12}
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
