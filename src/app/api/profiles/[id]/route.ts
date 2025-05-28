import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Gender } from '@prisma/client';

const profileUpdateSchema = z.object({
    fullName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    dob: z.string().optional(),
    gender: z.nativeEnum(Gender).optional(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactEmail: z.string().optional(),
    medicalConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    bloodType: z.string().optional(),
    // ...add other profile fields as needed
});

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
    try {
        const { id } = await params;
        const json = await request.json();
        const body = profileUpdateSchema.parse(json);

        const profile = await prisma.profile.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 });
    }
} 