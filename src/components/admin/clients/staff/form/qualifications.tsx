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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const educationLevelLabels = {
    HIGH_SCHOOL: "High School",
    DIPLOMA: "Diploma",
    BACHELORS: "Bachelors",
    MASTERS: "Masters",
    DOCTORATE: "Doctorate",
    OTHER: "Other"
};

interface QualificationsStepProps {
    form: UseFormReturn<StaffFormValues>;
}

export function QualificationsStep({ form }: QualificationsStepProps) {
    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="qualifications"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Qualifications</FormLabel>
                        <FormControl>
                            <Textarea className="w-full"
                                placeholder="Enter qualifications (one per line)"
                                value={field.value?.join('\n') || ''}
                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="specializations"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Specializations</FormLabel>
                        <FormControl>
                            <Textarea className="w-full"
                                placeholder="Enter specializations (one per line)"
                                value={field.value?.join('\n') || ''}
                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="preferredWorkingHours"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Preferred Working Hours</FormLabel>
                        <div className="space-y-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Switch
                                        checked={field.value?.[day] || false}
                                        onCheckedChange={(checked) => {
                                            const newValue = { ...field.value, [day]: checked };
                                            field.onChange(newValue);
                                        }}
                                    />
                                    <span>{day}</span>
                                </div>
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Education Level</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(educationLevelLabels).map(([value, label]) => (
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
