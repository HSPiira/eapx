'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

export default function SessionsPage() {
    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Service Sessions</h2>
                <Button onClick={() => toast.info('Schedule session coming soon')}>Schedule Session</Button>
            </div>
            <div className="text-center text-muted-foreground">
                Service sessions management coming soon
            </div>
        </div>
    );
} 