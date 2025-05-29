import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { StaffRole, WorkStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Create Zod enums from Prisma enums

// Define Params type for route handlers
type Params = Promise<{ id: string }>;

// Validation schema for staff creation/update
const createStaffSchema = z.object({
    // Either profileId for existing users, or user details for new users
    profileId: z.string().optional(),
    userId: z.string().optional(),
    // User/Profile fields (required if profileId is not provided)
    email: z.string().email().optional(),
    fullName: z.string().optional(),
    preferredName: z.string().optional(),
    phone: z.string().optional(),
    dob: z.string().transform((val) => new Date(val)).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    address: z.string().optional(),
    nationality: z.string().optional(),
    bloodType: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    accessibilityNeeds: z.array(z.string()).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactEmail: z.string().email().optional(),
    preferredLanguage: z.enum(['ENGLISH', 'SPANISH', 'FRENCH', 'GERMAN', 'OTHER']).optional(),
    preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'OTHER']).optional(),
    metadata: z.any().optional(),

    // Staff fields
    jobTitle: z.string(),
    companyId: z.string().optional(),
    managementLevel: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE', 'OTHER']).optional(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    preferredWorkingHours: z.any().optional(),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'CONSULTANT']).optional(),
    educationLevel: z.enum(['HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD']).optional(),
}).refine(
    (data) => {
        // Either profileId or user details must be provided
        return (data.profileId && data.userId) ||
            (data.email && data.fullName);
    },
    {
        message: "Either profileId and userId must be provided for existing users, or email and fullName for new users",
    }
);

// Define custom error types
interface CustomError extends Error {
    code?: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);
        const role = searchParams.get('role') as StaffRole | undefined;
        const hasBeneficiaries = searchParams.get('hasBeneficiaries') === 'true' ? true :
            searchParams.get('hasBeneficiaries') === 'false' ? false : undefined;

        if (status && status !== 'all') {
            if (!Object.values(WorkStatus).includes(status as WorkStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(WorkStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        const where: Prisma.StaffWhereInput = {
            clientId: id,
            deletedAt: null,
            OR: search
                ? [
                    { profile: { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { profile: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                ]
                : undefined,
            status: status && status !== 'all' ? (status as WorkStatus) : undefined,
            ...(role && { role }),
            ...(hasBeneficiaries !== undefined && {
                beneficiaries: hasBeneficiaries ? { some: {} } : { none: {} },
            }),
        };

        const cacheKey = `clients:${id}:staff:${page}:${limit}:${search}:${status}:${role}:${hasBeneficiaries}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.staff.count({ where });
        const staff = await prisma.staff.findMany({
            where,
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
                        metadata: true
                    }
                },
                beneficiaries: true,
                CareSession: true,
            },
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: staff,
            metadata: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            },
        };

        await cache.set(cacheKey, response);
        return NextResponse.json(response);
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = createStaffSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        const data = validationResult.data;

        try {
            // Start a transaction to ensure data consistency
            const result = await prisma.$transaction(async (tx) => {
                let user;
                let profile;

                // Check if user exists by email
                if (data.email) {
                    user = await tx.user.findUnique({
                        where: { email: data.email },
                        include: { profile: true }
                    });

                    if (!user) {
                        // Create new user and profile
                        try {
                            user = await tx.user.create({
                                data: {
                                    email: data.email!,
                                    status: 'ACTIVE',
                                    preferredLanguage: data.preferredLanguage,
                                    profile: {
                                        create: {
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
                                        }
                                    }
                                },
                                include: {
                                    profile: true
                                }
                            });
                            profile = user.profile;
                        } catch (error: unknown) {
                            if (error instanceof Error && error.message.includes('P2002')) {
                                throw new Error(`A user with email ${data.email} already exists`);
                            }
                            throw error;
                        }
                    } else {
                        // User exists, check if they have a profile
                        if (!user.profile) {
                            // Create profile for existing user
                            profile = await tx.profile.create({
                                data: {
                                    userId: user.id,
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
                                }
                            });
                        } else {
                            profile = user.profile;
                        }
                    }
                } else {
                    throw new Error('Email is required to create a staff member');
                }

                if (!profile) {
                    throw new Error('Profile is required to create staff member');
                }

                // Check if staff member already exists with this profile
                const existingStaff = await tx.staff.findFirst({
                    where: {
                        profileId: profile.id,
                        deletedAt: null,
                    },
                });

                if (existingStaff) {
                    throw new Error(`A staff member with this profile already exists`);
                }

                // Create the staff record
                const newStaff = await tx.staff.create({
                    data: {
                        clientId: id,
                        userId: user.id,
                        profileId: profile.id,
                        jobTitle: data.jobTitle,
                        companyId: data.companyId || id,
                        managementLevel: data.managementLevel || 'JUNIOR',
                        employmentType: data.employmentType || 'FULL_TIME',
                        educationLevel: data.educationLevel || 'HIGH_SCHOOL',
                        maritalStatus: data.maritalStatus || 'SINGLE',
                        startDate: data.startDate,
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
                                metadata: true
                            }
                        },
                        beneficiaries: true,
                        CareSession: true,
                    },
                });

                return newStaff;
            });

            await cache.deleteByPrefix(`clients:${id}:staff:`);
            return NextResponse.json(result, { status: 201 });
        } catch (error) {
            console.error('Error creating staff:', error);

            const customError = error as CustomError;

            // Handle specific error cases
            if (customError.message?.includes('already exists')) {
                return NextResponse.json({
                    error: customError.message,
                }, { status: 409 }); // Conflict
            }

            // Handle Prisma errors
            if (customError instanceof Prisma.PrismaClientKnownRequestError) {
                return NextResponse.json({
                    error: 'Database error occurred',
                    code: customError.code,
                }, { status: 500 });
            }

            // Handle other Prisma errors
            if (customError instanceof Prisma.PrismaClientUnknownRequestError ||
                customError instanceof Prisma.PrismaClientRustPanicError ||
                customError instanceof Prisma.PrismaClientInitializationError) {
                return NextResponse.json({
                    error: 'Database error occurred',
                }, { status: 500 });
            }

            // Handle generic errors
            return NextResponse.json({
                error: 'An error occurred while creating the staff member',
            }, { status: 500 });
        }
    });
} 