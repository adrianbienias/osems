/*
  Warnings:

  - You are about to drop the column `html` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Template` table. All the data in the column will be lost.
  - Added the required column `markdown` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Template" ("createdAt", "id", "subject") SELECT "createdAt", "id", "subject" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

/*
  Manual (more appropriate) alternative:

  ALTER TABLE "Template" RENAME "html" to "markdown";
  ALTER TABLE "Template" DROP COLUMN "text";
*/
