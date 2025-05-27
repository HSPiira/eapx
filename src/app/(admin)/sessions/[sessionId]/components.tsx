import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ClientDetailsData, CounselorAvailabilityData, InterventionData, LocationData } from './page';

interface SessionDetailsProps {
    data: ClientDetailsData;
    setData: (d: ClientDetailsData) => void;
}

export function SessionDetails({ data, setData }: SessionDetailsProps) {
    const { sessionFor = 'organization', whoFor = 'self', sessionType = 'individual', numAttendees = 1, company = '', staff = '' } = data || {};

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full bg-white rounded-sm p-8 border space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Client Details</h2>
                {/* Company */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Company</Label>
                    <input
                        type="text"
                        value={company}
                        readOnly
                        disabled
                        className="w-full border rounded-sm px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                </div>
                {/* Session for? */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Session for?</Label>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit">
                        <button type="button" className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${sessionFor === 'organization' ? 'bg-white border border-blue-400 text-blue-700' : 'text-gray-600 hover:bg-gray-200 border border-transparent'}`} onClick={() => setData({ ...data, sessionFor: 'organization' })}>Organization</button>
                        <button type="button" className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${sessionFor === 'staff' ? 'bg-white border border-blue-400 text-blue-700' : 'text-gray-600 hover:bg-gray-200 border border-transparent'}`} onClick={() => setData({ ...data, sessionFor: 'staff' })}>Staff</button>
                    </div>
                </div>
                {/* Staff and Who is it for? (only if Staff) */}
                {sessionFor === 'staff' && (
                    <>
                        <div className="space-y-1">
                            <Label className="font-semibold text-sm text-gray-700">Staff</Label>
                            <Select value={staff} onValueChange={v => setData({ ...data, staff: v })}>
                                <SelectTrigger className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition">
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="staff1">Staff 1</SelectItem>
                                    <SelectItem value="staff2">Staff 2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="font-semibold text-sm text-gray-700">Who is it for?</Label>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit">
                                <button type="button" className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${whoFor === 'self' ? 'bg-white border border-blue-400 text-blue-700' : 'text-gray-600 hover:bg-gray-200 border border-transparent'}`} onClick={() => setData({ ...data, whoFor: 'self' })}>Self</button>
                                <button type="button" className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${whoFor === 'dependant' ? 'bg-white border border-blue-400 text-blue-700' : 'text-gray-600 hover:bg-gray-200 border border-transparent'}`} onClick={() => setData({ ...data, whoFor: 'dependant' })}>Dependant</button>
                            </div>
                        </div>
                    </>
                )}
                {/* Session Type */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Session Type</Label>
                    <Select value={sessionType} onValueChange={(v: 'individual' | 'group') => setData({ ...data, sessionType: v })}>
                        <SelectTrigger className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Number of attendees (only if group) */}
                {sessionType === 'group' && (
                    <div className="space-y-1">
                        <Label className="font-semibold text-sm text-gray-700">Number of attendees</Label>
                        <input type="number" min={1} className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" value={numAttendees} onChange={e => setData({ ...data, numAttendees: Number(e.target.value) })} />
                    </div>
                )}
                {/* Notes */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Notes</Label>
                    <Textarea className="w-full border rounded-sm px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="Add notes..." value={data.notes || ''} onChange={e => setData({ ...data, notes: e.target.value })} />
                </div>
            </div>
        </div>
    );
}

interface InterventionDetailsProps {
    data: InterventionData;
    setData: (d: InterventionData) => void;
}

export function InterventionDetails({ data, setData }: InterventionDetailsProps) {
    const { service = '', intervention = '', notes = '' } = data || {};
    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full bg-white rounded-sm p-8 border space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Intervention Details</h2>
                {/* Service */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Service</Label>
                    <Select value={service} onValueChange={v => setData({ ...data, service: v })}>
                        <SelectTrigger className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition">
                            <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="service1">Service 1</SelectItem>
                            <SelectItem value="service2">Service 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Intervention */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Intervention</Label>
                    <Select value={intervention} onValueChange={v => setData({ ...data, intervention: v })}>
                        <SelectTrigger className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition">
                            <SelectValue placeholder="Select intervention" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="intervention1">Intervention 1</SelectItem>
                            <SelectItem value="intervention2">Intervention 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Notes */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Notes</Label>
                    <Textarea
                        className="w-full border rounded-sm px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        placeholder="Add intervention notes..."
                        value={notes}
                        onChange={e => setData({ ...data, notes: e.target.value })}
                    />
                </div>
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
            <div className="w-full bg-white rounded-sm p-8 border space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Counselor & Availability</h2>
                {/* Provider Counselor */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Provider</Label>
                    <Select value={provider} onValueChange={v => setData({ ...data, provider: v })}>
                        <SelectTrigger className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition">
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
                    <Label className="font-semibold text-sm text-gray-700">Staff Provider</Label>
                    <Select value={staff} onValueChange={v => setData({ ...data, staff: v })}>
                        <SelectTrigger className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition">
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
                    <Label className="font-semibold text-sm text-gray-700">Date & Time</Label>
                    <DatePicker value={date} onChange={v => setData({ ...data, date: v })} />
                </div>
                {/* Time Format Toggle */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="font-semibold text-sm text-gray-700">Available Time Slot</Label>
                        <div className="flex bg-gray-100 rounded-full p-0.5 gap-1 shadow-inner h-7">
                            <Button
                                type="button"
                                variant="ghost"
                                className={cn(
                                    "rounded-full text-xs font-medium transition-all duration-200 h-6 px-2",
                                    timeFormat === '12hr'
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-gray-700 hover:bg-blue-100'
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
                                        : 'text-gray-700 hover:bg-blue-100'
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
                                    ${selectedSlot === slot ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setData({ ...data, selectedSlot: slot })}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Duration */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Duration</Label>
                    <Select value={duration} onValueChange={v => setData({ ...data, duration: v })}>
                        <SelectTrigger className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition">
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

interface LocationDetailsProps {
    data: LocationData;
    setData: (d: LocationData) => void;
}

export function LocationDetails({ data, setData }: LocationDetailsProps) {
    const { location = '', requirements = '' } = data || {};
    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full bg-white rounded-sm p-8 border space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Location</h2>
                {/* Location Combobox */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Location</Label>
                    <Select value={location} onValueChange={v => setData({ ...data, location: v })}>
                        <SelectTrigger className="w-full border rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition">
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="px-2 py-1 text-xs text-gray-500">Conferencing</div>
                            <SelectItem value="teams">MS Teams</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="google-meet">Google Meet</SelectItem>
                            <div className="px-2 py-1 text-xs text-gray-500">In Person</div>
                            <SelectItem value="minet-office">In Person (Minet Office)</SelectItem>
                            <SelectItem value="provider-office">In Person (Provider Offices)</SelectItem>
                            <div className="px-2 py-1 text-xs text-gray-500">Other</div>
                            <SelectItem value="custom-location">Custom Attendee Location</SelectItem>
                            <SelectItem value="link-meeting">Link meeting</SelectItem>
                            <SelectItem value="phone-call">Phone Call</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Special Requirements */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700">Special Requirements</Label>
                    <Textarea
                        className="w-full border rounded-sm px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        placeholder="Any special requirements/accommodation needs."
                        value={requirements}
                        onChange={e => setData({ ...data, requirements: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}
