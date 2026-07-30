"use client";

import { useState } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { slugify } from "@/lib/slugify";
import { maskCep, maskPhone, DIAS_SEMANA } from "@/lib/masks";
import type { PeriodoInput } from "@/lib/horarios";

type Canal = { tipo: string; rotulo: string; valor: string };
type ServicoSel = { servicoId: number | null; atendimento: boolean; agendamento: boolean };

const PERIODO_VAZIO: PeriodoInput = {
  dias: [],
  temIntervalo: false,
  inicioManha: "",
  fimManha: "",
  inicioTarde: "",
  fimTarde: "",
};

export type UnidadeFormInitialData = {
  nome: string;
  slug: string;
  orgaoId: number;
  tipoPontoId: number;
  identificadorExterno: string;
  ativo: boolean;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  municipioId: number;
  iframeMapa: string;
  urlMapa: string;
  latitude: string;
  longitude: string;
  responsavelNome: string;
  telefone: string;
  canais: Canal[];
  periods: PeriodoInput[];
  servicos: ServicoSel[];
};

export default function UnidadeForm({
  action,
  orgaos,
  tiposPonto,
  municipios,
  servicosCatalogo,
  defaultTipoPontoId,
  initialData,
  submitLabel = "Salvar Unidade",
}: {
  action: (formData: FormData) => Promise<void>;
  orgaos: { id: number; nome: string; sigla: string }[];
  tiposPonto: { id: number; nome: string }[];
  municipios: { id: number; nome: string; uf: string }[];
  servicosCatalogo: { id: number; nome: string }[];
  defaultTipoPontoId?: number;
  initialData?: UnidadeFormInitialData;
  submitLabel?: string;
}) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialData);
  const [orgaoId, setOrgaoId] = useState<number | null>(
    initialData?.orgaoId ?? null
  );
  const [tipoPontoId, setTipoPontoId] = useState<number | null>(
    initialData?.tipoPontoId ?? defaultTipoPontoId ?? null
  );
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  const [municipioId, setMunicipioId] = useState<number | null>(
    initialData?.municipioId ?? null
  );
  const [cep, setCep] = useState(initialData?.cep ?? "");
  const [telefone, setTelefone] = useState(initialData?.telefone ?? "");

  const [canais, setCanais] = useState<Canal[]>(initialData?.canais ?? []);
  const [periods, setPeriods] = useState<PeriodoInput[]>(
    initialData?.periods?.length ? initialData.periods : [{ ...PERIODO_VAZIO }]
  );
  const [servicosSel, setServicosSel] = useState<ServicoSel[]>(
    initialData?.servicos ?? []
  );

  function handleNomeChange(v: string) {
    setNome(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function updatePeriod(index: number, patch: Partial<PeriodoInput>) {
    setPeriods((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p))
    );
  }

  function toggleDia(index: number, dia: number) {
    setPeriods((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const has = p.dias.includes(dia);
        return {
          ...p,
          dias: has ? p.dias.filter((d) => d !== dia) : [...p.dias, dia].sort(),
        };
      })
    );
  }

  function addCanal() {
    setCanais((prev) => [...prev, { tipo: "telefone", rotulo: "", valor: "" }]);
  }
  function updateCanal(index: number, patch: Partial<Canal>) {
    setCanais((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }
  function removeCanal(index: number) {
    setCanais((prev) => prev.filter((_, i) => i !== index));
  }

  function addServico() {
    setServicosSel((prev) => [
      ...prev,
      { servicoId: null, atendimento: false, agendamento: false },
    ]);
  }
  function updateServico(index: number, patch: Partial<ServicoSel>) {
    setServicosSel((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }
  function removeServico(index: number) {
    setServicosSel((prev) => prev.filter((_, i) => i !== index));
  }
  function selecionarTodosServicos() {
    setServicosSel(
      servicosCatalogo.map((s) => ({
        servicoId: s.id,
        atendimento: false,
        agendamento: false,
      }))
    );
  }

  const canaisValidos = canais;
  const servicosValidos = servicosSel.filter(
    (s): s is { servicoId: number; atendimento: boolean; agendamento: boolean } =>
      s.servicoId !== null
  );

  return (
    <form action={action} className="space-y-8 pb-16">
      {/* BLOCO 1 — Identificação */}
      <Secao titulo="Identificação" subtitulo="Dados básicos da unidade">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Nome" required className="sm:col-span-2">
            <input
              type="text"
              value={nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              required
              className={inputClass}
              name="nome"
            />
          </Campo>

          <Campo label="Slug" required hint="Gerado automaticamente, mas editável">
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
              className={inputClass}
              name="slug"
            />
          </Campo>

          <Campo label="Órgão" required>
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

          <Campo label="Tipo de local" required>
            <select
              name="tipoPontoId"
              required
              value={tipoPontoId ?? ""}
              onChange={(e) => setTipoPontoId(Number(e.target.value))}
              className={inputClass}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {tiposPonto.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            label="Identificador externo"
            hint="não preencher"
          >
            <input
              type="text"
              name="identificadorExterno"
              defaultValue={initialData?.identificadorExterno ?? ""}
              className={inputClass}
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
              Unidade ativa
            </label>
          </div>
        </div>
      </Secao>

      {/* BLOCO 2 — Endereço */}
      <Secao titulo="Endereço" subtitulo="Localização física da unidade">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo label="Logradouro" required className="sm:col-span-2">
            <input
              type="text"
              name="logradouro"
              defaultValue={initialData?.logradouro ?? ""}
              required
              className={inputClass}
            />
          </Campo>
          <Campo label="Número" required>
            <input
              type="text"
              name="numero"
              defaultValue={initialData?.numero ?? ""}
              required
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

          <Campo label="Cidade" required className="sm:col-span-2">
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
            label="Iframe do Google Maps"
            required
            className="sm:col-span-3"
            hint="Cole o código <iframe> gerado pelo Google Maps"
          >
            <textarea
              name="iframeMapa"
              defaultValue={initialData?.iframeMapa ?? ""}
              required
              rows={3}
              className={inputClass}
            />
          </Campo>

          <Campo label="Link do Google Maps" className="sm:col-span-2">
            <input
              type="url"
              name="urlMapa"
              defaultValue={initialData?.urlMapa ?? ""}
              placeholder="https://maps.app.goo.gl/..."
              className={inputClass}
            />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Latitude">
              <input
                type="number"
                step="any"
                name="latitude"
                defaultValue={initialData?.latitude ?? ""}
                className={inputClass}
              />
            </Campo>
            <Campo label="Longitude">
              <input
                type="number"
                step="any"
                name="longitude"
                defaultValue={initialData?.longitude ?? ""}
                className={inputClass}
              />
            </Campo>
          </div>
        </div>
      </Secao>

      {/* BLOCO 3 — Contato */}
      <Secao
        titulo="Contato"
        subtitulo="Campos complementares, não exigidos pela Carta de Serviço"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Responsável">
            <input
              type="text"
              name="responsavelNome"
              defaultValue={initialData?.responsavelNome ?? ""}
              className={inputClass}
            />
          </Campo>
          <Campo label="Telefone">
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              className={inputClass}
              name="telefone"
            />
          </Campo>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Canais adicionais</p>
          {canaisValidos.map((canal, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <select
                value={canal.tipo}
                onChange={(e) => updateCanal(i, { tipo: e.target.value })}
                className={`${inputClass} w-36`}
              >
                <option value="telefone">Telefone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
              </select>
              <input
                type="text"
                placeholder="Rótulo (ex: Ouvidoria)"
                value={canal.rotulo}
                onChange={(e) => updateCanal(i, { rotulo: e.target.value })}
                className={`${inputClass} flex-1 min-w-[10rem]`}
              />
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
          <button
            type="button"
            onClick={addCanal}
            className={botaoAdicionarClass}
          >
            + adicionar canal
          </button>
        </div>
      </Secao>

      {/* BLOCO 4 — Horário de Funcionamento */}
      <Secao titulo="Horário de Funcionamento">
        <div className="space-y-6">
          {periods.map((periodo, i) => (
            <div
              key={i}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Período {i + 1}
                </p>
                {periods.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setPeriods((prev) => prev.filter((_, idx) => idx !== i))
                    }
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
                Há intervalo no funcionamento?
              </label>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Campo label="Início da manhã" required>
                  <input
                    type="time"
                    required
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
                    required={periodo.temIntervalo}
                    value={periodo.fimManha}
                    onChange={(e) =>
                      updatePeriod(i, { fimManha: e.target.value })
                    }
                    className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                  />
                </Campo>
                <Campo label="Início da tarde">
                  <input
                    type="time"
                    disabled={!periodo.temIntervalo}
                    required={periodo.temIntervalo}
                    value={periodo.inicioTarde}
                    onChange={(e) =>
                      updatePeriod(i, { inicioTarde: e.target.value })
                    }
                    className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                  />
                </Campo>
                <Campo label="Fim da tarde" required>
                  <input
                    type="time"
                    required
                    value={periodo.fimTarde}
                    onChange={(e) =>
                      updatePeriod(i, { fimTarde: e.target.value })
                    }
                    className={inputClass}
                  />
                </Campo>
              </div>
              {periodo.dias.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  Selecione ao menos um dia da semana.
                </p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setPeriods((prev) => [...prev, { ...PERIODO_VAZIO }])}
            className={botaoAdicionarClass}
          >
            + adicionar outro período
          </button>
        </div>
      </Secao>

      {/* BLOCO 5 — Serviços Vinculados */}
      <Secao titulo="Serviços Vinculados">
        <div className="space-y-3">
          {servicosSel.map((servico, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3">
              <div className="min-w-[16rem] flex-1">
                <SearchableSelect
                  value={servico.servicoId}
                  onChange={(id) => updateServico(i, { servicoId: id })}
                  placeholder="Buscar serviço..."
                  options={servicosCatalogo.map((s) => ({
                    id: s.id,
                    label: s.nome,
                  }))}
                />
              </div>
              <label className="flex items-center gap-1.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={servico.atendimento}
                  onChange={(e) =>
                    updateServico(i, { atendimento: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
                />
                Atendimento presencial disponível?
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={servico.agendamento}
                  onChange={(e) =>
                    updateServico(i, { agendamento: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
                />
                Atendimento online disponível?
              </label>
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
              Selecionar todos os serviços
            </button>
          </div>
        </div>
      </Secao>

      {/* Campos ocultos com estruturas complexas serializadas */}
      <input type="hidden" name="canaisJson" value={JSON.stringify(canaisValidos)} />
      <input type="hidden" name="periodsJson" value={JSON.stringify(periods)} />
      <input type="hidden" name="servicosJson" value={JSON.stringify(servicosValidos)} />

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

function Secao({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-base font-semibold text-navy-900">{titulo}</h3>
        {subtitulo && <p className="text-xs text-slate-400">{subtitulo}</p>}
      </div>
      {children}
    </section>
  );
}

function Campo({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-gold-600"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-700";

const botaoAdicionarClass =
  "self-start rounded-md border border-dashed border-navy-300 px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-navy-50";
