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

// @ts-nocheck

const staffSchema = z.object({
    providerId: z.string().min(1, 'Provider is required'),
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Must be a valid email").optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    role: z.string().optional().or(z.literal('')),
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
    const isEditMode = Boolean(initialData && initialData.providerId);
    const form = useForm<ProviderStaffFormData>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            providerId: initialData?.providerId || '',
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
    const isStep1Valid = !!form.watch('fullName') && !!form.watch('providerId');

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
        const valid = await form.trigger(['providerId', 'fullName']);
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
                                <Label htmlFor="providerId">Provider</Label>
                                <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={providerOpen}
                                            className="w-full justify-between"
                                            disabled={isEditMode}
                                        >
                                            {form.watch('providerId')
                                                ? (Array.isArray(providers) ? providers.find((p) => p.id === form.watch('providerId'))?.name : '')
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
                                                                    form.setValue('providerId', provider.id);
                                                                    setProviderOpen(false);
                                                                }
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    form.watch('providerId') === provider.id
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
                                {form.formState.errors.providerId && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.providerId.message}
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
                                <Input
                                    id="qualifications"
                                    {...form.register("qualifications", {
                                        setValueAs: v => Array.isArray(v) ? v : typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [],
                                    })}
                                    placeholder="Comma-separated (e.g. BSc, MSc)"
                                    defaultValue={initialData?.qualifications?.join(', ') || ''}
                                />
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
                            <div className="space-y-2">
                                {Object.keys(interventionsByService).map((serviceName: string) => {
                                    const group = interventionsByService[serviceName];
                                    if (!group.length) return null; // skip empty groups
                                    const allChecked = group.every((i: Intervention) => form.watch('specializations').includes(i.id));
                                    const someChecked = group.some((i: Intervention) => form.watch('specializations').includes(i.id));
                                    return (
                                        <div key={serviceName} className="">
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
                                                <div className="pl-8 space-y-2">
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