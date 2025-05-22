'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientContractsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Contract management coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
} 