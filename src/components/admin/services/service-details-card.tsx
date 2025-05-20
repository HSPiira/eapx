'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, Calendar, FileText, Users, Edit, Trash2, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Service {
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, unknown>;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    interventions: Array<{
        id: string;
        name: string;
    }>;
}

interface ServiceDetailsCardProps {
    service: Service;
    onEdit?: (service: Service) => void;
    onDelete?: (service: Service) => void;
    onClose: () => void;
    onAddIntervention?: (service: Service) => void;
}

export function ServiceDetailsCard({
    service,
    onEdit,
    onDelete,
    onClose,
    onAddIntervention
}: ServiceDetailsCardProps) {
    // Responsive modal overlay for mobile and medium screens
    return (
        <div>
            {/* Backdrop for sm and md screens */}
            <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />
            <div
                className={
                    cn(
                        // Modal on sm/md, sidebar on lg+
                        'fixed z-50 inset-0 flex items-center justify-center lg:static lg:z-0 lg:inset-auto lg:top-auto lg:right-0',
                        'pointer-events-none lg:pointer-events-auto'
                    )
                }
            >
                <Card
                    className={
                        cn(
                            // Modal style on sm/md, sidebar on lg+
                            'w-full max-w-md min-w-0 rounded-lg bg-white pointer-events-auto mx-2 my-4 overflow-y-auto max-h-[90vh]',
                            'lg:max-w-[420px] lg:mx-0 lg:my-0 lg:rounded-lg lg:overflow-y-auto lg:max-h-[80vh]'
                        )
                    }
                >
                    <CardHeader className="border-b pb-4 sticky top-0 bg-white z-10">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg font-semibold truncate">{service.name}</CardTitle>
                                <CardDescription className="text-sm">
                                    Service Details
                                </CardDescription>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {onEdit && (
                                    <Button
                                        variant="default"
                                        size="icon"
                                        onClick={() => onEdit(service)}
                                        className="h-10 w-10 text-blue-600 bg-blue-100 hover:bg-blue-200 border border-blue-200"
                                        aria-label="Edit Service"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="default"
                                        size="icon"
                                        onClick={() => onDelete(service)}
                                        className="h-10 w-10 text-red-600 bg-red-100 hover:bg-red-200 border border-red-200"
                                        aria-label="Delete Service"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                )}
                                <Button
                                    variant="default"
                                    size="icon"
                                    onClick={onClose}
                                    className="h-10 w-10 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span>Description</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700">
                                {service.description || 'No description provided'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Users className="h-4 w-4 text-green-500" />
                                    <span>Interventions</span>
                                </div>
                                {onAddIntervention && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onAddIntervention(service)}
                                        className="h-8 gap-1 hover:bg-green-50 hover:text-green-600"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-1">
                                {service.interventions?.length ? (
                                    service.interventions.map((intervention) => (
                                        <div key={intervention.id} className="text-sm text-gray-700">
                                            • {intervention.name}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No interventions</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                <span>Created</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                {formatDate(service.createdAt)}
                            </p>
                        </div>

                        {service.deletedAt && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <X className="h-4 w-4 text-red-500" />
                                    <span>Deleted</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    {formatDate(service.deletedAt)}
                                </p>
                            </div>
                        )}

                        {Object.keys(service.metadata).length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span>Metadata</span>
                                </div>
                                <pre className="text-xs bg-gray-50 p-2 rounded-md overflow-auto max-h-32">
                                    {JSON.stringify(service.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 