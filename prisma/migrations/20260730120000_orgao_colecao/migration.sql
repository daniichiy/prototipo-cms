-- AlterTable
ALTER TABLE "Pessoa" ADD COLUMN "cpf" TEXT;

-- CreateTable
CREATE TABLE "OrgaoContato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,
    CONSTRAINT "OrgaoContato_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrgaoEndereco" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "logradouro" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "iframeMapa" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Setor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Setor_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gestor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "biografia" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Gestor_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrgaoUsuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "perfil" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "OrgaoUsuario_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrgaoUsuario_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SiteRelacionado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SiteRelacionado_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Orgao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "site" TEXT,
    "informacoes" TEXT,
    "orgaoExterno" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "atendenteMultiLocal" BOOLEAN NOT NULL DEFAULT false,
    "ignoraRegrasAgendamento" BOOLEAN NOT NULL DEFAULT false,
    "identificadorControlador" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Orgao" ("ativo", "id", "nome", "orgaoExterno", "sigla", "site", "slug") SELECT "ativo", "id", "nome", "orgaoExterno", "sigla", "site", "slug" FROM "Orgao";
DROP TABLE "Orgao";
ALTER TABLE "new_Orgao" RENAME TO "Orgao";
CREATE UNIQUE INDEX "Orgao_slug_key" ON "Orgao"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "OrgaoContato_orgaoId_key" ON "OrgaoContato"("orgaoId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgaoEndereco_orgaoId_key" ON "OrgaoEndereco"("orgaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Setor_orgaoId_sigla_key" ON "Setor"("orgaoId", "sigla");

-- CreateIndex
CREATE UNIQUE INDEX "OrgaoUsuario_orgaoId_pessoaId_key" ON "OrgaoUsuario"("orgaoId", "pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_cpf_key" ON "Pessoa"("cpf");
