"use client";

import { useState } from "react";
import {
  Campo,
  inputClass,
  botaoAdicionarClass,
} from "@/components/cms/form-ui";
import { maskPhone } from "@/lib/masks";
import {
  TIPOS_CANAL,
  TIPO_CANAL_OUTRO,
  rotuloDoTipoCanal,
  normalizarCanal,
  type CanalInput,
} from "@/lib/contato";

export type CanalContatoInput = CanalInput;

export type ContatoInitialData = {
  responsavel: string;
  telefone: string;
  email: string;
  canais: CanalContatoInput[];
};

export default function ContatoCampos({
  initialData,
  obrigatorio = true,
  mostrarResponsavel = true,
}: {
  initialData?: ContatoInitialData;
  obrigatorio?: boolean;
  /** Campo "Responsável" fica inativo (some do formulário) quando false. */
  mostrarResponsavel?: boolean;
}) {
  const [telefone, setTelefone] = useState(initialData?.telefone ?? "");
  const [canais, setCanais] = useState<CanalContatoInput[]>(
    (initialData?.canais ?? []).map(normalizarCanal)
  );

  function addCanal() {
    setCanais((prev) => [
      ...prev,
      { tipo: "telefone", rotulo: rotuloDoTipoCanal("telefone"), valor: "" },
    ]);
  }
  function updateCanal(index: number, patch: Partial<CanalContatoInput>) {
    // normaliza para nenhum campo virar undefined e tornar o input não controlado
    setCanais((prev) =>
      prev.map((c, i) => (i === index ? normalizarCanal({ ...c, ...patch }) : c))
    );
  }
  // O próprio tipo vira o rótulo do canal; só "Outro" tem rótulo digitado.
  function updateTipoCanal(index: number, tipo: string) {
    updateCanal(index, {
      tipo,
      rotulo: tipo === TIPO_CANAL_OUTRO ? "" : rotuloDoTipoCanal(tipo),
    });
  }
  function removeCanal(index: number) {
    setCanais((prev) => prev.filter((_, i) => i !== index));
  }

  const marca = obrigatorio ? "(Obrigatório)" : "(Opcional)";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {mostrarResponsavel && (
          <Campo
            label="Responsável"
            className="sm:col-span-2"
            hint="Nome da pessoa responsável pelo órgão"
          >
            <input
              type="text"
              name="responsavel"
              defaultValue={initialData?.responsavel ?? ""}
              className={inputClass}
            />
          </Campo>
        )}

        <Campo
          label="Telefone"
          required={obrigatorio}
          hint={`Informe um número de telefone ${marca}`}
        >
          <input
            type="text"
            name="telefone"
            value={telefone ?? ""}
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
            placeholder="contato@orgao.ms.gov.br"
            required={obrigatorio}
            className={inputClass}
          />
        </Campo>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-700">
            Canais de atendimento
          </p>
          <p className="text-xs text-slate-400">
            WhatsApp, ouvidoria, redes sociais e outros canais (Opcional)
          </p>
        </div>

        {canais.map((canal, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select
              value={canal.tipo || "telefone"}
              onChange={(e) => updateTipoCanal(i, e.target.value)}
              className={`${inputClass} w-36`}
            >
              {TIPOS_CANAL.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.label}
                </option>
              ))}
            </select>
            {canal.tipo === TIPO_CANAL_OUTRO && (
              <input
                type="text"
                placeholder="Rótulo (ex: Instagram)"
                value={canal.rotulo ?? ""}
                onChange={(e) => updateCanal(i, { rotulo: e.target.value })}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
            )}
            <input
              type="text"
              placeholder="Valor"
              value={canal.valor ?? ""}
              onChange={(e) => updateCanal(i, { valor: e.target.value })}
              className={`${inputClass} min-w-[10rem] flex-1`}
            />
            <button
              type="button"
              onClick={() => removeCanal(i)}
              className="text-sm text-red-600 hover:underline"
            >
              Remover
            </button>
          </div>
        ))}

        <button type="button" onClick={addCanal} className={botaoAdicionarClass}>
          + adicionar canal
        </button>
      </div>

      <input
        type="hidden"
        name="canaisContatoJson"
        value={JSON.stringify(canais)}
      />
    </div>
  );
}
