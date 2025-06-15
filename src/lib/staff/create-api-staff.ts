import { Prisma, Profile, User } from "@prisma/client";
import { CreateStaffInput } from "./api-staff-schema";
import { NextResponse } from "next/server";

export async function findOrCreateUser(tx: Prisma.TransactionClient, data: CreateStaffInput) {
    if (!data.email) throw new Error('Email is required to create a staff member');

    const existingUser = await tx.user.findUnique({
        where: { email: data.email },
        include: { profile: true },
    });

    if (existingUser) return existingUser;

    try {
        return await tx.user.create({
            data: {
                email: data.email,
                status: 'ACTIVE',
                preferredLanguage: data.preferredLanguage,
                profile: {
                    create: mapProfileData(data),
                },
            },
            include: { profile: true },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw new Error(`A user with email ${data.email} already exists`);
        }
        throw err;
    }
}

export async function findOrCreateProfile(tx: Prisma.TransactionClient, user: User & { profile?: Profile | null }, data: CreateStaffInput) {
    if (user.profile) return user.profile;

    return await tx.profile.create({
        data: {
            userId: user.id,
            ...mapProfileData(data),
        },
    });
}

export async function ensureStaffDoesNotExist(tx: Prisma.TransactionClient, profileId: string, clientId: string) {
    const existingStaff = await tx.staff.findFirst({
        where: {
            profileId,
            clientId,
            deletedAt: null,
        },
    });

    if (existingStaff) {
        throw new Error(`A staff member with this profile already exists`);
    }
}

export async function createStaffRecord(
    tx: Prisma.TransactionClient,
    profileId: string,
    userId: string,
    clientId: string,
    data: CreateStaffInput
) {
    return await tx.staff.create({
        data: {
            clientId,
            userId,
            profileId,
            jobTitle: data.jobTitle || '',
            companyId: data.companyId || clientId,
            companyStaffId: data.companyStaffId,
            managementLevel: data.managementLevel || 'JUNIOR',
            employmentType: data.employmentType || 'FULL_TIME',
            educationLevel: data.educationLevel || 'HIGH_SCHOOL',
            maritalStatus: data.maritalStatus || 'SINGLE',
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate,
            status: data.status || 'ACTIVE',
            qualifications: data.qualifications || [],
            specializations: data.specializations || [],
            preferredWorkingHours: data.preferredWorkingHours,
            metadata: data.metadata,
        },
        include: {
            profile: {
                select: {
                    id: true,
                    fullName: true,
                    preferredName: true,
                    email: true,
                    phone: true,
                    dob: true,
                    gender: true,
                    address: true,
                    nationality: true,
                    bloodType: true,
                    allergies: true,
                    medicalConditions: true,
                    dietaryRestrictions: true,
                    accessibilityNeeds: true,
                    emergencyContactName: true,
                    emergencyContactPhone: true,
                    emergencyContactEmail: true,
                    preferredLanguage: true,
                    preferredContactMethod: true,
                    metadata: true,
                },
            },
            beneficiaries: true,
            CareSession: true,
        },
    });
}

export function mapProfileData(data: CreateStaffInput) {
    return {
        fullName: data.fullName!,
        preferredName: data.preferredName,
        email: data.email!,
        phone: data.phone,
        dob: data.dob,
        gender: data.gender,
        address: data.address,
        nationality: data.nationality,
        bloodType: data.bloodType,
        allergies: data.allergies,
        medicalConditions: data.medicalConditions,
        dietaryRestrictions: data.dietaryRestrictions,
        accessibilityNeeds: data.accessibilityNeeds,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactEmail: data.emergencyContactEmail,
        preferredLanguage: data.preferredLanguage,
        preferredContactMethod: data.preferredContactMethod,
        metadata: data.metadata,
    };
}

export function handleError(error: unknown) {
    console.error('Error creating staff:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json({ error: 'Database error occurred', code: error.code }, { status: 500 });
    }

    if (error instanceof Error && error.message.includes('already exists')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({
        error: 'An error occurred while creating the staff member',
    }, { status: 500 });
}
