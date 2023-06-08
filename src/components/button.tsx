import Link, { LinkProps } from "next/link"
import { AnchorHTMLAttributes, ButtonHTMLAttributes, FC } from "react"

const LoadingIcon = () => (
  <span className="h-4 scale-125 ml-2 inline-flex items-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <circle cx="18" cy="12" r="0" fill="currentColor">
        <animate
          attributeName="r"
          begin=".67"
          calcMode="spline"
          dur="1.5s"
          keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
          repeatCount="indefinite"
          values="0;2;0;0"
        />
      </circle>
      <circle cx="12" cy="12" r="0" fill="currentColor">
        <animate
          attributeName="r"
          begin=".33"
          calcMode="spline"
          dur="1.5s"
          keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
          repeatCount="indefinite"
          values="0;2;0;0"
        />
      </circle>
      <circle cx="6" cy="12" r="0" fill="currentColor">
        <animate
          attributeName="r"
          begin="0"
          calcMode="spline"
          dur="1.5s"
          keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
          repeatCount="indefinite"
          values="0;2;0;0"
        />
      </circle>
    </svg>
  </span>
)

const SuccessIcon = () => (
  <span className="h-4 scale-125 ml-2 inline-flex items-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 1024 1024"
    >
      <path
        fill="currentColor"
        d="M512 64a448 448 0 1 1 0 896a448 448 0 0 1 0-896zm-55.808 536.384l-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z"
      />
    </svg>
  </span>
)

export const Button: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean
    isSuccess?: boolean
  }
> = ({
  children,
  className = "",
  isLoading = false,
  isSuccess = false,
  ...rest
}) => {
  return (
    <>
      <button
        className={`text-base inline-flex items-center ${
          isLoading ? "bg-blue-300 cursor-wait" : "bg-blue-500"
        } ${
          isSuccess ? "bg-green-400 cursor-auto" : ""
        } enabled:hover:bg-blue-600 rounded text-white inline-block py-2 px-4 cursor-pointer no-underline hover:no-underline border-0 ${className}`}
        disabled={isLoading || isSuccess}
        {...rest}
      >
        {isLoading ? (
          <>
            Loading&nbsp;
            <LoadingIcon />
          </>
        ) : isSuccess ? (
          <>
            Success&nbsp;
            <SuccessIcon />
          </>
        ) : (
          children
        )}
      </button>
    </>
  )
}

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
