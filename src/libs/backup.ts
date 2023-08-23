import {
  Admin,
  Auth,
  Autoresponder,
  AutoresponderLog,
  Contact,
  List,
  Newsletter,
  NewsletterLog,
  Setting,
  Template,
} from "@prisma/client"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { prisma } from "./prisma"

/*
  Database dumps may differ depending on database type.
  E.g. MySQL dump cannot be restored to SQLite database without changes in the SQL queries structure.
  Saving all tables in json file solves the problem, making the backup database type agnostic.
*/

const backupDir = "./backups"

function generateDbBackupFilename() {
  const timestamp =
    new Date().toISOString().replaceAll(":", "-").split(".")[0] + "Z"
  const dbBackupFilename = `osems-prod-db-${timestamp}.json`

  return dbBackupFilename
}

export async function dbBackup() {
  const admin = await prisma.admin.findMany()
  const auth = await prisma.auth.findMany()
  const setting = await prisma.setting.findMany()
  const template = await prisma.template.findMany()
  const list = await prisma.list.findMany()
  const contact = await prisma.contact.findMany()
  const autoresponder = await prisma.autoresponder.findMany()
  const autoresponderLog = await prisma.autoresponderLog.findMany()
  const newsletter = await prisma.newsletter.findMany()
  const newsletterLog = await prisma.newsletterLog.findMany()

  if (!existsSync(backupDir)) {
    mkdirSync(backupDir)
  }

  const dbBackupFilename = generateDbBackupFilename()

  writeFileSync(
    `${backupDir}/${dbBackupFilename}`,
    JSON.stringify({
      admin,
      auth,
      setting,
      template,
      list,
      contact,
      autoresponder,
      autoresponderLog,
      newsletter,
      newsletterLog,
    }),
    "utf-8"
  )

  console.info("Database backup has been made")
}

export async function dbRestore(dbBackupFilename: string) {
  let {
    admin,
    auth,
    setting,
    template,
    list,
    contact,
    autoresponder,
    autoresponderLog,
    newsletter,
    newsletterLog,
  } = JSON.parse(readFileSync(`${backupDir}/${dbBackupFilename}`, "utf-8")) as {
    admin: Admin[]
    auth: Auth[]
    setting: Setting[]
    template: Template[]
    list: List[]
    contact: Contact[]
    autoresponder: Autoresponder[]
    autoresponderLog: AutoresponderLog[]
    newsletter: Newsletter[]
    newsletterLog: NewsletterLog[]
  }

  auth = auth.map((item) => {
    item.createdAt = new Date(item.createdAt)
    item.confirmedAt &&= new Date(item.confirmedAt)
    return item
  })
  template = template.map((item: Template) => {
    item.createdAt = new Date(item.createdAt)
    return item
  })
  list = list.map((item: List) => {
    item.createdAt = new Date(item.createdAt)
    return item
  })
  contact = contact.map((item: Contact) => {
    item.createdAt = new Date(item.createdAt)
    item.confirmedAt &&= new Date(item.confirmedAt)
    item.unsubscribedAt &&= new Date(item.unsubscribedAt)
    return item
  })
  autoresponder = autoresponder.map((item) => {
    item.createdAt = new Date(item.createdAt)
    return item
  })
  autoresponderLog = autoresponderLog.map((item) => {
    item.createdAt = new Date(item.createdAt)
    item.sentAt &&= new Date(item.sentAt)
    return item
  })
  newsletter = newsletter.map((item) => {
    item.createdAt = new Date(item.createdAt)
    item.sentAt &&= new Date(item.sentAt)
    item.toSendAfter &&= new Date(item.toSendAfter)
    return item
  })
  newsletterLog = newsletterLog.map((item) => {
    item.createdAt = new Date(item.createdAt)
    item.sentAt &&= new Date(item.sentAt)
    return item
  })

  for (const item of admin) {
    await prisma.admin.create({ data: item })
  }
  for (const item of auth) {
    await prisma.auth.create({ data: item })
  }
  for (const item of setting) {
    await prisma.setting.create({ data: item })
  }
  for (const item of template) {
    await prisma.template.create({ data: item })
  }
  for (const item of list) {
    await prisma.list.create({ data: item })
  }
  for (const item of contact) {
    await prisma.contact.create({ data: item })
  }
  for (const item of autoresponder) {
    await prisma.autoresponder.create({ data: item })
  }
  for (const item of autoresponderLog) {
    await prisma.autoresponderLog.create({ data: item })
  }
  for (const item of newsletter) {
    await prisma.newsletter.create({ data: item })
  }
  for (const item of newsletterLog) {
    await prisma.newsletterLog.create({ data: item })
  }

  console.info("Database backup has been restored")
}
