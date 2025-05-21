'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EditClientModal } from '@/components/admin/clients/edit-client-modal';

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    billingAddress: string | null;
    taxId: string | null;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    industry: {
        id: string;
        name: string;
        code: string;
    } | null;
    status: string;
    preferredContactMethod: string | null;
    timezone: string | null;
    isVerified: boolean;
    notes: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}

async function fetchClient(id: string): Promise<Client> {
    const response = await fetch(`/api/clients/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch client');
    }
    return response.json();
}

export default function ClientOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: client, isLoading, isError } = useQuery<Client>({
        queryKey: ['client', clientId],
        queryFn: () => fetchClient(clientId),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    if (isError || !client) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">Failed to load client details</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-end mb-6">
                <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Pencil className="h-4 w-4" />
                    Edit Client
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="font-medium">Status:</div>
                            <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {client.status}
                            </Badge>
                            {client.isVerified && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        {client.email && (
                            <div>
                                <div className="font-medium">Email:</div>
                                <div className="text-muted-foreground">{client.email}</div>
                            </div>
                        )}
                        {client.phone && (
                            <div>
                                <div className="font-medium">Phone:</div>
                                <div className="text-muted-foreground">{client.phone}</div>
                            </div>
                        )}
                        {client.website && (
                            <div>
                                <div className="font-medium">Website:</div>
                                <div className="text-muted-foreground">{client.website}</div>
                            </div>
                        )}
                        {client.industry && (
                            <div>
                                <div className="font-medium">Industry:</div>
                                <div className="text-muted-foreground">{client.industry.name}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {client.contactPerson && (
                            <div>
                                <div className="font-medium">Contact Person:</div>
                                <div className="text-muted-foreground">{client.contactPerson}</div>
                            </div>
                        )}
                        {client.contactEmail && (
                            <div>
                                <div className="font-medium">Contact Email:</div>
                                <div className="text-muted-foreground">{client.contactEmail}</div>
                            </div>
                        )}
                        {client.contactPhone && (
                            <div>
                                <div className="font-medium">Contact Phone:</div>
                                <div className="text-muted-foreground">{client.contactPhone}</div>
                            </div>
                        )}
                        {client.preferredContactMethod && (
                            <div>
                                <div className="font-medium">Preferred Contact Method:</div>
                                <div className="text-muted-foreground">{client.preferredContactMethod}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Address Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {client.address && (
                            <div>
                                <div className="font-medium">Address:</div>
                                <div className="text-muted-foreground">{client.address}</div>
                            </div>
                        )}
                        {client.billingAddress && (
                            <div>
                                <div className="font-medium">Billing Address:</div>
                                <div className="text-muted-foreground">{client.billingAddress}</div>
                            </div>
                        )}
                        {client.taxId && (
                            <div>
                                <div className="font-medium">Tax ID:</div>
                                <div className="text-muted-foreground">{client.taxId}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {client.timezone && (
                            <div>
                                <div className="font-medium">Timezone:</div>
                                <div className="text-muted-foreground">{client.timezone}</div>
                            </div>
                        )}
                        {client.notes && (
                            <div>
                                <div className="font-medium">Notes:</div>
                                <div className="text-muted-foreground">{client.notes}</div>
                            </div>
                        )}
                        <div>
                            <div className="font-medium">Created:</div>
                            <div className="text-muted-foreground">
                                {new Date(client.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <div className="font-medium">Last Updated:</div>
                            <div className="text-muted-foreground">
                                {new Date(client.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <EditClientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    router.refresh();
                }}
                clientId={clientId}
            />
        </>
    );
} 