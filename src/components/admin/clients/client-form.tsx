'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const clientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable(),
    address: z.string().optional().nullable(),
    billingAddress: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    contactEmail: z.string().email('Invalid contact email').optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    industryId: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED']),
    preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'OTHER']).optional().nullable(),
    timezone: z.string().optional().nullable(),
    isVerified: z.boolean(),
    notes: z.string().optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

interface Industry {
    id: string;
    name: string;
}

interface ClientFormProps {
    onSubmit: (data: ClientFormData) => void;
    isSubmitting?: boolean;
    onCancel: () => void;
    defaultValues?: Partial<ClientFormData>;
    industries: Industry[];
}

export function ClientForm({
    onSubmit,
    isSubmitting = false,
    onCancel,
    defaultValues,
    industries,
}: ClientFormProps) {
    const [step, setStep] = React.useState(1);
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const form = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            email: null,
            phone: null,
            website: null,
            address: null,
            billingAddress: null,
            taxId: null,
            contactPerson: null,
            contactEmail: null,
            contactPhone: null,
            industryId: null,
            status: 'ACTIVE',
            preferredContactMethod: null,
            timezone: null,
            isVerified: false,
            notes: null,
            metadata: {},
            ...defaultValues,
        },
        mode: 'onChange',
    });

    const stepTitles = [
        "Basic Information",
        "Contact Details",
        "Additional Information"
    ];

    const filteredIndustries = React.useMemo(() => {
        if (!searchValue) return industries;
        return industries.filter((industry) =>
            industry.name.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [industries, searchValue]);

    const isStep1Valid = form.watch('name') && form.watch('industryId');
    const isStep2Valid = form.watch('email') || form.watch('phone');

    const handleFormSubmit = async (data: ClientFormData) => {
        console.log('Form submitted with data:', data);
        try {
            // Ensure metadata is an object
            const formData = {
                ...data,
                metadata: data.metadata || {},
            };
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    // Add form state logging
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            console.log('Form values changed:', value);
            console.log('Form errors:', form.formState.errors);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    console.log('Form submit event triggered');
                    console.log('Form validation state:', form.formState);
                    form.handleSubmit(handleFormSubmit)(e);
                }}
                className="space-y-4"
            >
                {/* Step Indicator */}
                <div className="mb-4 text-sm font-medium text-muted-foreground">
                    Step {step} of {stepTitles.length}: {stepTitles[step - 1]}
                </div>

                {/* Fixed height container for form content */}
                <div className="min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl>
                                            <Input className="w-full" placeholder="Enter company name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="industryId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Industry</FormLabel>
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className="justify-between"
                                                    >
                                                        {field.value
                                                            ? industries.find(
                                                                (industry) => industry.id === field.value
                                                            )?.name
                                                            : "Select industry..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" align="start">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search industry..."
                                                        value={searchValue}
                                                        onValueChange={setSearchValue}
                                                    />
                                                    <CommandEmpty>No industry found.</CommandEmpty>
                                                    <CommandGroup className="max-h-[300px] overflow-auto">
                                                        {filteredIndustries.map((industry) => (
                                                            <CommandItem
                                                                key={industry.id}
                                                                value={industry.name}
                                                                onSelect={() => {
                                                                    form.setValue("industryId", industry.id);
                                                                    setOpen(false);
                                                                    setSearchValue("");
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value === industry.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {industry.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tax ID</FormLabel>
                                        <FormControl>
                                            <Input className="w-full" placeholder="Enter tax ID" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input className="w-full" type="email" placeholder="Enter email" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input className="w-full" placeholder="Enter phone number" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input className="w-full" placeholder="Enter website URL" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea className="w-full" placeholder="Enter address" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="billingAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Billing Address</FormLabel>
                                        <FormControl>
                                            <Textarea className="w-full" placeholder="Enter billing address" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="contactPerson"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Person</FormLabel>
                                            <FormControl>
                                                <Input className="w-full" placeholder="Enter contact person" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Email</FormLabel>
                                            <FormControl>
                                                <Input className="w-full" type="email" placeholder="Enter contact email" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="contactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Phone</FormLabel>
                                        <FormControl>
                                            <Input className="w-full" placeholder="Enter contact phone" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="preferredContactMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Contact Method</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select preferred contact method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="EMAIL">Email</SelectItem>
                                                <SelectItem value="PHONE">Phone</SelectItem>
                                                <SelectItem value="SMS">SMS</SelectItem>
                                                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="timezone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Timezone</FormLabel>
                                        <FormControl>
                                            <Input className="w-full" placeholder="Enter timezone" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea className="w-full" placeholder="Enter notes" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isVerified"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Verified</FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                                Mark this client as verified
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    {step === 1 ? (
                        <>
                            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setStep(2);
                                }}
                                disabled={!isStep1Valid}
                            >
                                Next
                            </Button>
                        </>
                    ) : step === 2 ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setStep(1);
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setStep(3);
                                }}
                                disabled={!isStep2Valid}
                            >
                                Next
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setStep(2);
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </>
                    )}
                </div>
            </form>
        </Form>
    );
} 