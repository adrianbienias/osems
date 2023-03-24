import { ReactFCProps } from "@/libs/types"
import Link from "next/link"

export const NavLink = ({
  children,
  className = "",
  href,
  ...rest
}: ReactFCProps & { href: string }) => (
  <Link href={href} legacyBehavior {...rest}>
    <a className={`${className}`}>{children}</a>
  </Link>
)

export const Navbar = () => (
  <>
    <div className="max-w-screen-xl mx-auto pb-4">
      <div className="flex gap-16 items-center">
        <NavLink
          href="/"
          className="font-bold text-slate-800 hover:text-slate-600 hover:no-underline"
        >
          OSEMS
        </NavLink>
        <nav className="py-2 flex gap-6">
          <NavLink href="/lists">Lists</NavLink>
          <NavLink href="/newsletters">Newsletters</NavLink>
        </nav>
      </div>
    </div>
  </>
)
