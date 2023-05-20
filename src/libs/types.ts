import {
  Autoresponder,
  Contact,
  List,
  Newsletter,
  Template,
} from "@prisma/client"

type RecursiveObject<T> = T extends Date ? never : T extends object ? T : never

export type StringValues<TModel> = {
  [Key in keyof TModel]: TModel[Key] extends RecursiveObject<TModel[Key]>
    ? StringValues<TModel[Key]>
    : string
}
export type ListWithCount = List & { _count: { contacts: number } }
export type ContactWithList = Contact & { list: List }
export type AutoresponderWithListAndTemplates = Autoresponder & {
  list: List
  template: Template
}
export type NewsletterWithTemplate = Newsletter & { template: Template }
export type ReactSelectOption = { value: string; label: string } | null
export type ApiResponse = { error?: string; success?: string }
