"use client";

import { Campo, inputClass, botaoAdicionarClass } from "@/components/cms/form-ui";
import { DIAS_SEMANA } from "@/lib/masks";
import { PERIODO_VAZIO, type PeriodoInput } from "@/lib/horarios";

// Blocos de período (dias da semana + faixas de horário) compartilhados pelo
// formulário de local de atendimento e pelo cadastro de horários reutilizáveis.
export default function PeriodosEditor({
  periods,
  onChange,
}: {
  periods: PeriodoInput[];
  onChange: (periods: PeriodoInput[]) => void;
}) {
  function updatePeriod(index: number, patch: Partial<PeriodoInput>) {
    onChange(periods.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function toggleDia(index: number, dia: number) {
    onChange(
      periods.map((p, i) => {
        if (i !== index) return p;
        const has = p.dias.includes(dia);
        return {
          ...p,
          dias: has
            ? p.dias.filter((d) => d !== dia)
            : [...p.dias, dia].sort((a, b) => a - b),
        };
      })
    );
  }

  return (
    <div className="space-y-4">
      {periods.map((periodo, i) => (
        <div
          key={i}
          className="rounded-md border border-slate-200 bg-slate-50 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Período {i + 1}</p>
            {periods.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(periods.filter((_, idx) => idx !== i))}
                className="text-sm text-red-600 hover:underline"
              >
                Remover período
              </button>
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            {DIAS_SEMANA.map((d) => (
              <label
                key={d.valor}
                className="flex items-center gap-1.5 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={periodo.dias.includes(d.valor)}
                  onChange={() => toggleDia(i, d.valor)}
                  className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
                />
                {d.label}
              </label>
            ))}
          </div>

          <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={periodo.temIntervalo}
              onChange={(e) =>
                updatePeriod(i, { temIntervalo: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
            />
            Há intervalo (almoço)?
          </label>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Campo label="Início da manhã">
              <input
                type="time"
                value={periodo.inicioManha}
                onChange={(e) =>
                  updatePeriod(i, { inicioManha: e.target.value })
                }
                className={inputClass}
              />
            </Campo>
            <Campo label="Fim da manhã">
              <input
                type="time"
                disabled={!periodo.temIntervalo}
                value={periodo.fimManha}
                onChange={(e) => updatePeriod(i, { fimManha: e.target.value })}
                className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
              />
            </Campo>
            <Campo label="Início da tarde">
              <input
                type="time"
                disabled={!periodo.temIntervalo}
                value={periodo.inicioTarde}
                onChange={(e) =>
                  updatePeriod(i, { inicioTarde: e.target.value })
                }
                className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
              />
            </Campo>
            <Campo label="Fim da tarde">
              <input
                type="time"
                value={periodo.fimTarde}
                onChange={(e) => updatePeriod(i, { fimTarde: e.target.value })}
                className={inputClass}
              />
            </Campo>
          </div>

          {periodo.inicioManha && periodo.dias.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              Selecione ao menos um dia da semana.
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...periods, { ...PERIODO_VAZIO }])}
        className={botaoAdicionarClass}
      >
        + adicionar outro período
      </button>
    </div>
  );
}
