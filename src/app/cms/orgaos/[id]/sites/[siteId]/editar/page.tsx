import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Trilha from "@/components/cms/Trilha";
import SiteForm from "@/components/cms/orgao/SiteForm";
import { updateSite } from "@/app/cms/orgaos/actions";

export default async function EditarSitePage({
  params,
}: {
  params: Promise<{ id: string; siteId: string }>;
}) {
  const { id: idParam, siteId: siteIdParam } = await params;
  const id = Number(idParam);
  const siteId = Number(siteIdParam);

  const site = await prisma.siteRelacionado.findUnique({
    where: { id: siteId },
  });
  if (!site || site.orgaoId !== id) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Trilha
        itens={[
          { label: "Informações", href: `/cms/orgaos/${id}` },
          { label: "Gerenciar" },
        ]}
      />

      <SiteForm
        action={updateSite.bind(null, id, siteId)}
        cancelHref={`/cms/orgaos/${id}?aba=sites`}
        initialData={{
          titulo: site.titulo,
          link: site.link,
          ativo: site.ativo,
        }}
      />
    </div>
  );
}
