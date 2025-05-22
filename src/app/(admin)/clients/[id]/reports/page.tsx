'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientReportsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Reports and analytics coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
} 