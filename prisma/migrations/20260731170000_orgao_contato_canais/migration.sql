-- Contato do órgão no mesmo formato do local de atendimento: responsável,
-- telefone e e-mail no contato principal; os demais canais (WhatsApp, redes
-- sociais, ouvidoria...) passam para OrgaoCanalContato.

PRAGMA foreign_keys=OFF;

-- CreateTable
CREATE TABLE "OrgaoCanalContato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    CONSTRAINT "OrgaoCanalContato_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Preserva as redes sociais já cadastradas como canais adicionais
INSERT INTO "OrgaoCanalContato" ("orgaoId", "tipo", "rotulo", "valor")
SELECT "orgaoId", 'whatsapp', 'WhatsApp', "whatsapp" FROM "OrgaoContato"
WHERE "whatsapp" IS NOT NULL AND "whatsapp" <> '';
INSERT INTO "OrgaoCanalContato" ("orgaoId", "tipo", "rotulo", "valor")
SELECT "orgaoId", 'outro', 'Instagram', "instagram" FROM "OrgaoContato"
WHERE "instagram" IS NOT NULL AND "instagram" <> '';
INSERT INTO "OrgaoCanalContato" ("orgaoId", "tipo", "rotulo", "valor")
SELECT "orgaoId", 'outro', 'Facebook', "facebook" FROM "OrgaoContato"
WHERE "facebook" IS NOT NULL AND "facebook" <> '';
INSERT INTO "OrgaoCanalContato" ("orgaoId", "tipo", "rotulo", "valor")
SELECT "orgaoId", 'outro', 'Twitter', "twitter" FROM "OrgaoContato"
WHERE "twitter" IS NOT NULL AND "twitter" <> '';
INSERT INTO "OrgaoCanalContato" ("orgaoId", "tipo", "rotulo", "valor")
SELECT "orgaoId", 'outro', 'Youtube', "youtube" FROM "OrgaoContato"
WHERE "youtube" IS NOT NULL AND "youtube" <> '';

-- RedefineTable
CREATE TABLE "new_OrgaoContato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "responsavel" TEXT,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "OrgaoContato_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OrgaoContato" ("id", "orgaoId", "telefone", "email")
SELECT "id", "orgaoId", "telefone", "email" FROM "OrgaoContato";
DROP TABLE "OrgaoContato";
ALTER TABLE "new_OrgaoContato" RENAME TO "OrgaoContato";
CREATE UNIQUE INDEX "OrgaoContato_orgaoId_key" ON "OrgaoContato"("orgaoId");

PRAGMA foreign_keys=ON;
