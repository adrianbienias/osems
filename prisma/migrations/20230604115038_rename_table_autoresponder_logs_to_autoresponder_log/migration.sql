/*
  Warnings:

  - You are about to drop the `AutoresponderLogs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AutoresponderLogs";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AutoresponderLog" (
    "email" TEXT NOT NULL,
    "autoresponderId" TEXT NOT NULL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("email", "autoresponderId"),
    CONSTRAINT "AutoresponderLog_autoresponderId_fkey" FOREIGN KEY ("autoresponderId") REFERENCES "Autoresponder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
