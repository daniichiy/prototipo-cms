"use client";

import { useState } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import {
  Secao,
  Campo,
  inputClass,
  botaoAdicionarClass,
} from "@/components/cms/form-ui";
import HorariosEditor, {
  type ModeloHorarioResumo,
} from "@/components/cms/HorariosEditor";
import { maskCep, maskPhone } from "@/lib/masks";
import {
  TIPOS_CANAL,
  TIPO_CANAL_OUTRO,
  rotuloDoTipoCanal,
} from "@/lib/contato";
import {
  PERIODO_VAZIO,
  normalizarPeriodo,
  type PeriodoInput,
} from "@/lib/horarios";

type Canal = { tipo: string; rotulo: string; valor: string };
type ServicoSel = { servicoId: number | null };

export type UnidadeFormInitialData = {
  nome: string;
  orgaoId: number;
  ativo: boolean;
  endereco: string;
  complemento: string;
  bairro: string;
  cep: string;
  municipioId: number;
  sourceMapa: string;
  responsavelNome: string;
  centralAtendimento: boolean;
  telefone: string;
  email: string;
  canais: Canal[];
  periodosFuncionamento: PeriodoInput[];
  periodosAtendimento: PeriodoInput[];
  servicos: ServicoSel[];
};

export default function UnidadeForm({
  action,
  orgaos,
  municipios,
  servicosCatalogo,
  modelosHorario,
  outrosLocais,
  salvarModeloHorario,
  initialData,
  submitLabel = "Salvar Local de Atendimento",
}: {
  action: (formData: FormData) => Promise<void>;
  orgaos: { id: number; nome: string; sigla: string }[];
  municipios: { id: number; nome: string; uf: string }[];
  servicosCatalogo: { id: number; nome: string }[];
  modelosHorario: ModeloHorarioResumo[];
  outrosLocais: { id: number; nome: string; sublabel?: string }[];
  salvarModeloHorario: (nome: string, periodosJson: string) => Promise<void>;
  initialData?: UnidadeFormInitialData;
  submitLabel?: string;
}) {
  const [orgaoId, setOrgaoId] = useState<number | null>(
    initialData?.orgaoId ?? null
  );
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  const [municipioId, setMunicipioId] = useState<number | null>(
    initialData?.municipioId ?? null
  );
  const [cep, setCep] = useState(initialData?.cep ?? "");

  const [centralAtendimento, setCentralAtendimento] = useState(
    initialData?.centralAtendimento ?? false
  );
  const [telefone, setTelefone] = useState(initialData?.telefone ?? "");

  const [canais, setCanais] = useState<Canal[]>(
    (initialData?.canais ?? []).map((c) => ({
      tipo: c.tipo ?? "telefone",
      rotulo: c.rotulo ?? "",
      valor: c.valor ?? "",
    }))
  );

  const [periodosFuncionamento, setPeriodosFuncionamento] = useState<
    PeriodoInput[]
  >(
    initialData?.periodosFuncionamento?.length
      ? initialData.periodosFuncionamento.map(normalizarPeriodo)
      : [{ ...PERIODO_VAZIO }]
  );
  const [periodosAtendimento, setPeriodosAtendimento] = useState<PeriodoInput[]>(
    initialData?.periodosAtendimento?.length
      ? initialData.periodosAtendimento.map(normalizarPeriodo)
      : [{ ...PERIODO_VAZIO }]
  );
  const [replicarFuncionamento, setReplicarFuncionamento] = useState<number[]>(
    []
  );
  const [replicarAtendimento, setReplicarAtendimento] = useState<number[]>([]);

  const [servicosSel, setServicosSel] = useState<ServicoSel[]>(
    initialData?.servicos ?? []
  );

  function addCanal() {
    setCanais((prev) => [
      ...prev,
      { tipo: "telefone", rotulo: rotuloDoTipoCanal("telefone"), valor: "" },
    ]);
  }
  function updateCanal(index: number, patch: Partial<Canal>) {
    setCanais((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
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

  function addServico() {
    setServicosSel((prev) => [...prev, { servicoId: null }]);
  }
  function updateServico(index: number, servicoId: number | null) {
    setServicosSel((prev) =>
      prev.map((s, i) => (i === index ? { servicoId } : s))
    );
  }
  function removeServico(index: number) {
    setServicosSel((prev) => prev.filter((_, i) => i !== index));
  }
  function selecionarTodosServicos() {
    setServicosSel(servicosCatalogo.map((s) => ({ servicoId: s.id })));
  }

  const servicosValidos = servicosSel.filter(
    (s): s is { servicoId: number } => s.servicoId !== null
  );

  return (
    <form action={action} className="space-y-8 pb-16">
      {/* BLOCO 1 — Cadastro do local de atendimento */}
      <Secao
        titulo="Cadastro do local de atendimento"
        subtitulo="Dados exibidos na seção “Onde solicitar” da Carta de Serviço"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo label="Nome" required className="sm:col-span-3">
            <input
              type="text"
              name="nome"
              defaultValue={initialData?.nome ?? ""}
              required
              className={inputClass}
            />
          </Campo>

          <Campo label="CEP" required>
            <input
              type="text"
              name="cep"
              value={cep}
              onChange={(e) => setCep(maskCep(e.target.value))}
              placeholder="00000-000"
              required
              className={inputClass}
            />
          </Campo>

          <Campo
            label="Endereço"
            required
            className="sm:col-span-2"
            hint="Logradouro e número do local"
          >
            <input
              type="text"
              name="endereco"
              defaultValue={initialData?.endereco ?? ""}
              required
              placeholder="Ex.: Rua Engenheiro Luthero Lopes, 36"
              className={inputClass}
            />
          </Campo>

          <Campo label="Complemento">
            <input
              type="text"
              name="complemento"
              defaultValue={initialData?.complemento ?? ""}
              className={inputClass}
            />
          </Campo>

          <Campo label="Bairro" required>
            <input
              type="text"
              name="bairro"
              defaultValue={initialData?.bairro ?? ""}
              required
              className={inputClass}
            />
          </Campo>

          <Campo label="Cidade" required>
            <SearchableSelect
              name="municipioId"
              required
              value={municipioId}
              onChange={setMunicipioId}
              placeholder="Buscar cidade..."
              options={municipios.map((m) => ({
                id: m.id,
                label: m.nome,
                sublabel: m.uf,
              }))}
            />
          </Campo>

          <Campo
            label="Source do mapa"
            required
            className="sm:col-span-3"
            hint="Link de referência do endereço no Google Maps"
          >
            <input
              type="text"
              name="sourceMapa"
              defaultValue={initialData?.sourceMapa ?? ""}
              required
              placeholder="https://www.google.com/maps/embed?pb=..."
              className={inputClass}
            />
          </Campo>

          <Campo label="Órgão" required className="sm:col-span-2">
            <SearchableSelect
              name="orgaoId"
              required
              value={orgaoId}
              onChange={setOrgaoId}
              placeholder="Buscar órgão..."
              options={orgaos.map((o) => ({
                id: o.id,
                label: o.nome,
                sublabel: o.sigla,
              }))}
            />
          </Campo>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
            />
            <label htmlFor="ativo" className="text-sm text-slate-700">
              Ativo (apto para atendimento)
            </label>
          </div>
        </div>
      </Secao>

      {/* BLOCO 2 — Contato */}
      <Secao titulo="Adicionar contato">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Responsável" hint="Nome da pessoa responsável pela unidade">
            <input
              type="text"
              name="responsavelNome"
              defaultValue={initialData?.responsavelNome ?? ""}
              className={inputClass}
            />
          </Campo>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="centralAtendimento"
            checked={centralAtendimento}
            onChange={(e) => setCentralAtendimento(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
          />
          Central de Atendimento
        </label>

        {centralAtendimento && (
          <div className="mt-3 grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <Campo label="Telefone da unidade">
              <input
                type="text"
                name="telefone"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className={inputClass}
              />
            </Campo>
            <Campo label="E-mail da unidade">
              <input
                type="email"
                name="email"
                defaultValue={initialData?.email ?? ""}
                placeholder="contato@orgao.ms.gov.br"
                className={inputClass}
              />
            </Campo>
          </div>
        )}

        <div className="mt-5 space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-700">
              Canais de atendimento
            </p>
            <p className="text-xs text-slate-400">
              WhatsApp, e-mail e outros canais (ex.: “WhatsApp da Glória”)
            </p>
          </div>
          {canais.map((canal, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <select
                value={canal.tipo}
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
                  placeholder="Rótulo (ex: WhatsApp da Glória)"
                  value={canal.rotulo}
                  onChange={(e) => updateCanal(i, { rotulo: e.target.value })}
                  className={`${inputClass} flex-1 min-w-[10rem]`}
                />
              )}
              <input
                type="text"
                placeholder="Valor"
                value={canal.valor}
                onChange={(e) => updateCanal(i, { valor: e.target.value })}
                className={`${inputClass} flex-1 min-w-[10rem]`}
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
      </Secao>

      {/* BLOCO 3 — Horário de funcionamento */}
      <Secao
        titulo="Horário de funcionamento"
        subtitulo="Período em que o local está aberto"
      >
        <HorariosEditor
          titulo="Horário de funcionamento"
          periods={periodosFuncionamento}
          onChange={setPeriodosFuncionamento}
          modelos={modelosHorario}
          onSalvarModelo={salvarModeloHorario}
          outrosLocais={outrosLocais}
          replicarIds={replicarFuncionamento}
          onReplicarChange={setReplicarFuncionamento}
        />
      </Secao>

      {/* BLOCO 4 — Horário de atendimento */}
      <Secao
        titulo="Horário de atendimento"
        subtitulo="Período em que o cidadão é atendido — é o horário exibido na Carta de Serviço"
      >
        <HorariosEditor
          titulo="Horário de atendimento"
          periods={periodosAtendimento}
          onChange={setPeriodosAtendimento}
          modelos={modelosHorario}
          onSalvarModelo={salvarModeloHorario}
          outrosLocais={outrosLocais}
          replicarIds={replicarAtendimento}
          onReplicarChange={setReplicarAtendimento}
        />
      </Secao>

      {/* BLOCO 5 — Serviços vinculados */}
      <Secao
        titulo="Serviços vinculados"
        subtitulo="Serviços prestados neste local de atendimento"
      >
        <div className="space-y-3">
          {servicosSel.map((servico, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3">
              <div className="min-w-[16rem] flex-1">
                <SearchableSelect
                  value={servico.servicoId}
                  onChange={(id) => updateServico(i, id)}
                  placeholder="Buscar serviço..."
                  options={servicosCatalogo.map((s) => ({
                    id: s.id,
                    label: s.nome,
                  }))}
                />
              </div>
              <button
                type="button"
                onClick={() => removeServico(i)}
                className="text-sm text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          ))}

          <div className="flex gap-3">
            <button type="button" onClick={addServico} className={botaoAdicionarClass}>
              + adicionar serviço
            </button>
            <button
              type="button"
              onClick={selecionarTodosServicos}
              className="text-sm font-medium text-gold-600 hover:underline"
            >
              Selecionar todos
            </button>
          </div>
        </div>
      </Secao>

      {/* Campos ocultos com estruturas complexas serializadas */}
      <input type="hidden" name="canaisJson" value={JSON.stringify(canais)} />
      <input
        type="hidden"
        name="funcionamentoJson"
        value={JSON.stringify(periodosFuncionamento)}
      />
      <input
        type="hidden"
        name="atendimentoJson"
        value={JSON.stringify(periodosAtendimento)}
      />
      <input
        type="hidden"
        name="replicarFuncionamentoJson"
        value={JSON.stringify(replicarFuncionamento)}
      />
      <input
        type="hidden"
        name="replicarAtendimentoJson"
        value={JSON.stringify(replicarAtendimento)}
      />
      <input
        type="hidden"
        name="servicosJson"
        value={JSON.stringify(servicosValidos)}
      />

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-slate-50/95 px-1 py-4 backdrop-blur">
        <button
          type="submit"
          className="rounded-md bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
