'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui';
import { Search, X, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { CenteredErrorDisplay } from '@/components/shared/CenteredErrorDisplay';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

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
    createdAt: Date;
    updatedAt: Date;
}

interface IndustriesResponse {
    data: Industry[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const IndustriesPage = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [parentId, setParentId] = useState<string | null>(null);
    const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // Reset to first page on new search
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading, error, refetch } = useIndustries({ page, limit, search, parentId });

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    }, [searchInput]);

    const handleClearSearch = useCallback(() => {
        setSearchInput('');
        setSearch('');
        setPage(1);
    }, []);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
        }
    }, [handleSearch]);

    const handlePreviousPage = useCallback(() => {
        if (page > 1) {
            setPage(prev => prev - 1);
        }
    }, [page]);

    const handleNextPage = useCallback(() => {
        if (data?.metadata?.totalPages && page < data.metadata.totalPages) {
            setPage(prev => prev + 1);
        }
    }, [page, data?.metadata?.totalPages]);

    const handleParentChange = useCallback((value: string) => {
        setParentId(value === 'all' ? null : value);
        setPage(1); // Reset to first page when parent changes
    }, []);

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-grow items-center justify-center w-full h-full">
                <CenteredErrorDisplay
                    message={error.message}
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
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
                    onValueChange={handleParentChange}
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

            <div>
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
                                <TableCell
                                    className="font-medium text-nowrap cursor-pointer hover:text-primary"
                                    onClick={() => setSelectedIndustry(industry)}
                                >
                                    {industry.name}
                                </TableCell>
                                <TableCell className="text-nowrap">{industry.code || '-'}</TableCell>
                                <TableCell className="text-nowrap">{industry.parent?.name || '-'}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{industry.description || '-'}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setSelectedIndustry(industry)}>
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {/* handle edit */ }}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {/* handle delete */ }}>
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <LoadingSpinner className="w-4 h-4" />
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <div>
                            Showing {data?.data?.length || 0} of {data?.metadata?.total || 0} industries
                            {data?.metadata?.totalPages && data.metadata.totalPages > 1 && (
                                <span className="ml-2">
                                    (Page {page} of {data.metadata.totalPages})
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        {data?.metadata?.total && data.metadata.total > 0 && (
                            <span>
                                {((page - 1) * limit) + 1} - {Math.min(page * limit, data.metadata.total)} of {data.metadata.total}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePreviousPage}
                            disabled={page === 1 || isLoading}
                            size="icon"
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous page</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={!data?.metadata?.totalPages || page >= (data?.metadata?.totalPages || 0) || isLoading}
                            size="icon"
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next page</span>
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedIndustry} onOpenChange={() => setSelectedIndustry(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Industry Details</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">{selectedIndustry?.name}</h2>
                                {selectedIndustry?.code && (
                                    <p className="text-sm text-muted-foreground mt-1">Code: {selectedIndustry.code}</p>
                                )}
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Parent Industry</h3>
                                        <p className="text-base">{selectedIndustry?.parent?.name || 'None'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                                        <p className="text-base whitespace-pre-wrap">
                                            {selectedIndustry?.description || 'No description available'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                                        <p className="text-sm">
                                            {selectedIndustry?.createdAt ? format(new Date(selectedIndustry.createdAt), 'PPP') : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                                        <p className="text-sm">
                                            {selectedIndustry?.updatedAt ? format(new Date(selectedIndustry.updatedAt), 'PPP') : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IndustriesPage; 