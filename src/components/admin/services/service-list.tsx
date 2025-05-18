import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveIcon } from '@/config/icon-map';
import { Badge } from '@/components/ui/badge';

interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    status: 'active' | 'inactive';
    enrolledUsers: number;
    category: string;
}

interface ServiceListProps {
    services: Service[];
}

export function ServiceList({ services }: ServiceListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
                const Icon = resolveIcon(service.icon as any);
                return (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Icon className="w-8 h-8 text-primary" />
                                    <CardTitle>{service.title}</CardTitle>
                                </div>
                                <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                    {service.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base mb-4">
                                {service.description}
                            </CardDescription>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{service.category}</span>
                                <span>{service.enrolledUsers} enrolled</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 