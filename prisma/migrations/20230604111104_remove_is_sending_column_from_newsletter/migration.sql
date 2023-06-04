/*
  Warnings:

  - You are about to drop the column `isSending` on the `Newsletter` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listIdToInclude" TEXT NOT NULL,
    "listIdsToExclude" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "toSendAfter" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Newsletter" ("createdAt", "id", "listIdToInclude", "listIdsToExclude", "sentAt", "templateId", "toSendAfter") SELECT "createdAt", "id", "listIdToInclude", "listIdsToExclude", "sentAt", "templateId", "toSendAfter" FROM "Newsletter";
DROP TABLE "Newsletter";
ALTER TABLE "new_Newsletter" RENAME TO "Newsletter";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
