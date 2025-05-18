// src/components/clients/client-header.tsx
'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function ClientHeader() {
    const router = useRouter();

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground">
                    Manage and monitor your client organizations
                </p>
            </div>
            <Button
                onClick={() => router.push('/clients/new')}
                className="flex items-center gap-2"
            >
                <Plus className="h-4 w-4" />
                Add Client
            </Button>
        </div>
    );
}