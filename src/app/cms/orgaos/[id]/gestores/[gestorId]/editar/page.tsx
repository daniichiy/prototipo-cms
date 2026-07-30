import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Trilha from "@/components/cms/Trilha";
import GestorForm from "@/components/cms/orgao/GestorForm";
import { updateGestor } from "@/app/cms/orgaos/actions";

export default async function EditarGestorPage({
  params,
}: {
  params: Promise<{ id: string; gestorId: string }>;
}) {
  const { id: idParam, gestorId: gestorIdParam } = await params;
  const id = Number(idParam);
  const gestorId = Number(gestorIdParam);

  const gestor = await prisma.gestor.findUnique({ where: { id: gestorId } });
  if (!gestor || gestor.orgaoId !== id) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Informações do Órgão", href: `/cms/orgaos/${id}` },
          { label: "Gerenciar Gestor do órgão" },
        ]}
      />

      <GestorForm
        action={updateGestor.bind(null, id, gestorId)}
        cancelHref={`/cms/orgaos/${id}?aba=gestores`}
        initialData={{
          nome: gestor.nome,
          biografia: gestor.biografia,
          fotoUrl: gestor.fotoUrl ?? "",
          ativo: gestor.ativo,
        }}
      />
    </div>
  );
}
