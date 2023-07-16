import consoleStamp from "console-stamp"

consoleStamp(console, { format: ":date(yyyy-mm-dd HH:MM:ss) :label" })

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.PRE_BUILD === "true" ? ".next-pre-build" : ".next",
}

export default nextConfig
