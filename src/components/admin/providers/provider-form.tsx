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
import { Check, ChevronsUpDown, ChevronDown, FileText, FileSignature, FileSpreadsheet, FileCode, FileArchive } from "lucide-react";
import { cn } from '@/lib/utils';
import { ServiceProviderType, ProviderEntityType } from '@/schema/enums';
import { CreateServiceProviderInput } from '@/schema/provider';
import { Intervention } from '@/types/interventions';

// Use the CreateServiceProviderInput schema directly
const providerSchema = CreateServiceProviderInput;

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderFormProps {
    onSubmitAction: (data: ProviderFormData & { documents: Record<string, File | File[] | null>; interventionsOffered: string[] }) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    initialData?: Partial<ProviderFormData>;
    services?: { id: string; name: string }[];
    interventions?: Intervention[];
}

export function ProviderForm({
    onSubmitAction,
    isSubmitting,
    initialData,
    services = [],
    interventions = [],
    onCancel,
}: ProviderFormProps) {
    const form = useForm({
        resolver: zodResolver(providerSchema),
        mode: 'onChange',
        defaultValues: {
            name: initialData?.name ?? '',
            type: initialData?.type,
            entityType: initialData?.entityType ?? undefined,
            contactEmail: initialData?.contactEmail ?? '',
            contactPhone: initialData?.contactPhone,
            location: initialData?.location,
            qualifications: initialData?.qualifications ?? [],
            specializations: initialData?.specializations ?? [],
            isVerified: initialData?.isVerified ?? false,
            status: initialData?.status ?? 'ACTIVE',
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
        setOpenGroups((prev) => {
            const newGroups: Record<string, boolean> = {};
            Object.keys(prev).forEach(key => {
                newGroups[key] = false;
            });
            newGroups[serviceName] = !prev[serviceName];
            return newGroups;
        });
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
        onSubmitAction({ ...data, documents, interventionsOffered });
    };

    const [providerCategoryOpen, setProviderCategoryOpen] = useState(false);
    const [providerTypeOpen, setProviderTypeOpen] = useState(false);

    // Use these enums for dropdown options in the form UI
    const providerTypes = ServiceProviderType.options.map((value: z.infer<typeof ServiceProviderType>) => ({
        value,
        label: value.charAt(0) + value.slice(1).toLowerCase()
    }));
    const entityTypes = ProviderEntityType.options.map((value: z.infer<typeof ProviderEntityType>) => ({
        value,
        label: value.charAt(0) + value.slice(1).toLowerCase()
    }));

    const [emptyServiceChecked, setEmptyServiceChecked] = useState<Record<string, boolean>>({});

    return (
        <div className="space-y-6">
            <div className="mb-4 text-sm font-medium text-muted-foreground">
                Step {step} of 3: {step === 1 ? 'Provider Info' : step === 2 ? 'Documents' : 'Services & Interventions'}
            </div>
            <form id="provider-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                {step === 1 && (
                    <div className="space-y-4">
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
                            <Label>Provider Type</Label>
                            <Popover open={providerTypeOpen} onOpenChange={setProviderTypeOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={providerTypeOpen}
                                        className="w-full justify-between"
                                    >
                                        {form.watch("entityType") || "Select provider type..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput className="text-gray-800 placeholder-gray-400" placeholder="Search provider type..." />
                                        <CommandList>
                                            <CommandEmpty>No provider type found.</CommandEmpty>
                                            <CommandGroup>
                                                {entityTypes.map((type) => (
                                                    <CommandItem
                                                        key={type.value}
                                                        value={type.value}
                                                        onSelect={() => {
                                                            form.setValue("entityType", type.value);
                                                            setProviderTypeOpen(false);
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
                            <Label>Provider Category</Label>
                            <Popover open={providerCategoryOpen} onOpenChange={setProviderCategoryOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={providerCategoryOpen}
                                        className="w-full justify-between"
                                    >
                                        {form.watch("type") || "Select provider category..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput className="text-gray-800 placeholder-gray-400" placeholder="Search provider category..." />
                                        <CommandList>
                                            <CommandEmpty>No provider category found.</CommandEmpty>
                                            <CommandGroup>
                                                {providerTypes.map((type) => (
                                                    <CommandItem
                                                        key={type.value}
                                                        value={type.value}
                                                        onSelect={() => {
                                                            form.setValue("type", type.value);
                                                            setProviderCategoryOpen(false);
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
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Documents</Label>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Working Contract</Label>
                                    <div className="flex items-center space-x-2">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={(e) => handleFileChange('workingContract', e.target.files)}
                                            />
                                            <div className="p-2 border rounded-md hover:bg-gray-50">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                            </div>
                                        </label>
                                        {documents.workingContract && !Array.isArray(documents.workingContract) && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-green-500">{documents.workingContract.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setDocuments(prev => ({ ...prev, workingContract: null }))}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>KYC Documents</Label>
                                    <div className="flex items-center space-x-2">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={(e) => handleFileChange('kyc', e.target.files)}
                                            />
                                            <div className="p-2 border rounded-md hover:bg-gray-50">
                                                <FileSignature className="h-5 w-5 text-purple-500" />
                                            </div>
                                        </label>
                                        {documents.kyc && !Array.isArray(documents.kyc) && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-green-500">{documents.kyc.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setDocuments(prev => ({ ...prev, kyc: null }))}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>CV/Resume</Label>
                                    <div className="flex items-center space-x-2">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={(e) => handleFileChange('cv', e.target.files, true)}
                                            />
                                            <div className="p-2 border rounded-md hover:bg-gray-50">
                                                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                                            </div>
                                        </label>
                                        {documents.cv && Array.isArray(documents.cv) && documents.cv.length > 0 && (
                                            <div className={cn(
                                                "flex flex-col gap-2",
                                                documents.cv.length > 3 && "max-h-[120px] overflow-y-auto pr-2"
                                            )}>
                                                {documents.cv.map((file, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <span className="text-sm text-green-500">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (Array.isArray(documents.cv)) {
                                                                    const newFiles = [...documents.cv];
                                                                    newFiles.splice(index, 1);
                                                                    setDocuments(prev => ({ ...prev, cv: newFiles }));
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Declaration Form</Label>
                                    <div className="flex items-center space-x-2">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={(e) => handleFileChange('declarationForm', e.target.files)}
                                            />
                                            <div className="p-2 border rounded-md hover:bg-gray-50">
                                                <FileCode className="h-5 w-5 text-orange-500" />
                                            </div>
                                        </label>
                                        {documents.declarationForm && !Array.isArray(documents.declarationForm) && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-green-500">{documents.declarationForm.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setDocuments(prev => ({ ...prev, declarationForm: null }))}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Professional Documents</Label>
                                    <div className="flex items-center space-x-2">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={(e) => handleFileChange('professionalDocs', e.target.files, true)}
                                            />
                                            <div className="p-2 border rounded-md hover:bg-gray-50">
                                                <FileArchive className="h-5 w-5 text-indigo-500" />
                                            </div>
                                        </label>
                                        {documents.professionalDocs && Array.isArray(documents.professionalDocs) && documents.professionalDocs.length > 0 && (
                                            <div className={cn(
                                                "flex flex-col gap-2",
                                                documents.professionalDocs.length > 3 && "max-h-[120px] overflow-y-auto pr-2"
                                            )}>
                                                {documents.professionalDocs.map((file, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <span className="text-sm text-green-500">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (Array.isArray(documents.professionalDocs)) {
                                                                    const newFiles = [...documents.professionalDocs];
                                                                    newFiles.splice(index, 1);
                                                                    setDocuments(prev => ({ ...prev, professionalDocs: newFiles }));
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-4">
                        {Object.entries(interventionsByService).map(([serviceName, serviceInterventions]) => (
                            <div key={serviceName} className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center min-w-0">
                                        {serviceInterventions.length > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleGroup(serviceName)}
                                                className="p-1 hover:bg-gray-100 rounded mr-2"
                                            >
                                                <ChevronDown
                                                    className={cn(
                                                        "h-4 w-4 transition-transform",
                                                        openGroups[serviceName] ? "rotate-180" : ""
                                                    )}
                                                />
                                            </button>
                                        ) : null}
                                        <span className="font-medium truncate">{serviceName}</span>
                                    </div>
                                    <div className="flex items-center min-w-[120px] justify-end space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={serviceInterventions.length > 0
                                                ? serviceInterventions.every((i) => interventionsOffered.includes(i.id))
                                                : emptyServiceChecked[serviceName] || false}
                                            onChange={(e) => {
                                                if (serviceInterventions.length > 0) {
                                                    handleCheckAll(serviceName, e.target.checked);
                                                } else {
                                                    setEmptyServiceChecked(prev => ({ ...prev, [serviceName]: e.target.checked }));
                                                }
                                            }}
                                        />
                                        <span className="text-sm text-gray-500">Select All</span>
                                    </div>
                                </div>

                                {serviceInterventions.length > 0 && openGroups[serviceName] && (
                                    <div className={cn(
                                        "flex flex-col space-y-2 ml-7",
                                        serviceInterventions.length > 10 && "max-h-60 overflow-y-auto pr-2"
                                    )}>
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
            </form>
            <div className="flex justify-end gap-2 mt-4">
                {step === 1 && onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                        Back
                    </Button>
                )}
                {step < 3 && (
                    <Button type="button" onClick={handleNext}>
                        Next
                    </Button>
                )}
                {step === 3 && (
                    <Button type="submit" form="provider-form" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Provider"}
                    </Button>
                )}
            </div>
        </div>
    );
} 