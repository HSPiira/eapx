'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui';
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    description: string | null;
    metadata: any;
    createdAt: string;
    updatedAt: string;
    _count: {
        services: number;
    };
}

interface CategoriesTableProps {
    categories: Category[];
    onEdit?: (category: Category) => void;
    onDelete?: (category: Category) => void;
}

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortField, setSortField] = React.useState<keyof Category>('name');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

    const filteredCategories = React.useMemo(() => {
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const sortedCategories = React.useMemo(() => {
        return [...filteredCategories].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });
    }, [filteredCategories, sortField, sortDirection]);

    const handleSort = (field: keyof Category) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort('name')}
                                    className="flex items-center gap-1"
                                >
                                    Name
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort('_count')}
                                    className="flex items-center gap-1"
                                >
                                    Services
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort('createdAt')}
                                    className="flex items-center gap-1"
                                >
                                    Created
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedCategories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-primary font-semibold">
                                                {category.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        {category.name}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-md truncate">
                                    {category.description || 'No description'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {category._count.services}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {onEdit && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(category)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(category)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 