import React from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClientDetailsData, SessionType } from "./types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface Staff {
    id: string;
    name: string;
    profile?: {
        fullName?: string;
    };
}

interface Dependant {
    id: string;
    name: string;
}

interface ClientDetailsProps {
    data: ClientDetailsData;
    setData: (d: ClientDetailsData) => void;
}

// Organization session types component
function OrganizationSessionTypes({ value, onChange }: { value: SessionType; onChange: (value: SessionType) => void }) {
    const orgSessionTypes = [
        { value: 'talk' as SessionType, label: 'Talk' },
        { value: 'webinar' as SessionType, label: 'Webinar' },
        { value: 'training' as SessionType, label: 'Training' },
        { value: 'workshop' as SessionType, label: 'Workshop' },
        { value: 'seminar' as SessionType, label: 'Seminar' },
        { value: 'conference' as SessionType, label: 'Conference' }
    ];

    return (
        <div className="space-y-1">
            <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Session Type</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                    <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                    {orgSessionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

// Staff session types component
function StaffSessionTypes({ value, onChange }: { value: SessionType; onChange: (value: SessionType) => void }) {
    const staffSessionTypes = [
        { value: 'individual' as SessionType, label: 'Individual' },
        { value: 'couple' as SessionType, label: 'Couple' },
        { value: 'family' as SessionType, label: 'Family' },
        { value: 'group' as SessionType, label: 'Group' }
    ];

    return (
        <div className="space-y-1">
            <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Session Type</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                    <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                    {staffSessionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export function ClientDetails({ data, setData }: ClientDetailsProps) {
    const { sessionFor = 'organization', whoFor = 'self', sessionType = 'individual', numAttendees = 1, company = '', staff = '', dependant = '', clientId = '' } = data || {};
    const queryClient = useQueryClient();

    // Update numAttendees when sessionType changes
    React.useEffect(() => {
        if (sessionType === 'couple') {
            setData({ ...data, numAttendees: 2 });
        } else if (sessionType === 'group' || sessionType === 'family') {
            setData({ ...data, numAttendees: Math.max(2, numAttendees) });
        } else if (sessionType === 'individual') {
            setData({ ...data, numAttendees: 1 });
        }
    }, [sessionType]);

    // Prefetch staff data when clientId is available
    React.useEffect(() => {
        if (clientId) {
            queryClient.prefetchQuery({
                queryKey: ['staff', clientId],
                queryFn: async () => {
                    const res = await fetch(`/api/clients/${clientId}/staff`);
                    if (!res.ok) throw new Error('Failed to fetch staff');
                    return res.json();
                },
                staleTime: 5 * 60 * 1000, // 5 minutes
                gcTime: 30 * 60 * 1000, // 30 minutes
            });
        }
    }, [clientId, queryClient]);

    // Prefetch beneficiaries when staff is selected
    React.useEffect(() => {
        if (clientId && staff) {
            queryClient.prefetchQuery({
                queryKey: ['beneficiaries', clientId, staff],
                queryFn: async () => {
                    const res = await fetch(`/api/clients/${clientId}/staff/${staff}/beneficiaries`);
                    if (!res.ok) throw new Error('Failed to fetch beneficiaries');
                    return res.json();
                },
                staleTime: 5 * 60 * 1000,
                gcTime: 30 * 60 * 1000,
            });
        }
    }, [clientId, staff, queryClient]);

    // Fetch staff data
    const { data: staffData, isLoading: loadingStaff, error: staffError } = useQuery({
        queryKey: ['staff', clientId],
        queryFn: async () => {
            const res = await fetch(`/api/clients/${clientId}/staff`);
            if (!res.ok) throw new Error('Failed to fetch staff');
            return res.json();
        },
        enabled: !!clientId,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Fetch beneficiaries data
    const { data: beneficiariesData, isLoading: loadingDependants, error: beneficiariesError } = useQuery({
        queryKey: ['beneficiaries', clientId, staff],
        queryFn: async () => {
            const res = await fetch(`/api/clients/${clientId}/staff/${staff}/beneficiaries`);
            if (!res.ok) throw new Error('Failed to fetch beneficiaries');
            return res.json();
        },
        enabled: !!clientId && !!staff,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Handle staff selection
    const handleStaffChange = (newStaffId: string) => {
        setData({ ...data, staff: newStaffId, dependant: '' });
    };

    // Show error states
    if (staffError || beneficiariesError) {
        return (
            <div className="w-full flex items-start justify-start mt-6">
                <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                    <div className="text-center text-red-500">
                        <p>Error loading data. Please try again.</p>
                        <Button
                            onClick={() => {
                                queryClient.invalidateQueries({ queryKey: ['staff', clientId] });
                                if (staff) {
                                    queryClient.invalidateQueries({ queryKey: ['beneficiaries', clientId, staff] });
                                }
                            }}
                            className="mt-4"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const staffList = staffData?.data?.map((s: Staff) => ({
        id: s.id,
        name: s.profile?.fullName || s.name || 'Unnamed Staff'
    })) || [];

    const dependants = beneficiariesData?.data || [];

    // Auto-select staff if only one staff and none is selected
    React.useEffect(() => {
        if (!staff && staffList.length === 1) {
            setData({ ...data, staff: staffList[0].id });
        }
    }, [staffList, staff, data, setData]);

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Client Details</h2>
                {/* Company */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Company</Label>
                    <input
                        value={company}
                        readOnly
                        disabled
                        className="w-full border dark:border-gray-700 text-sm rounded-sm px-3 py-2 bg-background text-gray-700 dark:text-gray-300"
                    />
                </div>
                {/* Session for? */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Session for?</Label>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
                        <button type="button" className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${sessionFor === 'organization' ? 'bg-white dark:bg-gray-700 border border-blue-400 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'}`} onClick={() => setData({ ...data, sessionFor: 'organization' })}>Organization</button>
                        <button type="button" className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${sessionFor === 'staff' ? 'bg-white dark:bg-gray-700 border border-blue-400 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'}`} onClick={() => setData({ ...data, sessionFor: 'staff' })}>Staff</button>
                    </div>
                </div>
                {/* Staff and Who is it for? (only if Staff) */}
                {sessionFor === 'staff' && (
                    <>
                        <div className="space-y-1">
                            <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Staff</Label>
                            <Select value={staff} onValueChange={handleStaffChange}>
                                <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                                    <SelectValue placeholder={loadingStaff ? "Loading staff..." : "Select staff"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffList.map((s: { id: string; name: string }) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Who is it for?</Label>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
                                <button type="button" className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${whoFor === 'self' ? 'bg-white dark:bg-gray-700 border border-blue-400 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'}`} onClick={() => setData({ ...data, whoFor: 'self' })}>Self</button>
                                <button type="button" className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${whoFor === 'dependant' ? 'bg-white dark:bg-gray-700 border border-blue-400 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'}`} onClick={() => setData({ ...data, whoFor: 'dependant' })}>Dependant</button>
                            </div>
                        </div>
                        {/* Dependant dropdown (only if Who is it for? is dependant) */}
                        {whoFor === 'dependant' && (
                            <div className="space-y-1">
                                <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Dependant</Label>
                                <Select value={dependant} onValueChange={v => setData({ ...data, dependant: v })}>
                                    <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                                        <SelectValue placeholder={loadingDependants ? "Loading dependants..." : "Select dependant"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dependants.map((d: Dependant) => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </>
                )}
                {/* Session Type - Now using the new components */}
                {sessionFor === 'organization' ? (
                    <OrganizationSessionTypes
                        value={sessionType}
                        onChange={(v) => setData({ ...data, sessionType: v })}
                    />
                ) : (
                    <StaffSessionTypes
                        value={sessionType}
                        onChange={(v) => setData({ ...data, sessionType: v })}
                    />
                )}
                {/* Number of attendees (only if group, family, or couple) */}
                {(sessionType === 'group' || sessionType === 'family' || sessionType === 'couple') && (
                    <div className="space-y-1">
                        <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                            Number of attendees
                            {sessionType === 'couple' && <span className="text-gray-500 dark:text-gray-400 ml-1">(Fixed at 2)</span>}
                        </Label>
                        <input
                            type="number"
                            min={sessionType === 'couple' ? 2 : 2}
                            max={sessionType === 'couple' ? 2 : undefined}
                            className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background text-gray-900 dark:text-white"
                            value={numAttendees}
                            onChange={e => {
                                const value = Number(e.target.value);
                                if (sessionType === 'couple') {
                                    setData({ ...data, numAttendees: 2 });
                                } else {
                                    setData({ ...data, numAttendees: Math.max(2, value) });
                                }
                            }}
                            disabled={sessionType === 'couple'}
                        />
                    </div>
                )}
                {/* Notes */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Notes</Label>
                    <Textarea className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background text-gray-900 dark:text-white" placeholder="Add notes..." value={data.notes || ''} onChange={e => setData({ ...data, notes: e.target.value })} />
                </div>
            </div>
        </div>
    );
}