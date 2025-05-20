import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

interface Intervention {
    id: string;
    name: string;
    description: string | null;
    service: {
        id: string;
        name: string;
    };
    status: string;
    duration: number | null;
    capacity: number | null;
    prerequisites: string | null;
    isPublic: boolean;
    price: number | null;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    ServiceProvider?: { name: string } | null;
}

interface InterventionListProps {
    interventions: Intervention[];
}

export function InterventionList({ interventions }: InterventionListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interventions.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    <p>No interventions available</p>
                </div>
            ) : (
                interventions.map((intervention) => (
                    <Card key={intervention.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{intervention.name}</CardTitle>
                                <Badge variant={intervention.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {intervention.status.toLowerCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base mb-4">
                                {intervention.description || 'No description available'}
                            </CardDescription>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Category:</span>
                                    <span>{intervention.service?.name ?? '-'}</span>
                                </div>
                                {intervention.duration && (
                                    <div className="flex justify-between">
                                        <span>Duration:</span>
                                        <span>{intervention.duration} minutes</span>
                                    </div>
                                )}
                                {intervention.capacity && (
                                    <div className="flex justify-between">
                                        <span>Capacity:</span>
                                        <span>{intervention.capacity} people</span>
                                    </div>
                                )}
                                {intervention.price && (
                                    <div className="flex justify-between">
                                        <span>Price:</span>
                                        <span>${intervention.price.toFixed(2)}</span>
                                    </div>
                                )}
                                {intervention.ServiceProvider && (
                                    <div className="flex justify-between">
                                        <span>Provider:</span>
                                        <span>{intervention.ServiceProvider.name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Visibility:</span>
                                    <span>{intervention.isPublic ? 'Public' : 'Private'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
} 