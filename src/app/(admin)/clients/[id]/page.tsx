'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle2, Pencil, Mail as MailIcon, BarChart, MapPin, Users, Info } from 'lucide-react';
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



export default function ClientOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const clientId = params.id as string;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: client, isLoading, isError } = useClient(clientId);

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
            <div className="color-scheme-blue w-full max-w-3xl lg:max-w-4xl px-0 md:px-4 lg:px-0 bg-background rounded-xl p-0 md:p-8 shadow-none md:shadow space-y-2">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-4 mb-2 md:mb-6 pt-2 md:pt-0">
                    <div className="flex flex-col flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2 truncate">
                            {client.name}
                            {client.status === 'ACTIVE' && (
                                <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700 ml-2">Active</Badge>
                            )}
                            {client.isVerified && (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 ml-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-300" /> Verified
                                </Badge>
                            )}
                        </h1>
                        {client.taxId && (
                            <div className="text-sm text-muted-foreground mt-1 truncate">Tax ID: {client.taxId}</div>
                        )}
                    </div>
                    <Button
                        variant="default"
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow ml-auto"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Button>
                </div>

                {/* Info Sections */}
                <div className="grid md:grid-cols-2 gap-12 divide-y-2 md:divide-y-0 md:divide-x-2 divide-blue-100 dark:divide-blue-900">
                    {/* Left Column */}
                    <div className="pr-0 md:pr-8 space-y-6">
                        {/* Contact Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 border-l-4 border-blue-400 dark:border-blue-700 pl-2">
                                <span className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                    <MailIcon className="h-5 w-5 text-blue-400 dark:text-blue-300" /> Contact
                                </span>
                            </div>
                            {client.email && <InfoRow label="Email" value={client.email} />}
                            {client.phone && <InfoRow label="Phone" value={client.phone} />}
                            {client.website && <InfoRow label="Website" value={client.website} />}
                            {client.preferredContactMethod && <InfoRow label="Preferred Contact" value={client.preferredContactMethod} />}
                        </div>
                        {/* Industry Section */}
                        {client.industry && (
                            <div>
                                <div className="flex items-center gap-2 mb-2 border-l-4 border-blue-300 dark:border-blue-600 pl-2">
                                    <span className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                        <BarChart className="h-5 w-5 text-blue-300 dark:text-blue-400" /> Industry
                                    </span>
                                </div>
                                <InfoRow label="Industry" value={client.industry.name} />
                            </div>
                        )}
                    </div>
                    {/* Right Column */}
                    <div className="pl-0 md:pl-8 space-y-6">
                        {/* Address Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 border-l-4 border-blue-200 dark:border-blue-800 pl-2">
                                <span className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-200 dark:text-blue-400" /> Address
                                </span>
                            </div>
                            {client.address && <InfoRow label="Address" value={client.address} />}
                            {client.billingAddress && <InfoRow label="Billing Address" value={client.billingAddress} />}
                        </div>
                        {/* Contact Person Section */}
                        {(client.contactPerson || client.contactEmail || client.contactPhone) && (
                            <div>
                                <div className="flex items-center gap-2 mb-2 border-l-4 border-blue-200 dark:border-blue-800 pl-2">
                                    <span className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-200 dark:text-blue-400" /> Contact Person
                                    </span>
                                </div>
                                {client.contactPerson && <InfoRow label="Name" value={client.contactPerson} />}
                                {client.contactEmail && <InfoRow label="Email" value={client.contactEmail} />}
                                {client.contactPhone && <InfoRow label="Phone" value={client.contactPhone} />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Section */}
                <div className="pt-8 mt-8 border-t-2 border-blue-100 dark:border-blue-900">
                    <div className="flex items-center gap-2 mb-2 border-l-4 border-blue-100 dark:border-blue-900 pl-2">
                        <span className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-100 dark:text-blue-400" /> Additional
                        </span>
                    </div>
                    {client.timezone && <InfoRow label="Timezone" value={client.timezone} />}
                    {client.notes && <InfoRow label="Notes" value={client.notes} />}
                    <InfoRow label="Created" value={new Date(client.createdAt).toLocaleDateString()} />
                    <InfoRow label="Last Updated" value={new Date(client.updatedAt).toLocaleDateString()} />
                </div>
            </div>

            <EditClientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['client', clientId] });
                }}
                clientId={clientId}
            />
        </>
    );
}

// Helper component for info rows
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200 min-w-[120px]">{label}:</span>
            <span className="text-sm text-muted-foreground">{value}</span>
        </div>
    );
}