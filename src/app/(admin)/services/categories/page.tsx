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
import { toast } from "sonner"

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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
    }

    return response.json();
}

async function updateCategory({ id, ...data }: CategoryFormData & { id: string }) {
    const response = await fetch(`/api/services/categories/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
    }

    return response.json();
}

async function deleteCategory(id: string) {
    const response = await fetch(`/api/services/categories/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
    }

    return response.json();
}

export default function CategoriesPage() {
    const [open, setOpen] = React.useState(false);
    const queryClient = useQueryClient();
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/services/categories');
            if (!res.ok) {
                throw new Error('Failed to fetch categories');
            }
            return res.json();
        },
    });

    const createCategoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setOpen(false);
            toast.success("Category created successfully!")
        },
        onError: (error) => {
            console.error('Error creating category:', error);
            toast.error("Failed to create category.")
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success("Category updated successfully!")
        },
        onError: (error) => {
            console.error('Error updating category:', error);
            toast.error("Failed to update category.")
        }
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success("Category deleted successfully!")
        },
        onError: (error) => {
            console.error('Error deleting category:', error);
            toast.error("Failed to delete category.")
        }
    });

    const handleSubmit = React.useCallback(async (data: CategoryFormData) => {
        createCategoryMutation.mutate(data);
    }, [createCategoryMutation]);

    const handleEdit = React.useCallback(async (category: Category) => {
        // TODO: Implement edit modal
        console.log('Edit category:', category);
    }, []);

    const handleDelete = React.useCallback(async (category: Category) => {
        if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
            deleteCategoryMutation.mutate(category.id);
        }
    }, [deleteCategoryMutation]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (!data) {
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
                    <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
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