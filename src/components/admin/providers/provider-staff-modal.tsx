'use client';

import React from 'react';
import { ProviderStaffForm, ProviderStaffFormData } from './provider-staff-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProviderStaffModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ProviderStaffFormData) => void;
    isSubmitting?: boolean;
    initialData?: Partial<ProviderStaffFormData>;
    mode?: 'add' | 'edit';
    error?: string | null;
    providers: { id: string; name: string }[];
    interventions: { id: string; name: string }[];
    services: { id: string; name: string }[];
}

export function ProviderStaffModal({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    initialData,
    mode = 'add',
    error,
    providers,
    interventions,
    services,
}: ProviderStaffModalProps) {
    return (
        <Dialog open={open} onOpenChange={open => !open && onClose()}>
            <DialogContent onInteractOutside={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{mode === 'edit' ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'edit' ? 'Update staff details below.' : 'Fill in the staff details below.'}
                    </DialogDescription>
                </DialogHeader>
                {error && (
                    <div className="mb-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded px-3 py-2">
                        {error}
                    </div>
                )}
                <ProviderStaffForm
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={onClose}
                    initialData={initialData}
                    providers={providers}
                    interventions={interventions}
                    services={services}
                />
            </DialogContent>
        </Dialog>
    );
} 