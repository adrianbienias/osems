import {
  FC,
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react"

export const Table: FC<TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = "",
  ...rest
}) => (
  <div className="border border-slate-200 border-solid rounded overflow-auto">
    <table
      className={`border-collapse w-full min-w-max ${className}`}
      {...rest}
    >
      {children}
    </table>
  </div>
)

export const Thead: FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = "",
  ...rest
}) => (
  <thead
    className={`border-solid border-slate-200 border-x-0 border-t-0 border-b bg-slate-50 ${className}`}
    {...rest}
  >
    {children}
  </thead>
)

export const Tbody: FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = "",
  ...rest
}) => (
  <tbody className={`divide-y ${className}`} {...rest}>
    {children}
  </tbody>
)

export const Th: FC<ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = "",
  ...rest
}) => (
  <th className={`text-left p-4 ${className}`} {...rest}>
    {children}
  </th>
)

export const Tr: FC<HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = "",
  ...rest
}) => (
  <tr
    className={`text-left p-4 border-solid border-slate-200 border-x-0 border-t-0 border-b last:border-b-0 ${className}`}
    {...rest}
  >
    {children}
  </tr>
)

export const Td: FC<TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = "",
  ...rest
}) => (
  <td className={`text-left p-4 ${className}`} {...rest}>
    {children}
  </td>
)
