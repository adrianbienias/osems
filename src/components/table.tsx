import { ReactFCProps } from "@/libs/types"

export const Table: React.FC<ReactFCProps> = ({
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

export const Thead: React.FC<ReactFCProps> = ({
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

export const Tbody: React.FC<ReactFCProps> = ({
  children,
  className = "",
  ...rest
}) => (
  <tbody className={`divide-y ${className}`} {...rest}>
    {children}
  </tbody>
)

export const Th: React.FC<ReactFCProps> = ({
  children,
  className = "",
  ...rest
}) => (
  <th className={`text-left p-4 ${className}`} {...rest}>
    {children}
  </th>
)

export const Tr: React.FC<ReactFCProps> = ({
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

export const Td: React.FC<ReactFCProps & { colspan?: number }> = ({
  children,
  className = "",
  ...rest
}) => (
  <td className={`text-left p-4 ${className}`} {...rest}>
    {children}
  </td>
)
