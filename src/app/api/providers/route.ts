import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, WorkStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const isVerified = searchParams.get('isVerified');

        const skip = (page - 1) * limit;

        const where = {
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { contactEmail: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { contactPhone: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ],
            }),
            ...(status ? { status: status as WorkStatus } : {}),
            ...(isVerified ? { isVerified: isVerified === 'true' } : {}),
        };

        const total = await prisma.serviceProvider.count({ where });
        const providers = await prisma.serviceProvider.findMany({
            where,
            orderBy: { name: 'asc' },
            skip,
            take: limit,
        });

        return NextResponse.json({
            data: providers,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching providers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch providers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        // Check for duplicate name
        const existingProvider = await prisma.serviceProvider.findFirst({
            where: {
                name: body.name,
                deletedAt: null
            }
        });
        if (existingProvider) {
            return NextResponse.json(
                { error: 'Provider with this name already exists' },
                { status: 400 }
            );
        }
        const provider = await prisma.serviceProvider.create({
            data: {
                name: body.name,
                type: body.type || null,
                contactEmail: body.contactEmail,
                contactPhone: body.contactPhone,
                location: body.location,
                qualifications: body.qualifications,
                specializations: body.specializations,
                rating: body.rating,
                isVerified: body.isVerified,
                metadata: body.metadata,
                status: body.status,
            },
        });
        return NextResponse.json(provider);
    } catch (error) {
        console.error('Error creating provider:', error);
        return NextResponse.json(
            { error: 'Failed to create provider' },
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
        return NextResponse.json({ error: 'Provider ID and name are required' }, { status: 400 });
    }
    // Check for duplicate name
    const existingProvider = await prisma.serviceProvider.findFirst({
        where: {
            name: body.name,
            id: { not: body.id },
            deletedAt: null
        }
    });
    if (existingProvider) {
        return NextResponse.json(
            { error: 'Provider with this name already exists' },
            { status: 400 }
        );
    }
    try {
        const updatedProvider = await prisma.serviceProvider.update({
            where: { id: body.id, deletedAt: null },
            data: {
                name: body.name,
                type: body.type || null,
                contactEmail: body.contactEmail,
                contactPhone: body.contactPhone,
                location: body.location,
                qualifications: body.qualifications,
                specializations: body.specializations,
                rating: body.rating,
                isVerified: body.isVerified,
                metadata: body.metadata,
                status: body.status,
            },
        });
        return NextResponse.json(updatedProvider);
    } catch (error) {
        console.error('Error updating provider:', error);
        return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
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
        return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }
    try {
        // Soft delete provider
        await prisma.serviceProvider.update({
            where: { id: body.id, deletedAt: null },
            data: {
                deletedAt: new Date()
            }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting provider:', error);
        return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
    }
} 