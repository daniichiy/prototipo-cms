import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Trilha from "@/components/cms/Trilha";
import EnderecoForm from "@/components/cms/orgao/EnderecoForm";
import { upsertEndereco } from "@/app/cms/orgaos/actions";
import { parseDiasSemana } from "@/lib/orgao";

export default async function GerenciarEnderecoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const [orgao, municipios] = await Promise.all([
    prisma.orgao.findUnique({ where: { id }, include: { endereco: true } }),
    prisma.municipio.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!orgao) notFound();

  const e = orgao.endereco;

  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Informações do Órgão", href: `/cms/orgaos/${id}` },
          { label: "Gerenciar Endereço do órgão" },
        ]}
      />

      <EnderecoForm
        action={upsertEndereco.bind(null, id)}
        cancelHref={`/cms/orgaos/${id}`}
        municipios={municipios}
        initialData={{
          logradouro: e?.logradouro ?? "",
          complemento: e?.complemento ?? "",
          bairro: e?.bairro ?? "",
          cep: e?.cep ?? "",
          sourceMapa: e?.sourceMapa ?? "",
          municipioId: e?.municipioId ?? null,
          dias: e ? parseDiasSemana(e.diasSemana) : [],
          temIntervalo: e?.temIntervalo ?? false,
          funcInicioManha: e?.funcInicioManha ?? "",
          funcFimManha: e?.funcFimManha ?? "",
          funcInicioTarde: e?.funcInicioTarde ?? "",
          funcFimTarde: e?.funcFimTarde ?? "",
          atendInicioManha: e?.atendInicioManha ?? "",
          atendFimManha: e?.atendFimManha ?? "",
          atendInicioTarde: e?.atendInicioTarde ?? "",
          atendFimTarde: e?.atendFimTarde ?? "",
        }}
      />
    </div>
  );
}
