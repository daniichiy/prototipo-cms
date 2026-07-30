"use client";

import { useState } from "react";
import Modal from "@/components/cms/Modal";

/**
 * Link "Visualizar" que abre o conteúdo HTML em modal — usado pelos campos
 * "Informações" e "Rota" no detalhe do órgão.
 *
 * O HTML vem do próprio CMS (texto institucional e embed do Google Maps),
 * então é renderizado como no sistema legado.
 */
export default function VisualizarHtml({
  titulo,
  html,
}: {
  titulo: string;
  html: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-800 hover:underline"
      >
        <span aria-hidden>👁</span> Visualizar
      </button>

      {aberto && (
        <Modal
          titulo={titulo}
          onClose={() => setAberto(false)}
          larguraMaxima="max-w-3xl"
        >
          <div
            className="prose-sm max-w-none overflow-x-auto text-sm text-slate-700 [&_iframe]:h-80 [&_iframe]:w-full"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Modal>
      )}
    </>
  );
}
