import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"

export const Input = ({
  placeholder,
  defaultValue,
  name,
  type,
  id,
  label,
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
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="inline-block w-full placeholder:text-slate-400/60 border-solid border bg-slate-50/50 border-slate-300 px-3 py-1.5 rounded"
    />
  </div>
)

export const Textarea = ({
  placeholder,
  defaultValue,
  name,
  id,
  label,
  rows,
  cols,
  onChange,
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
      name={name}
      rows={rows}
      cols={cols}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      className="block w-full placeholder:text-slate-400/60 border-solid border bg-slate-50/50 border-slate-300 px-3 py-1.5 rounded"
    ></textarea>
  </div>
)
