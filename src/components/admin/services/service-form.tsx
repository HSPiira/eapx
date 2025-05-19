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
    duration: z.number().optional().nullable(),
    capacity: z.number().optional().nullable(),
    prerequisites: z.string().optional(),
    isPublic: z.boolean(),
    price: z.number().optional().nullable(),
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
    onSubmit: (data: ServiceFormData) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    categories: CategoryOption[];
    providers?: ProviderOption[];
    initialData?: Partial<ServiceFormData>;
    submitLabel?: string;
    submittingLabel?: string;
}

export function ServiceForm({
    onSubmit,
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
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={categoryOpen}
                            className="w-full justify-between"
                            disabled={categories.length === 0}
                        >
                            {form.watch("categoryId")
                                ? categories.find(
                                    (category) => category.id === form.watch("categoryId")
                                )?.name
                                : categories.length === 0
                                    ? "No categories available"
                                    : "Select category"}
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
                    <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={providerOpen}
                                className="w-full justify-between"
                            >
                                {form.watch("serviceProviderId")
                                    ? providers.find(
                                        (provider) => provider.id === form.watch("serviceProviderId")
                                    )?.name
                                    : "Select provider"}
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