import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { NextAuthConfig } from "next-auth"
import type { DefaultSession } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            roles?: string[]
            status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
            access_token?: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        roles?: string[]
        email: string
        name?: string | null
        image?: string | null
        status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
        access_token?: string
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string
        roles?: string[]
        idToken?: string
        name?: string | null
        email?: string | null
        picture?: string | null
        sub?: string
        access_token?: string
    }
}

export const createConfig = (prismaClient = prisma): NextAuthConfig => ({
    adapter: PrismaAdapter(prismaClient),
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
            authorization: {
                params: {
                    scope: "openid profile email",
                    prompt: "select_account",
                    response_type: "code",
                    response_mode: "query",
                }
            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    callbacks: {
        async signIn({ user, account }) {
            try {
                if (!user.email) {
                    return false
                }

                // Check if a user with this email exists
                const existingUser = await prismaClient.user.findUnique({
                    where: { email: user.email },
                    include: { accounts: true }
                })

                if (existingUser) {
                    // Check if the user already has a Microsoft account
                    const hasMicrosoftAccount = existingUser.accounts.some(
                        acc => acc.provider === "microsoft-entra-id"
                    )

                    if (!hasMicrosoftAccount) {
                        // Link the Microsoft account to the existing user
                        await prismaClient.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account?.type ?? "oauth",
                                provider: account?.provider ?? "microsoft-entra-id",
                                providerAccountId: account?.providerAccountId ?? "",
                                access_token: account?.access_token,
                                expires_at: account?.expires_at,
                                token_type: account?.token_type,
                                scope: account?.scope,
                                id_token: account?.id_token,
                                session_state: account?.session_state?.toString() ?? null,
                            }
                        })
                    }

                    // Update last login time
                    await prismaClient.user.update({
                        where: { id: existingUser.id },
                        data: {
                            lastLoginAt: new Date(),
                            status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
                        },
                    })

                    // Create audit log
                    await prismaClient.auditLog.create({
                        data: {
                            action: "LOGIN",
                            entityType: "User",
                            entityId: existingUser.id,
                            userId: existingUser.id,
                            data: {
                                provider: account?.provider,
                                email: user.email,
                                isLinked: !hasMicrosoftAccount,
                            },
                        },
                    })

                    return true
                }

                // Create new user
                const newUser = await prismaClient.user.create({
                    data: {
                        id: user.id,
                        email: user.email,
                        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
                        emailVerified: new Date(),
                        lastLoginAt: new Date(),
                    },
                })

                // Create audit log for new user
                await prismaClient.auditLog.create({
                    data: {
                        action: "LOGIN",
                        entityType: "User",
                        entityId: newUser.id,
                        userId: newUser.id,
                        data: {
                            provider: account?.provider,
                            email: user.email,
                            isNewUser: true,
                        },
                    },
                })

                // Create profile for new user
                await prismaClient.profile.create({
                    data: {
                        userId: newUser.id,
                        fullName: user.name ?? "",
                        email: user.email,
                        image: user.image ?? null,
                    },
                })

                return true
            } catch (error) {
                console.error('Error in signIn callback:', error)
                return false
            }
        },

        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string
                session.user.roles = token.roles as string[]
                if (token.access_token) {
                    session.user.access_token = token.access_token
                }

                // Get user status from database
                const dbUser = await prismaClient.user.findUnique({
                    where: { id: token.id },
                    select: { status: true },
                })
                if (dbUser?.status) {
                    session.user.status = dbUser.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
                }
            }
            return session
        },

        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.email = user.email
            }
            if (account?.access_token) {
                token.access_token = account.access_token
            }
            return token
        },

        authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = request.nextUrl.pathname.startsWith('/admin')

            if (isOnDashboard) {
                return isLoggedIn
            }

            // For non-dashboard routes, allow public access
            return true
        },

        // Handle redirect URLs properly
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 60 * 60, // 1 hour
    },
    events: {
        async signOut(message) {
            if ('token' in message && message.token?.id) {
                // Get the user from the database
                const dbUser = await prismaClient.user.findUnique({
                    where: { id: message.token.id }
                })

                if (dbUser) {
                    await prismaClient.auditLog.create({
                        data: {
                            action: "LOGOUT",
                            entityType: "User",
                            entityId: dbUser.id,
                            userId: dbUser.id,
                            data: {
                                email: dbUser.email,
                            }
                        }
                    })
                }
            }
        }
    },
})

export const { auth, handlers, signIn, signOut } = NextAuth(createConfig())