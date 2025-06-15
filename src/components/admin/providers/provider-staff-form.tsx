'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Check, ChevronsUpDown, ChevronDown } from "lucide-react";

const staffSchema = z.object({
    id: z.string().min(1, 'Provider is required'),
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Must be a valid email").nullable().optional(),
    phone: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
    qualifications: z.array(z.string()),
    specializations: z.array(z.string()),
    isPrimaryContact: z.boolean(),
});

export type ProviderStaffFormData = z.infer<typeof staffSchema>;

interface Intervention {
    id: string;
    name: string;
    serviceId?: string;
    service?: { id: string; name: string };
}

interface ProviderStaffFormProps {
    onSubmit: (data: ProviderStaffFormData) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    initialData?: Partial<ProviderStaffFormData>;
    interventions?: Intervention[];
    providers: { id: string; name: string; entityType?: string }[];
    services?: { id: string; name: string }[];
}

export function ProviderStaffForm({
    onSubmit,
    isSubmitting,
    onCancel,
    initialData,
    interventions = [],
    providers = [],
    services = [],
}: ProviderStaffFormProps) {
    const [step, setStep] = useState(1);
    const [providerOpen, setProviderOpen] = useState(false);
    const isEditMode = Boolean(initialData && initialData.id);
    const form = useForm<ProviderStaffFormData>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            id: initialData?.id || '',
            fullName: initialData?.fullName || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            role: initialData?.role || '',
            qualifications: initialData?.qualifications || [],
            specializations: initialData?.specializations || [],
            isPrimaryContact: initialData?.isPrimaryContact ?? false,
        },
        mode: 'onChange',
    });

    // Step 1: Basic Info
    // Step 2: Specializations
    const stepTitles = ['Basic Information', 'Specializations'];

    // Group interventions by service using services prop
    const interventionsByService = useMemo(() => {
        const groups: Record<string, Intervention[]> = {};
        if (services && services.length) {
            services.forEach(service => {
                groups[service.name] = interventions.filter((i: Intervention) => i.service && i.service.id === service.id);
            });
        }
        // Add 'Other' group for interventions without a service
        const other = interventions.filter((i: Intervention) => !i.service || !i.service.id);
        if (other.length) groups['Other'] = other;
        return groups;
    }, [interventions, services]);

    // Collapsible state for each service group
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const toggleGroup = (serviceName: string) => {
        setOpenGroups((prev) => ({ ...prev, [serviceName]: !prev[serviceName] }));
    };
    // Check all/none for a group
    const handleCheckAll = (serviceName: string, checked: boolean) => {
        const groupIds = interventionsByService[serviceName].map((i: Intervention) => i.id);
        const current = form.getValues('specializations');
        if (checked) {
            // Add all groupIds not already present
            form.setValue('specializations', Array.from(new Set([...current, ...groupIds])));
        } else {
            // Remove all groupIds from specializations
            form.setValue('specializations', current.filter((id: string) => !groupIds.includes(id)));
        }
    };

    const handleFormSubmit = (data: ProviderStaffFormData) => {
        onSubmit(data);
    };

    const handleNext = async () => {
        // Only validate step 1 fields before advancing
        const valid = await form.trigger(['id', 'fullName']);
        if (valid) setStep(2);
    };

    return (
        <>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-4"
            >
                {/* Step Indicator */}
                <div className="mb-4 text-sm font-medium text-muted-foreground">
                    Step {step} of {stepTitles.length}: {stepTitles[step - 1]}
                </div>
                {/* Fixed height container for form content */}
                <div className="min-h-[300px]">
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Provider Combobox */}
                            <div className="space-y-2">
                                <Label htmlFor="id">Provider</Label>
                                <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={providerOpen}
                                            className="w-full justify-between"
                                            disabled={isEditMode}
                                        >
                                            {form.watch('id')
                                                ? (Array.isArray(providers) ? providers.find((p) => p.id === form.watch('id'))?.name : '')
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
                                                    {(Array.isArray(providers) ? providers.filter((provider) => provider.entityType === 'COMPANY') : []).map((provider) => (
                                                        <CommandItem
                                                            key={provider.id}
                                                            value={provider.name}
                                                            onSelect={() => {
                                                                if (!isEditMode) {
                                                                    form.setValue('id', provider.id);
                                                                    setProviderOpen(false);
                                                                }
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    form.watch('id') === provider.id
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
                                {form.formState.errors.id && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.id.message}
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
                                {form.formState.errors.qualifications && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.qualifications.message}
                                    </p>
                                )}
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
                    )}
                    {step === 2 && (
                        <div className="space-y-4">
                            <Label>Specializations</Label>
                            {Object.keys(interventionsByService).length === 0 ? (
                                <p className="text-sm text-muted-foreground">No specializations available</p>
                            ) : (
                                <div className="space-y-2">
                                    {Object.keys(interventionsByService).map((serviceName: string) => {
                                        const group = interventionsByService[serviceName];
                                        if (!group.length) return null;
                                        const allChecked = group.every((i: Intervention) => form.watch('specializations').includes(i.id));
                                        const someChecked = group.some((i: Intervention) => form.watch('specializations').includes(i.id));
                                        return (
                                            <div key={serviceName} className="border rounded-lg p-2">
                                                <div className="flex items-center gap-2 py-1">
                                                    <button
                                                        type="button"
                                                        className="flex items-center p-0 bg-none border-none"
                                                        onClick={() => toggleGroup(serviceName)}
                                                        aria-label={openGroups[serviceName] ? 'Collapse' : 'Expand'}
                                                        tabIndex={0}
                                                    >
                                                        <ChevronDown className={`h-4 w-4 transition-transform ${openGroups[serviceName] ? 'rotate-90' : 'rotate-0'}`} />
                                                    </button>
                                                    <Checkbox
                                                        checked={allChecked ? true : (!allChecked && someChecked ? 'indeterminate' : false)}
                                                        onCheckedChange={checked => handleCheckAll(serviceName, Boolean(checked))}
                                                    />
                                                    <span className="font-medium select-none">{serviceName}</span>
                                                </div>
                                                {openGroups[serviceName] && (
                                                    <div className="pl-8 space-y-2 mt-2">
                                                        {group.map((intervention: Intervention) => (
                                                            <label key={intervention.id} className="flex items-center gap-2 cursor-pointer">
                                                                <Checkbox
                                                                    checked={form.watch('specializations').includes(intervention.id)}
                                                                    onCheckedChange={checked => {
                                                                        const current = form.getValues('specializations');
                                                                        if (checked) {
                                                                            form.setValue('specializations', [...current, intervention.id]);
                                                                        } else {
                                                                            form.setValue('specializations', current.filter((id: string) => id !== intervention.id));
                                                                        }
                                                                    }}
                                                                />
                                                                <span>{intervention.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {form.formState.errors.specializations && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.specializations.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                {/* Navigation buttons for step 2 only */}
                {step === 2 && (
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Staff'}</Button>
                    </div>
                )}
            </form>
            {/* Navigation buttons for step 1 only (outside form) */}
            {step === 1 && (
                <div className="flex justify-end gap-2 mt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    )}
                    <Button type="button" onClick={handleNext} disabled={isSubmitting}>Next</Button>
                </div>
            )}
        </>
    );
} 