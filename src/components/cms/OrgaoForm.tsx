"use client";

import Link from "next/link";
import {
  Secao,
  Campo,
  inputClass,
  botaoPrimarioClass,
  botaoSecundarioClass,
} from "@/components/cms/form-ui";
import ContatoCampos, {
  type ContatoInitialData,
} from "@/components/cms/orgao/ContatoCampos";
import EnderecoCampos, {
  type EnderecoInitialData,
} from "@/components/cms/orgao/EnderecoCampos";

export type OrgaoFormInitialData = {
  nome: string;
  sigla: string;
  ativo: boolean;
};

export default function OrgaoForm({
  action,
  initialData,
  cancelHref,
  submitLabel = "Salvar",
  municipios,
  contatoInitial,
  enderecoInitial,
}: {
  action: (formData: FormData) => Promise<void>;
  initialData?: OrgaoFormInitialData;
  cancelHref: string;
  submitLabel?: string;
  /** Quando informado, o formulário também exibe as seções de contato e endereço. */
  municipios?: { id: number; nome: string; uf: string }[];
  contatoInitial?: ContatoInitialData;
  enderecoInitial?: EnderecoInitialData;
}) {
  return (
    <form action={action} className="space-y-8 pb-16">
      <Secao titulo="Informações do Órgão" subtitulo="Dados básicos do órgão">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo label="Sigla" required hint="Informe a sigla do órgão">
            <input
              type="text"
              name="sigla"
              defaultValue={initialData?.sigla ?? ""}
              required
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Nome"
            required
            className="sm:col-span-2"
            hint="Informe o nome completo do órgão"
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
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="ativo"
                defaultChecked={initialData?.ativo ?? true}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
              Ativo?
            </label>
            <p className="ml-6 mt-0.5 text-xs text-slate-400">
              Informe se o órgão está ativo ou inativo
            </p>
          </div>
        </div>
      </Secao>

      {municipios && (
        <>
          <Secao
            titulo="Informações de Contato"
            subtitulo="Telefone, email e redes sociais do órgão. Preencha telefone e email para salvar o contato."
          >
            <ContatoCampos initialData={contatoInitial} obrigatorio={false} />
          </Secao>

          <Secao
            titulo="Endereço"
            subtitulo="Localização e horários do órgão. Deixe em branco para informar depois; se preencher, complete todos os campos marcados."
          >
            <EnderecoCampos
              municipios={municipios}
              initialData={enderecoInitial}
              obrigatorio={false}
            />
          </Secao>
        </>
      )}

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
