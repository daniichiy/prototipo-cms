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
import HorariosCampos, {
  type HorariosInitialData,
} from "@/components/cms/orgao/HorariosCampos";
import { ORGAOS_DISPONIVEIS } from "@/lib/orgao";

export type OrgaoFormInitialData = {
  sigla: string;
};

export default function OrgaoForm({
  action,
  initialData,
  cancelHref,
  submitLabel = "Salvar",
  municipios,
  contatoInitial,
  enderecoInitial,
  mostrarResponsavel = true,
}: {
  action: (formData: FormData) => Promise<void>;
  initialData?: OrgaoFormInitialData;
  cancelHref: string;
  submitLabel?: string;
  /** Quando informado, o formulário também exibe as seções de contato e endereço. */
  municipios?: { id: number; nome: string; uf: string }[];
  contatoInitial?: ContatoInitialData;
  enderecoInitial?: EnderecoInitialData & HorariosInitialData;
  /** Campo "Responsável" do contato fica inativo quando false. */
  mostrarResponsavel?: boolean;
}) {
  return (
    <form action={action} className="space-y-8 pb-16">
      <Secao titulo="Órgão" subtitulo="Selecione o órgão">
        <Campo label="Órgão" required hint="Escolha o órgão na lista">
          <select
            name="sigla"
            defaultValue={initialData?.sigla ?? ""}
            required
            className={inputClass}
          >
            <option value="" disabled>
              Selecione o órgão...
            </option>
            {ORGAOS_DISPONIVEIS.map((o) => (
              <option key={o.sigla} value={o.sigla}>
                {o.sigla}
              </option>
            ))}
          </select>
        </Campo>
      </Secao>

      {municipios && (
        <>
          <Secao
            titulo="Informações de Contato"
            subtitulo="Responsável, telefone e email do órgão, além dos canais de atendimento. Preencha telefone e email para salvar o contato."
          >
            <ContatoCampos
              initialData={contatoInitial}
              obrigatorio={false}
              mostrarResponsavel={mostrarResponsavel}
            />
          </Secao>

          <Secao
            titulo="Endereço"
            subtitulo="Localização do órgão. Deixe em branco para informar depois; se preencher, complete todos os campos marcados."
          >
            <EnderecoCampos
              municipios={municipios}
              initialData={enderecoInitial}
              obrigatorio={false}
            />
          </Secao>

          <Secao
            titulo="Horários"
            subtitulo="Dias da semana e horários de funcionamento e de atendimento do órgão."
          >
            <HorariosCampos initialData={enderecoInitial} obrigatorio={false} />
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
