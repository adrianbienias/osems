type RecursiveObject<T> = T extends Date ? never : T extends object ? T : never

export type StringValues<TModel> = {
  [Key in keyof TModel]: TModel[Key] extends RecursiveObject<TModel[Key]>
    ? StringValues<TModel[Key]>
    : string
}
export type ApiResponse = { error?: string; success?: string }
