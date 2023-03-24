import { List, Newsletter, Template } from "@prisma/client"
import { ReactNode } from "react"

type RecursiveObject<T> = T extends Date ? never : T extends object ? T : never

export type StringValues<TModel> = {
  [Key in keyof TModel]: TModel[Key] extends RecursiveObject<TModel[Key]>
    ? StringValues<TModel[Key]>
    : string
}

export type ReactFCProps = {
  children: ReactNode
  className?: string
}

export type ListWithCount = List & { _count: { contacts: number } }

export type NewsletterWithTemplate = Newsletter & { template: Template }
