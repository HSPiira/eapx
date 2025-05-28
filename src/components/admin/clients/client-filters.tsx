// src/components/clients/client-filters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { BaseStatus, ContactMethod } from '@prisma/client';

interface ClientFiltersState {
    search: string;
    status?: BaseStatus | 'all';
    industryId?: string | 'all';
    isVerified?: boolean;
    preferredContactMethod?: ContactMethod;
    createdAfter?: Date;
    createdBefore?: Date;
    hasContract?: boolean;
    hasStaff?: boolean;
}

interface ClientFiltersProps {
    onFilterChangeAction: (filters: Partial<ClientFiltersState>) => void;
    currentFilters: ClientFiltersState;
}

export function ClientFilters({ onFilterChangeAction, currentFilters }: ClientFiltersProps) {
    const [search, setSearch] = useState(currentFilters.search);
    const [status, setStatus] = useState<BaseStatus | 'all'>(currentFilters.status || 'all');
    const [industryId, setIndustryId] = useState<string | 'all'>(currentFilters.industryId || 'all');

    // Sync internal state with external currentFilters prop
    useEffect(() => {
        setSearch(currentFilters.search);
        setStatus(currentFilters.status || 'all');
        setIndustryId(currentFilters.industryId || 'all');
    }, [currentFilters]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = e.target.value;
        setSearch(newSearch);
        // Debounce this or apply on a button click for better performance on large datasets
        onFilterChangeAction({ search: newSearch });
    };

    const handleStatusChange = (newStatus: BaseStatus | 'all') => {
        setStatus(newStatus);
        onFilterChangeAction({ status: newStatus });
    };

    const handleIndustryChange = (newIndustryId: string | 'all') => {
        setIndustryId(newIndustryId);
        onFilterChangeAction({ industryId: newIndustryId });
    };

    const handleClearFilters = () => {
        const clearedFilters: ClientFiltersState = {
            search: '',
            status: 'all',
            industryId: 'all',
            isVerified: undefined,
            preferredContactMethod: undefined,
            createdAfter: undefined,
            createdBefore: undefined,
            hasContract: undefined,
            hasStaff: undefined,
        };
        // Update internal state
        setSearch(clearedFilters.search);
        setStatus(clearedFilters.status as BaseStatus | 'all'); // Explicitly cast status
        setIndustryId(clearedFilters.industryId as string | 'all'); // Explicit cast here
        // Notify parent component
        onFilterChangeAction(clearedFilters);
    };

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search clients..."
                    className="pl-9"
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>

            <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {/* Assuming BaseStatus has ACTIVE, INACTIVE, PENDING, ARCHIVED, DELETED */}
                    {Object.values(BaseStatus).map((s) => (
                        <SelectItem key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={industryId} onValueChange={handleIndustryChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {/* TODO: Fetch industries from API */}
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
            </Button>

            <Button variant="ghost" className="flex items-center gap-2" onClick={handleClearFilters}>
                <X className="h-4 w-4" />
                Clear
            </Button>
        </div>
    );
}