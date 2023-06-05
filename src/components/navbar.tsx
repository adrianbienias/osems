import Link, { LinkProps } from "next/link"
import { AnchorHTMLAttributes, FC } from "react"

const NavLink: FC<AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps> = ({
  children,
  className = "",
  href,
  ...rest
}) => (
  <Link href={href} legacyBehavior {...rest}>
    <a className={`${className}`}>{children}</a>
  </Link>
)

export function Navbar() {
  async function handleClick(event: React.SyntheticEvent) {
    event.preventDefault()
    await fetch("/api/v1/public/auth", { method: "DELETE" })
    window.location.reload()
  }

  return (
    <>
      <div className="max-w-screen-xl mx-auto pb-4">
        <div className="flex gap-6 items-center justify-between">
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
          <div>
            <a href="" onClick={handleClick}>
              Log out
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
