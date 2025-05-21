import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { industrySelectFields } from '@/lib/select-fields';
import { Prisma } from '@prisma/client';

const industrySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().optional(),
    description: z.string().optional(),
    parentId: z.string().optional(),
    externalId: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const parentId = searchParams.get('parentId');

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.IndustryWhereInput = {
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ],
            }),
            ...(parentId && parentId !== 'all' ? { parentId } : {}),
        };

        // Get total count for pagination
        const total = await prisma.industry.count({ where });

        // Fetch paginated industries
        const industries = await prisma.industry.findMany({
            where,
            select: industrySelectFields,
            orderBy: { name: 'asc' },
            skip,
            take: limit,
        });

        return NextResponse.json({
            data: industries,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching industries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch industries' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = industrySchema.parse(body);

        const industry = await prisma.industry.create({
            data: {
                name: validatedData.name,
                code: validatedData.code || null,
                description: validatedData.description || null,
                parentId: validatedData.parentId || null,
                externalId: validatedData.externalId || null,
                metadata: validatedData.metadata as Prisma.InputJsonValue,
            },
            select: industrySelectFields,
        });

        return NextResponse.json(industry);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error creating industry:', error);
        return NextResponse.json(
            { error: 'Failed to create industry' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!body.id || !body.name) {
        return NextResponse.json({ error: 'Industry ID and name are required' }, { status: 400 });
    }

    // Check for duplicate name  
    const existingIndustry = await prisma.industry.findFirst({
        where: {
            name: body.name,
            id: { not: body.id },
            deletedAt: null
        }
    });

    if (existingIndustry) {
        return NextResponse.json(
            { error: 'Industry with this name already exists' },
            { status: 400 }
        );
    }

    try {
        const updatedIndustry = await prisma.industry.update({
            where: { id: body.id, deletedAt: null },
            data: {
                name: body.name,
                code: body.code,
                description: body.description,
                parentId: body.parentId,
                externalId: body.externalId,
                metadata: body.metadata
            },
            select: industrySelectFields
        });

        return NextResponse.json(updatedIndustry);
    } catch (error) {
        console.error('Error updating industry:', error);
        return NextResponse.json({ error: 'Failed to update industry' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!body.id) {
        return NextResponse.json({ error: 'Industry ID is required' }, { status: 400 });
    }

    try {
        // Check if industry has children
        const hasChildren = await prisma.industry.findFirst({
            where: { parentId: body.id, deletedAt: null }
        });

        if (hasChildren) {
            return NextResponse.json(
                { error: 'Cannot delete industry with child industries' },
                { status: 400 }
            );
        }

        // Check if industry is used by any clients
        const hasClients = await prisma.client.findFirst({
            where: {
                industryId: body.id,
                deletedAt: null
            }
        });

        if (hasClients) {
            return NextResponse.json(
                { error: 'Cannot delete industry that is assigned to clients' },
                { status: 400 }
            );
        }

        // Soft delete industry
        await prisma.industry.update({
            where: { id: body.id, deletedAt: null },
            data: {
                deletedAt: new Date()
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting industry:', error);
        return NextResponse.json({ error: 'Failed to delete industry' }, { status: 500 });
    }
} 