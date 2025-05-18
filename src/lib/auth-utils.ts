import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function isAdmin(session: Session | null): Promise<boolean> {
    if (!session?.user?.id) return false;

    const userWithRoles = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            userRoles: {
                include: {
                    role: true
                }
            }
        }
    });

    return userWithRoles?.userRoles.some(userRole =>
        userRole.role.name === 'ADMIN' && !userRole.role.deletedAt
    ) ?? false;
} 