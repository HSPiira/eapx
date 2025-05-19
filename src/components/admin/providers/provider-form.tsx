'use client';

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const providerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    contactEmail: z.string().email().nullable(),
    contactPhone: z.string().nullable(),
    location: z.string().nullable(),
    qualifications: z.array(z.string()),
    specializations: z.array(z.string()),
    isVerified: z.boolean(),
    status: z.string(),
}) satisfies z.ZodType<ProviderFormData>;

export type ProviderFormData = {
    name: string;
    type: string;
    contactEmail: string | null;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    isVerified: boolean;
    status: string;
};

interface ProviderFormProps {
    onSubmit: (data: ProviderFormData) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    initialData?: Partial<ProviderFormData>;
}

export function ProviderForm({
    onSubmit,
    isSubmitting,
    onCancel,
    initialData,
}: ProviderFormProps) {
    const form = useForm<ProviderFormData>({
        resolver: zodResolver(providerSchema),
        defaultValues: {
            name: initialData?.name || '',
            type: initialData?.type || '',
            contactEmail: initialData?.contactEmail || null,
            contactPhone: initialData?.contactPhone || null,
            location: initialData?.location || null,
            qualifications: initialData?.qualifications || [],
            specializations: initialData?.specializations || [],
            isVerified: initialData?.isVerified || false,
            status: initialData?.status || 'ACTIVE',
        },
    });

    const [typeOpen, setTypeOpen] = useState(false);

    const providerTypes = [
        { value: 'COUNSELOR', label: 'Counselor' },
        { value: 'CLINIC', label: 'Clinic' },
        { value: 'HOTLINE', label: 'Hotline' },
        { value: 'COACH', label: 'Coach' },
        { value: 'OTHER', label: 'Other' },
    ];

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter provider name"
                />
                {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={typeOpen}
                            className="w-full justify-between"
                        >
                            {form.watch("type")
                                ? providerTypes.find(
                                    (type) => type.value === form.watch("type")
                                )?.label
                                : "Select type"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search type..." />
                            <CommandList>
                                <CommandEmpty>No type found.</CommandEmpty>
                                <CommandGroup>
                                    {providerTypes.map((type) => (
                                        <CommandItem
                                            key={type.value}
                                            value={type.label}
                                            onSelect={() => {
                                                form.setValue("type", type.value);
                                                setTypeOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    form.watch("type") === type.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {type.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {form.formState.errors.type && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.type.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                    id="contactEmail"
                    type="email"
                    {...form.register("contactEmail")}
                    placeholder="Enter contact email"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                    id="contactPhone"
                    {...form.register("contactPhone")}
                    placeholder="Enter contact phone"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    {...form.register("location")}
                    placeholder="Enter location"
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="isVerified"
                    checked={form.watch("isVerified")}
                    onCheckedChange={(checked) => form.setValue("isVerified", checked)}
                />
                <Label htmlFor="isVerified">Verified Provider</Label>
            </div>

            <div className="flex justify-end space-x-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Provider'}
                </Button>
            </div>
        </form>
    );
} 