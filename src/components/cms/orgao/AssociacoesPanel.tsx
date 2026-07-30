"use client";

import Link from "next/link";
import { useState } from "react";
import Modal from "@/components/cms/Modal";
import ConfirmActionButton from "@/components/cms/ConfirmActionButton";
import SearchableSelect from "@/components/SearchableSelect";
import { EtiquetaStatus } from "@/components/cms/orgao/leitura";
import {
  Campo,
  inputClass,
  botaoPrimarioClass,
} from "@/components/cms/form-ui";
import {
  createSetor,
  toggleSetor,
  deleteSetor,
  deleteGestor,
  createUsuario,
  deleteUsuario,
  deleteSite,
} from "@/app/cms/orgaos/actions";
import { PERFIS_USUARIO } from "@/lib/orgao";

export type SetorItem = { id: number; sigla: string; nome: string; ativo: boolean };
export type GestorItem = {
  id: number;
  nome: string;
  fotoUrl: string | null;
  ativo: boolean;
};
export type UsuarioItem = {
  id: number;
  nome: string;
  cpf: string | null;
  perfil: string;
  ativo: boolean;
};
export type SiteItem = {
  id: number;
  titulo: string;
  link: string;
  ativo: boolean;
};

type Aba = "setores" | "gestores" | "usuarios" | "sites";

const ABAS: { id: Aba; label: string }[] = [
  { id: "setores", label: "Setores" },
  { id: "gestores", label: "Gestores" },
  { id: "usuarios", label: "Usuários" },
  { id: "sites", label: "Sites relacionados" },
];

const POR_PAGINA = 10;

export default function AssociacoesPanel({
  orgaoId,
  abaInicial = "setores",
  setores,
  gestores,
  usuarios,
  sites,
  pessoas,
}: {
  orgaoId: number;
  abaInicial?: Aba;
  setores: SetorItem[];
  gestores: GestorItem[];
  usuarios: UsuarioItem[];
  sites: SiteItem[];
  pessoas: { id: number; nome: string; cpf: string | null }[];
}) {
  const [aba, setAba] = useState<Aba>(abaInicial);
  const [modal, setModal] = useState<"setor" | "usuario" | null>(null);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-navy-900">Associações</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModal("setor")}
            className={botaoAssociacaoClass}
          >
            + Setor
          </button>
          <Link
            href={`/cms/orgaos/${orgaoId}/gestores/novo`}
            className={botaoAssociacaoClass}
          >
            + Gestor
          </Link>
          <Link
            href={`/cms/orgaos/${orgaoId}/sites/novo`}
            className={botaoAssociacaoClass}
          >
            + Site
          </Link>
          <button
            type="button"
            onClick={() => setModal("usuario")}
            className={botaoAssociacaoClass}
          >
            + Usuário
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`-mb-px rounded-t-md border px-4 py-2 text-sm ${
              aba === a.id
                ? "border-slate-200 border-b-white bg-white font-medium text-navy-900"
                : "border-transparent text-slate-500 hover:text-navy-800"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === "setores" && (
        <Tabela
          colunas={["Sigla", "Nome", "Status", "Ações"]}
          itens={setores}
          vazio="Nenhum setor cadastrado."
          renderLinha={(s) => (
            <>
              <td className="px-4 py-3 font-medium text-navy-900">{s.sigla}</td>
              <td className="px-4 py-3 text-slate-600">{s.nome}</td>
              <td className="px-4 py-3">
                <EtiquetaStatus ativo={s.ativo} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-start gap-4">
                  <ConfirmActionButton
                    action={() => toggleSetor(orgaoId, s.id)}
                    label={s.ativo ? "Inativar" : "Ativar"}
                    pendingLabel="Salvando..."
                    className="text-sm text-navy-800 hover:underline disabled:opacity-50"
                  />
                  <ConfirmActionButton
                    action={() => deleteSetor(orgaoId, s.id)}
                    label="Excluir"
                    pendingLabel="Excluindo..."
                    confirmMessage={`Excluir o setor "${s.sigla}"?`}
                  />
                </div>
              </td>
            </>
          )}
        />
      )}

      {aba === "gestores" && (
        <Tabela
          colunas={["Foto", "Nome", "Status", "Ações"]}
          itens={gestores}
          vazio="Nenhum gestor cadastrado."
          renderLinha={(g) => (
            <>
              <td className="px-4 py-3">
                {g.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.fotoUrl}
                    alt={`Foto de ${g.nome}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
                    —
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-medium text-navy-900">{g.nome}</td>
              <td className="px-4 py-3">
                <EtiquetaStatus ativo={g.ativo} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-start gap-4">
                  <Link
                    href={`/cms/orgaos/${orgaoId}/gestores/${g.id}/editar`}
                    className="text-sm text-navy-800 hover:underline"
                  >
                    Editar
                  </Link>
                  <ConfirmActionButton
                    action={() => deleteGestor(orgaoId, g.id)}
                    label="Excluir"
                    pendingLabel="Excluindo..."
                    confirmMessage={`Excluir o gestor "${g.nome}"?`}
                  />
                </div>
              </td>
            </>
          )}
        />
      )}

      {aba === "usuarios" && (
        <Tabela
          colunas={["CPF", "Nome", "Perfil", "Status", "Ações"]}
          itens={usuarios}
          vazio="Nenhum usuário vinculado."
          renderLinha={(u) => (
            <>
              <td className="px-4 py-3 font-medium text-navy-900">
                {u.cpf ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">{u.nome}</td>
              <td className="px-4 py-3 text-slate-600">{u.perfil}</td>
              <td className="px-4 py-3">
                <EtiquetaStatus ativo={u.ativo} />
              </td>
              <td className="px-4 py-3">
                <ConfirmActionButton
                  action={() => deleteUsuario(orgaoId, u.id)}
                  label="Desvincular"
                  pendingLabel="Removendo..."
                  confirmMessage={`Desvincular "${u.nome}" deste órgão?`}
                />
              </td>
            </>
          )}
        />
      )}

      {aba === "sites" && (
        <Tabela
          colunas={["Título", "Link", "Status", "Ações"]}
          itens={sites}
          vazio="Nenhum site relacionado."
          renderLinha={(s) => (
            <>
              <td className="px-4 py-3 font-medium text-navy-900">{s.titulo}</td>
              <td className="px-4 py-3">
                <a
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-navy-800 hover:underline"
                >
                  {s.link}
                </a>
              </td>
              <td className="px-4 py-3">
                <EtiquetaStatus ativo={s.ativo} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-start gap-4">
                  <Link
                    href={`/cms/orgaos/${orgaoId}/sites/${s.id}/editar`}
                    className="text-sm text-navy-800 hover:underline"
                  >
                    Editar
                  </Link>
                  <ConfirmActionButton
                    action={() => deleteSite(orgaoId, s.id)}
                    label="Excluir"
                    pendingLabel="Excluindo..."
                    confirmMessage={`Excluir o site "${s.titulo}"?`}
                  />
                </div>
              </td>
            </>
          )}
        />
      )}

      {modal === "setor" && (
        <SetorModal orgaoId={orgaoId} onClose={() => setModal(null)} />
      )}
      {modal === "usuario" && (
        <UsuarioModal
          orgaoId={orgaoId}
          pessoas={pessoas}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
}

// -------------------------------------------------------------- Tabela

function Tabela<T extends { id: number }>({
  colunas,
  itens,
  vazio,
  renderLinha,
}: {
  colunas: string[];
  itens: T[];
  vazio: string;
  renderLinha: (item: T) => React.ReactNode;
}) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(itens.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = itens.slice(
    (paginaAtual - 1) * POR_PAGINA,
    paginaAtual * POR_PAGINA
  );

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-800 text-xs uppercase tracking-wide text-white">
            <tr>
              {colunas.map((c) => (
                <th key={c} className="px-4 py-3 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-0 odd:bg-navy-50/40"
              >
                {renderLinha(item)}
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td
                  colSpan={colunas.length}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  {vazio}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPagina(n)}
              className={`h-8 w-8 rounded-md text-sm ${
                n === paginaAtual
                  ? "bg-navy-800 font-medium text-white"
                  : "border border-slate-200 text-navy-800 hover:bg-navy-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------- Modais

function SetorModal({
  orgaoId,
  onClose,
}: {
  orgaoId: number;
  onClose: () => void;
}) {
  const [erro, setErro] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setErro(null);
    try {
      await createSetor(orgaoId, formData);
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }

  return (
    <Modal titulo="+ Setor" onClose={onClose}>
      <form action={submit} className="space-y-4">
        <Campo label="Sigla" required hint="Informe a sigla do setor">
          <input type="text" name="sigla" required className={inputClass} />
        </Campo>
        <Campo label="Nome" required hint="Informe um nome para o Setor">
          <input type="text" name="nome" required className={inputClass} />
        </Campo>
        <RodapeModal erro={erro} onClose={onClose} />
      </form>
    </Modal>
  );
}

function UsuarioModal({
  orgaoId,
  pessoas,
  onClose,
}: {
  orgaoId: number;
  pessoas: { id: number; nome: string; cpf: string | null }[];
  onClose: () => void;
}) {
  const [pessoaId, setPessoaId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setErro(null);
    try {
      await createUsuario(orgaoId, formData);
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }

  return (
    <Modal titulo="+ Usuário" onClose={onClose}>
      <form action={submit} className="space-y-4">
        <Campo label="CPF do usuário" required hint="Selecione o usuário">
          <SearchableSelect
            name="pessoaId"
            required
            value={pessoaId}
            onChange={setPessoaId}
            placeholder="Digite pelo menos 3 caracteres para buscar"
            options={pessoas.map((p) => ({
              id: p.id,
              label: p.cpf ?? p.nome,
              sublabel: p.cpf ? p.nome : undefined,
            }))}
          />
        </Campo>
        <Campo
          label="Perfil"
          required
          hint="Selecione o perfil do usuário a ser cadastrado"
        >
          <select name="perfil" required className={inputClass}>
            {PERFIS_USUARIO.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Campo>
        <RodapeModal erro={erro} onClose={onClose} />
      </form>
    </Modal>
  );
}

function RodapeModal({
  erro,
  onClose,
}: {
  erro: string | null;
  onClose: () => void;
}) {
  return (
    <>
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex gap-3 pt-1">
        <button type="submit" className={botaoPrimarioClass}>
          Salvar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          Fechar
        </button>
      </div>
    </>
  );
}

const botaoAssociacaoClass =
  "rounded-md bg-navy-800 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-navy-700";
