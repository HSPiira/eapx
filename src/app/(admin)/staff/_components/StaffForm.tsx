'use client'

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StaffRole } from '@prisma/client';
import { useState } from 'react';
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
import { cn } from '@/lib/utils';

const staffFormSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    role: z.nativeEnum(StaffRole),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactEmail: z.string().email('Invalid email address').optional(),
    notes: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
    staff?: Partial<StaffFormValues>;
    onSubmit: (data: StaffFormValues) => Promise<void>;
}

export function StaffForm({ staff, onSubmit }: StaffFormProps) {
    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            fullName: staff?.fullName || '',
            email: staff?.email || '',
            phone: staff?.phone || '',
            role: staff?.role || StaffRole.STAFF,
            qualifications: staff?.qualifications || [],
            specializations: staff?.specializations || [],
            emergencyContactName: staff?.emergencyContactName || '',
            emergencyContactPhone: staff?.emergencyContactPhone || '',
            emergencyContactEmail: staff?.emergencyContactEmail || '',
            notes: staff?.notes || '',
        },
    });

    const [roleOpen, setRoleOpen] = useState(false);

    const selectedRole = Object.values(StaffRole).find(
        (role) => role === form.watch("role")
    );

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="staff-form">
                <div className="space-y-4">
                    {/* Basic Information */}
                    <h3 className="text-lg font-semibold leading-none tracking-tight">Basic Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter full name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="Enter email address" />
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
                                        <Input {...field} type="tel" placeholder="Enter phone number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Title</FormLabel>
                                    <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={roleOpen}
                                                    className="w-full justify-between"
                                                >
                                                    {selectedRole?.toString() || "Select a job title"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search job title..." />
                                                <CommandList>
                                                    <CommandEmpty>No job title found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {Object.values(StaffRole).map((role) => (
                                                            <CommandItem
                                                                key={role}
                                                                value={role}
                                                                onSelect={() => {
                                                                    form.setValue("role", role);
                                                                    setRoleOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value === role ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {role}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Emergency Contact */}
                    <h3 className="text-lg font-semibold leading-none tracking-tight">Emergency Contact</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter contact name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Phone</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="tel" placeholder="Enter contact phone" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="emergencyContactEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="Enter contact email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Additional Information */}
                    <h3 className="text-lg font-semibold leading-none tracking-tight">Additional Information</h3>
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Enter notes" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    );
} 