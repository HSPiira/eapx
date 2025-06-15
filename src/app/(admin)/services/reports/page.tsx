'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

export default function ReportsPage() {
    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Service Reports</h2>
                <Button onClick={() => toast.info('Report generation coming soon')}>Generate Report</Button>
            </div>
            <div className="text-center text-muted-foreground">
                Service reports and analytics coming soon
            </div>
        </div>
    );
} 