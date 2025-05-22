'use client';

import React from 'react';
import { Button } from '@/components/ui';

export default function FeedbackPage() {
    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Session Feedback</h2>
                <Button>View Reports</Button>
            </div>
            <div className="text-center text-muted-foreground">
                Session feedback management coming soon
            </div>
        </div>
    );
} 