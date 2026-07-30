"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Campo,
  inputClass,
  botaoPrimarioClass,
} from "@/components/cms/form-ui";
import { maskPhone } from "@/lib/masks";

export type ContatoInitialData = {
  telefone: string;
  email: string;
  instagram: string;
  whatsapp: string;
  facebook: string;
  twitter: string;
  youtube: string;
};

export default function ContatoForm({
  action,
  cancelHref,
  initialData,
}: {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  initialData?: ContatoInitialData;
}) {
  const [telefone, setTelefone] = useState(initialData?.telefone ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");

  return (
    <form action={action}>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-base font-semibold text-navy-900">
          Gerenciar Contato do órgão
        </h3>

        <div className="space-y-5">
          <Campo
            label="Telefone"
            required
            hint="Informe um número de telefone (Obrigatório)"
          >
            <input
              type="text"
              name="telefone"
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
              placeholder="(00) 0000-0000"
              required
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Email"
            required
            hint="Informe um email válido (Obrigatório)"
          >
            <input
              type="email"
              name="email"
              defaultValue={initialData?.email ?? ""}
              required
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Instagram"
            hint="Insira a URL do perfil no instagram (Opcional)"
          >
            <input
              type="url"
              name="instagram"
              defaultValue={initialData?.instagram ?? ""}
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Whatsapp"
            hint="Informe um número do whatsapp (Opcional)"
          >
            <input
              type="text"
              name="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Facebook"
            hint="Insira a URL do perfil no facebook (Opcional)"
          >
            <input
              type="url"
              name="facebook"
              defaultValue={initialData?.facebook ?? ""}
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Twitter"
            hint="Insira a URL do perfil no twitter (Opcional)"
          >
            <input
              type="url"
              name="twitter"
              defaultValue={initialData?.twitter ?? ""}
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Youtube"
            hint="Insira a URL do perfil no youtube (Opcional)"
          >
            <input
              type="url"
              name="youtube"
              defaultValue={initialData?.youtube ?? ""}
              className={inputClass}
            />
          </Campo>
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
