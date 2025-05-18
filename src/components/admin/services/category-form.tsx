'use client';

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from '@/components/ui';

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    onSubmit: (data: CategoryFormData) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

export function CategoryForm({ onSubmit, isSubmitting, onCancel }: CategoryFormProps) {
    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter category name"
                />
                {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Enter category description"
                />
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <LoadingSpinner className="mr-2" />
                            Creating...
                        </>
                    ) : (
                        'Create Category'
                    )}
                </Button>
            </div>
        </form>
    );
} 