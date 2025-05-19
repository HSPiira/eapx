'use client';

import React, { useCallback, useState } from 'react';
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';

interface Provider {
    id: string;
    name: string;
    type: string;
    contactEmail: string | null;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    rating: number | null;
    isVerified: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'RESIGNED';
    _count?: {
        services: number;
        sessions: number;
    };
}

export default function ProvidersPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [type, setType] = useState<string>('all');
    const [status, setStatus] = useState<string>('all');
    const queryClient = useQueryClient();

    const { data: providers, isLoading } = useQuery<Provider[]>({
        queryKey: ['providers', search, type, status],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (type && type !== 'all') params.append('type', type);
            if (status && status !== 'all') params.append('status', status);

            const response = await fetch(`/api/services/providers?${params.toString()}`);
            const data = await response.json();
            return data.data;
        },
    });

    const createProvider = useMutation({
        mutationFn: async (data: ProviderFormData) => {
            const response = await fetch('/api/services/providers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to create provider');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providers'] });
            setIsCreateDialogOpen(false);
        },
    });

    const handleCreateProvider = useCallback((data: ProviderFormData) => {
        createProvider.mutate(data);
    }, [createProvider]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Service Providers</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>Add Provider</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Provider</DialogTitle>
                            <DialogDescription>
                                Create a new service provider in the system.
                            </DialogDescription>
                        </DialogHeader>
                        <ProviderForm
                            onSubmit={handleCreateProvider}
                            isSubmitting={createProvider.isPending}
                            onCancel={() => setIsCreateDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search providers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Provider Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="COUNSELOR">Counselor</SelectItem>
                        <SelectItem value="CLINIC">Clinic</SelectItem>
                        <SelectItem value="HOTLINE">Hotline</SelectItem>
                        <SelectItem value="COACH">Coach</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="RESIGNED">Resigned</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {providers && <ProviderTable providers={providers} />}
        </div>
    );
} 