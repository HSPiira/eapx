'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientFeedbackPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Feedback management coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
} 