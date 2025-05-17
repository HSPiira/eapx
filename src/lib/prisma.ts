import { PrismaClient } from '@prisma/client'

const createPrismaClient = () => new PrismaClient({
    log: ['error', 'warn'], // Only show errors and warnings
})

declare global {
    // Allow global prisma instance for dev to avoid multiple instances
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV === 'development') {
    globalThis.prisma = prisma
}
