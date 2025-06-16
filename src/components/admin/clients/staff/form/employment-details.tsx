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

const managementLevelLabels = {
    JUNIOR: "Junior",
    MID: "Mid",
    SENIOR: "Senior",
    EXECUTIVE: "Executive",
    OTHER: "Other"
};

const employmentTypeLabels = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    CONTRACT: "Contract",
    TEMPORARY: "Temporary",
    INTERN: "Intern",
    VOLUNTEER: "Volunteer",
    OTHER: "Other"
};

const maritalStatusLabels = {
    SINGLE: "Single",
    MARRIED: "Married",
    DIVORCED: "Divorced",
    WIDOWED: "Widowed"
};


interface EmploymentDetailsStepProps {
    form: UseFormReturn<StaffFormValues>;
}

export function EmploymentDetailsStep({ form }: EmploymentDetailsStepProps) {
    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                            <Input className="w-full" placeholder="Enter job title" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4 w-full">
                <FormField
                    control={form.control}
                    name="companyStaffId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Staff ID</FormLabel>
                            <FormControl>
                                <Input
                                    className="w-full"
                                    placeholder="Enter company staff id"
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
                    name="managementLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Management Level <span className="text-red-500 ml-1">*</span></FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(managementLevelLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Employment Type <span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(employmentTypeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4 w-full">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Date</FormLabel>
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
                    name="endDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>End Date</FormLabel>
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
            </div>
            <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Marital Status <span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(maritalStatusLabels).map(([value, label]) => (
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
