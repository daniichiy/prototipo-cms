"use client";

import { inputClass } from "@/components/cms/form-ui";
import { DIAS_SEMANA } from "@/lib/masks";
import { PERIODO_VAZIO, type PeriodoInput } from "@/lib/horarios";

// Uma linha por dia da semana: o check liga o dia e os quatro campos de horário
// ficam na frente dele. Cada dia vira um PeriodoInput com um único dia.

const CAMPOS = [
  { chave: "inicioManha", label: "Início manhã" },
  { chave: "fimManha", label: "Fim manhã" },
  { chave: "inicioTarde", label: "Início tarde" },
  { chave: "fimTarde", label: "Fim tarde" },
] as const;

export default function HorarioPorDiaEditor({
  periods,
  onChange,
}: {
  periods: PeriodoInput[];
  onChange: (periods: PeriodoInput[]) => void;
}) {
  function periodoDoDia(dia: number) {
    return periods.find((p) => p.dias.includes(dia));
  }

  function ordenar(lista: PeriodoInput[]) {
    return [...lista].sort((a, b) => (a.dias[0] ?? 0) - (b.dias[0] ?? 0));
  }

  function toggleDia(dia: number) {
    if (periodoDoDia(dia)) {
      onChange(periods.filter((p) => !p.dias.includes(dia)));
      return;
    }
    onChange(ordenar([...periods, { ...PERIODO_VAZIO, dias: [dia] }]));
  }

  function atualizar(dia: number, patch: Partial<PeriodoInput>) {
    onChange(
      periods.map((p) => {
        if (!p.dias.includes(dia)) return p;
        const atualizado = { ...p, ...patch };
        // o intervalo é deduzido: preencher os campos da tarde significa que o
        // dia tem uma parada no meio
        return {
          ...atualizado,
          temIntervalo: Boolean(atualizado.fimManha && atualizado.inicioTarde),
        };
      })
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Marque os dias atendidos e informe o horário de cada um. Deixe os campos
        da tarde em branco quando o atendimento for corrido.
      </p>

      <div className="hidden gap-2 px-2 text-xs font-medium text-slate-500 sm:grid sm:grid-cols-[10rem_repeat(4,1fr)]">
        <span>Dia da semana</span>
        {CAMPOS.map((c) => (
          <span key={c.chave}>{c.label}</span>
        ))}
      </div>

      {DIAS_SEMANA.map((d) => {
        const periodo = periodoDoDia(d.valor);
        const marcado = Boolean(periodo);

        return (
          <div
            key={d.valor}
            className={`grid grid-cols-2 items-center gap-2 rounded-md border p-2 sm:grid-cols-[10rem_repeat(4,1fr)] ${
              marcado
                ? "border-slate-200 bg-slate-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700 sm:col-span-1">
              <input
                type="checkbox"
                checked={marcado}
                onChange={() => toggleDia(d.valor)}
                className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
              {d.label}
            </label>

            {CAMPOS.map((campo) => (
              <div key={campo.chave}>
                <span className="mb-0.5 block text-[11px] text-slate-500 sm:hidden">
                  {campo.label}
                </span>
                <input
                  type="time"
                  aria-label={`${campo.label} — ${d.label}`}
                  value={periodo?.[campo.chave] ?? ""}
                  disabled={!marcado}
                  onChange={(e) =>
                    atualizar(d.valor, { [campo.chave]: e.target.value })
                  }
                  className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
