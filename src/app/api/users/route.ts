import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Gender, IdType, UserStatus } from '@prisma/client';

const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().optional(),
    preferredName: z.string().optional(),
    dob: z.string().optional(),
    gender: z.nativeEnum(Gender).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    nationality: z.string().optional(),
    idNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    idType: z.nativeEnum(IdType).optional(),
    allergies: z.string().array().optional(),
    medicalConditions: z.string().array().optional(),
    dietaryRestrictions: z.string().array().optional(),
    accessibilityNeeds: z.string().array().optional(),
    metadata: z.object({
        clientId: z.string().optional(),
    }).optional(),
});

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = userSchema.parse(json);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: body.email,
                status: UserStatus.ACTIVE,
                metadata: {
                    type: 'user',
                    clientId: body.metadata?.clientId,
                }
            }
        });

        // Create profile
        const profile = await prisma.profile.create({
            data: {
                fullName: body.fullName,
                email: body.email,
                phone: body.phone,
                userId: user.id,
                preferredName: body.preferredName,
                dob: body.dob,
                gender: body.gender,
                emergencyContactName: body.emergencyContactName,
                emergencyContactPhone: body.emergencyContactPhone,
                nationality: body.nationality,
                idNumber: body.idNumber,
                passportNumber: body.passportNumber,
                idType: body.idType,
                allergies: body.allergies,
                medicalConditions: body.medicalConditions,
                dietaryRestrictions: body.dietaryRestrictions,
                accessibilityNeeds: body.accessibilityNeeds,
            }
        });

        return NextResponse.json({
            id: user.id,
            profileId: profile.id,
            email: user.email,
            fullName: profile.fullName,
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true }
    });

    if (!user || !user.profile) {
        return NextResponse.json({}, { status: 404 });
    }

    return NextResponse.json({
        id: user.id,
        profileId: user.profile.id,
        email: user.email,
        fullName: user.profile.fullName,
        // ...other fields as needed
    });
} 