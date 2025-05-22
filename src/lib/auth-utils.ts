import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function isAdmin(session: Session | null): Promise<boolean> {
    if (!session?.user?.id) return false;

    // 1️⃣ Fast-path – use roles already in the session  
    if (Array.isArray(session.user.roles)) {
        return session.user.roles.includes('ADMIN');
    }

    // 2️⃣ Fallback – single DB hit  
    const userWithRoles = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            userRoles: {
                select: {
                    role: {
                        select: { name: true, deletedAt: true }
                    }
                }
            }
        }
    });

    return userWithRoles?.userRoles.some(
        ur => ur.role.name === 'ADMIN' && !ur.role.deletedAt
    ) ?? false;
} 