import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const email = searchParams.get('email');
        const phone = searchParams.get('phone');
        const role = searchParams.get('role');
        const isPrimaryContact = searchParams.get('isPrimaryContact');
        const skip = (page - 1) * limit;
        const where = {
            serviceProviderId: providerId,
            ...(search && {
                OR: [
                    { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { role: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ],
            }),
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {}),
            ...(role ? { role } : {}),
            ...(isPrimaryContact ? { isPrimaryContact: isPrimaryContact === 'true' } : {}),
        };
        const total = await prisma.providerStaff.count({ where });
        const staff = await prisma.providerStaff.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        return NextResponse.json({
            data: staff,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching provider staff:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider staff' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const body = await request.json();
        if (!body.fullName) {
            return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
        }
        const staff = await prisma.providerStaff.create({
            data: {
                serviceProviderId: providerId,
                fullName: body.fullName,
                email: body.email,
                phone: body.phone,
                role: body.role,
                qualifications: body.qualifications,
                specializations: body.specializations,
                isPrimaryContact: body.isPrimaryContact,
                metadata: body.metadata,
            },
        });
        return NextResponse.json(staff);
    } catch (error) {
        console.error('Error creating provider staff:', error);
        return NextResponse.json(
            { error: 'Failed to create provider staff' },
            { status: 500 }
        );
    }
}
