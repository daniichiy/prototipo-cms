import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Trilha from "@/components/cms/Trilha";
import GestorForm from "@/components/cms/orgao/GestorForm";
import { createGestor } from "@/app/cms/orgaos/actions";

export default async function NovoGestorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const orgao = await prisma.orgao.findUnique({ where: { id } });
  if (!orgao) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Informações do Órgão", href: `/cms/orgaos/${id}` },
          { label: "Gerenciar Gestor do órgão" },
        ]}
      />

      <GestorForm
        action={createGestor.bind(null, id)}
        cancelHref={`/cms/orgaos/${id}?aba=gestores`}
      />
    </div>
  );
}
