'use client'

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { StaffFormValues } from '../staff-form';
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

const genderLabels = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other"
};

const idTypeLabels = {
    NATIONAL_ID: "National ID",
    PASSPORT: "Passport",
    DRIVER_LICENSE: "Driver's License",
    OTHER: "Other"
};

interface BasicInformationStepProps {
    form: UseFormReturn<StaffFormValues>;
}

export function BasicInformationStep({ form }: BasicInformationStepProps) {
    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name <span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                            <Input className="w-full" placeholder="Enter full name" {...field} />
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
                        <FormLabel>Email <span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                            <Input className="w-full" type="email" placeholder="Enter email" {...field} />
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
                        <FormLabel>Phone <span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                            <Input className="w-full" placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4 w-full">
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Input
                                    className="w-full"
                                    type="date"
                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(genderLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <FormField
                    control={form.control}
                    name="idType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID Type</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('idNumber', '');
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ID type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(idTypeLabels).map(([value, label]) => (
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
                    name="idNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                                <Input
                                    className="w-full"
                                    placeholder={form.watch('idType') ? `Enter ${form.watch('idType')} number` : "Enter ID number"}
                                    {...field}
                                    disabled={!form.watch('idType')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
