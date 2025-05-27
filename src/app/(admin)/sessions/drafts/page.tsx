'use client'
import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

interface DraftSession {
    id: string;
    client?: { name?: string };
    scheduledAt?: string;
    createdAt?: string;
    // Add more fields as needed
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch draft sessions');
    return res.json();
});

export default function DraftSessionsPage() {
    const { data, error, isLoading } = useSWR('/api/services/sessions?status=DRAFT', fetcher, { revalidateOnFocus: false });
    const drafts: DraftSession[] = data?.data || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 mb-6 animate-pulse">
                    <Calendar className="text-5xl text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center">Loading draft sessions...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 mb-6 animate-pulse">
                    <Calendar className="text-5xl text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center text-red-600">{error.message}</h2>
            </div>
        );
    }

    if (!drafts.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 mb-6 animate-pulse">
                    <Calendar className="text-5xl text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center">No draft sessions</h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    You have no draft sessions. Your draft sessions will show up here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {drafts.map((draft) => (
                <Link
                    key={draft.id}
                    href={`/sessions/${draft.id}`}
                    className="block border rounded-lg p-4 bg-white dark:bg-gray-900 hover:shadow-md transition"
                >
                    <div className="flex items-center gap-4">
                        <Calendar className="w-6 h-6 text-gray-400" />
                        <div className="flex-1">
                            <div className="font-semibold text-lg text-gray-900 dark:text-white">
                                {draft.client?.name || 'Draft Session'}
                                <span className="mx-1 text-gray-400">·</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 align-middle">{draft.id}</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Created: {draft.createdAt ? new Date(draft.createdAt).toLocaleString() : 'N/A'}
                            </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Draft</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}
