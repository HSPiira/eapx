'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm, type CategoryFormData } from '@/components/admin/services/category-form';
import { CategoriesTable } from '@/components/admin/services/categories-table';

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

interface CategoriesResponse {
    data: Category[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

async function fetchCategories(): Promise<CategoriesResponse> {
    const response = await fetch('/api/services/categories');
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    return response.json();
}

async function createCategory(data: CategoryFormData): Promise<Category> {
    const response = await fetch('/api/services/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create category');
    }

    return response.json();
}

export default function CategoriesPage() {
    const [open, setOpen] = React.useState(false);
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery<CategoriesResponse>({
        queryKey: ['categories'],
        queryFn: fetchCategories
    });

    const createCategoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setOpen(false);
        },
    });

    const handleSubmit = (data: CategoryFormData) => {
        createCategoryMutation.mutate(data);
    };

    const handleEdit = (category: Category) => {
        // TODO: Implement edit functionality
        console.log('Edit category:', category);
    };

    const handleDelete = (category: Category) => {
        // TODO: Implement delete functionality
        console.log('Delete category:', category);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                Error loading categories. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Service Categories</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Category</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>
                                Create a new service category to organize your services.
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm
                            onSubmit={handleSubmit}
                            isSubmitting={createCategoryMutation.isPending}
                            onCancel={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <CategoriesTable
                categories={data?.data || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
} 