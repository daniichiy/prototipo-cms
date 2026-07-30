-- CreateTable
CREATE TABLE "Municipio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "codigoIbge" TEXT
);

-- CreateTable
CREATE TABLE "Orgao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "site" TEXT,
    "orgaoExterno" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "TipoPonto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "exigeEndereco" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "PontoAtendimento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "tipoPontoId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "identificadorExterno" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "PontoAtendimento_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PontoAtendimento_tipoPontoId_fkey" FOREIGN KEY ("tipoPontoId") REFERENCES "TipoPonto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Endereco" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pontoAtendimentoId" INTEGER NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "iframeMapa" TEXT NOT NULL,
    "urlMapa" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    CONSTRAINT "Endereco_pontoAtendimentoId_fkey" FOREIGN KEY ("pontoAtendimentoId") REFERENCES "PontoAtendimento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Endereco_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PontoResponsavel" (
    "pontoAtendimentoId" INTEGER NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "cargo" TEXT,

    PRIMARY KEY ("pontoAtendimentoId", "pessoaId"),
    CONSTRAINT "PontoResponsavel_pontoAtendimentoId_fkey" FOREIGN KEY ("pontoAtendimentoId") REFERENCES "PontoAtendimento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PontoResponsavel_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CanalContato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pontoAtendimentoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    CONSTRAINT "CanalContato_pontoAtendimentoId_fkey" FOREIGN KEY ("pontoAtendimentoId") REFERENCES "PontoAtendimento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TipoHorario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pontoAtendimentoId" INTEGER NOT NULL,
    "tipoHorarioId" INTEGER NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "inicio" TEXT NOT NULL,
    "fim" TEXT NOT NULL,
    "periodo" TEXT,
    CONSTRAINT "Horario_pontoAtendimentoId_fkey" FOREIGN KEY ("pontoAtendimentoId") REFERENCES "PontoAtendimento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Horario_tipoHorarioId_fkey" FOREIGN KEY ("tipoHorarioId") REFERENCES "TipoHorario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Servico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ServicoUnidade" (
    "pontoAtendimentoId" INTEGER NOT NULL,
    "servicoId" INTEGER NOT NULL,
    "agendamento" BOOLEAN NOT NULL DEFAULT false,
    "atendimento" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("pontoAtendimentoId", "servicoId"),
    CONSTRAINT "ServicoUnidade_pontoAtendimentoId_fkey" FOREIGN KEY ("pontoAtendimentoId") REFERENCES "PontoAtendimento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServicoUnidade_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_slug_key" ON "Municipio"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Orgao_slug_key" ON "Orgao"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TipoPonto_slug_key" ON "TipoPonto"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PontoAtendimento_slug_key" ON "PontoAtendimento"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_pontoAtendimentoId_key" ON "Endereco"("pontoAtendimentoId");
