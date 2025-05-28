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

const serviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
    onSubmit: (data: ServiceFormData) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    initialData?: Partial<ServiceFormData>;
}

export function ServiceForm({ onSubmit, isSubmitting, onCancel, initialData }: ServiceFormProps) {
    const form = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: '',
            description: '',
            metadata: {},
            ...initialData,
        },
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter service name"
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
                    placeholder="Enter service description"
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
                            {initialData ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        initialData ? 'Update Service' : 'Create Service'
                    )}
                </Button>
            </div>
        </form>
    );
} 