import type { List } from "@/modules/lists"
import htmlParser from "prettier/parser-html"
import prettier from "prettier/standalone"
import { renderToStaticMarkup } from "react-dom/server"
import { SignupForm } from "../signup-form"

export default function ListSignup({ list }: { list: List }) {
  return (
    <>
      <section>
        <h2>List signup form</h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div>
            <p className="mb-2">Embed code</p>
            <p className="mt-0 text-base text-slate-400">
              Place it on your website
            </p>

            <div className="overflow-auto max-w-lg border-solid border border-slate-200 px-4 py-2 mb-4 rounded">
              <pre className="whitespace-pre-wrap">
                {prettier.format(
                  renderToStaticMarkup(<SignupForm listId={list.id} />),
                  {
                    parser: "html",
                    plugins: [htmlParser],
                    htmlWhitespaceSensitivity: "ignore",
                  }
                )}
              </pre>
            </div>
          </div>

          <div>
            <p className="mb-2">Unstyled preview</p>
            <p className="mt-0 text-base text-slate-400">
              It&apos;s working, you can try it
            </p>

            <SignupForm listId={list.id} />
          </div>
        </div>
      </section>
    </>
  )
}
