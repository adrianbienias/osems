/*
  Warnings:

  - Added the required column `preheader` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "preheader" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Template" ("createdAt", "id", "markdown", "subject", "preheader") SELECT "createdAt", "id", "markdown", "subject", "" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
