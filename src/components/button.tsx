import { ReactFCProps } from "@/libs/types"
import Link from "next/link"
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react"

export const Button = ({
  children,
  className = "",
  ...rest
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) => (
  <button
    className={`text-base bg-blue-500 hover:bg-blue-600 rounded text-white inline-block py-2 px-4 cursor-pointer no-underline hover:no-underline border-0 ${className}`}
    {...rest}
  >
    {children}
  </button>
)

export const LinkButton = ({
  children,
  className = "",
  href,
  ...rest
}: ReactFCProps & { href: string }) => (
  <Link href={href} legacyBehavior {...rest}>
    <a
      className={`text-base bg-blue-500 hover:bg-blue-600 rounded text-white inline-block py-2 px-4 cursor-pointer no-underline hover:no-underline ${className}`}
    >
      {children}
    </a>
  </Link>
)
