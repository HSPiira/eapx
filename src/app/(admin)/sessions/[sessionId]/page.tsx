'use client'
import { ArrowLeft, ExternalLink, Link2, Code2, Trash2, Calendar, Clock4, MapPin, CheckCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SessionDetails, InterventionDetails, CounselorAvailabilityDetails, LocationDetails } from './components';
import type { FC, Dispatch, SetStateAction } from 'react';
import { useSession } from 'next-auth/react';

const sidebarItems = [
    { key: 'client-setup', label: 'Client Details', icon: Link2, description: 'Client and session information' },
    { key: 'intervention', label: 'Intervention', icon: Clock4, description: 'Select intervention and service' },
    { key: 'counselor-availability', label: 'Counselor Availability', icon: Calendar, description: 'Choose counselor, date, and time' },
    { key: 'location', label: 'Location', icon: MapPin, description: 'Set location and special requirements' },
    { key: 'review', label: 'Review', icon: CheckCircle, description: 'Review and confirm' },
];

// Section data types
export interface ClientDetailsData {
    sessionFor?: 'organization' | 'staff';
    whoFor?: 'self' | 'dependant';
    sessionType?: 'individual' | 'group';
    numAttendees?: number;
    company?: string;
    staff?: string;
    notes?: string;
}

export interface InterventionData {
    service?: string;
    intervention?: string;
    notes?: string;
}

export interface CounselorAvailabilityData {
    provider?: string;
    staff?: string;
    date?: Date;
    timeFormat?: '12hr' | '24hr';
    selectedSlot?: string;
    duration?: string;
}

export interface LocationData {
    location?: string;
    requirements?: string;
}

export interface FormData {
    client: ClientDetailsData;
    intervention: InterventionData;
    counselor: CounselorAvailabilityData;
    location: LocationData;
}

type SectionKey = keyof FormData;

type SectionComponentProps<T extends SectionKey> = {
    data: FormData[T];
    setData: (d: FormData[T]) => void;
};

const sectionComponents = {
    client: SessionDetails as FC<SectionComponentProps<'client'>>,
    intervention: InterventionDetails as FC<SectionComponentProps<'intervention'>>,
    counselor: CounselorAvailabilityDetails as FC<SectionComponentProps<'counselor'>>,
    location: LocationDetails as FC<SectionComponentProps<'location'>>,
} as const;

interface SessionData {
    client?: {
        name: string;
    };
    id: string;
}

// Pretty print object with unquoted keys for display
function prettyPrintObject(obj: unknown, indent = 2): string {
    if (obj === null) return 'null';
    if (Array.isArray(obj)) {
        return '[\n' + obj.map(v => ' '.repeat(indent) + prettyPrintObject(v, indent + 2)).join(',\n') + '\n' + ' '.repeat(indent - 2) + ']';
    }
    if (typeof obj === 'object') {
        return (
            '{\n' +
            Object.entries(obj as Record<string, unknown>)
                .map(
                    ([key, value]) =>
                        ' '.repeat(indent) +
                        key +
                        ': ' +
                        (typeof value === 'object' && value !== null
                            ? prettyPrintObject(value, indent + 2)
                            : JSON.stringify(value))
                )
                .join(',\n') +
            '\n' + ' '.repeat(indent - 2) + '}'
        );
    }
    return JSON.stringify(obj);
}

function Header() {
    const router = useRouter();
    const params = useParams();
    const { status } = useSession();
    const [hidden, setHidden] = useState(false);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                if (status === 'loading') return;
                if (status === 'unauthenticated') {
                    router.push('/auth/login');
                    return;
                }

                setError(null);
                const res = await fetch(`/api/services/sessions/${params.sessionId}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to fetch session: ${res.status}`);
                }

                const data = await res.json();
                setSessionData(data);
            } catch (error) {
                console.error('Error fetching session:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch session');
            }
        };

        if (params.sessionId) {
            fetchSessionData();
        }
    }, [params.sessionId, status, router]);

    const handleSave = () => {
        // TODO: Call your staging save API
        alert('Saved to staging!');
    };

    const sessionTitle = error
        ? 'Error'
        : (sessionData
            ? <><span>{sessionData.client?.name || 'New Session'}</span><span className="mx-1 text-gray-400">·</span><span className="text-xs font-normal text-gray-500 dark:text-gray-300 align-middle">{sessionData.id}</span></>
            : 'Loading...');

    return (
        <div className="flex items-center justify-between w-full px-0 mx-0 mt-0 bg-background">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2 min-w-0">
                <button
                    className="p-1 rounded-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors"
                    onClick={() => router.push('/sessions/drafts')}
                    aria-label="Back to Sessions"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span className={`font-bold text-lg truncate ${error ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{sessionTitle}</span>
                {error && (
                    <span className="text-sm text-red-600 ml-2">{error}</span>
                )}
            </div>
            {/* Right: Hidden toggle, menu, save */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <span className="text-gray-700 font-medium text-sm">Hidden</span>
                    <button
                        className={`w-8 h-5 flex items-center bg-gray-200 rounded-full p-0.5 transition-colors duration-200 ${hidden ? 'bg-blue-500' : ''}`}
                        onClick={() => setHidden(h => !h)}
                        aria-label="Toggle hidden"
                    >
                        <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transform transition-transform duration-200 ${hidden ? 'translate-x-3' : ''}`}></span>
                    </button>
                </div>
                <span className="h-5 w-px bg-gray-200 mx-1" />
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded" aria-label="Open"><ExternalLink className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded" aria-label="Link"><Link2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded" aria-label="Code"><Code2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded text-red-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
                <span className="h-5 w-px bg-gray-200 mx-1" />
                <button className="px-3 py-1.5 rounded font-semibold hover:bg-gray-800 transition-colors ml-1 text-sm bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" aria-label="Save" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}

function Sidebar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
    return (
        <nav className="hidden lg:block w-64 h-full pt-6 pr-2">
            {sidebarItems.map((item) => {
                const SelectedIcon = item.icon;
                const isSelected = selected === item.key;
                return (
                    <div
                        key={item.key}
                        className={
                            isSelected
                                ? 'flex items-start px-2 py-1.5 mb-1 cursor-pointer rounded-sm bg-gray-100 dark:bg-gray-800'
                                : 'flex items-start px-2 py-1.5 mb-1 cursor-pointer rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }
                        onClick={() => onSelect(item.key)}
                    >
                        <SelectedIcon className="w-4 h-4 mr-3 text-gray-700 dark:text-gray-300 mt-0.5" />
                        <div className="flex-1">
                            <div className={isSelected ? 'font-semibold text-sm text-gray-900 dark:text-white' : 'font-semibold text-sm text-gray-900 dark:text-gray-100'}>{item.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}

function TabBar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
    return (
        <nav className="flex lg:hidden border-b bg-white px-2 overflow-x-auto">
            {sidebarItems.map((item) => {
                const SelectedIcon = item.icon;
                const isSelected = selected === item.key;
                return (
                    <button
                        key={item.key}
                        className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${isSelected ? 'border-blue-500 text-blue-700 bg-gray-100' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => onSelect(item.key)}
                    >
                        <SelectedIcon className="w-4 h-4 mr-1" />
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
}

function ReviewDetails({ formData, onConfirm }: { formData: FormData; onConfirm: () => void }) {
    return (
        <div className="w-full flex items-start justify-start mt-6">
            <form
                className="w-full bg-background rounded-sm p-8 border dark:border-gray-800 space-y-8"
                onSubmit={e => {
                    e.preventDefault();
                    onConfirm();
                }}
            >
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Review Details</h2>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Client Details</h3>
                    <pre className="bg-muted p-2 rounded text-sm text-gray-900 dark:text-gray-100">{prettyPrintObject(formData.client)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Intervention</h3>
                    <pre className="bg-muted p-2 rounded text-sm text-gray-900 dark:text-gray-100">{prettyPrintObject(formData.intervention)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Counselor & Availability</h3>
                    <pre className="bg-muted p-2 rounded text-sm text-gray-900 dark:text-gray-100">{prettyPrintObject(formData.counselor)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Location</h3>
                    <pre className="bg-muted p-2 rounded text-sm text-gray-900 dark:text-gray-100">{prettyPrintObject(formData.location)}</pre>
                </div>
                <div className="flex gap-4 justify-end">
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">Confirm</button>
                </div>
            </form>
        </div>
    );
}

function Content({
    selected,
    formData,
    setFormData,
    onConfirm,
}: {
    selected: string;
    formData: FormData;
    setFormData: Dispatch<SetStateAction<FormData>>;
    onConfirm: () => void;
}) {
    if (selected === 'review') {
        return (
            <div className="flex-1">
                <ReviewDetails formData={formData} onConfirm={onConfirm} />
            </div>
        );
    }

    const keyMap: Record<string, SectionKey> = {
        'client-setup': 'client',
        'intervention': 'intervention',
        'counselor-availability': 'counselor',
        'location': 'location',
    };

    const sectionKey = keyMap[selected as keyof typeof keyMap];
    const SectionComponent = sectionKey ? sectionComponents[sectionKey] : null;

    if (SectionComponent && sectionKey) {
        return (
            <div className="flex-1">
                <SectionComponent
                    data={formData[sectionKey]}
                    setData={(d: FormData[typeof sectionKey]) =>
                        setFormData((prev) => ({ ...prev, [sectionKey]: d }))
                    }
                />
            </div>
        );
    }

    return (
        <div className="flex-1 p-8">
            <h2 className="text-xl font-bold mb-4">{selected}</h2>
            <p className="text-gray-600">Content for <b>{selected}</b> goes here.</p>
        </div>
    );
}

export default function SessionEditPage() {
    const [selected, setSelected] = useState('client-setup');
    const [formData, setFormData] = useState<FormData>({
        client: {},
        intervention: {},
        counselor: {},
        location: {},
    });
    const [, setSessionData] = useState<SessionData | null>(null);
    const [, setError] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                if (status === 'loading') return;
                if (status === 'unauthenticated') {
                    router.push('/auth/login');
                    return;
                }

                setError(null);
                const res = await fetch(`/api/services/sessions/${params.sessionId}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to fetch session: ${res.status}`);
                }

                const data = await res.json();
                setSessionData(data);
                // Update form data with session data
                setFormData(prev => ({
                    ...prev,
                    client: {
                        ...prev.client,
                        company: data.client?.name || '',
                    }
                }));
            } catch (error) {
                console.error('Error fetching session:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch session');
            }
        };

        if (params.sessionId) {
            fetchSessionData();
        }
    }, [params.sessionId, status, router]);

    const handleConfirm = () => {
        // TODO: Call your session creation API
        alert('Session confirmed!');
    };

    return (
        <div className="flex flex-col h-screen w-full">
            <div className="sticky top-0 z-20 w-full bg-white">
                <Header />
                <TabBar selected={selected} onSelect={setSelected} />
            </div>
            <div className="flex flex-1 min-h-0">
                <Sidebar selected={selected} onSelect={setSelected} />
                <div className="flex-1 overflow-y-auto">
                    <Content
                        selected={selected}
                        formData={formData}
                        setFormData={setFormData}
                        onConfirm={handleConfirm}
                    />
                </div>
            </div>
        </div>
    );
}