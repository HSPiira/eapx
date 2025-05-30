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

const interventionSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    serviceId: z.string().min(1, 'Service is required'),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED']),
    duration: z.number().min(0).optional().nullable(),
    capacity: z.number().min(1).optional().nullable(),
    prerequisites: z.string().optional(),
    isPublic: z.boolean(),
    price: z.number().min(0).optional().nullable(),
    metadata: z.record(z.unknown()).optional(),
});

export type InterventionFormData = z.infer<typeof interventionSchema>;

interface Service {
    id: string;
    name: string;
}

interface InterventionFormProps {
    onSubmit: (data: InterventionFormData) => void;
    isSubmitting?: boolean;
    onCancel: () => void;
    defaultValues?: Partial<InterventionFormData>;
    services: Service[];
}

export function InterventionForm({
    onSubmit,
    isSubmitting = false,
    onCancel,
    defaultValues,
    services,
}: InterventionFormProps) {
    const form = useForm<InterventionFormData>({
        resolver: zodResolver(interventionSchema),
        defaultValues: {
            name: '',
            serviceId: '',
            description: '',
            status: 'ACTIVE',
            duration: null,
            capacity: null,
            prerequisites: '',
            isPublic: true,
            price: null,
            metadata: {},
            ...defaultValues,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter intervention name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {services.map((service) => (
                                        <SelectItem key={service.id} value={service.id}>
                                            {service.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter intervention description"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration (minutes)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Enter minimum duration (minutes)"
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? null : Number(e.target.value);
                                            field.onChange(value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        placeholder="Enter minimum capacity"
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? null : Number(e.target.value);
                                            field.onChange(value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="prerequisites"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prerequisites</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter prerequisites"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    placeholder="Enter price"
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? null : Number(e.target.value);
                                        field.onChange(value);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Public</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                    Make this intervention visible to all users
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
                /> */}

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 