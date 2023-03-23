export const ErrorMsg = ({ errorMsg }: { errorMsg: string }) => {
  if (!errorMsg) {
    return null
  }

  return (
    <p
      role="alert"
      className="text-sm bg-red-100 text-red-500 border-red-300 border-solid border py-1 px-2 rounded"
    >
      🚨 {errorMsg}
    </p>
  )
}
