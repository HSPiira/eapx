import React from 'react';
import { notFound } from 'next/navigation';
import { StaffForm } from '../../_components/StaffForm';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StaffFormValues } from '../../_components/StaffForm';

type Params = Promise<{ id: string }>;

async function getStaffMember(id: string) {
    const staff = await prisma.staff.findUnique({
        where: {
            id,
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

    if (!staff) {
        return null;
    }

    return {
        ...staff,
        fullName: staff.profile.fullName,
        email: staff.profile.email || '',
        phone: staff.profile.phone || '',
        emergencyContactName: staff.profile.emergencyContactName || '',
        emergencyContactPhone: staff.profile.emergencyContactPhone || '',
        emergencyContactEmail: staff.profile.emergencyContactEmail || '',
        preferredLanguage: staff.profile.preferredLanguage || undefined,
        preferredContactMethod: staff.profile.preferredContactMethod || undefined,
        allergies: staff.profile.allergies || [],
        medicalConditions: staff.profile.medicalConditions || [],
        dietaryRestrictions: staff.profile.dietaryRestrictions || [],
        accessibilityNeeds: staff.profile.accessibilityNeeds || [],
        managementLevel: staff.managementLevel,
        employmentType: staff.employmentType || undefined,
        maritalStatus: staff.maritalStatus,
        status: staff.status,
    } as Partial<StaffFormValues>;
}

async function updateStaffMember(id: string, data: StaffFormValues) {
    'use server'

    const staff = await prisma.staff.findUnique({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            profile: true,
        },
    });

    if (!staff) {
        throw new Error('Staff not found');
    }

    // Update profile
    await prisma.profile.update({
        where: {
            id: staff.profileId,
        },
        data: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            emergencyContactEmail: data.emergencyContactEmail,
            preferredLanguage: data.preferredLanguage,
            preferredContactMethod: data.preferredContactMethod,
            allergies: data.allergies,
            medicalConditions: data.medicalConditions,
            dietaryRestrictions: data.dietaryRestrictions,
            accessibilityNeeds: data.accessibilityNeeds,
        },
    });

    // Update staff member
    await prisma.staff.update({
        where: {
            id,
        },
        data: {
            jobTitle: data.jobTitle || '',
            managementLevel: data.managementLevel,
            employmentType: data.employmentType,
            educationLevel: data.educationLevel,
            maritalStatus: data.maritalStatus,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            status: data.status,
            qualifications: data.qualifications || [],
            specializations: data.specializations || [],
            preferredWorkingHours: data.preferredWorkingHours,
        },
    });

    redirect(`/staff/${id}`);
}

export default async function EditStaffPage({
    params,
}: {
    params: Params
}) {
    const { id } = await params;
    const staff = await getStaffMember(id);

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
                    onSubmit={updateStaffMember.bind(null, id)}
                    onCancel={() => {
                        redirect(`/staff/${id}`);
                    }}
                />
            </div>
        </div>
    );
} 