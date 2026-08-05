"use client";

import { useState } from "react";
import { Campo, inputClass } from "@/components/cms/form-ui";
import { DIAS_SEMANA } from "@/lib/masks";

export type HorariosInitialData = {
  dias: number[];
  temIntervalo: boolean;
  funcInicioManha: string;
  funcFimManha: string;
  funcInicioTarde: string;
  funcFimTarde: string;
  atendInicioManha: string;
  atendFimManha: string;
  atendInicioTarde: string;
  atendFimTarde: string;
};

export default function HorariosCampos({
  initialData,
  obrigatorio = true,
}: {
  initialData?: HorariosInitialData;
  obrigatorio?: boolean;
}) {
  const [dias, setDias] = useState<number[]>(initialData?.dias ?? []);
  const [temIntervalo, setTemIntervalo] = useState(
    initialData?.temIntervalo ?? false
  );

  function toggleDia(valor: number) {
    setDias((prev) =>
      prev.includes(valor)
        ? prev.filter((d) => d !== valor)
        : [...prev, valor].sort((a, b) => a - b)
    );
  }

  return (
    <div className="space-y-5">
      <Campo
        label="Dias da Semana"
        required={obrigatorio}
        hint="Escolha os dias da semana"
      >
        <div className="flex flex-wrap gap-2 rounded-md border border-slate-300 bg-white p-2">
          {DIAS_SEMANA.map((d) => {
            const selecionado = dias.includes(d.valor);
            return (
              <button
                key={d.valor}
                type="button"
                onClick={() => toggleDia(d.valor)}
                aria-pressed={selecionado}
                className={`rounded px-2 py-1 text-sm ${
                  selecionado
                    ? "bg-slate-200 text-slate-800"
                    : "border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {selecionado && <span aria-hidden>× </span>}
                {d.label}
              </button>
            );
          })}
        </div>
        {obrigatorio && dias.length === 0 && (
          <p className="mt-1 text-xs text-amber-600">
            Selecione ao menos um dia da semana.
          </p>
        )}
      </Campo>

      <div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="temIntervalo"
            checked={temIntervalo}
            onChange={(e) => setTemIntervalo(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
          />
          Órgão tem intervalo no funcionamento?
        </label>
        <p className="ml-6 mt-0.5 text-xs text-slate-400">
          Marque se o intervalo de almoço estiver ativo.
        </p>
      </div>

      <BlocoHorarios
        titulo="Horário de funcionamento"
        prefixo="func"
        rotulo="funcionamento"
        temIntervalo={temIntervalo}
        obrigatorio={obrigatorio}
        initial={{
          inicioManha: initialData?.funcInicioManha ?? "",
          fimManha: initialData?.funcFimManha ?? "",
          inicioTarde: initialData?.funcInicioTarde ?? "",
          fimTarde: initialData?.funcFimTarde ?? "",
        }}
      />

      <BlocoHorarios
        titulo="Horário de atendimento"
        prefixo="atend"
        rotulo="atendimento"
        temIntervalo={temIntervalo}
        obrigatorio={obrigatorio}
        initial={{
          inicioManha: initialData?.atendInicioManha ?? "",
          fimManha: initialData?.atendFimManha ?? "",
          inicioTarde: initialData?.atendInicioTarde ?? "",
          fimTarde: initialData?.atendFimTarde ?? "",
        }}
      />

      <input type="hidden" name="diasSemanaJson" value={JSON.stringify(dias)} />
    </div>
  );
}

function BlocoHorarios({
  titulo,
  prefixo,
  rotulo,
  temIntervalo,
  obrigatorio,
  initial,
}: {
  titulo: string;
  prefixo: "func" | "atend";
  rotulo: string;
  temIntervalo: boolean;
  obrigatorio: boolean;
  initial: {
    inicioManha: string;
    fimManha: string;
    inicioTarde: string;
    fimTarde: string;
  };
}) {
  const desabilitadoClass = `${inputClass} disabled:bg-slate-100 disabled:text-slate-400`;

  return (
    <fieldset className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <legend className="px-1 text-sm font-medium text-slate-700">
        {titulo}
      </legend>
      {/* os quatro horários ficam lado a lado, em uma única linha */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Campo
          label="Início manhã"
          required={obrigatorio}
          hint={`Hora de início do ${rotulo} pela manhã`}
        >
          <input
            type="time"
            name={`${prefixo}InicioManha`}
            defaultValue={initial.inicioManha}
            required={obrigatorio}
            className={inputClass}
          />
        </Campo>

        <Campo
          label="Fim manhã"
          required={obrigatorio && temIntervalo}
          hint={`Hora de finalização do ${rotulo} pela manhã`}
        >
          <input
            type="time"
            name={`${prefixo}FimManha`}
            defaultValue={initial.fimManha}
            disabled={!temIntervalo}
            required={obrigatorio && temIntervalo}
            className={desabilitadoClass}
          />
        </Campo>

        <Campo
          label="Início tarde"
          required={obrigatorio && temIntervalo}
          hint={`Hora de início do ${rotulo} pela tarde`}
        >
          <input
            type="time"
            name={`${prefixo}InicioTarde`}
            defaultValue={initial.inicioTarde}
            disabled={!temIntervalo}
            required={obrigatorio && temIntervalo}
            className={desabilitadoClass}
          />
        </Campo>

        <Campo
          label="Fim tarde"
          required={obrigatorio}
          hint={`Hora de finalização do ${rotulo} pela tarde`}
        >
          <input
            type="time"
            name={`${prefixo}FimTarde`}
            defaultValue={initial.fimTarde}
            required={obrigatorio}
            className={inputClass}
          />
        </Campo>
      </div>
    </fieldset>
  );
}
