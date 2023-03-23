import { ReactFCProps } from "@/libs/types"

export const Table: React.FC<ReactFCProps> = ({ children, className = "" }) => (
  <div className="border border-slate-200 border-solid rounded overflow-auto">
    <table className={`border-collapse w-full min-w-max ${className}`}>
      {children}
    </table>
  </div>
)

export const Thead: React.FC<ReactFCProps> = ({ children, className = "" }) => (
  <thead
    className={`border-solid border-slate-200 border-x-0 border-t-0 border-b bg-slate-50 ${className}`}
  >
    {children}
  </thead>
)

export const Tbody: React.FC<ReactFCProps> = ({ children, className = "" }) => (
  <tbody className={`divide-y ${className}`}>{children}</tbody>
)

export const Th: React.FC<ReactFCProps> = ({ children, className = "" }) => (
  <th className={`text-left p-4 ${className}`}>{children}</th>
)

export const Tr: React.FC<ReactFCProps> = ({ children, className = "" }) => (
  <tr
    className={`text-left p-4 border-solid border-slate-200 border-x-0 border-t-0 border-b last:border-b-0 ${className}`}
  >
    {children}
  </tr>
)

export const Td: React.FC<ReactFCProps & { colspan?: number }> = ({
  children,
  className = "",
  colspan,
}) => (
  <td className={`text-left p-4 ${className}`} colSpan={colspan}>
    {children}
  </td>
)
