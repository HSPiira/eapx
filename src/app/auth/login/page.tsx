'use client'

import Image from "next/image";
import Link from "next/link";
import { Button, LoadingSpinner } from "@/components/ui";
import { useState } from "react";
import { signIn } from 'next-auth/react'

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleAuth = async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            await signIn("microsoft-entra-id", { redirectTo: "/dashboard" })
        } catch (error) {
            console.error("Sign in error:", error)
            setIsLoading(false)
        }
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        await handleAuth()
    }

    return (<div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-950 dark:via-black dark:to-gray-900">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="relative w-full max-w-sm">
                {/* Background card with blur effect */}
                <div className="absolute inset-0 bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl" />

                {/* Content */}
                <div className="relative p-8">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <div className="flex items-center justify-center gap-3">
                                <Image
                                    src="/dark-logo.png"
                                    alt="careAxis logo"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10"
                                />
                                <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                                    careAxis
                                </h1>
                            </div>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Sign in to access your account
                        </p>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-6">
                        <Button
                            type="submit"
                            className="w-full relative bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                            disabled={isLoading}
                            onClick={handleAuth}
                        >
                            {!isLoading && (
                                <Image
                                    src="/microsoft.svg"
                                    alt="Microsoft logo"
                                    width={20}
                                    height={20}
                                    className="mr-2"
                                />
                            )}
                            {isLoading ? (
                                <>
                                    <LoadingSpinner className="mr-2" />
                                    Signing in...
                                </>
                            ) : (
                                "Continue with Microsoft"
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-transparent px-2 text-gray-500 dark:text-gray-400">
                                    Secure Authentication
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            By signing in, you agree to our{" "}
                            <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                                Privacy Policy
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>

        {/* Footer */}
        <footer className="w-full flex flex-col items-center mt-12 mb-4 px-4">
            <div className="w-full max-w-lg border-t border-gray-200 dark:border-gray-800 mb-4" />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 md:gap-8 flex-wrap items-center justify-center text-xs sm:text-sm">
                <a
                    className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors text-gray-600 dark:text-gray-300"
                    href="#"
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
                    className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors text-gray-600 dark:text-gray-300"
                    href="#"
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
                    className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors text-gray-600 dark:text-gray-300"
                    href="#"
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
    </div>)
}