-- Formulário do órgão enxuto: o endereço passa a ter apenas endereço, cidade,
-- source do mapa, dias da semana e os dois horários.
-- bairro/cep viram opcionais (deixam de ser editados) e iframeMapa vira
-- sourceMapa, igual ao endereço do local de atendimento.

PRAGMA foreign_keys=OFF;

-- RedefineTable
CREATE TABLE "new_OrgaoEndereco" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "logradouro" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT,
    "cep" TEXT,
    "sourceMapa" TEXT NOT NULL,
    "diasSemana" TEXT NOT NULL,
    "temIntervalo" BOOLEAN NOT NULL DEFAULT false,
    "funcInicioManha" TEXT NOT NULL,
    "funcFimManha" TEXT,
    "funcInicioTarde" TEXT,
    "funcFimTarde" TEXT NOT NULL,
    "atendInicioManha" TEXT NOT NULL,
    "atendFimManha" TEXT,
    "atendInicioTarde" TEXT,
    "atendFimTarde" TEXT NOT NULL,
    CONSTRAINT "OrgaoEndereco_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrgaoEndereco_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrgaoEndereco" ("id", "orgaoId", "municipioId", "logradouro", "complemento", "bairro", "cep", "sourceMapa", "diasSemana", "temIntervalo", "funcInicioManha", "funcFimManha", "funcInicioTarde", "funcFimTarde", "atendInicioManha", "atendFimManha", "atendInicioTarde", "atendFimTarde")
SELECT "id", "orgaoId", "municipioId", "logradouro", "complemento", "bairro", "cep", "iframeMapa", "diasSemana", "temIntervalo", "funcInicioManha", "funcFimManha", "funcInicioTarde", "funcFimTarde", "atendInicioManha", "atendFimManha", "atendInicioTarde", "atendFimTarde"
FROM "OrgaoEndereco";
DROP TABLE "OrgaoEndereco";
ALTER TABLE "new_OrgaoEndereco" RENAME TO "OrgaoEndereco";
CREATE UNIQUE INDEX "OrgaoEndereco_orgaoId_key" ON "OrgaoEndereco"("orgaoId");

PRAGMA foreign_keys=ON;
