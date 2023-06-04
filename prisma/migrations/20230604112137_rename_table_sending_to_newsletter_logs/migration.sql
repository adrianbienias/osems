/*
  Warnings:

  - You are about to drop the `Sending` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Sending";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "NewsletterLogs" (
    "email" TEXT NOT NULL,
    "newsletterId" TEXT NOT NULL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("email", "newsletterId"),
    CONSTRAINT "NewsletterLogs_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
