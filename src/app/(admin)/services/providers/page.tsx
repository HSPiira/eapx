'use client';

import React, { useEffect, useState } from 'react';
import { ProviderTable } from '@/components/admin/providers/provider-table';
import { Button, LoadingSpinner } from '@/components/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ProviderForm, type ProviderFormData } from '@/components/admin/providers/provider-form';
import { toast } from "sonner"
import { ProviderEditModal } from '@/components/admin/providers/provider-edit-modal';

interface Provider {
    id: string;
    name: string;
    type: string;
    entityType: string;
    contactEmail: string | null;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'RESIGNED';
    isVerified: boolean;
    rating: number | null;
    createdAt: string;
    _count?: {
        services: number;
        sessions: number;
    };
}

async function fetchProviders() {
    const res = await fetch('/api/providers');
    if (!res.ok) {
        throw new Error('Failed to fetch providers');
    }
    return res.json();
}

async function createProvider(data: ProviderFormData) {
    const response = await fetch('/api/services/providers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create provider');
    }

    return response.json();
}

async function updateProvider({ id, ...data }: ProviderFormData & { id: string }) {
    const response = await fetch(`/api/services/providers/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update provider');
    }

    return response.json();
}

async function deleteProvider(id: string) {
    const response = await fetch(`/api/services/providers/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete provider');
    }

    return response.json();
}

export default function ProvidersListPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);

    useEffect(() => {
        async function fetchProviders() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/providers');
                if (!res.ok) throw new Error('Failed to fetch providers');
                const json = await res.json();
                setProviders(json.data || []);
            } catch (err: any) {
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        }
        fetchProviders();
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
        } catch (err) {
            alert('Failed to update provider');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        // TODO: Implement delete logic
        alert(`Delete provider with id: ${id}`);
    };

    const handleAddProvider = async (data: ProviderFormData) => {
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
        } catch (err) {
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