import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { UserStatus } from '@prisma/client';

const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().optional(),
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