"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MultiSelect from "@/components/MultiSelect";
import PeriodosEditor from "@/components/cms/PeriodosEditor";
import {
  Secao,
  Campo,
  inputClass,
  botaoPrimarioClass,
} from "@/components/cms/form-ui";
import {
  PERIODO_VAZIO,
  resumoPeriodos,
  TIPO_ATENDIMENTO,
  TIPO_FUNCIONAMENTO,
  type PeriodoInput,
} from "@/lib/horarios";
import {
  aplicarModeloEmLocais,
  excluirModeloHorario,
  salvarModeloHorario,
} from "@/app/cms/horarios/actions";

type Modelo = {
  id: number;
  nome: string;
  periodos: PeriodoInput[];
};

type Local = { id: number; nome: string; sublabel?: string };

export default function ModelosHorarioPanel({
  modelos,
  locais,
}: {
  modelos: Modelo[];
  locais: Local[];
}) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [periodos, setPeriodos] = useState<PeriodoInput[]>([
    { ...PERIODO_VAZIO },
  ]);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, startSalvar] = useTransition();

  function salvar() {
    setErro(null);
    startSalvar(async () => {
      try {
        await salvarModeloHorario(nome, JSON.stringify(periodos));
        setNome("");
        setPeriodos([{ ...PERIODO_VAZIO }]);
        router.refresh();
      } catch (e) {
        setErro(
          e instanceof Error ? e.message : "Não foi possível salvar o horário."
        );
      }
    });
  }

  return (
    <div className="space-y-8 pb-16">
      <Secao
        titulo="Novo horário"
        subtitulo="Cadastre uma vez e aplique a quantos locais de atendimento quiser"
      >
        <Campo
          label="Nome do horário"
          required
          hint="Ex.: “Expediente padrão 07:30 às 17:30”"
        >
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
          />
        </Campo>

        <div className="mt-4">
          <PeriodosEditor periods={periodos} onChange={setPeriodos} />
        </div>

        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className={`${botaoPrimarioClass} disabled:opacity-60`}
          >
            {salvando ? "Salvando..." : "Salvar horário"}
          </button>
        </div>
      </Secao>

      <Secao
        titulo="Horários cadastrados"
        subtitulo="Aplique o mesmo horário a vários locais de atendimento de uma vez"
      >
        {modelos.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Nenhum horário cadastrado ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {modelos.map((m) => (
              <ModeloItem key={m.id} modelo={m} locais={locais} />
            ))}
          </ul>
        )}
      </Secao>
    </div>
  );
}

function ModeloItem({ modelo, locais }: { modelo: Modelo; locais: Local[] }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [tipos, setTipos] = useState<string[]>([TIPO_ATENDIMENTO]);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, startProcessar] = useTransition();

  function toggleTipo(slug: string) {
    setTipos((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  }

  function aplicar() {
    setErro(null);
    setMensagem(null);
    if (!tipos.length) {
      setErro("Escolha se o horário é de funcionamento, de atendimento ou ambos.");
      return;
    }
    startProcessar(async () => {
      try {
        for (const tipo of tipos) {
          await aplicarModeloEmLocais(modelo.id, tipo, selecionados);
        }
        setMensagem(
          `Horário aplicado a ${selecionados.length} local(is) de atendimento.`
        );
        setSelecionados([]);
        router.refresh();
      } catch (e) {
        setErro(
          e instanceof Error ? e.message : "Não foi possível aplicar o horário."
        );
      }
    });
  }

  function excluir() {
    startProcessar(async () => {
      await excluirModeloHorario(modelo.id);
      router.refresh();
    });
  }

  return (
    <li className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-navy-900">{modelo.nome}</p>
          <p className="text-sm text-slate-500">
            {resumoPeriodos(modelo.periodos)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="text-sm font-medium text-navy-800 hover:underline"
          >
            {aberto ? "Fechar" : "Aplicar a locais"}
          </button>
          <button
            type="button"
            onClick={excluir}
            disabled={processando}
            className="text-sm text-red-600 hover:underline disabled:opacity-60"
          >
            Excluir
          </button>
        </div>
      </div>

      {aberto && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={tipos.includes(TIPO_FUNCIONAMENTO)}
                onChange={() => toggleTipo(TIPO_FUNCIONAMENTO)}
                className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
              Horário de funcionamento
            </label>
            <label className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={tipos.includes(TIPO_ATENDIMENTO)}
                onChange={() => toggleTipo(TIPO_ATENDIMENTO)}
                className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
              Horário de atendimento
            </label>
          </div>

          <MultiSelect
            options={locais.map((l) => ({
              id: l.id,
              label: l.nome,
              sublabel: l.sublabel,
            }))}
            values={selecionados}
            onChange={setSelecionados}
            placeholder="Buscar local de atendimento..."
            vazio="Nenhum local de atendimento cadastrado"
          />

          {erro && <p className="text-sm text-red-600">{erro}</p>}
          {mensagem && <p className="text-sm text-green-700">{mensagem}</p>}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={aplicar}
              disabled={processando || selecionados.length === 0}
              className="rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {processando ? "Aplicando..." : "Aplicar horário"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
