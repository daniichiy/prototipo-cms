import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Trilha from "@/components/cms/Trilha";
import SiteForm from "@/components/cms/orgao/SiteForm";
import { createSite } from "@/app/cms/orgaos/actions";

export default async function NovoSitePage({
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
          { label: "Informações", href: `/cms/orgaos/${id}` },
          { label: "Gerenciar" },
        ]}
      />

      <SiteForm
        action={createSite.bind(null, id)}
        cancelHref={`/cms/orgaos/${id}?aba=sites`}
      />
    </div>
  );
}
