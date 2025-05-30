import { withRouteMiddleware } from "@/middleware/api-middleware";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";
import { getPaginationParams } from "@/lib/api-utils";
import { StaffRole, WorkStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
    findOrCreateUser,
    findOrCreateProfile,
    ensureStaffDoesNotExist,
    createStaffRecord,
    handleError,
    createStaffSchema,
} from "@/lib/staff";

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } =
            getPaginationParams(searchParams);
        const role = searchParams.get("role") as StaffRole | undefined;
        const hasBeneficiaries =
            searchParams.get("hasBeneficiaries") === "true"
                ? true
                : searchParams.get("hasBeneficiaries") === "false"
                    ? false
                    : undefined;

        if (status && status !== "all") {
            if (!Object.values(WorkStatus).includes(status as WorkStatus)) {
                return NextResponse.json(
                    {
                        error: `Invalid status value. Must be one of: ${Object.values(WorkStatus).join(", ")}`,
                    },
                    { status: 400 }
                );
            }
        }

        const where: Prisma.StaffWhereInput = {
            clientId: id,
            deletedAt: null,
            OR: search
                ? [
                    {
                        profile: {
                            fullName: {
                                contains: search,
                                mode: Prisma.QueryMode.insensitive,
                            },
                        },
                    },
                    {
                        profile: {
                            email: { contains: search, mode: Prisma.QueryMode.insensitive },
                        },
                    },
                ]
                : undefined,
            status: status && status !== "all" ? (status as WorkStatus) : undefined,
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
                        metadata: true,
                    },
                },
                beneficiaries: true,
                CareSession: true,
            },
            skip: offset,
            take: limit,
            orderBy: { createdAt: "desc" },
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
        const { id: clientId } = await params;

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        const validationResult = createStaffSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        try {
            const result = await prisma.$transaction(async (tx) => {
                const user = await findOrCreateUser(tx, data);
                console.log('user', user);
                const profile = await findOrCreateProfile(tx, user, data);
                console.log('profile', profile);
                await ensureStaffDoesNotExist(tx, profile.id, clientId);
                console.log('staff does not exist');
                const staff = await createStaffRecord(
                    tx,
                    profile.id,
                    user.id,
                    clientId,
                    data
                );
                return staff;
            });
            console.log('result', result);
            await cache.deleteByPrefix(`clients:${clientId}:staff:`);
            return NextResponse.json(result, { status: 201 });
        } catch (error) {
            return handleError(error);
        }
    });
}
