import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string, documentId: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, documentId } = await params;
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                serviceProviderId: providerId
            }
        });
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        return NextResponse.json(document);
    } catch (error) {
        console.error('Error fetching provider document:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider document' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, documentId } = await params;
        const body = await request.json();
        if (!body.title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        const updated = await prisma.document.update({
            where: { id: documentId, serviceProviderId: providerId },
            data: {
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
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating provider document:', error);
        return NextResponse.json(
            { error: 'Failed to update provider document' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, documentId } = await params;
        await prisma.document.update({
            where: { id: documentId, serviceProviderId: providerId },
            data: { deletedAt: new Date() }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting provider document:', error);
        return NextResponse.json(
            { error: 'Failed to delete provider document' },
            { status: 500 }
        );
    }
} 