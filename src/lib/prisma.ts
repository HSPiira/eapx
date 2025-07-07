import { PrismaClient } from '@prisma/client'

const createPrismaClient = () => new PrismaClient({
    log: ['error', 'warn'], // Only show errors and warnings
})

declare global {
    // Allow global prisma instance for dev to avoid multiple instances
     
    var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV === 'development') {
    globalThis.prisma = prisma
}

// Export encryption utilities for manual use
export { 
    encryptSensitiveData, 
    decryptSensitiveData, 
    encryptStringArray, 
    decryptStringArray 
} from './encryption';

// Export data encryption utilities
export {
    encryptUserData,
    decryptUserData,
    encryptAccountData,
    decryptAccountData,
    migrateExistingData
} from './encryption-utils';
