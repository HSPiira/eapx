import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ClientStaffTable } from './client-staff-table';
import { StaffFormModal } from './_components/StaffFormModal';

type Params = Promise<{ id: string }>;

async function getClientStaff(clientId: string) {
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true }
    });

    if (!client) {
        notFound();
    }

    const staff = await prisma.staff.findMany({
        where: {
            clientId,
            deletedAt: null,
        },
        include: {
            profile: true,
            client: {
                select: {
                    name: true,
                },
            },
        },
    });

    return {
        clientName: client.name,
        staff: staff.map((member) => ({
            id: member.id,
            fullName: member.profile.fullName,
            email: member.profile.email,
            role: member.role,
            status: member.status,
            startDate: member.startDate.toISOString(),
            client: member.client,
        })),
    };
}

export default async function ClientStaffPage({
    params,
}: {
    params: Params;
}) {
    const { id } = await params;
    const { clientName, staff } = await getClientStaff(id);

    return (
        <div className="container mx-auto">
            <div className="flex justify-end mb-6">
                <StaffFormModal clientId={id} />
            </div>
            <ClientStaffTable staff={staff} />
        </div>
    );
} 