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

interface HealthInformationStepProps {
    form: UseFormReturn<StaffFormValues>;
}

export function HealthInformationStep({ form }: HealthInformationStepProps) {
    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                            <Textarea className="w-full"
                                placeholder="Enter allergies (one per line)"
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
                name="medicalConditions"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <FormControl>
                            <Textarea className="w-full"
                                placeholder="Enter medical conditions (one per line)"
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
                name="dietaryRestrictions"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dietary Restrictions</FormLabel>
                        <FormControl>
                            <Textarea className="w-full"
                                placeholder="Enter dietary restrictions (one per line)"
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
                name="accessibilityNeeds"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Accessibility Needs</FormLabel>
                        <FormControl>
                            <Textarea className="w-full"
                                placeholder="Enter accessibility needs (one per line)"
                                value={field.value?.join('\n') || ''}
                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
