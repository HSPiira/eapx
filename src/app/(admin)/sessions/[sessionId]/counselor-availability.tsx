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
        duration = '15',
    } = data || {};
    // ... timeSlots12, timeSlots24, durations ...
    const timeSlots12 = [
        '08:00 am', '08:15 am', '08:30 am', '08:45 am',
        '09:00 am', '09:15 am', '09:30 am', '09:45 am',
        '10:00 am', '10:15 am', '10:30 am', '10:45 am',
        '11:00 am', '11:15 am', '11:30 am', '11:45 am',
    ];
    const timeSlots24 = [
        '08:00', '08:15', '08:30', '08:45',
        '09:00', '09:15', '09:30', '09:45',
        '10:00', '10:15', '10:30', '10:45',
        '11:00', '11:15', '11:30', '11:45',
    ];
    const durations = [
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '45', label: '45 minutes' },
        { value: '60', label: '1 hour' },
        { value: '90', label: '1.5 hours' },
        { value: '120', label: '2 hours' },
        { value: '180', label: '3 hours' },
    ];
    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Counselor & Availability</h2>
                {/* Provider Counselor */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Provider</Label>
                    <Select value={provider} onValueChange={v => setData({ ...data, provider: v })}>
                        <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                            <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="counselor1">Counselor 1</SelectItem>
                            <SelectItem value="counselor2">Counselor 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Staff Provider (always shown) */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Staff Provider</Label>
                    <Select value={staff} onValueChange={v => setData({ ...data, staff: v })}>
                        <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                            <SelectValue placeholder="Select staff provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="staff1">Staff 1</SelectItem>
                            <SelectItem value="staff2">Staff 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Date & Time */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Date & Time</Label>
                    <DatePicker value={date} onChange={v => setData({ ...data, date: v })} />
                </div>
                {/* Time Format Toggle */}
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
                                onClick={() => setData({ ...data, timeFormat: '12hr' })}
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
                                onClick={() => setData({ ...data, timeFormat: '24hr' })}
                            >
                                24hr
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {(timeFormat === '12hr' ? timeSlots12 : timeSlots24).map(slot => (
                            <button
                                key={slot}
                                type="button"
                                className={`px-2 py-1 rounded border text-sm transition-all duration-200
                                    ${selectedSlot === slot
                                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                                        : 'bg-background border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                onClick={() => setData({ ...data, selectedSlot: slot })}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
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