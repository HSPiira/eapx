'use client'

import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

interface Session {
    id: string;
    scheduledAt: string;
    duration: number;
    location: string;
    status: string;
    client: {
        name: string;
    };
    provider: {
        name: string;
    };
    intervention: {
        name: string;
    };
}

interface SessionsResponse {
    data: Session[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const fetcher = (url: string) => fetch(url, {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    }
}).then(res => {
    if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.status} ${res.statusText}`);
    return res.json();
});

export default function UpcomingSessionsPage() {
    const { status } = useSession();
    const router = useRouter();
    const { data, error, isLoading } = useSWR<SessionsResponse>(
        status === 'authenticated' ? '/api/services/sessions?status=SCHEDULED' : null,
        fetcher,
        { revalidateOnFocus: false }
    );

    if (status === 'unauthenticated') {
        router.push('/auth/login');
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 mb-6 animate-pulse">
                    <Calendar className="text-5xl text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center">Loading upcoming sessions...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <Calendar className="text-5xl text-red-400 dark:text-red-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center text-red-600">{error.message}</h2>
            </div>
        );
    }

    const sessions = data?.data || [];

    if (!sessions.length) {
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

    return (
        <div className="container mx-auto">
            <div className="grid gap-4">
                {sessions.map((session) => {
                    const sessionDate = new Date(session.scheduledAt);
                    const formattedDate = sessionDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    const formattedTime = sessionDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });

                    return (
                        <div
                            key={session.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/sessions/${session.id}`)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {session.intervention.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            with {session.provider.name}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {formattedDate}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {formattedTime} ({session.duration} minutes)
                                        </div>
                                        {session.location && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {session.location}
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <User className="w-4 h-4 mr-2" />
                                            {session.client.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                        {session.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
