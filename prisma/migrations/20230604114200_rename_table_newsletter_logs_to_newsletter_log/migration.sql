/*
  Warnings:

  - You are about to drop the `NewsletterLogs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NewsletterLogs";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "NewsletterLog" (
    "email" TEXT NOT NULL,
    "newsletterId" TEXT NOT NULL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("email", "newsletterId"),
    CONSTRAINT "NewsletterLog_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
