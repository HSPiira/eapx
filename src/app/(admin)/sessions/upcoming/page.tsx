'use client'

import React from 'react';
import { Calendar } from 'lucide-react';

export default function UpcomingSessionsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-6">
                <Calendar className="text-4xl text-blue-500 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center text-gray-900 dark:text-white">No upcoming sessions</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                You have no upcoming sessions. Your upcoming sessions will show up here.
            </p>
        </div>
    );
}
