import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Trilha from "@/components/cms/Trilha";
import AssociacoesPanel from "@/components/cms/orgao/AssociacoesPanel";
import VisualizarHtml from "@/components/cms/orgao/VisualizarHtml";
import {
  Card,
  Dado,
  Booleano,
  EtiquetaStatus,
  NaoCadastrado,
} from "@/components/cms/orgao/leitura";
import {
  formatDataHora,
  formatDiasSemana,
  formatHorario,
  parseDiasSemana,
} from "@/lib/orgao";

type Aba = "setores" | "gestores" | "usuarios" | "sites";
const ABAS_VALIDAS: Aba[] = ["setores", "gestores", "usuarios", "sites"];

// A seção de associações (setores, gestores, usuários e sites) está desativada.
// Basta voltar para `true` para exibi-la novamente.
const ASSOCIACOES_ATIVAS = false;

export default async function OrgaoInformacoesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { id: idParam } = await params;
  const { aba } = await searchParams;
  const id = Number(idParam);

  const [orgao, unidades, pessoas] = await Promise.all([
    prisma.orgao.findUnique({
      where: { id },
      include: {
        contato: true,
        endereco: { include: { municipio: true } },
        setores: { orderBy: { nome: "asc" } },
        gestores: { orderBy: { nome: "asc" } },
        usuarios: { include: { pessoa: true }, orderBy: { id: "asc" } },
        sites: { orderBy: { titulo: "asc" } },
      },
    }),
    prisma.pontoAtendimento.findMany({
      where: { orgaoId: id },
      orderBy: { nome: "asc" },
      include: { endereco: { include: { municipio: true } } },
    }),
    prisma.pessoa.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!orgao) notFound();

  const abaInicial = ABAS_VALIDAS.includes(aba as Aba)
    ? (aba as Aba)
    : "setores";

  const { contato, endereco } = orgao;

  return (
    <div className="mx-auto max-w-6xl">
      <Trilha
        itens={[
          { label: "Órgãos", href: "/cms/orgaos" },
          { label: "Informações" },
        ]}
      />

      <div className="space-y-6">
        {/* ---------------------------------------------- Informações */}
        <Card
          titulo="Informações do Órgão"
          acaoHref={`/cms/orgaos/${orgao.id}/editar`}
        >
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-5">
              <Dado label="Sigla">{orgao.sigla}</Dado>
              <Dado label="Nome">{orgao.nome}</Dado>
            </div>

            <div className="space-y-5">
              <Dado label="Ativo?">
                <Booleano valor={orgao.ativo} />
              </Dado>
            </div>

            <div className="space-y-5">
              <Dado label="Adicionado em">
                {formatDataHora(orgao.criadoEm)}
              </Dado>
              <Dado label="Atualizado em">
                {formatDataHora(orgao.atualizadoEm)}
              </Dado>
            </div>
          </dl>
        </Card>

        {/* -------------------------------------------------- Contatos */}
        <Card titulo="Contatos" acaoHref={`/cms/orgaos/${orgao.id}/contato`}>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-5">
              <Dado label="Telefone">
                {contato?.telefone ?? <NaoCadastrado />}
              </Dado>
              <Dado label="Email">{contato?.email ?? <NaoCadastrado />}</Dado>
            </div>
            <div className="space-y-5">
              <Dado label="Facebook">
                <Quebravel valor={contato?.facebook} />
              </Dado>
              <Dado label="Whatsapp">
                {contato?.whatsapp ?? <NaoCadastrado />}
              </Dado>
              <Dado label="Instagram">
                <Quebravel valor={contato?.instagram} />
              </Dado>
            </div>
            <div className="space-y-5">
              <Dado label="Twitter">
                <Quebravel valor={contato?.twitter} />
              </Dado>
              <Dado label="Youtube">
                <Quebravel valor={contato?.youtube} />
              </Dado>
            </div>
          </dl>
        </Card>

        {/* ------------------------------------------------- Endereço */}
        <Card
          titulo="Endereço do Órgão"
          acaoHref={`/cms/orgaos/${orgao.id}/endereco`}
        >
          {endereco ? (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-5">
                <Dado label="Endereço">{endereco.logradouro}</Dado>
                <Dado label="Cidade">
                  {endereco.municipio.nome} - {endereco.municipio.uf}
                </Dado>
              </div>

              <div className="space-y-5">
                <Dado label="Source do mapa">
                  <VisualizarHtml
                    titulo="Rota do Órgão"
                    html={endereco.sourceMapa}
                  />
                </Dado>
                <Dado label="Dias da semana">
                  {formatDiasSemana(parseDiasSemana(endereco.diasSemana))}
                </Dado>
              </div>

              <div className="space-y-5">
                <Dado label="Tem intervalo?">
                  <Booleano valor={endereco.temIntervalo} />
                </Dado>
                <Dado label="Horário de funcionamento">
                  <Linhas
                    valores={formatHorario({
                      temIntervalo: endereco.temIntervalo,
                      inicioManha: endereco.funcInicioManha,
                      fimManha: endereco.funcFimManha,
                      inicioTarde: endereco.funcInicioTarde,
                      fimTarde: endereco.funcFimTarde,
                    })}
                  />
                </Dado>
                <Dado label="Horário de atendimento">
                  <Linhas
                    valores={formatHorario({
                      temIntervalo: endereco.temIntervalo,
                      inicioManha: endereco.atendInicioManha,
                      fimManha: endereco.atendFimManha,
                      inicioTarde: endereco.atendInicioTarde,
                      fimTarde: endereco.atendFimTarde,
                    })}
                  />
                </Dado>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-400">
              Endereço ainda não cadastrado.
            </p>
          )}
        </Card>

        {/* -------------------------------------------------- Unidades */}
        <Card
          titulo={`Unidades (${unidades.length})`}
          acaoHref="/cms/unidades/novo"
          acaoLabel="+ Nova Unidade"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Endereço</th>
                  <th className="px-4 py-3">Cidade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {unidades.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-navy-900">
                      {u.nome}
                      <p className="text-xs font-normal text-slate-400">
                        /{u.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.endereco?.logradouro ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.endereco?.municipio.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <EtiquetaStatus ativo={u.ativo} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/cms/unidades/${u.id}/editar`}
                        className="text-sm text-navy-800 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
                {unidades.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Nenhuma unidade cadastrada para este órgão.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ----------------------------------------------- Associações */}
        {ASSOCIACOES_ATIVAS && (
          <AssociacoesPanel
            orgaoId={orgao.id}
            abaInicial={abaInicial}
            setores={orgao.setores.map((s) => ({
              id: s.id,
              sigla: s.sigla,
              nome: s.nome,
              ativo: s.ativo,
            }))}
            gestores={orgao.gestores.map((g) => ({
              id: g.id,
              nome: g.nome,
              fotoUrl: g.fotoUrl,
              ativo: g.ativo,
            }))}
            usuarios={orgao.usuarios.map((u) => ({
              id: u.id,
              nome: u.pessoa.nome,
              cpf: u.pessoa.cpf,
              perfil: u.perfil,
              ativo: u.ativo,
            }))}
            sites={orgao.sites.map((s) => ({
              id: s.id,
              titulo: s.titulo,
              link: s.link,
              ativo: s.ativo,
            }))}
            pessoas={pessoas.map((p) => ({
              id: p.id,
              nome: p.nome,
              cpf: p.cpf,
            }))}
          />
        )}

        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Link
            href="/cms/orgaos"
            className="rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-navy-700"
          >
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}

function Quebravel({ valor }: { valor?: string | null }) {
  if (!valor) return <NaoCadastrado />;
  return <span className="break-all">{valor}</span>;
}

function Linhas({ valores }: { valores: string[] }) {
  if (valores.length === 0) return <NaoCadastrado />;
  return (
    <>
      {valores.map((v) => (
        <span key={v} className="block">
          {v}
        </span>
      ))}
    </>
  );
}
