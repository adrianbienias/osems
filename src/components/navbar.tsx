import Link, { LinkProps } from "next/link"
import { AnchorHTMLAttributes, FC } from "react"

export const NavLink: FC<
  AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps
> = ({ children, className = "", href, ...rest }) => (
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
          <NavLink href="/contacts">Contacts</NavLink>
          <NavLink href="/newsletters">Newsletters</NavLink>
          <NavLink href="/autoresponders">Autoresponders</NavLink>
        </nav>
      </div>
    </div>
  </>
)
