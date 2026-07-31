"use client";

import { useState } from "react";
import { Campo, inputClass } from "@/components/cms/form-ui";
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

export default function ContatoCampos({
  initialData,
  obrigatorio = true,
}: {
  initialData?: ContatoInitialData;
  obrigatorio?: boolean;
}) {
  const [telefone, setTelefone] = useState(initialData?.telefone ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");

  const marca = obrigatorio ? "(Obrigatório)" : "(Opcional)";

  return (
    <div className="space-y-5">
      <Campo
        label="Telefone"
        required={obrigatorio}
        hint={`Informe um número de telefone ${marca}`}
      >
        <input
          type="text"
          name="telefone"
          value={telefone}
          onChange={(e) => setTelefone(maskPhone(e.target.value))}
          placeholder="(00) 0000-0000"
          required={obrigatorio}
          className={inputClass}
        />
      </Campo>

      <Campo
        label="Email"
        required={obrigatorio}
        hint={`Informe um email válido ${marca}`}
      >
        <input
          type="email"
          name="email"
          defaultValue={initialData?.email ?? ""}
          required={obrigatorio}
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

      <Campo label="Whatsapp" hint="Informe um número do whatsapp (Opcional)">
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

      <Campo label="Twitter" hint="Insira a URL do perfil no twitter (Opcional)">
        <input
          type="url"
          name="twitter"
          defaultValue={initialData?.twitter ?? ""}
          className={inputClass}
        />
      </Campo>

      <Campo label="Youtube" hint="Insira a URL do perfil no youtube (Opcional)">
        <input
          type="url"
          name="youtube"
          defaultValue={initialData?.youtube ?? ""}
          className={inputClass}
        />
      </Campo>
    </div>
  );
}
