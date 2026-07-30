"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Secao,
  Campo,
  inputClass,
  botaoPrimarioClass,
  botaoSecundarioClass,
} from "@/components/cms/form-ui";
import { slugify } from "@/lib/slugify";

export type OrgaoFormInitialData = {
  nome: string;
  sigla: string;
  slug: string;
  site: string;
  informacoes: string;
  identificadorControlador: string;
  ativo: boolean;
  orgaoExterno: boolean;
  atendenteMultiLocal: boolean;
  ignoraRegrasAgendamento: boolean;
};

export default function OrgaoForm({
  action,
  initialData,
  cancelHref,
  submitLabel = "Salvar",
}: {
  action: (formData: FormData) => Promise<void>;
  initialData?: OrgaoFormInitialData;
  cancelHref: string;
  submitLabel?: string;
}) {
  const [sigla, setSigla] = useState(initialData?.sigla ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialData);

  function handleSiglaChange(v: string) {
    setSigla(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  return (
    <form action={action} className="space-y-8 pb-16">
      <Secao titulo="Identificação" subtitulo="Dados básicos do órgão">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Sigla" required hint="Informe a sigla do órgão">
            <input
              type="text"
              name="sigla"
              value={sigla}
              onChange={(e) => handleSiglaChange(e.target.value)}
              required
              className={inputClass}
            />
          </Campo>

          <Campo label="Slug" required hint="Gerado automaticamente, mas editável">
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
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

          <Campo label="Site" hint="Insira a URL do site do órgão (Opcional)">
            <input
              type="url"
              name="site"
              defaultValue={initialData?.site ?? ""}
              placeholder="https://www.orgao.ms.gov.br"
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Identificador no controlador"
            hint="Id do órgão no sistema legado (Opcional)"
          >
            <input
              type="text"
              name="identificadorControlador"
              defaultValue={initialData?.identificadorControlador ?? ""}
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Informações"
            className="sm:col-span-2"
            hint="Texto institucional exibido na página do órgão. Aceita HTML."
          >
            <textarea
              name="informacoes"
              defaultValue={initialData?.informacoes ?? ""}
              rows={8}
              className={inputClass}
            />
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Configurações" subtitulo="Regras de comportamento do órgão">
        <div className="space-y-3">
          <CampoBooleano
            name="ativo"
            label="Ativo?"
            hint="Informe se o órgão está ativo ou inativo"
            defaultChecked={initialData?.ativo ?? true}
          />
          <CampoBooleano
            name="orgaoExterno"
            label="Órgão externo?"
            hint="Marque se o órgão não faz parte da estrutura do Governo do Estado"
            defaultChecked={initialData?.orgaoExterno ?? false}
          />
          <CampoBooleano
            name="atendenteMultiLocal"
            label="Atendentes podem ser adicionados em mais de um local de atendimento?"
            hint="Marque se o mesmo atendente pode atuar em vários locais"
            defaultChecked={initialData?.atendenteMultiLocal ?? false}
          />
          <CampoBooleano
            name="ignoraRegrasAgendamento"
            label="Ignora regras de agendamento?"
            hint="Marque se o órgão não segue as regras padrão de agendamento"
            defaultChecked={initialData?.ignoraRegrasAgendamento ?? false}
          />
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

function CampoBooleano({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
        />
        {label}
      </label>
      <p className="ml-6 mt-0.5 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
