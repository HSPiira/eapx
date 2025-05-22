'use client'

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, XCircle, Plus } from 'lucide-react';
import Link from 'next/link';

type Session = {
    id: string;
    title: string;
    date: string;
    time: string;
    status?: 'confirmed' | 'pending' | 'cancelled';
};

async function fetchUpcomingSessions(): Promise<Session[]> {
    // Replace with real API call, example:
    // const res = await fetch('/api/sessions/upcoming');
    // if (!res.ok) throw new Error('Failed to fetch');
    // return await res.json();

    // Mock data for demo:
    await new Promise((r) => setTimeout(r, 500));
    return [
        {
            id: '1',
            title: 'Consultation with Alice',
            date: '2025-06-01',
            time: '10:00 - 11:00',
            status: 'confirmed',
        },
        {
            id: '2',
            title: 'Meeting with Bob',
            date: '2025-06-03',
            time: '14:00 - 15:00',
            status: 'pending',
        },
    ];
}

export default function UpcomingSessionsPage() {
    const [sessions, setSessions] = useState<Session[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await fetchUpcomingSessions();
                setSessions(data);
                setError(null);
            } catch (error: unknown) {
                console.error('Failed to load sessions:', error);
                setError(error instanceof Error ? error.message : 'Failed to load sessions.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="p-6 border rounded-xl shadow-sm dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                                <div className="space-y-2">
                                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                                    <div className="flex space-x-4">
                                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                </div>
                            </div>
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!sessions || sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-6">
                    <Calendar className="text-4xl text-blue-500 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center text-gray-900 dark:text-white">No upcoming sessions</h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                    You have no upcoming sessions. As soon as someone books a time with you it will show up here.
                </p>
                <Link
                    href="/settings/availability"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Set Up Availability
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map((session) => (
                <div
                    key={session.id}
                    className="group p-6 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                    {session.title}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-1.5" />
                                        {new Date(session.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="w-4 h-4 mr-1.5" />
                                        {session.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {session.status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${session.status === 'confirmed'
                                ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 dark:from-emerald-900/30 dark:to-emerald-900/20 dark:text-emerald-400'
                                : session.status === 'pending'
                                    ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 dark:from-amber-900/30 dark:to-amber-900/20 dark:text-amber-400'
                                    : 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 dark:from-rose-900/30 dark:to-rose-900/20 dark:text-rose-400'
                                }`}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
