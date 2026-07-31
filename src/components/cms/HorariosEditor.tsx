"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MultiSelect from "@/components/MultiSelect";
import { Campo, inputClass } from "@/components/cms/form-ui";
import PeriodosEditor from "@/components/cms/PeriodosEditor";
import {
  normalizarPeriodo,
  resumoPeriodos,
  type PeriodoInput,
} from "@/lib/horarios";

export type ModeloHorarioResumo = {
  id: number;
  nome: string;
  periodos: PeriodoInput[];
};

export default function HorariosEditor({
  titulo,
  periods,
  onChange,
  modelos,
  onSalvarModelo,
  outrosLocais,
  replicarIds,
  onReplicarChange,
}: {
  titulo: string;
  periods: PeriodoInput[];
  onChange: (periods: PeriodoInput[]) => void;
  modelos: ModeloHorarioResumo[];
  onSalvarModelo: (nome: string, periodosJson: string) => Promise<void>;
  outrosLocais: { id: number; nome: string; sublabel?: string }[];
  replicarIds: number[];
  onReplicarChange: (ids: number[]) => void;
}) {
  const router = useRouter();
  const [modeloId, setModeloId] = useState("");
  const [nomeNovoModelo, setNomeNovoModelo] = useState("");
  const [mostrarSalvarModelo, setMostrarSalvarModelo] = useState(false);
  const [mostrarReplicar, setMostrarReplicar] = useState(replicarIds.length > 0);
  const [erroModelo, setErroModelo] = useState<string | null>(null);
  const [salvando, startSalvar] = useTransition();

  function aplicarModelo(id: string) {
    setModeloId(id);
    const modelo = modelos.find((m) => String(m.id) === id);
    if (modelo?.periodos.length) {
      onChange(modelo.periodos.map(normalizarPeriodo));
    }
  }

  function salvarModelo() {
    const nome = nomeNovoModelo.trim();
    if (!nome) {
      setErroModelo("Dê um nome ao horário para poder reutilizá-lo.");
      return;
    }
    setErroModelo(null);
    startSalvar(async () => {
      try {
        await onSalvarModelo(nome, JSON.stringify(periods));
        setNomeNovoModelo("");
        setMostrarSalvarModelo(false);
        router.refresh();
      } catch (e) {
        setErroModelo(
          e instanceof Error ? e.message : "Não foi possível salvar o horário."
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Reaproveitar um horário já cadastrado */}
      <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3">
        <Campo
          label="Usar um horário já cadastrado"
          hint="Preenche os períodos abaixo com um horário salvo — você ainda pode ajustá-lo."
        >
          <select
            value={modeloId ?? ""}
            onChange={(e) => aplicarModelo(e.target.value)}
            className={inputClass}
          >
            <option value="">Preencher manualmente</option>
            {modelos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} — {resumoPeriodos(m.periodos)}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <PeriodosEditor periods={periods} onChange={onChange} />

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setMostrarSalvarModelo((v) => !v)}
          className="text-sm font-medium text-gold-600 hover:underline"
        >
          Salvar este horário para reutilizar
        </button>
        <button
          type="button"
          onClick={() => setMostrarReplicar((v) => !v)}
          className="text-sm font-medium text-gold-600 hover:underline"
        >
          Aplicar este horário a outros locais
        </button>
      </div>

      {mostrarSalvarModelo && (
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <Campo
            label="Nome do horário"
            hint="Ex.: “Expediente padrão 07:30 às 17:30”. Ele passa a aparecer na lista acima para qualquer local."
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={nomeNovoModelo}
                onChange={(e) => setNomeNovoModelo(e.target.value)}
                className={`${inputClass} flex-1 min-w-[14rem]`}
              />
              <button
                type="button"
                onClick={salvarModelo}
                disabled={salvando}
                className="rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {salvando ? "Salvando..." : "Salvar horário"}
              </button>
            </div>
          </Campo>
          <p className="mt-2 text-xs text-slate-500">
            Será salvo: {resumoPeriodos(periods) || "—"}
          </p>
          {erroModelo && <p className="mt-2 text-xs text-red-600">{erroModelo}</p>}
        </div>
      )}

      {mostrarReplicar && (
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="mb-1 text-sm font-medium text-slate-700">
            Aplicar o mesmo {titulo.toLowerCase()} a outros locais
          </p>
          <p className="mb-2 text-xs text-slate-500">
            Ao salvar, estes locais passam a ter exatamente este horário — o
            horário anterior deles, deste tipo, é substituído.
          </p>
          <MultiSelect
            options={outrosLocais.map((u) => ({
              id: u.id,
              label: u.nome,
              sublabel: u.sublabel,
            }))}
            values={replicarIds}
            onChange={onReplicarChange}
            placeholder="Buscar local de atendimento..."
            vazio="Nenhum outro local cadastrado"
          />
        </div>
      )}
    </div>
  );
}
