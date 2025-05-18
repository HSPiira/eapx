import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

interface Service {
    id: string;
    name: string;
    description: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED' | 'DELETED';
    duration: number | null;
    capacity: number | null;
    isPublic: boolean;
    price: number | null;
    category: {
        id: string;
        name: string;
    };
    ServiceProvider?: {
        id: string;
        name: string;
        type: string;
    } | null;
}

interface ServiceListProps {
    services: Service[];
}

export function ServiceList({ services }: ServiceListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{service.name}</CardTitle>
                            <Badge variant={service.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {service.status.toLowerCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-base mb-4">
                            {service.description}
                        </CardDescription>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Category:</span>
                                <span>{service.category.name}</span>
                            </div>
                            {service.duration && (
                                <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span>{service.duration} minutes</span>
                                </div>
                            )}
                            {service.capacity && (
                                <div className="flex justify-between">
                                    <span>Capacity:</span>
                                    <span>{service.capacity} people</span>
                                </div>
                            )}
                            {service.price && (
                                <div className="flex justify-between">
                                    <span>Price:</span>
                                    <span>${service.price.toFixed(2)}</span>
                                </div>
                            )}
                            {service.ServiceProvider && (
                                <div className="flex justify-between">
                                    <span>Provider:</span>
                                    <span>{service.ServiceProvider.name}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Visibility:</span>
                                <span>{service.isPublic ? 'Public' : 'Private'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
} 