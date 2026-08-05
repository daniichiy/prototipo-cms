"use client";

import Link from "next/link";
import {
  Secao,
  Campo,
  inputClass,
  botaoPrimarioClass,
  botaoSecundarioClass,
} from "@/components/cms/form-ui";

export type OrgaoCadastroInitialData = {
  sigla: string;
  nome: string;
  ativo: boolean;
};

export default function OrgaoCadastroForm({
  action,
  cancelHref,
  initialData,
  submitLabel = "Salvar",
}: {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  initialData?: OrgaoCadastroInitialData;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="space-y-8 pb-16">
      <Secao
        titulo="Órgão"
        subtitulo="Informe a sigla, o nome completo e a situação do órgão"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Campo label="Sigla" required hint="Ex.: DETRAN">
            <input
              type="text"
              name="sigla"
              defaultValue={initialData?.sigla ?? ""}
              required
              maxLength={30}
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Nome do órgão"
            required
            className="sm:col-span-2"
            hint="Nome completo, sem abreviações"
          >
            <input
              type="text"
              name="nome"
              defaultValue={initialData?.nome ?? ""}
              required
              className={inputClass}
            />
          </Campo>

          <div className="sm:col-span-3">
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
              Informe se o órgão está ativo ou inativo
            </p>
          </div>
        </div>
      </Secao>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-slate-50/95 px-1 py-4 backdrop-blur">
        <Link href={cancelHref} className={botaoSecundarioClass}>
          Cancelar
        </Link>
        <button type="submit" className={botaoPrimarioClass}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
