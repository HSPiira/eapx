import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { BaseStatus, Prisma, ContactMethod } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define select fields for client queries
const clientSelectFields = {
    id: true,
    name: true,
    email: true,
    phone: true,
    website: true,
    address: true,
    billingAddress: true,
    taxId: true,
    contactPerson: true,
    contactEmail: true,
    contactPhone: true,
    industryId: true,
    industry: {
        select: {
            id: true,
            name: true,
            code: true
        }
    },
    status: true,
    preferredContactMethod: true,
    timezone: true,
    isVerified: true,
    notes: true,
    metadata: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
    staff: {
        where: {
            deletedAt: null
        },
        select: {
            id: true,
            jobTitle: true,
            status: true,
            startDate: true,
            endDate: true,
            profile: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    dob: true,
                    gender: true,
                    nationality: true,
                    address: true,
                    idNumber: true,
                    passportNumber: true,
                    idType: true,
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
            }
        }
    }
};

// Create Zod enum from Prisma enum
const baseStatusEnum = z.enum(Object.values(BaseStatus) as [string, ...string[]]);
const contactMethodEnum = z.enum(Object.values(ContactMethod) as [string, ...string[]]);

// Validation schema for client creation/update
const clientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable(),
    address: z.string().optional().nullable(),
    billingAddress: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    contactEmail: z.string().email('Invalid contact email').optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    industryId: z.string().optional().nullable(),
    status: baseStatusEnum.optional(),
    preferredContactMethod: contactMethodEnum.optional().nullable(),
    timezone: z.string().optional().nullable(),
    isVerified: z.boolean().optional(),
    notes: z.string().optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
});

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);

        // Additional filter parameters
        const industryId = searchParams.get('industryId') || undefined;
        const isVerified = searchParams.get('isVerified') === 'true' ? true :
            searchParams.get('isVerified') === 'false' ? false : undefined;
        const preferredContactMethod = searchParams.get('preferredContactMethod') as ContactMethod | undefined;
        const createdAfter = searchParams.get('createdAfter') ? new Date(searchParams.get('createdAfter')!) : undefined;
        const createdBefore = searchParams.get('createdBefore') ? new Date(searchParams.get('createdBefore')!) : undefined;
        const hasContract = searchParams.get('hasContract') === 'true' ? true :
            searchParams.get('hasContract') === 'false' ? false : undefined;
        const hasStaff = searchParams.get('hasStaff') === 'true' ? true :
            searchParams.get('hasStaff') === 'false' ? false : undefined;

        if (status && status !== 'all') {
            if (!Object.values(BaseStatus).includes(status as BaseStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(BaseStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        if (preferredContactMethod && !Object.values(ContactMethod).includes(preferredContactMethod)) {
            return NextResponse.json({
                error: `Invalid contact method. Must be one of: ${Object.values(ContactMethod).join(', ')}`,
            }, { status: 400 });
        }

        const where: Prisma.ClientWhereInput = {
            deletedAt: null,
        };

        const cacheKey = `clients:${page}:${limit}:${search}:${status}:${industryId}:${isVerified}:${preferredContactMethod}:${createdAfter}:${createdBefore}:${hasContract}:${hasStaff}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const totalCount = await prisma.client.count({ where });

        const clients = await prisma.client.findMany({
            where,
            select: clientSelectFields,
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: clients,
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

export async function POST(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = clientSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        // Check for duplicate email if provided
        if (body.email) {
            const existingClient = await prisma.client.findFirst({
                where: {
                    email: body.email,
                    deletedAt: null,
                },
            });

            if (existingClient) {
                return NextResponse.json({
                    error: 'A client with this email already exists',
                }, { status: 409 });
            }
        }

        // Check for duplicate tax ID if provided
        if (body.taxId) {
            const existingClient = await prisma.client.findFirst({
                where: {
                    taxId: body.taxId,
                    deletedAt: null,
                },
            });

            if (existingClient) {
                return NextResponse.json({
                    error: 'A client with this tax ID already exists',
                }, { status: 409 });
            }
        }

        const newClient = await prisma.client.create({
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                website: body.website,
                address: body.address,
                billingAddress: body.billingAddress,
                taxId: body.taxId,
                contactPerson: body.contactPerson,
                contactEmail: body.contactEmail,
                contactPhone: body.contactPhone,
                industryId: body.industryId,
                status: (body.status || 'ACTIVE') as BaseStatus,
                preferredContactMethod: body.preferredContactMethod,
                timezone: body.timezone,
                isVerified: body.isVerified ?? false,
                notes: body.notes,
                metadata: body.metadata,
            },
            select: clientSelectFields,
        });

        await cache.deleteByPrefix('clients:');
        return NextResponse.json(newClient, { status: 201 });
    });
} 