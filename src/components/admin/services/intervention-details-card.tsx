import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, DollarSign, Users, Calendar, Info, Trash2, Circle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Intervention {
    id: string;
    name: string;
    description: string | null;
    service: {
        id: string;
        name: string;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED' | 'DELETED';
    capacity: number | null;
    price: number | null;
    metadata: Record<string, unknown>;
    createdAt: string;
    deletedAt: string | null;
    serviceId: string;
    duration: number | null;
    prerequisites: string | null;
    isPublic: boolean;
    updatedAt: string;
    serviceProviderId: string | null;
    ServiceProvider?: {
        id: string;
        name: string;
        type: string;
    } | null;
}

interface InterventionDetailsCardProps {
    intervention: Intervention;
    onClose: () => void;
    onEdit?: (intervention: Intervention) => void;
    onDelete?: (intervention: Intervention) => void;
}

function statusColor(status: Intervention['status']) {
    switch (status) {
        case 'ACTIVE': return 'text-green-500';
        case 'INACTIVE': return 'text-gray-400';
        case 'PENDING': return 'text-yellow-500';
        case 'ARCHIVED': return 'text-blue-400';
        case 'DELETED': return 'text-red-500';
        default: return 'text-muted-foreground';
    }
}

export function InterventionDetailsCard({ intervention, onClose, onEdit, onDelete }: InterventionDetailsCardProps) {
    return (
        <div className="w-full max-w-xs md:max-w-sm lg:max-w-xs xl:max-w-sm">
            <Card className="rounded-lg shadow-lg">
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                        <CardTitle className="truncate text-lg font-semibold flex items-center gap-2">
                            <Circle className={`h-3 w-3 ${statusColor(intervention.status)}`} fill="currentColor" />
                            {intervention.name}
                        </CardTitle>
                    </div>
                    <div className="flex gap-2">
                        {onEdit && (
                            <Button variant="ghost" size="icon" onClick={() => onEdit(intervention)} className="h-8 w-8">
                                <Info className="h-4 w-4 text-blue-500" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button variant="ghost" size="icon" onClick={() => onDelete(intervention)} className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-muted-foreground">Service:</span>
                            <span>{intervention.service.name}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-4 w-4 text-green-500" />
                            <span>Capacity:</span>
                            <span className="text-gray-700">{intervention.capacity ?? '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <DollarSign className="h-4 w-4 text-yellow-500" />
                            <span>Price:</span>
                            <span className="text-gray-700">{intervention.price ? `$${intervention.price.toFixed(2)}` : '-'}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span>Created:</span>
                            <span className="text-gray-700">{formatDate(intervention.createdAt)}</span>
                        </div>
                        {intervention.deletedAt && (
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <X className="h-4 w-4 text-red-500" />
                                <span>Deleted:</span>
                                <span className="text-gray-700">{formatDate(intervention.deletedAt)}</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs text-muted-foreground font-medium">Description</div>
                        <div className="text-sm text-gray-700">
                            {intervention.description || 'No description provided'}
                        </div>
                    </div>
                    {Object.keys(intervention.metadata).length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs text-muted-foreground font-medium">Metadata</div>
                            <pre className="text-xs bg-gray-50 p-2 rounded-md overflow-auto max-h-32">
                                {JSON.stringify(intervention.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 