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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const serviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'DELETED']),
    duration: z.number().optional(),
    capacity: z.number().optional(),
    prerequisites: z.string().optional(),
    isPublic: z.boolean(),
    price: z.number().optional(),
    serviceProviderId: z.string().optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
    onSubmit: (data: ServiceFormData) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    categories: Array<{ id: string; name: string }>;
    providers?: Array<{ id: string; name: string; type: string }>;
}

export function ServiceForm({
    onSubmit,
    isSubmitting,
    onCancel,
    categories,
    providers = []
}: ServiceFormProps) {
    const form = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: '',
            description: '',
            status: 'ACTIVE',
            isPublic: true,
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

            <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                    onValueChange={(value) => form.setValue("categoryId", value)}
                    defaultValue={form.getValues("categoryId")}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.categoryId.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    onValueChange={(value) => form.setValue("status", value as any)}
                    defaultValue={form.getValues("status")}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                        id="duration"
                        type="number"
                        {...form.register("duration", { valueAsNumber: true })}
                        placeholder="Enter duration"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                        id="capacity"
                        type="number"
                        {...form.register("capacity", { valueAsNumber: true })}
                        placeholder="Enter capacity"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                    id="prerequisites"
                    {...form.register("prerequisites")}
                    placeholder="Enter prerequisites"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register("price", { valueAsNumber: true })}
                    placeholder="Enter price"
                />
            </div>

            {providers.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="serviceProviderId">Service Provider</Label>
                    <Select
                        onValueChange={(value) => form.setValue("serviceProviderId", value)}
                        defaultValue={form.getValues("serviceProviderId")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                            {providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                    {provider.name} ({provider.type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="flex items-center space-x-2">
                <Switch
                    id="isPublic"
                    checked={form.watch("isPublic")}
                    onCheckedChange={(checked) => form.setValue("isPublic", checked)}
                />
                <Label htmlFor="isPublic">Public Service</Label>
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
                        'Create Service'
                    )}
                </Button>
            </div>
        </form>
    );
} 