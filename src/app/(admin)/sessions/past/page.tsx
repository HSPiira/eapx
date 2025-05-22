'use client'
import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

type Session = {
    id: string;
    title: string;
    date: string;
    time: string;
};

async function fetchPastSessions(): Promise<Session[]> {
    // Replace with real API call:
    // const res = await fetch('/api/sessions/past');
    // if (!res.ok) throw new Error('Failed to fetch');
    // return await res.json();

    // Mock data example:
    await new Promise(r => setTimeout(r, 500));
    return [
        { id: '1', title: 'Consultation with Alice', date: '2025-04-01', time: '10:00 - 11:00' },
        { id: '2', title: 'Meeting with Bob', date: '2025-04-15', time: '14:00 - 15:00' },
    ];
}

export default function PastSessionsPage() {
    const [sessions, setSessions] = useState<Session[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await fetchPastSessions();
                setSessions(data);
                setError(null);
            } catch {
                setError('Failed to load past sessions.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <p className="text-gray-500 dark:text-gray-400">Loading past sessions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!sessions || sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 mb-6 animate-pulse">
                    <Calendar className="text-5xl text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-center">No past bookings</h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    You have no past bookings. Your past bookings will show up here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map(({ id, title, date, time }) => (
                <div
                    key={id}
                    className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow dark:border-gray-700"
                >
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {new Date(date).toLocaleDateString()} — {time}
                    </p>
                </div>
            ))}
        </div>
    );
}
