'use client';

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";

const staffSchema = z.object({
    serviceProviderId: z.string().min(1, 'Provider is required'),
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Must be a valid email").nullable().optional(),
    phone: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
    qualifications: z.array(z.string()),
    isPrimaryContact: z.boolean(),
});

export type ProviderStaffFormData = z.infer<typeof staffSchema>;

interface ProviderStaffFormProps {
    onSubmit: (data: ProviderStaffFormData) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    initialData?: Partial<ProviderStaffFormData>;
    providers: { id: string; name: string; entityType?: string }[];
}

export function ProviderStaffForm({
    onSubmit,
    isSubmitting,
    onCancel,
    initialData,
    providers = [],
}: ProviderStaffFormProps) {
    const [providerOpen, setProviderOpen] = useState(false);
    const isEditMode = Boolean(initialData && initialData.serviceProviderId);

    const form = useForm<ProviderStaffFormData>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            serviceProviderId: initialData?.serviceProviderId || '',
            fullName: initialData?.fullName || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            role: initialData?.role || '',
            qualifications: initialData?.qualifications || [],
            isPrimaryContact: initialData?.isPrimaryContact ?? false,
        },
        mode: 'onChange',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const values = form.getValues();
        console.log('Submitting form with values:', values);

        if (!values.serviceProviderId) {
            form.setError('serviceProviderId', {
                type: 'manual',
                message: 'Provider is required'
            });
            return;
        }

        form.handleSubmit(onSubmit)(e);
    };

    // Add form state debugging
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            console.log('Form values:', value);
            console.log('Form errors:', form.formState.errors);
        });
        return () => subscription.unsubscribe();
    }, [form.watch, form.formState.errors]);

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 w-full max-w-2xl mx-auto"
        >
            <div className="space-y-4">
                {/* Provider Combobox */}
                <div className="space-y-2">
                    <Label htmlFor="serviceProviderId">Provider</Label>
                    <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={providerOpen}
                                className="w-full justify-between"
                                disabled={isEditMode}
                            >
                                {form.watch('serviceProviderId')
                                    ? providers.find((p) => p.id === form.watch('serviceProviderId'))?.name
                                    : 'Select provider'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search provider..." />
                                <CommandList>
                                    <CommandEmpty>No provider found.</CommandEmpty>
                                    <CommandGroup>
                                        {providers
                                            .filter((provider) => provider.entityType === 'COMPANY')
                                            .map((provider) => (
                                                <CommandItem
                                                    key={provider.id}
                                                    value={provider.name}
                                                    onSelect={() => {
                                                        if (!isEditMode) {
                                                            form.setValue('serviceProviderId', provider.id, {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                                shouldTouch: true
                                                            });
                                                            form.clearErrors('serviceProviderId');
                                                            setProviderOpen(false);
                                                        }
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            form.watch('serviceProviderId') === provider.id
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                    {provider.name}
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

                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        {...form.register("fullName")}
                        placeholder="Enter full name"
                    />
                    {form.formState.errors.fullName && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.fullName.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="Enter email"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        {...form.register("phone")}
                        placeholder="Enter phone"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                        id="role"
                        {...form.register("role")}
                        placeholder="Enter role (e.g. Team Leader, Counselor)"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <div className="flex flex-wrap gap-2">
                        {form.watch('qualifications').map((qual, index) => (
                            <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                                <span>{qual}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = form.getValues('qualifications');
                                        form.setValue('qualifications', current.filter((_, i) => i !== index));
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            id="qualifications"
                            placeholder="Add qualification (e.g. BSc, MSc)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const value = input.value.trim();
                                    if (value) {
                                        const current = form.getValues('qualifications');
                                        if (!current.includes(value)) {
                                            form.setValue('qualifications', [...current, value]);
                                        }
                                        input.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="isPrimaryContact"
                        checked={form.watch("isPrimaryContact")}
                        onCheckedChange={(checked) => form.setValue("isPrimaryContact", checked)}
                    />
                    <Label htmlFor="isPrimaryContact">Primary Contact</Label>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                )}
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Staff'}</Button>
            </div>
        </form>
    );
} 