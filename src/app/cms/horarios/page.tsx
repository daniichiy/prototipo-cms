import { prisma } from "@/lib/prisma";
import ModelosHorarioPanel from "@/components/cms/horario/ModelosHorarioPanel";
import { parsePeriodos } from "@/lib/horarios";

export default async function HorariosPage() {
  const [modelos, locais] = await Promise.all([
    prisma.modeloHorario.findMany({ orderBy: { nome: "asc" } }),
    prisma.pontoAtendimento.findMany({
      orderBy: { nome: "asc" },
      include: { orgao: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy-900">Horários</h2>
        <p className="text-sm text-slate-500">
          Horários reutilizáveis: cadastre um horário e aplique-o a vários locais
          de atendimento de uma só vez.
        </p>
      </div>

      <ModelosHorarioPanel
        modelos={modelos.map((m) => ({
          id: m.id,
          nome: m.nome,
          periodos: parsePeriodos(m.periodosJson),
        }))}
        locais={locais.map((l) => ({
          id: l.id,
          nome: l.nome,
          sublabel: l.orgao.sigla,
        }))}
      />
    </div>
  );
}
