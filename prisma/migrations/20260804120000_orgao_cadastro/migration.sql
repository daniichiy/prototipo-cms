-- Coleção "Cadastrar Órgãos": catálogo simples com sigla, nome e situação.
CREATE TABLE "OrgaoCadastro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "OrgaoCadastro_sigla_key" ON "OrgaoCadastro"("sigla");
