'use client'
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

interface UnconfirmedSession {
    id: string;
    client?: { name?: string };
    scheduledAt?: string;
    createdAt?: string;
    creator?: {
        id: string;
        email: string;
        name: string;
    };
    // Add more fields as needed
}

const fetcher = (url: string) => fetch(url, {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    }
}).then(res => {
    if (!res.ok) throw new Error(`Failed to fetch unconfirmed sessions: ${res.status} ${res.statusText}`);
    return res.json();
});

export default function UnconfirmedSessionsPage() {
    const { data, error, isLoading } = useSWR('/api/services/sessions?status=UNCONFIRMED', fetcher, { revalidateOnFocus: false });
    const sessions: UnconfirmedSession[] = data?.data || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 mb-6 animate-pulse">
                    <Calendar className="text-5xl text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center">Loading unconfirmed sessions...</h2>
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

    if (!sessions.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 mb-6 animate-pulse">
                    <Calendar className="text-5xl text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center">No unconfirmed sessions</h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    You have no unconfirmed sessions. Sessions that need confirmation will show up here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {sessions.map((session) => (
                <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="block border rounded-sm p-4 bg-white dark:bg-gray-900 hover:shadow-md transition"
                >
                    <div className="flex items-center">
                        <div className="flex-1">
                            <div className="text-sm text-gray-900 dark:text-white">
                                {session.client?.name || 'Unconfirmed Session'}
                                <span className="mx-1 text-gray-400">·</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 align-middle">{session.id}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <Clock className="w-4 h-4 text-gray-400 mr-1" />
                                Created: {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'Not set'}
                                {session.creator && (
                                    <>
                                        <span className="mx-1 text-gray-400">·</span>
                                        <span>By: {session.creator.name || session.creator.email || 'Unknown user'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">Unconfirmed</span>
                    </div>
                </Link>
            ))}
        </div>
    );
} 