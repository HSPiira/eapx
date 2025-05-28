import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Gender } from '@prisma/client';

const profileSchema = z.object({
    fullName: z.string().min(1),
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

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = profileSchema.parse(json);

        const profile = await prisma.profile.create({
            data: body,
        });

        return NextResponse.json(profile, { status: 201 });
    } catch (error) {
        console.error('Error creating profile:', error);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 400 });
    }
} 