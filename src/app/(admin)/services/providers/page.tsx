'use client';

import React, { useEffect, useState } from 'react';
import { ProviderTable } from '@/components/admin/providers/provider-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ProviderForm, ProviderFormData } from '@/components/admin/providers/provider-form';
import { ProviderEditModal } from '@/components/admin/providers/provider-edit-modal';

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

interface Intervention {
    id: string;
    name: string;
    serviceId?: string;
    service?: { id: string; name: string };
}

interface Service {
    id: string;
    name: string;
}

export default function ProvidersListPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [interventions, setInterventions] = useState<Intervention[]>([]);

    useEffect(() => {
        async function fetchProviders() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/providers');
                if (!res.ok) throw new Error('Failed to fetch providers');
                const json = await res.json();
                setProviders(json.data || []);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchProviders();
    }, []);

    useEffect(() => {
        async function fetchServicesAndInterventions() {
            try {
                const resServices = await fetch('/api/services?limit=200');
                const jsonServices = await resServices.json();
                setServices(jsonServices.data || []);
                const resInterventions = await fetch('/api/services/interventions?limit=200');
                const jsonInterventions = await resInterventions.json();
                setInterventions((jsonInterventions.data || []).map((i: Intervention) => ({ ...i, service: i.service })));
            } catch (error) {
                console.error('Error fetching services and interventions:', error);
                setServices([]);
                setInterventions([]);
            }
        }
        fetchServicesAndInterventions();
    }, []);

    const handleEdit = (provider: Provider) => {
        setEditingProvider(provider);
        setIsEditDialogOpen(true);
    };

    const handleUpdateProvider = async (data: ProviderFormData) => {
        if (!editingProvider) return;
        setIsEditSubmitting(true);
        try {
            const res = await fetch(`/api/providers/${editingProvider.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update provider');
            const updated = await res.json();
            setProviders(prev => prev.map(p => p.id === updated.id ? updated : p));
            setIsEditDialogOpen(false);
            setEditingProvider(null);
        } catch (error) {
            console.error('Failed to update provider:', error);
            alert('Failed to update provider');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        // TODO: Implement delete logic
        alert(`Delete provider with id: ${id}`);
    };

    const handleAddProvider = async (data: ProviderFormData & { documents: Record<string, File | File[] | null>; interventionsOffered: string[] }) => {
        try {
            const payload = {
                ...data,
                type: data.type ? data.type : null,
            };
            const res = await fetch('/api/providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to add provider');
            const json = await res.json();
            setProviders(prev => [json, ...prev]);
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to add provider:', error);
            alert('Failed to add provider');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Providers</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Add Provider
                        </button>
                    </DialogTrigger>
                    <DialogContent onInteractOutside={e => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle>Add New Provider</DialogTitle>
                            <DialogDescription>
                                Add a new provider to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <ProviderForm
                            onSubmit={handleAddProvider}
                            isSubmitting={false}
                            onCancel={() => setIsDialogOpen(false)}
                            services={services}
                            interventions={interventions}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            {loading && <div className="p-4 text-gray-500">Loading...</div>}
            {error && <div className="p-4 text-red-500">{error}</div>}
            <ProviderTable providers={providers} onEdit={handleEdit} onDelete={handleDelete} />
            <ProviderEditModal
                open={isEditDialogOpen}
                onOpenChange={open => {
                    setIsEditDialogOpen(open);
                    if (!open) setEditingProvider(null);
                }}
                provider={editingProvider}
                onSubmit={handleUpdateProvider}
                isSubmitting={isEditSubmitting}
            />
        </div>
    );
} 