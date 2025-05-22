'use client';
import React, { useState } from 'react';

const mockOnboarding = [
    {
        id: '1',
        name: 'Acme Health',
        status: 'Pending',
        submittedAt: '2024-05-01',
    },
    {
        id: '2',
        name: 'Wellness Group',
        status: 'Approved',
        submittedAt: '2024-04-15',
    },
];

export default function ProvidersOnboardingPage() {
    const [onboarding] = useState(mockOnboarding);

    return (
        <div className="text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Provider Onboarding</h1>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">Bulk Approve</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Name</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Status</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Submitted At</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {onboarding.map((entry) => (
                            <tr key={entry.id} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                                <td className="p-2 border border-gray-200 dark:border-gray-700">{entry.name}</td>
                                <td className="p-2 border border-gray-200 dark:border-gray-700">{entry.status}</td>
                                <td className="p-2 border border-gray-200 dark:border-gray-700">{entry.submittedAt}</td>
                                <td className="p-2 border border-gray-200 dark:border-gray-700 space-x-2">
                                    <button className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded hover:bg-green-300 dark:hover:bg-green-700">Approve</button>
                                    <button className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-700">Reject</button>
                                    <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 