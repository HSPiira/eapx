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
import { Search, ArrowUpDown, X, Calendar, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, unknown>;
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
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

    const filteredCategories = React.useMemo(() => {
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const sortedCategories = React.useMemo(() => {
        return [...filteredCategories].sort((a, b) => {
            let aValue, bValue;

            // Handle nested properties
            if (sortField === '_count') {
                aValue = a._count.services;
                bValue = b._count.services;
            } else {
                aValue = a[sortField];
                bValue = b[sortField];
            }

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
            if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            // Handle number comparison
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            // Handle date comparison
            if (sortField === 'createdAt' || sortField === 'updatedAt') {
                const aDate = new Date(aValue as string).getTime();
                const bDate = new Date(bValue as string).getTime();
                return sortDirection === 'asc'
                    ? aDate - bDate
                    : bDate - aDate;
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
        <div className="relative">
            <div className={`space-y-4 ${selectedCategory ? 'mr-96' : ''} transition-all duration-300`}>
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
                                <TableRow
                                    key={category.id}
                                    className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                                    onClick={() => setSelectedCategory(category)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View details for ${category.name}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedCategory(category);
                                        }
                                    }}
                                >
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
                                    <TableCell
                                        className="max-w-md truncate"
                                        title={category.description || 'No description'}
                                    >
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(category);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(category);
                                                    }}
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

            {/* Details Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-background border-l shadow-lg transition-transform duration-300 transform ${selectedCategory ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{ top: 'var(--header-height, 0px)' }}
            >
                {selectedCategory && (
                    <Card className="h-full border-0 rounded-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold">Category Details</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedCategory(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary text-xl font-semibold">
                                        {selectedCategory.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedCategory.name}</h3>
                                    <Badge variant="secondary">
                                        {selectedCategory._count.services} services
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Description</span>
                                </div>
                                <p className="text-sm">
                                    {selectedCategory.description || 'No description provided'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Created</span>
                                </div>
                                <p className="text-sm">
                                    {new Date(selectedCategory.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>Services</span>
                                </div>
                                <p className="text-sm">
                                    {selectedCategory._count.services} services in this category
                                </p>
                            </div>

                            <div className="pt-4 flex gap-2">
                                {onEdit && (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => onEdit(selectedCategory)}
                                    >
                                        Edit Category
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete ${selectedCategory.name}?`)) {
                                                onDelete(selectedCategory);
                                                setSelectedCategory(null); // Close the panel after deletion
                                            }
                                        }}
                                    >
                                        Delete Category
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 