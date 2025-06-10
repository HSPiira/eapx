'use client'

import React, { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
    addDays,
    addWeeks,
    addMonths,
    subDays,
    subWeeks,
    subMonths,
    startOfWeek,
    startOfMonth,
    endOfMonth,
    isSameDay,
    isSameMonth,
    format,
    getHours,
    getMinutes,
} from 'date-fns';

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

const VIEWS = ['day', 'week', 'month'] as const;
type ViewType = typeof VIEWS[number];

const TIME_START = 7; // 7 AM
const TIME_END = 20; // 8 PM
const TIME_SLOTS = Array.from({ length: TIME_END - TIME_START }, (_, i) => TIME_START + i);

export default function UpcomingSessionsPage() {
    const { status } = useSession();
    const router = useRouter();
    const { data, error, isLoading } = useSWR<SessionsResponse>(
        status === 'authenticated' ? '/api/services/sessions?status=SCHEDULED' : null,
        fetcher,
        { revalidateOnFocus: false }
    );

    const [view, setView] = useState<ViewType>('week');
    const [current, setCurrent] = useState(new Date());

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    if (status === 'unauthenticated') {
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

    const goPrev = () => {
        if (view === 'day') setCurrent(subDays(current, 1));
        else if (view === 'week') setCurrent(subWeeks(current, 1));
        else setCurrent(subMonths(current, 1));
    };
    const goNext = () => {
        if (view === 'day') setCurrent(addDays(current, 1));
        else if (view === 'week') setCurrent(addWeeks(current, 1));
        else setCurrent(addMonths(current, 1));
    };
    const goToday = () => setCurrent(new Date());

    const getWeekDays = (date: Date) => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    };
    const getMonthMatrix = (date: Date) => {
        const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
        const end = endOfMonth(date);
        const days: Date[] = [];
        let curr = start;
        while (curr <= end || days.length % 7 !== 0) {
            days.push(curr);
            curr = addDays(curr, 1);
        }
        return Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7));
    };

    return (
        <div className="container mx-auto py-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={goPrev} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft /></button>
                    <button onClick={goToday} className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">Today</button>
                    <button onClick={goNext} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight /></button>
                    <span className="ml-4 text-lg font-semibold">
                        {view === 'month' ? format(current, 'MMMM yyyy') :
                            view === 'week' ? `${format(startOfWeek(current, { weekStartsOn: 1 }), 'MMM d')} - ${format(addDays(startOfWeek(current, { weekStartsOn: 1 }), 6), 'MMM d, yyyy')}` :
                                format(current, 'PPP')}
                    </span>
                </div>
                <div className="flex gap-2">
                    {VIEWS.map(v => (
                        <button key={v} className={`px-3 py-1 rounded ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                    ))}
                </div>
            </div>

            {view === 'month' && (
                <div className="grid grid-cols-7 gap-px overflow-hidden">
                    {getWeekDays(current).map(day => (
                        <div key={day.toString()} className="bg-white dark:bg-background p-2 text-left font-bold border-b border-gray-200 dark:border-gray-800">
                            {format(day, 'EEEE')}
                        </div>
                    ))}
                    {getMonthMatrix(current).flat().map((day, i) => (
                        <div key={i} className={`bg-white dark:bg-background min-h-[90px] p-1 align-top border-b border-gray-100 dark:border-gray-800 ${isSameMonth(day, current) ? '' : 'text-gray-400 dark:text-gray-600'}`}>
                            <div className="text-xs font-semibold mb-1">{format(day, 'dd')}</div>
                            {sessions.filter(s => isSameDay(new Date(s.scheduledAt), day)).map(s => (
                                <div key={s.id} className="bg-blue-200 dark:bg-blue-800 rounded p-1 mt-1 text-xs cursor-pointer truncate" onClick={() => router.push(`/sessions/${s.id}`)}>
                                    {s.client.name} <span className="block text-[10px]">{format(new Date(s.scheduledAt), 'HH:mm')}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {(view === 'week' || view === 'day') && (
                <div className="grid" style={{ gridTemplateColumns: `80px repeat(${view === 'week' ? 7 : 1}, 1fr)` }}>
                    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"></div>
                    {(view === 'week' ? getWeekDays(current) : [current]).map((day, idx) => (
                        <div
                            key={day.toString()}
                            className={`bg-white dark:bg-background border-b border-gray-200 dark:border-gray-800 py-1 px-2 ${idx !== 0 ? 'border-l border-gray-200 dark:border-gray-800' : ''}`}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-base">{format(day, 'dd')}</span>
                                <span className="text-sm">{format(day, 'EEEE')}</span>
                            </div>
                        </div>
                    ))}
                    {TIME_SLOTS.map(hour => (
                        <React.Fragment key={hour}>
                            <div className="h-14 text-xs text-right pr-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-end bg-white dark:bg-gray-900">
                                {hour}:00
                            </div>
                            {(view === 'week' ? getWeekDays(current) : [current]).map((day, idx) => (
                                <div
                                    key={day.toString() + hour}
                                    className={`relative h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background ${idx !== 0 ? 'border-l border-gray-200 dark:border-gray-800' : ''}`}
                                >
                                    {sessions.filter(s => {
                                        const start = new Date(s.scheduledAt);
                                        return isSameDay(start, day) && getHours(start) === hour;
                                    }).map(s => {
                                        const start = new Date(s.scheduledAt);
                                        const minuteOffset = getMinutes(start);
                                        const height = (s.duration / 60) * 56;
                                        return (
                                            <div key={s.id}
                                                className="absolute left-2 right-2 bg-blue-200 dark:bg-blue-800 rounded p-1 text-xs cursor-pointer shadow-md overflow-hidden"
                                                style={{ top: `${(minuteOffset / 60) * 56}px`, height, minHeight: '32px' }}
                                                onClick={() => router.push(`/sessions/${s.id}`)}
                                            >
                                                <div className="font-bold truncate">{s.client.name}</div>
                                                <div className="truncate">{s.intervention.name}</div>
                                                <div className="text-[10px]">{format(start, 'HH:mm')} ({s.duration}m)</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {!sessions.length && (
                <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16 bg-gray-50 dark:bg-gray-900/50 mt-8">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-6">
                        <Calendar className="text-4xl text-blue-500 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-center text-gray-900 dark:text-white">No upcoming sessions</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                        You have no upcoming sessions. Your upcoming sessions will show up here.
                    </p>
                </div>
            )}
        </div>
    );
}
