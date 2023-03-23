export const DatetimeUtc = ({
  datetime,
}: {
  datetime: string | Date | null
}) => {
  if (!datetime) {
    return <>N/A</>
  }

  return (
    <>
      <span className="text-slate-600">
        {new Date(datetime).toLocaleString("pl-PL", {
          timeZone: "UTC",
        })}{" "}
      </span>
      <span className="text-slate-500 text-xs">(UTC)</span>
    </>
  )
}
