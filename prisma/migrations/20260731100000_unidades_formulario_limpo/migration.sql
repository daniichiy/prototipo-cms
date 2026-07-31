-- Formulário limpo do Local de Atendimento (pesquisa "Locais de Atendimento").
-- Endereco: um único campo de endereço (logradouro + número) e "Source do mapa".
-- TipoHorario: slug para distinguir "funcionamento" de "atendimento".
-- ModeloHorario: horário reutilizável aplicável a vários locais.

PRAGMA foreign_keys=OFF;

-- RedefineTable
CREATE TABLE "new_Endereco" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pontoAtendimentoId" INTEGER NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "logradouro" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "sourceMapa" TEXT NOT NULL,
    CONSTRAINT "Endereco_pontoAtendimentoId_fkey" FOREIGN KEY ("pontoAtendimentoId") REFERENCES "PontoAtendimento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Endereco_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Endereco" ("id", "pontoAtendimentoId", "municipioId", "logradouro", "complemento", "bairro", "cep", "sourceMapa")
SELECT
    "id",
    "pontoAtendimentoId",
    "municipioId",
    TRIM("logradouro" || ', ' || COALESCE(NULLIF("numero", ''), 's/n')),
    "complemento",
    "bairro",
    "cep",
    COALESCE(NULLIF("urlMapa", ''), "iframeMapa")
FROM "Endereco";
DROP TABLE "Endereco";
ALTER TABLE "new_Endereco" RENAME TO "Endereco";
CREATE UNIQUE INDEX "Endereco_pontoAtendimentoId_key" ON "Endereco"("pontoAtendimentoId");

-- RedefineTable
CREATE TABLE "new_TipoHorario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_TipoHorario" ("id", "nome", "slug")
SELECT "id", "nome", 'tipo-horario-' || "id" FROM "TipoHorario";
DROP TABLE "TipoHorario";
ALTER TABLE "new_TipoHorario" RENAME TO "TipoHorario";
CREATE UNIQUE INDEX "TipoHorario_slug_key" ON "TipoHorario"("slug");

-- O tipo padrão pré-existente passa a ser o "funcionamento"
UPDATE "TipoHorario" SET "nome" = 'Horário de funcionamento', "slug" = 'funcionamento'
WHERE "id" = (SELECT MIN("id") FROM "TipoHorario");

-- CreateTable
CREATE TABLE "ModeloHorario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "periodosJson" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ModeloHorario_nome_key" ON "ModeloHorario"("nome");

PRAGMA foreign_keys=ON;
