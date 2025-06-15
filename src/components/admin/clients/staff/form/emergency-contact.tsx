'use client'

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { StaffFormValues } from '@/components/admin/clients/staff/staff-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const languageLabels = {
    ENGLISH: "English",
    FRENCH: "French",
    SPANISH: "Spanish",
};

const contactMethodLabels = {
    EMAIL: "Email",
    PHONE: "Phone",
    SMS: "SMS",
    WHATSAPP: "WhatsApp",
};

interface EmergencyContactStepProps {
    form: UseFormReturn<StaffFormValues>;
}

export function EmergencyContactStep({ form }: EmergencyContactStepProps) {
    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Emergency Contact Name <span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                            <Input
                                className="w-full"
                                placeholder="Enter emergency contact name"
                                {...field}
                                value={field.value || ''}
                            />
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
                        <FormLabel>Emergency Contact Phone</FormLabel>
                        <FormControl>
                            <Input
                                className="w-full"
                                placeholder="Enter emergency contact phone"
                                {...field}
                                value={field.value || ''}
                            />
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
                        <FormLabel>Emergency Contact Email <span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                            <Input
                                className="w-full"
                                type="email"
                                placeholder="Enter emergency contact email"
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Preferred Language</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(languageLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select contact method" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(contactMethodLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
