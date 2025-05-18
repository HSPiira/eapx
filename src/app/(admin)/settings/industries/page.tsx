'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui';
import { Search, X } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Industry {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    parentId: string | null;
    parent: {
        id: string;
        name: string;
        code: string | null;
    } | null;
}

const fetchIndustries = async (params: { page: number; limit: number; search: string; parentId: string | null }) => {
    const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.search && { search: params.search }),
        ...(params.parentId && { parentId: params.parentId }),
    });

    const response = await fetch(`/api/industries?${queryParams}`);
    if (!response.ok) {
        throw new Error('Failed to fetch industries');
    }
    return response.json();
};

const IndustriesPage = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [parentId, setParentId] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // Reset to first page on new search
        }, 1000); // 2 seconds debounce

        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['industries', page, limit, search, parentId],
        queryFn: () => fetchIndustries({ page, limit, search, parentId }),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearch('');
        setPage(1);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">Failed to load industries</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">Industries</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your industry categories</p>
                </div>
                <Button>Add Industry</Button>
            </div>

            <div className="flex gap-4 items-end">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Search industries..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" variant="secondary">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </form>
                <Select
                    value={parentId || 'all'}
                    onValueChange={(value) => setParentId(value === 'all' ? null : value)}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by parent" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        {data?.data.map((industry: Industry) => (
                            <SelectItem key={industry.id} value={industry.id}>
                                {industry.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px] py-2">Name</TableHead>
                            <TableHead className="w-[100px] py-2">Code</TableHead>
                            <TableHead className="w-[200px] py-2">Parent Industry</TableHead>
                            <TableHead className="py-2">Description</TableHead>
                            <TableHead className="w-[100px] py-2">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.data.map((industry: Industry) => (
                            <TableRow key={industry.id}>
                                <TableCell className="font-medium truncate py-2">{industry.name}</TableCell>
                                <TableCell className="truncate py-2">{industry.code || '-'}</TableCell>
                                <TableCell className="truncate py-2">{industry.parent?.name || '-'}</TableCell>
                                <TableCell className="truncate max-w-[300px] py-2">{industry.description || '-'}</TableCell>
                                <TableCell className="py-2">
                                    <Button variant="ghost" size="sm">
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Showing {data?.data.length} of {data?.pagination.total} industries
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= data?.pagination.pages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default IndustriesPage; 