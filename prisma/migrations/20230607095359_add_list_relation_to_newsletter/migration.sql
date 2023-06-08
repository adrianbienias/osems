/*
  Warnings:

  - You are about to drop the column `listIdToInclude` on the `Newsletter` table. All the data in the column will be lost.
  - Added the required column `listId` to the `Newsletter` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT NOT NULL,
    "listIdsToExclude" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "toSendAfter" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Newsletter_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Newsletter" ("createdAt", "id", "listIdsToExclude", "sentAt", "templateId", "toSendAfter") SELECT "createdAt", "id", "listIdsToExclude", "sentAt", "templateId", "toSendAfter" FROM "Newsletter";
DROP TABLE "Newsletter";
ALTER TABLE "new_Newsletter" RENAME TO "Newsletter";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
