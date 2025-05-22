import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProviderForm, ProviderFormData } from './provider-form';

interface ProviderEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    provider: any | null; // Use your Provider type if available
    onSubmit: (data: ProviderFormData) => void;
    isSubmitting?: boolean;
}

export function ProviderEditModal({ open, onOpenChange, provider, onSubmit, isSubmitting }: ProviderEditModalProps) {
    if (!provider) return null;
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
                    initialData={provider}
                    onSubmit={onSubmit}
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