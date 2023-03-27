/*
  Warnings:

  - You are about to drop the column `from` on the `List` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `Newsletter` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "confirmationTemplateId" TEXT NOT NULL,
    "signupRedirectUrl" TEXT NOT NULL,
    "confirmationRedirectUrl" TEXT NOT NULL,
    "unsubscribeRedirectUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_List" ("confirmationRedirectUrl", "confirmationTemplateId", "createdAt", "id", "name", "signupRedirectUrl", "unsubscribeRedirectUrl") SELECT "confirmationRedirectUrl", "confirmationTemplateId", "createdAt", "id", "name", "signupRedirectUrl", "unsubscribeRedirectUrl" FROM "List";
DROP TABLE "List";
ALTER TABLE "new_List" RENAME TO "List";
CREATE UNIQUE INDEX "List_name_key" ON "List"("name");
CREATE TABLE "new_Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listIdToInclude" TEXT NOT NULL,
    "listIdsToExclude" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "toSendAfter" DATETIME NOT NULL,
    "isSending" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Newsletter" ("createdAt", "id", "isSending", "listIdToInclude", "listIdsToExclude", "sentAt", "templateId", "toSendAfter") SELECT "createdAt", "id", "isSending", "listIdToInclude", "listIdsToExclude", "sentAt", "templateId", "toSendAfter" FROM "Newsletter";
DROP TABLE "Newsletter";
ALTER TABLE "new_Newsletter" RENAME TO "Newsletter";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
