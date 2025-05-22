'use client';

import React, { useState, useMemo } from 'react';
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
import { Check, ChevronsUpDown, FileCheck, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';

// Define enums to match your Prisma schema
const ServiceProviderTypeEnum = z.enum(["COUNSELOR", "CLINIC", "HOTLINE", "COACH", "OTHER"]);
const ProviderEntityTypeEnum = z.enum(["INDIVIDUAL", "COMPANY"]);

const providerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: ServiceProviderTypeEnum.optional(),
    entityType: ProviderEntityTypeEnum,
    contactEmail: z.string({
        required_error: "Contact email is required"
    }).email("Must be a valid email"),
    contactPhone: z.string().nullable(),
    location: z.string().nullable(),
    qualifications: z.array(z.string()),
    specializations: z.array(z.string()),
    isVerified: z.boolean(),
    status: z.string(),
}) satisfies z.ZodType<ProviderFormData>;

export type ProviderFormData = {
    name: string;
    type?: z.infer<typeof ServiceProviderTypeEnum>;
    entityType: z.infer<typeof ProviderEntityTypeEnum>;
    contactEmail: string;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    isVerified: boolean;
    status: string;
};

interface Intervention {
    id: string;
    name: string;
    serviceId?: string;
    service?: { id: string; name: string };
}

interface ProviderFormProps {
    onSubmit: (data: ProviderFormData & { documents: Record<string, File | File[] | null>; interventionsOffered: string[] }) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    initialData?: Partial<ProviderFormData>;
    services?: { id: string; name: string }[];
    interventions?: Intervention[];
}

export function ProviderForm({
    onSubmit,
    isSubmitting,
    initialData,
    services = [],
    interventions = [],
}: ProviderFormProps) {
    const form = useForm<ProviderFormData>({
        resolver: zodResolver(providerSchema),
        defaultValues: {
            name: initialData?.name || '',
            type: initialData?.type || undefined,
            entityType: initialData?.entityType || 'INDIVIDUAL',
            contactEmail: initialData?.contactEmail || '',
            contactPhone: initialData?.contactPhone || null,
            location: initialData?.location || null,
            qualifications: initialData?.qualifications || [],
            specializations: initialData?.specializations || [],
            isVerified: initialData?.isVerified || false,
            status: initialData?.status || 'ACTIVE',
        },
    });

    const [step, setStep] = useState(1);
    const [documents, setDocuments] = useState<Record<string, File | File[] | null>>({
        workingContract: null,
        kyc: null,
        cv: [],
        declarationForm: null,
        professionalDocs: [],
    });
    const [interventionsOffered, setInterventionsOffered] = useState<string[]>([]);
    // Group interventions by service
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
        const current = interventionsOffered;
        if (checked) {
            setInterventionsOffered(Array.from(new Set([...current, ...groupIds])));
        } else {
            setInterventionsOffered(current.filter((id: string) => !groupIds.includes(id)));
        }
    };

    const handleFileChange = (field: string, files: FileList | null, multiple = false) => {
        if (!files) return;
        setDocuments(prev => ({
            ...prev,
            [field]: multiple ? Array.from(files) : files[0]
        }));
    };

    const handleNext = async () => {
        // Validate current step if needed
        if (step === 1) {
            const valid = await form.trigger();
            if (!valid) return;
        }
        setStep(s => s + 1);
    };
    const handleBack = () => setStep(s => s - 1);

    const handleFormSubmit = (data: ProviderFormData) => {
        onSubmit({ ...data, documents, interventionsOffered });
    };

    const [typeOpen, setTypeOpen] = useState(false);
    const [entityTypeOpen, setEntityTypeOpen] = useState(false);

    // Use these enums for dropdown options in the form UI
    const providerTypes = ServiceProviderTypeEnum.options.map(value => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }));
    const entityTypes = ProviderEntityTypeEnum.options.map(value => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }));


    return (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="mb-4 text-sm font-medium text-muted-foreground">
                Step {step} of 3: {step === 1 ? 'Provider Info' : step === 2 ? 'Documents' : 'Services & Interventions'}
            </div>
            {step === 1 && (
                <>
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
                        <Label htmlFor="entityType">Entity Type</Label>
                        <Popover open={entityTypeOpen} onOpenChange={setEntityTypeOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={entityTypeOpen}
                                    className="w-full justify-between"
                                >
                                    {form.watch("entityType")
                                        ? entityTypes.find(
                                            (type) => type.value === form.watch("entityType")
                                        )?.label
                                        : "Select entity type"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search entity type..." />
                                    <CommandList>
                                        <CommandEmpty>No entity type found.</CommandEmpty>
                                        <CommandGroup>
                                            {entityTypes.map((type) => (
                                                <CommandItem
                                                    key={type.value}
                                                    value={type.label}
                                                    onSelect={() => {
                                                        form.setValue("entityType", type.value);
                                                        setEntityTypeOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            form.watch("entityType") === type.value
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
                        {form.formState.errors.entityType && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.entityType.message}
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
                                        : "Select provider type"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search provider type..." />
                                    <CommandList>
                                        <CommandEmpty>No provider type found.</CommandEmpty>
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
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            {...form.register("contactEmail")}
                            placeholder="Enter contact email"
                        />
                        {form.formState.errors.contactEmail && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.contactEmail.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                            id="contactPhone"
                            type="tel"
                            {...form.register("contactPhone")}
                            placeholder="Enter contact phone"
                        />
                        {form.formState.errors.contactPhone && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.contactPhone.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            {...form.register("location")}
                            placeholder="Enter location"
                        />
                        {form.formState.errors.location && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.location.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="qualifications">Qualifications</Label>
                        <Input
                            id="qualifications"
                            {...form.register("qualifications")}
                            placeholder="Enter qualifications (comma-separated)"
                        />
                        {form.formState.errors.qualifications && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.qualifications.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specializations">Specializations</Label>
                        <Input
                            id="specializations"
                            {...form.register("specializations")}
                            placeholder="Enter specializations (comma-separated)"
                        />
                        {form.formState.errors.specializations && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.specializations.message}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isVerified"
                            checked={form.watch("isVerified")}
                            onCheckedChange={(checked) => form.setValue("isVerified", checked)}
                        />
                        <Label htmlFor="isVerified">Verified</Label>
                    </div>
                </>
            )}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Working Contract</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="file"
                                onChange={(e) => handleFileChange('workingContract', e.target.files)}
                            />
                            {documents.workingContract && (
                                <FileCheck className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>KYC Documents</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="file"
                                onChange={(e) => handleFileChange('kyc', e.target.files)}
                            />
                            {documents.kyc && (
                                <FileCheck className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>CV/Resume</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="file"
                                multiple
                                onChange={(e) => handleFileChange('cv', e.target.files, true)}
                            />
                            {documents.cv && Array.isArray(documents.cv) && documents.cv.length > 0 && (
                                <FileCheck className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Declaration Form</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="file"
                                onChange={(e) => handleFileChange('declarationForm', e.target.files)}
                            />
                            {documents.declarationForm && (
                                <FileCheck className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Professional Documents</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="file"
                                multiple
                                onChange={(e) => handleFileChange('professionalDocs', e.target.files, true)}
                            />
                            {documents.professionalDocs && Array.isArray(documents.professionalDocs) && documents.professionalDocs.length > 0 && (
                                <FileCheck className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                    </div>
                </div>
            )}
            {step === 3 && (
                <div className="space-y-4">
                    {Object.entries(interventionsByService).map(([serviceName, serviceInterventions]) => (
                        <div key={serviceName} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex items-center space-x-2"
                                    onClick={() => toggleGroup(serviceName)}
                                >
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform",
                                            openGroups[serviceName] ? "transform rotate-180" : ""
                                        )}
                                    />
                                    <span>{serviceName}</span>
                                </Button>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCheckAll(serviceName, true)}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCheckAll(serviceName, false)}
                                    >
                                        None
                                    </Button>
                                </div>
                            </div>
                            {openGroups[serviceName] && (
                                <div className="pl-4 space-y-2">
                                    {serviceInterventions.map((intervention) => (
                                        <div key={intervention.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={intervention.id}
                                                checked={interventionsOffered.includes(intervention.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setInterventionsOffered([...interventionsOffered, intervention.id]);
                                                    } else {
                                                        setInterventionsOffered(interventionsOffered.filter(id => id !== intervention.id));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={intervention.id}>{intervention.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-between pt-4">
                {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                        Back
                    </Button>
                )}
                {step < 3 ? (
                    <Button type="button" onClick={handleNext}>
                        Next
                    </Button>
                ) : (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                )}
            </div>
        </form>
    );
} 