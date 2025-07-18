import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { WorkStatus, ManagementLevel, MaritalStatus } from '@prisma/client';

const staffSchema = z.object({
    profileId: z.string().min(1, "Profile ID is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    status: z.nativeEnum(WorkStatus).default(WorkStatus.ACTIVE),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    qualifications: z.array(z.string()),
    specializations: z.array(z.string()),
    clientId: z.string().min(1, "Client ID is required"),
    managementLevel: z.nativeEnum(ManagementLevel).default(ManagementLevel.JUNIOR),
    maritalStatus: z.nativeEnum(MaritalStatus).default(MaritalStatus.SINGLE),
});


export async function GET() {
    try {
        const staff = await prisma.staff.findMany({
            include: {
                profile: true,
                client: {
                    select: {
                        name: true,
                    },
                },
            },
            where: {
                deletedAt: null,
            },
        });

        return NextResponse.json(
            staff.map((member) => ({
                id: member.id,
                name: member.profile.fullName,
                email: member.profile.email,
                companyId: member.clientId,
                jobTitle: member.jobTitle,
                status: member.status,
                startDate: member.startDate.toISOString(),
                client: member.client,
            }))
        );
    } catch (error) {
        console.error("Error fetching staff:", error);
        return NextResponse.json(
            { error: "Failed to fetch staff" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = staffSchema.parse(json);

        // Check if profile exists and has a user
        const profile = await prisma.profile.findUnique({
            where: { id: body.profileId },
            include: { user: true }
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        if (!profile.userId) {
            return NextResponse.json(
                { error: "Profile must be associated with a user" },
                { status: 400 }
            );
        }

        // Create the staff record using the existing profile
        const staff = await prisma.staff.create({
            data: {
                jobTitle: body.jobTitle,
                status: body.status,
                startDate: body.startDate ? new Date(body.startDate) : new Date(),
                endDate: body.endDate ? new Date(body.endDate) : null,
                qualifications: body.qualifications,
                specializations: body.specializations,
                profileId: profile.id,
                clientId: body.clientId,
                userId: profile.userId,
                companyId: body.clientId,
                managementLevel: body.managementLevel,
                maritalStatus: body.maritalStatus,
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

        return NextResponse.json({
            id: staff.id,
            fullName: staff.profile.fullName,
            email: staff.profile.email,
            jobTitle: staff.jobTitle,
            status: staff.status,
            startDate: staff.startDate.toISOString(),
            client: staff.client,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating staff:", error);
        return NextResponse.json(
            { error: "Failed to create staff" },
            { status: 500 }
        );
    }
} 