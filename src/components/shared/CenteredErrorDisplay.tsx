'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CenteredErrorDisplayProps {
    message: string;
    onRetry?: () => void;
}

export function CenteredErrorDisplay({ message, onRetry }: CenteredErrorDisplayProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 border rounded-md shadow-sm border-gray-200 dark:border-gray-700">
            <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-500 mb-4">Permission Access Denied</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">If the problem persists, please contact your administrator.</p>
            {onRetry && (
                <Button onClick={onRetry}>Try Again</Button>
            )}
        </div>
    );
} 