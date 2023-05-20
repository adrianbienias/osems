-- CreateTable
CREATE TABLE "Autoresponder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "delayDays" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Autoresponder_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AutoresponderLogs" (
    "email" TEXT NOT NULL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autoresponderId" TEXT NOT NULL,

    PRIMARY KEY ("email", "autoresponderId"),
    CONSTRAINT "AutoresponderLogs_autoresponderId_fkey" FOREIGN KEY ("autoresponderId") REFERENCES "Autoresponder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
