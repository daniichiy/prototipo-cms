"use client";

import { useMemo, useState } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { Campo, inputClass } from "@/components/cms/form-ui";
import { maskCep } from "@/lib/masks";
import type { HorariosInitialData } from "@/components/cms/orgao/HorariosCampos";

export type MunicipioOption = { id: number; nome: string; uf: string };

export type EnderecoInitialData = {
  logradouro: string;
  complemento: string;
  bairro: string;
  cep: string;
  sourceMapa: string;
  municipioId: number | null;
};

/** Endereço + horários no mesmo formulário (tela "Gerenciar Endereço"). */
export type EnderecoHorariosInitialData = EnderecoInitialData &
  HorariosInitialData;

export default function EnderecoCampos({
  municipios,
  initialData,
  obrigatorio = true,
}: {
  municipios: MunicipioOption[];
  initialData?: EnderecoInitialData;
  obrigatorio?: boolean;
}) {
  const [municipioId, setMunicipioId] = useState<number | null>(
    initialData?.municipioId ?? null
  );
  // a UF vem do município escolhido; serve para filtrar a lista de cidades
  const [uf, setUf] = useState(
    () =>
      municipios.find((m) => m.id === initialData?.municipioId)?.uf ?? ""
  );
  const [cep, setCep] = useState(initialData?.cep ?? "");

  const ufs = useMemo(
    () => [...new Set(municipios.map((m) => m.uf))].sort(),
    [municipios]
  );
  const municipiosDaUf = useMemo(
    () => (uf ? municipios.filter((m) => m.uf === uf) : municipios),
    [municipios, uf]
  );

  // trocar a UF invalida a cidade que não pertence mais à lista
  function trocarUf(novaUf: string) {
    setUf(novaUf);
    const atual = municipios.find((m) => m.id === municipioId);
    if (atual && novaUf && atual.uf !== novaUf) setMunicipioId(null);
  }

  return (
    <div className="space-y-5">
      {/* cada campo tem key própria: sem isso o React reaproveita o input da
          mesma posição ao reordenar (ex.: controlado <-> não controlado) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Campo
          key="cep"
          label="CEP"
          required={obrigatorio}
          className="sm:col-span-2"
          hint="CEP do endereço"
        >
          <input
            type="text"
            name="cep"
            value={cep}
            onChange={(e) => setCep(maskCep(e.target.value))}
            placeholder="00000-000"
            required={obrigatorio}
            className={inputClass}
          />
        </Campo>

        <Campo
          key="logradouro"
          label="Endereço"
          required={obrigatorio}
          className="sm:col-span-4"
          hint="Informe o endereço"
        >
          <input
            type="text"
            name="logradouro"
            defaultValue={initialData?.logradouro ?? ""}
            placeholder="Rua, avenida ou rodovia e número"
            required={obrigatorio}
            className={inputClass}
          />
        </Campo>

        <Campo
          key="complemento"
          label="Complemento"
          className="sm:col-span-3"
          hint="Bloco, sala, andar (Opcional)"
        >
          <input
            type="text"
            name="complemento"
            defaultValue={initialData?.complemento ?? ""}
            className={inputClass}
          />
        </Campo>

        <Campo
          key="bairro"
          label="Bairro"
          required={obrigatorio}
          className="sm:col-span-3"
          hint="Bairro do endereço"
        >
          <input
            type="text"
            name="bairro"
            defaultValue={initialData?.bairro ?? ""}
            required={obrigatorio}
            className={inputClass}
          />
        </Campo>

        <Campo
          key="uf"
          label="UF"
          required={obrigatorio}
          className="sm:col-span-2"
          hint="Estado do endereço"
        >
          <select
            name="uf"
            value={uf}
            onChange={(e) => trocarUf(e.target.value)}
            required={obrigatorio}
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {ufs.map((sigla) => (
              <option key={sigla} value={sigla}>
                {sigla}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          key="cidade"
          label="Cidade"
          required={obrigatorio}
          className="sm:col-span-4"
          hint="Informe a cidade"
        >
          <SearchableSelect
            name="municipioId"
            required={obrigatorio}
            value={municipioId}
            onChange={setMunicipioId}
            placeholder="Buscar cidade..."
            options={municipiosDaUf.map((m) => ({
              id: m.id,
              label: m.nome,
              sublabel: m.uf,
            }))}
          />
        </Campo>
      </div>

      <Campo
        label="Source do maps"
        required={obrigatorio}
        hint="Adicionar source/embed do maps.google.com."
      >
        <textarea
          name="sourceMapa"
          defaultValue={initialData?.sourceMapa ?? ""}
          rows={6}
          required={obrigatorio}
          className={inputClass}
        />
      </Campo>
    </div>
  );
}
