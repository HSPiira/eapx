// src/components/admin/clients/client-header.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ClientHeaderProps {
    onAddClick: () => void;
}

export function ClientHeader({ onAddClick }: ClientHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Clients</h1>
            <Button onClick={onAddClick}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
            </Button>
        </div>
    );
}