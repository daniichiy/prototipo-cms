import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Trilha from "@/components/cms/Trilha";
import ContatoForm from "@/components/cms/orgao/ContatoForm";
import { upsertContato } from "@/app/cms/orgaos/actions";

export default async function GerenciarContatoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const orgao = await prisma.orgao.findUnique({
    where: { id },
    include: { contato: true, canais: true },
  });
  if (!orgao) notFound();

  const contato = orgao.contato;

  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Informações do Órgão", href: `/cms/orgaos/${id}` },
          { label: "Gerenciar Contato do órgão" },
        ]}
      />

      <ContatoForm
        action={upsertContato.bind(null, id)}
        cancelHref={`/cms/orgaos/${id}`}
        initialData={{
          responsavel: contato?.responsavel ?? "",
          telefone: contato?.telefone ?? "",
          email: contato?.email ?? "",
          canais: orgao.canais.map((c) => ({
            tipo: c.tipo,
            rotulo: c.rotulo,
            valor: c.valor,
          })),
        }}
      />
    </div>
  );
}
