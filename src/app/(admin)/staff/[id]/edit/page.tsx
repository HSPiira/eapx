import React from 'react';
import { notFound } from 'next/navigation';
import { StaffForm } from '../../_components/StaffForm';

async function getStaffMember(id: string) {
    // TODO: Implement API call to fetch staff member data
    return null;
}

export default async function EditStaffPage({
    params,
}: {
    params: { id: string };
}) {
    const staff = await getStaffMember(params.id);

    if (!staff) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Edit Staff Member</h1>
                    <p className="text-muted-foreground">Update staff information and details</p>
                </div>
            </div>

            <div className="grid gap-6">
                <StaffForm
                    staff={staff}
                    onSubmit={async (data) => {
                        'use server'
                        // TODO: Implement staff update logic
                        console.log('Updating staff:', data)
                    }}
                />
            </div>
        </div>
    );
} 