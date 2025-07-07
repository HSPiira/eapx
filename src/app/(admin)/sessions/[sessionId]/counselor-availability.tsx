import { SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { CounselorAvailabilityData } from "./types";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ServiceProviderType } from "@prisma/client";
import { useEffect } from "react";

interface Provider {
    id: string;
    name: string;
    type: ServiceProviderType;
    entityType: 'INDIVIDUAL' | 'COMPANY';
}

interface ProviderStaff {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    role?: string;
}

interface TimeSlotProps {
    selectedSlot: string;
    onSelect: (slot: string) => void;
    timeFormat: '12hr' | '24hr';
    onFormatChange: (format: '12hr' | '24hr') => void;
}

function TimeSlot({ selectedSlot, onSelect, timeFormat, onFormatChange }: TimeSlotProps) {
    // Generate time slots from 7 AM to 7 PM
    const generateTimeSlots = (format: '12hr' | '24hr') => {
        const slots = [];
        for (let hour = 7; hour <= 19; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                if (format === '12hr') {
                    const period = hour >= 12 ? 'pm' : 'am';
                    const displayHour = hour > 12 ? hour - 12 : hour;
                    const time = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
                    slots.push(time);
                } else {
                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    slots.push(time);
                }
            }
        }
        return slots;
    };

    // Format the selected slot to match the generated slots format
    const formatSelectedSlot = (slot: string, format: '12hr' | '24hr') => {
        if (!slot) return '';
        try {
            const [time, period] = slot.split(' ');
            const [hours, minutes] = time.split(':');
            const hoursNum = String(Number(hours)); // remove leading zero
            const periodLower = period ? period.toLowerCase() : '';

            if (format === '12hr') {
                return `${hoursNum}:${minutes} ${periodLower}`.trim();
            } else {
                // Convert 12hr slot to 24hr if needed
                let h = Number(hours);
                if (periodLower === 'pm' && h !== 12) h += 12;
                if (periodLower === 'am' && h === 12) h = 0;
                // If no period, assume already 24hr
                const hour24 = h.toString().padStart(2, '0');
                return `${hour24}:${minutes}`;
            }
        } catch (error) {
            console.error('Error formatting time slot:', error);
            return '';
        }
    };

    const timeSlots = generateTimeSlots(timeFormat).map(slot => {
        const [time, period] = slot.split(' ');
        const [hours, minutes] = time.split(':');
        const hoursNum = String(Number(hours));
        const periodLower = period ? period.toLowerCase() : '';
        if (timeFormat === '12hr') {
            return `${hoursNum}:${minutes} ${periodLower}`.trim();
        } else {
            // 24hr: ensure leading zero
            const hour24 = Number(hours).toString().padStart(2, '0');
            return `${hour24}:${minutes}`;
        }
    });
    const formattedSelectedSlot = formatSelectedSlot(selectedSlot, timeFormat);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Available Time Slot</Label>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 gap-1 shadow-inner h-7">
                    <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                            "rounded-full text-xs font-medium transition-all duration-200 h-6 px-2",
                            timeFormat === '12hr'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                        )}
                        onClick={() => onFormatChange('12hr')}
                    >
                        12hr
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                            "rounded-full text-xs font-medium transition-all duration-200 h-6 px-2",
                            timeFormat === '24hr'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                        )}
                        onClick={() => onFormatChange('24hr')}
                    >
                        24hr
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 max-h-[240px]">
                {timeSlots.map(slot => (
                    <button
                        key={slot}
                        type="button"
                        className={`px-2 py-1 rounded border text-sm transition-all duration-200
                            ${formattedSelectedSlot === slot
                                ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                                : 'bg-background border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        onClick={() => onSelect(slot)}
                    >
                        {slot}
                    </button>
                ))}
            </div>
        </div>
    );
}

interface CounselorAvailabilityDetailsProps {
    data: CounselorAvailabilityData;
    setData: (d: CounselorAvailabilityData) => void;
}

export function CounselorAvailabilityDetails({ data, setData }: CounselorAvailabilityDetailsProps) {
    const {
        provider = '',
        staff = '',
        date = undefined,
        timeFormat = '12hr',
        selectedSlot = '',
        duration = '30',
    } = data || {};

    const queryClient = useQueryClient();

    useEffect(() => {
        // Initialize duration if not set
        if (!data.duration) {
            setData({ ...data, duration: '30' });
        }
    }, [data, setData]);

    // Fetch providers
    const { data: providersData, isLoading: loadingProviders } = useQuery({
        queryKey: ['providers'],
        queryFn: async () => {
            const res = await fetch('/api/providers');
            if (!res.ok) throw new Error('Failed to fetch providers');
            return res.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });

    // Fetch provider staff when a company provider is selected
    const { data: staffData, isLoading: loadingStaff } = useQuery({
        queryKey: ['provider-staff', provider],
        queryFn: async () => {
            const res = await fetch(`/api/providers/${provider}/staff`);
            if (!res.ok) throw new Error('Failed to fetch provider staff');
            return res.json();
        },
        enabled: !!provider && providersData?.data?.find((p: Provider) => p.id === provider)?.entityType === 'COMPANY',
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const selectedProvider = providersData?.data?.find((p: Provider) => p.id === provider);
    const showStaffSelection = selectedProvider?.entityType === 'COMPANY';

    const durations = [
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '45', label: '45 minutes' },
        { value: '60', label: '1 hour' },
        { value: '90', label: '1.5 hours' },
        { value: '120', label: '2 hours' },
        { value: '180', label: '3 hours' },
    ];

    // Handle provider change
    const handleProviderChange = (newProviderId: string) => {
        setData({ ...data, provider: newProviderId, staff: '' });
    };

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Counselor & Availability</h2>
                {/* Provider Counselor */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Provider</Label>
                    <Select value={provider} onValueChange={handleProviderChange}>
                        <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                            <SelectValue placeholder={loadingProviders ? "Loading providers..." : "Select provider"} />
                        </SelectTrigger>
                        <SelectContent>
                            {providersData?.data?.map((p: Provider) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Staff Provider (only shown for company providers) */}
                {showStaffSelection && (
                    <div className="space-y-1">
                        <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Staff Provider</Label>
                        <Select value={staff} onValueChange={v => setData({ ...data, staff: v })}>
                            <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                                <SelectValue placeholder={loadingStaff ? "Loading staff..." : "Select staff provider"} />
                            </SelectTrigger>
                            <SelectContent>
                                {staffData?.data?.map((s: ProviderStaff) => (
                                    <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {/* Date & Time */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Date & Time</Label>
                    <DatePicker value={date} onChange={v => setData({ ...data, date: v })} />
                </div>
                {/* Time Slot Selection */}
                <TimeSlot
                    selectedSlot={selectedSlot}
                    onSelect={slot => setData({ ...data, selectedSlot: slot })}
                    timeFormat={timeFormat}
                    onFormatChange={format => setData({ ...data, timeFormat: format })}
                />
                {/* Duration */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Duration</Label>
                    <Select value={duration} onValueChange={v => setData({ ...data, duration: v })}>
                        <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                            <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                            {durations.map(d => (
                                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}