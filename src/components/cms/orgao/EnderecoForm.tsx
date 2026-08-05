"use client";

import Link from "next/link";
import EnderecoCampos, {
  type EnderecoHorariosInitialData,
} from "@/components/cms/orgao/EnderecoCampos";
import HorariosCampos from "@/components/cms/orgao/HorariosCampos";
import { botaoPrimarioClass } from "@/components/cms/form-ui";

export type { EnderecoHorariosInitialData };

export default function EnderecoForm({
  action,
  cancelHref,
  municipios,
  initialData,
}: {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  municipios: { id: number; nome: string; uf: string }[];
  initialData?: EnderecoHorariosInitialData;
}) {
  return (
    <form action={action}>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-base font-semibold text-navy-900">
          Gerenciar Endereço do órgão
        </h3>

        <EnderecoCampos municipios={municipios} initialData={initialData} />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-base font-semibold text-navy-900">
          Horários do órgão
        </h3>

        <HorariosCampos initialData={initialData} />
      </div>

      <div className="mt-4 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
        <button type="submit" className={botaoPrimarioClass}>
          Salvar
        </button>
        <Link
          href={cancelHref}
          className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
