'use client';

import React from 'react';
import { Button } from '@/components/ui';

export default function ProvidersPage() {
    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Service Providers</h2>
                <Button>Add Provider</Button>
            </div>
            <div className="text-center text-muted-foreground">
                Service providers management coming soon
            </div>
        </div>
    );
} 