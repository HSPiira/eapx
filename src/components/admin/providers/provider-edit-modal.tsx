import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProviderForm } from './provider-form';
import { CreateServiceProviderInput } from '@/schema/provider';

type ProviderType = 'COUNSELOR' | 'CLINIC' | 'HOTLINE' | 'COACH' | 'OTHER';
type ProviderEntityType = 'INDIVIDUAL' | 'COMPANY';
type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'RESIGNED';

interface Provider {
    id: string;
    name: string;
    type: ProviderType;
    entityType: ProviderEntityType;
    contactEmail: string;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    status: ProviderStatus;
    isVerified: boolean;
    rating: number | null;
    createdAt: string;
    updatedAt?: string;
    _count?: {
        services: number;
        sessions: number;
    };
}

interface ProviderEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    provider: Provider | null;
    onSubmit: (data: CreateServiceProviderInput) => void;
    isSubmitting?: boolean;
}

export function ProviderEditModal({ open, onOpenChange, provider, onSubmit, isSubmitting }: ProviderEditModalProps) {
    if (!provider) return null;

    // Convert provider data to match form data structure
    const formData: Partial<CreateServiceProviderInput> = {
        name: provider.name,
        type: provider.type,
        entityType: provider.entityType,
        contactEmail: provider.contactEmail,
        contactPhone: provider.contactPhone ?? undefined,
        location: provider.location ?? undefined,
        qualifications: provider.qualifications,
        specializations: provider.specializations,
        isVerified: provider.isVerified,
        status: provider.status,
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onInteractOutside={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Edit Provider</DialogTitle>
                    <DialogDescription>
                        Update the provider details below.
                    </DialogDescription>
                </DialogHeader>
                <ProviderForm
                    initialData={formData}
                    onSubmitAction={onSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => onOpenChange(false)}
                />
                <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                        <span className="font-medium">Created At:</span> {provider.createdAt ? new Date(provider.createdAt).toLocaleString() : '-'}
                    </div>
                    <div>
                        <span className="font-medium">Updated At:</span> {provider.updatedAt ? new Date(provider.updatedAt).toLocaleString() : '-'}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 