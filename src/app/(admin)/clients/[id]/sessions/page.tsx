'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientSessionsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Session management coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
} 