import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const documents = await prisma.document.findMany({
            where: {
                serviceProviderId: providerId
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching provider documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider documents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const body = await request.json();
        if (!body.title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        const document = await prisma.document.create({
            data: {
                serviceProviderId: providerId,
                title: body.title,
                description: body.description,
                type: body.type,
                url: body.url,
                fileSize: body.fileSize,
                fileType: body.fileType,
                version: body.version,
                isLatest: body.isLatest,
                previousVersionId: body.previousVersionId,
                status: body.status,
                expiryDate: body.expiryDate,
                isConfidential: body.isConfidential,
                tags: body.tags,
                metadata: body.metadata,
                uploadedById: body.uploadedById,
                clientId: body.clientId,
                contractId: body.contractId,
                providerStaffId: body.providerStaffId,
            },
        });
        return NextResponse.json(document);
    } catch (error) {
        console.error('Error creating provider document:', error);
        return NextResponse.json(
            { error: 'Failed to create provider document' },
            { status: 500 }
        );
    }
} 