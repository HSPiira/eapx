import { CheckCircle2, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-950 dark:via-black dark:to-gray-900">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                  src="/dark-logo.png"
                  alt="careAxis logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
              />
              <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 sm:text-6xl">
                careAxis
              </h1>
            </div>
            <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
              Your confidential, modern counseling platform
            </p>

            <div className="mb-12 inline-block text-left">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-lg text-gray-700 dark:text-gray-200">Get started by signing in</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-lg text-gray-700 dark:text-gray-200">See a counselor of your choice</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-lg text-gray-700 dark:text-gray-200">100% private & secure</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-center mb-12">
              <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <span>Get Started</span>
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        <footer className="w-full flex flex-col items-center mt-12 mb-4 px-4">
          <div className="w-full max-w-lg border-t border-gray-200 dark:border-gray-800 mb-4" />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 md:gap-8 flex-wrap items-center justify-center text-xs sm:text-sm">
            <a
                className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors text-gray-700 dark:text-gray-300"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
            >
              <Image
                  aria-hidden
                  src="/file.svg"
                  alt="File icon"
                  width={16}
                  height={16}
                  className="w-4 h-4"
              />
              About Us
            </a>
            <a
                className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors text-gray-700 dark:text-gray-300"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
            >
              <Image
                  aria-hidden
                  src="/window.svg"
                  alt="Window icon"
                  width={16}
                  height={16}
                  className="w-4 h-4"
              />
              Go to Minet Uganda →
            </a>
            <a
                className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors text-gray-700 dark:text-gray-300"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
            >
              <Image
                  aria-hidden
                  src="/globe.svg"
                  alt="Globe icon"
                  width={16}
                  height={16}
                  className="w-4 h-4"
              />
              Contact Us
            </a>
          </div>
        </footer>
      </div>
  )
}
