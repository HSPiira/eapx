'use client';

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from '@/components/ui';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';

const serviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    duration: z.number().min(1, "Duration must be at least 1 minute").optional().nullable(),
    capacity: z.number().min(1, "Capacity must be at least 1").optional().nullable(),
    prerequisites: z.string().optional(),
    isPublic: z.boolean(),
    price: z.number().min(0, "Price cannot be negative").optional().nullable(),
    serviceProviderId: z.string().optional().nullable(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface CategoryOption {
    id: string;
    name: string;
}

interface ProviderOption {
    id: string;
    name: string;
    type: string;
}

interface ServiceFormProps {
    onSubmitAction: (data: ServiceFormData) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    categories: CategoryOption[];
    providers?: ProviderOption[];
    initialData?: Partial<ServiceFormData>;
    submitLabel?: string;
    submittingLabel?: string;
}

export function ServiceForm({
    onSubmitAction,
    isSubmitting,
    onCancel,
    categories,
    providers = [],
    initialData,
    submitLabel = 'Create Service',
    submittingLabel = 'Creating...'
}: ServiceFormProps) {
    const form = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: '',
            description: '',
            isPublic: true,
            categoryId: '',
            duration: null,
            capacity: null,
            prerequisites: '',
            price: null,
            serviceProviderId: null,
            ...initialData
        },
    });

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [providerOpen, setProviderOpen] = useState(false);

    const selectedCategory = categories.find(
        (category) => category.id === form.watch("categoryId")
    );
    const selectedProvider = providers.find(
        (provider) => provider.id === form.watch("serviceProviderId")
    );

    return (
        <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-4">
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
                {form.formState.errors.description && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.description.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={categoryOpen}
                            className="w-full justify-between"
                            disabled={categories.length === 0}
                        >
                            {selectedCategory?.name || (categories.length === 0 ? "No categories available" : "Select category")}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search category..." />
                            <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                    {categories.length === 0 ? (
                                        <div className="p-2 text-center text-sm text-muted-foreground">
                                            No categories available
                                        </div>
                                    ) : (
                                        categories.map((category) => (
                                            <CommandItem
                                                key={category.id}
                                                value={category.name}
                                                onSelect={() => {
                                                    form.setValue("categoryId", category.id);
                                                    setCategoryOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.watch("categoryId") === category.id
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {category.name}
                                            </CommandItem>
                                        ))
                                    )}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.categoryId.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                        id="duration"
                        type="number"
                        min="1"
                        {...form.register("duration", { valueAsNumber: true })}
                        placeholder="Enter duration"
                    />
                    {form.formState.errors.duration && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.duration.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                        id="capacity"
                        type="number"
                        min="1"
                        {...form.register("capacity", { valueAsNumber: true })}
                        placeholder="Enter capacity"
                    />
                    {form.formState.errors.capacity && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.capacity.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                    id="prerequisites"
                    {...form.register("prerequisites")}
                    placeholder="Enter prerequisites"
                />
                {form.formState.errors.prerequisites && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.prerequisites.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register("price", { valueAsNumber: true })}
                    placeholder="Enter price"
                />
                {form.formState.errors.price && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.price.message}
                    </p>
                )}
            </div>

            {providers.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="serviceProviderId">Service Provider</Label>
                    <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={providerOpen}
                                className="w-full justify-between"
                            >
                                {selectedProvider ? `${selectedProvider.name} (${selectedProvider.type})` : "Select provider"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search provider..." />
                                <CommandList>
                                    <CommandEmpty>No provider found.</CommandEmpty>
                                    <CommandGroup>
                                        {providers.map((provider) => (
                                            <CommandItem
                                                key={provider.id}
                                                value={provider.name}
                                                onSelect={() => {
                                                    form.setValue("serviceProviderId", provider.id);
                                                    setProviderOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.watch("serviceProviderId") === provider.id
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {provider.name} ({provider.type})
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {form.formState.errors.serviceProviderId && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.serviceProviderId.message}
                        </p>
                    )}
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
                            {submittingLabel}
                        </>
                    ) : (
                        submitLabel
                    )}
                </Button>
            </div>
        </form>
    );
} 