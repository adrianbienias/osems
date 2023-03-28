import Link, { LinkProps } from "next/link"
import { AnchorHTMLAttributes, ButtonHTMLAttributes, FC } from "react"

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className = "",
  ...rest
}) => (
  <button
    className={`text-base bg-blue-500 hover:bg-blue-600 rounded text-white inline-block py-2 px-4 cursor-pointer no-underline hover:no-underline border-0 ${className}`}
    {...rest}
  >
    {children}
  </button>
)

export const LinkButton: FC<
  AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps
> = ({ children, className = "", href, ...rest }) => (
  <Link href={href} legacyBehavior {...rest}>
    <a
      className={`text-base bg-blue-500 hover:bg-blue-600 rounded text-white inline-block py-2 px-4 cursor-pointer no-underline hover:no-underline ${className}`}
    >
      {children}
    </a>
  </Link>
)
