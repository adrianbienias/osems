import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"

export const Input = ({
  id,
  label,
  className = "",
  ...rest
}: DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { label: string }) => (
  <div className="mb-2">
    <div className="mb-0.5">
      <label className="text-sm text-slate-600" htmlFor={id}>
        {label}
      </label>
      &nbsp;
    </div>
    <input
      id={id}
      {...rest}
      className={`inline-block w-full placeholder:text-slate-400/60 border-solid border bg-slate-50/50 border-slate-300 px-3 py-1.5 rounded ${className}`}
    />
  </div>
)

export const Textarea = ({
  id,
  label,
  className = "",
  ...rest
}: DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> & { label: string }) => (
  <div className="mb-2">
    <div className="mb-0.5">
      <label className="text-sm text-slate-600" htmlFor={id}>
        {label}
      </label>
      &nbsp;
    </div>
    <textarea
      id={id}
      {...rest}
      className={`block w-full placeholder:text-slate-400/60 border-solid border bg-slate-50/50 border-slate-300 px-3 py-1.5 rounded ${className}`}
    ></textarea>
  </div>
)
