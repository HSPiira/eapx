'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { AvailabilityPicker } from './AvailabilityPicker';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronsUpDown, Check, Plus } from 'lucide-react';

const sessionRequestSchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    staffId: z.string().min(1, 'Staff member is required'),
    counselorId: z.string().min(1, 'Counselor is required'),
    sessionType: z.enum(['individual', 'group', 'couple'], {
        required_error: 'Session type is required',
    }),
    sessionMethod: z.enum(['online', 'physical'], {
        required_error: 'Session method is required',
    }),
    date: z.date({
        required_error: 'Date is required',
    }),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    location: z.string().optional(),
    notes: z.string().optional(),
});

type SessionRequestFormData = z.infer<typeof sessionRequestSchema>;

interface Company {
    id: string;
    name: string;
}

interface Staff {
    id: string;
    name: string;
    email: string;
    companyId: string;
}

interface Counselor {
    id: string;
    name: string;
    email: string;
}

interface SessionRequestFormProps {
    companies: Company[];
    counselors: Counselor[];
    staff: Staff[];
    onSubmit: (data: SessionRequestFormData) => Promise<void>;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

const sessionTypes = [
    { id: 'individual', label: 'Individual' },
    { id: 'group', label: 'Group' },
    { id: 'couple', label: 'Couple' },
];

const companySessionTypes = [
    { id: 'talk', label: 'Talk' },
    { id: 'comedy', label: 'Comedy' },
    { id: 'training', label: 'Training' },
];

export function SessionRequestForm({
    companies,
    counselors,
    staff,
    onSubmit,
    isSubmitting = false,
    onCancel,
}: SessionRequestFormProps) {
    const [step, setStep] = React.useState(1);
    const [selectedCompany, setSelectedCompany] = React.useState<string>('');
    const [selectedDate, setSelectedDate] = React.useState<Date>();
    const [selectedTime, setSelectedTime] = React.useState<{ start: string; end: string }>();
    const [sessionFor, setSessionFor] = React.useState<'company' | 'staff'>('company');
    const [companyOpen, setCompanyOpen] = React.useState(false);
    const [selfOrBeneficiary, setSelfOrBeneficiary] = React.useState<'self' | 'beneficiary'>('self');
    const [staffOpen, setStaffOpen] = React.useState(false);
    const [selectedStaff, setSelectedStaff] = React.useState<string>('');
    const [showAddBeneficiary, setShowAddBeneficiary] = React.useState(false);
    const [newBeneficiary, setNewBeneficiary] = React.useState({ name: '', gender: '', relation: '', dob: '', notes: '' });
    const [filteredStaff, setFilteredStaff] = React.useState<Staff[]>([]);
    const genderOptions = [
        { id: 'male', label: 'Male' },
        { id: 'female', label: 'Female' },
        { id: 'other', label: 'Other' },
    ];
    const relationOptions = [
        { id: 'spouse', label: 'Spouse' },
        { id: 'child', label: 'Child' },
        { id: 'parent', label: 'Parent' },
        { id: 'other', label: 'Other' },
    ];
    const [notes, setNotes] = React.useState('');
    const [selectedCounselor, setSelectedCounselor] = React.useState<string>('');
    const [counselorOpen, setCounselorOpen] = React.useState(false);
    const [sessionLocation, setSessionLocation] = React.useState<string>("");
    const [physicalAddress, setPhysicalAddress] = React.useState<string>("");
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(null);
    const [sessionType, setSessionType] = React.useState('');
    const [sessionTypeOpen, setSessionTypeOpen] = React.useState(false);
    const [companySessionType, setCompanySessionType] = React.useState('');
    const [companySessionTypeOpen, setCompanySessionTypeOpen] = React.useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = React.useState('');
    const [beneficiaryOpen, setBeneficiaryOpen] = React.useState(false);
    const [beneficiaries, setBeneficiaries] = React.useState<any[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SessionRequestFormData>({
        resolver: zodResolver(sessionRequestSchema),
    });

    const sessionMethod = watch('sessionMethod');
    const selectedCompanyObj = companies.find(c => c.id === selectedCompany);

    const handleCompanyChange = (companyId: string) => {
        setSelectedCompany(companyId);
        setValue('companyId', companyId);
        setValue('staffId', ''); // Reset staff selection
    };

    const handleTimeSelect = (date: Date, startTime: string) => {
        setSelectedDate(date);
        // Calculate endTime as 1 hour after startTime
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const end = new Date(date);
        end.setHours(startHour);
        end.setMinutes(startMinute + 60); // add 60 minutes
        const endHour = end.getHours().toString().padStart(2, '0');
        const endMinute = end.getMinutes().toString().padStart(2, '0');
        const endTime = `${endHour}:${endMinute}`;
        setSelectedTime({ start: startTime, end: endTime });
        setValue('date', date);
        setValue('startTime', startTime);
        setValue('endTime', endTime);
    };

    const onFormSubmit = async (data: SessionRequestFormData) => {
        try {
            await onSubmit(data);
            toast.success('Session request submitted successfully');
        } catch (error) {
            toast.error('Failed to submit session request');
        }
    };

    // Add step titles
    const stepTitles = [
        "Details",
        "Counselor & Time",
        "Summary"
    ];
    const totalSteps = stepTitles.length;

    const isStep1Valid = selectedCompany && (
        (sessionFor === 'company' && companySessionType) ||
        (sessionFor === 'staff' && selectedStaff && selfOrBeneficiary && sessionType && (selfOrBeneficiary === 'self' || (selfOrBeneficiary === 'beneficiary' && selectedBeneficiary)))
    );

    // Filter staff based on selected company
    useEffect(() => {
        if (selectedCompany) {
            const companyStaff = staff.filter(s => s.companyId === selectedCompany);
            console.log('Filtered staff:', companyStaff); // Debug log
            setFilteredStaff(companyStaff);
        } else {
            setFilteredStaff([]);
        }
    }, [selectedCompany, staff]);

    return (
        <form
            className="space-y-4 w-full"
            onSubmit={e => {
                e.preventDefault();
                if (step === 1) {
                    if (!selectedCompany || (sessionFor === 'staff' && !selectedStaff)) return;
                    setStep(2);
                } else if (step === 2) {
                    if (!selectedCounselor || !sessionLocation || (sessionLocation === 'physical' && !physicalAddress) || !selectedDate || !selectedTime) return;
                    setStep(3);
                } else if (step === 3) {
                    handleSubmit((data) => {
                        onSubmit({
                            ...data,
                            companyId: selectedCompany,
                            staffId: selectedStaff,
                            counselorId: selectedCounselor,
                            notes,
                            sessionType: sessionType as 'individual' | 'group' | 'couple',
                            sessionMethod: sessionLocation === 'physical' ? 'physical' : 'online',
                            location: sessionLocation === 'physical' ? physicalAddress : sessionLocation,
                            date: selectedDate!,
                            startTime: selectedTime!.start,
                            endTime: selectedTime!.end,
                        });
                    })();
                }
            }}
        >
            {/* Step Indicator */}
            <div className="mb-4 text-sm font-medium text-muted-foreground">
                Step {step} of {totalSteps}: {stepTitles[step - 1]}
            </div>
            {step === 1 && (
                <>
                    {/* Select Company */}
                    <div className="space-y-2">
                        <Label htmlFor="company">Select Company</Label>
                        <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={companyOpen}
                                    className="w-full justify-between"
                                    disabled={companies.length === 0}
                                >
                                    {selectedCompanyObj?.name || (companies.length === 0 ? "No companies available" : "Select company")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search company..." />
                                    <CommandList>
                                        <CommandEmpty>No company found.</CommandEmpty>
                                        {companies.map((company) => (
                                            <CommandItem
                                                key={company.id}
                                                value={company.name}
                                                onSelect={() => {
                                                    setSelectedCompany(company.id);
                                                    setCompanyOpen(false);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", selectedCompany === company.id ? "opacity-100" : "opacity-0")} />
                                                {company.name}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Session for? */}
                    <div className="space-y-2">
                        <Label>Session for?</Label>
                        <RadioGroup value={sessionFor} onValueChange={value => setSessionFor(value as 'company' | 'staff')} className="flex flex-row items-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="company" id="session-for-company" />
                                <Label htmlFor="session-for-company">Company</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="staff" id="session-for-staff" />
                                <Label htmlFor="session-for-staff">Staff</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* If Staff: Select Staff Member */}
                    {sessionFor === 'staff' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="staff">Select Staff Member</Label>
                                <Popover open={staffOpen} onOpenChange={setStaffOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={staffOpen}
                                            className="w-full justify-between"
                                            disabled={!selectedCompany || filteredStaff.length === 0}
                                        >
                                            {selectedStaff && filteredStaff.find(s => s.id === selectedStaff)?.name ||
                                                (!selectedCompany ? "Select a company first" :
                                                    filteredStaff.length === 0 ? "No staff available" :
                                                        "Select staff member")}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search staff..." />
                                            <CommandList>
                                                <CommandEmpty>No staff found.</CommandEmpty>
                                                {filteredStaff.map((member) => (
                                                    <CommandItem
                                                        key={member.id}
                                                        value={member.name}
                                                        onSelect={() => {
                                                            setSelectedStaff(member.id);
                                                            setStaffOpen(false);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", selectedStaff === member.id ? "opacity-100" : "opacity-0")} />
                                                        {member.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/* Who is this for? */}
                            <div className="space-y-2">
                                <Label>Who is this for?</Label>
                                <RadioGroup value={selfOrBeneficiary} onValueChange={value => setSelfOrBeneficiary(value as 'self' | 'beneficiary')} className="flex flex-row items-center gap-6 mt-2">
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="self" id="who-for-self" />
                                        <Label htmlFor="who-for-self">Self</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="beneficiary" id="who-for-beneficiary" />
                                        <Label htmlFor="who-for-beneficiary">Beneficiary</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {/* If Beneficiary: Choose Beneficiary and Session Type */}
                            {selfOrBeneficiary === 'beneficiary' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="beneficiary">Choose Beneficiary</Label>
                                        <Popover open={beneficiaryOpen} onOpenChange={setBeneficiaryOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={beneficiaryOpen}
                                                    className="w-full justify-between"
                                                    disabled={beneficiaries.length === 0}
                                                >
                                                    {selectedBeneficiary && beneficiaries.find(b => b.id === selectedBeneficiary)?.name || (beneficiaries.length === 0 ? "No beneficiaries available" : "Select beneficiary")}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search beneficiary..." />
                                                    <CommandList>
                                                        <CommandEmpty>No beneficiary found.</CommandEmpty>
                                                        {beneficiaries.map((b) => (
                                                            <CommandItem
                                                                key={b.id}
                                                                value={b.name}
                                                                onSelect={() => {
                                                                    setSelectedBeneficiary(b.id);
                                                                    setBeneficiaryOpen(false);
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", selectedBeneficiary === b.id ? "opacity-100" : "opacity-0")} />
                                                                {b.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </>
                            )}
                            {sessionFor === 'staff' && (
                                <div className="space-y-2">
                                    <Label htmlFor="sessionType">Session Type</Label>
                                    <Popover open={sessionTypeOpen} onOpenChange={setSessionTypeOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={sessionTypeOpen}
                                                className="w-full justify-between"
                                            >
                                                {sessionTypes.find(s => s.id === sessionType)?.label || "Select session type"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search session type..." />
                                                <CommandList>
                                                    <CommandEmpty>No session type found.</CommandEmpty>
                                                    {sessionTypes.map((s) => (
                                                        <CommandItem
                                                            key={s.id}
                                                            value={s.label}
                                                            onSelect={() => {
                                                                setSessionType(s.id);
                                                                setSessionTypeOpen(false);
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", sessionType === s.id ? "opacity-100" : "opacity-0")} />
                                                            {s.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </>
                    )}

                    {/* If Company: Add Session Type */}
                    {sessionFor === 'company' && (
                        <div className="space-y-2">
                            <Label htmlFor="company-session-type">Session Type</Label>
                            <Popover open={companySessionTypeOpen} onOpenChange={setCompanySessionTypeOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={companySessionTypeOpen}
                                        className="w-full justify-between"
                                    >
                                        {companySessionTypes.find(s => s.id === companySessionType)?.label || "Select session type"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search session type..." />
                                        <CommandList>
                                            <CommandEmpty>No session type found.</CommandEmpty>
                                            {companySessionTypes.map((s) => (
                                                <CommandItem
                                                    key={s.id}
                                                    value={s.label}
                                                    onSelect={() => {
                                                        setCompanySessionType(s.id);
                                                        setCompanySessionTypeOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", companySessionType === s.id ? "opacity-100" : "opacity-0")} />
                                                    {s.label}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {/* Notes section for session details, optional */}
                    <div className="space-y-2">
                        <Label htmlFor="session-notes">Notes (optional)</Label>
                        <Textarea
                            id="session-notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Enter any additional information or requirements"
                            className="min-h-[80px] text-base"
                        />
                    </div>

                    {/* Cancel and Next Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={!isStep1Valid}>
                            Next
                        </Button>
                    </div>
                </>
            )}
            {step === 2 && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="counselor">Choose a Counselor</Label>
                        <Popover open={counselorOpen} onOpenChange={setCounselorOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={counselorOpen}
                                    className="w-full justify-between"
                                >
                                    {selectedCounselor && counselors.find(c => c.id === selectedCounselor)?.name || "Select counselor"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search counselor..." />
                                    <CommandList>
                                        <CommandEmpty>No counselor found.</CommandEmpty>
                                        {counselors.map((c) => (
                                            <CommandItem
                                                key={c.id}
                                                value={c.name}
                                                onSelect={() => {
                                                    setSelectedCounselor(c.id);
                                                    setCounselorOpen(false);
                                                    setSelectedDate(undefined);
                                                    setSelectedTime(undefined);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", selectedCounselor === c.id ? "opacity-100" : "opacity-0")} />
                                                {c.name}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    {/* Session Location Picker */}
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="session-location">Session Location</Label>
                        <Select value={sessionLocation} onValueChange={setSessionLocation}>
                            <SelectTrigger id="session-location" className="w-full">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="virtual">Virtual</SelectItem>
                                <SelectItem value="phone">Phone Call</SelectItem>
                                <SelectItem value="physical">Physical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Physical address input if needed */}
                    {sessionLocation === "physical" && (
                        <div className="space-y-2">
                            <Label htmlFor="physical-address">Location Address</Label>
                            <Input
                                id="physical-address"
                                value={physicalAddress}
                                onChange={e => setPhysicalAddress(e.target.value)}
                                placeholder="Enter address or location details"
                            />
                        </div>
                    )}
                    {/* Date Picker for slot selection */}
                    {selectedCounselor && (
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="counselor-date">Choose a Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={date => {
                                            setSelectedDate(date);
                                            setSelectedTime(undefined); // reset time when date changes
                                        }}
                                        disabled={date => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            return date < today;
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                    {/* Availability Picker for time slot selection */}
                    {selectedCounselor && selectedDate && (
                        <div className="mt-4">
                            <AvailabilityPicker
                                counselorId={selectedCounselor}
                                selectedDate={selectedDate}
                                selectedTimeSlot={selectedTimeSlot}
                                onTimeSelect={(date, startTime) => {
                                    setSelectedDate(date);
                                    setSelectedTimeSlot(startTime);
                                    // Calculate endTime as 1 hour after startTime
                                    const [startHour, startMinute] = startTime.split(":").map(Number);
                                    const end = new Date(date);
                                    end.setHours(startHour);
                                    end.setMinutes(startMinute + 60);
                                    const endHour = end.getHours().toString().padStart(2, '0');
                                    const endMinute = end.getMinutes().toString().padStart(2, '0');
                                    const endTime = `${endHour}:${endMinute}`;
                                    setSelectedTime({ start: startTime, end: endTime });
                                    setValue('date', date);
                                    setValue('startTime', startTime);
                                    setValue('endTime', endTime);
                                }}
                            />
                        </div>
                    )}
                    {/* Back and Submit Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                        <Button type="submit" disabled={!selectedCounselor || !sessionLocation || (sessionLocation === 'physical' && !physicalAddress) || !selectedDate || !selectedTime}>
                            Next
                        </Button>
                    </div>
                </>
            )}
            {step === 3 && (
                <>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Review your request</h3>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Company:</span> {companies.find(c => c.id === selectedCompany)?.name}</div>
                            {sessionFor === 'staff' && <div><span className="font-medium">Staff:</span> {staff.find(s => s.id === selectedStaff)?.name}</div>}
                            {sessionFor === 'staff' && <div><span className="font-medium">Who is this for:</span> {selfOrBeneficiary === 'self' ? 'Self' : 'Beneficiary'}</div>}
                            {sessionFor === 'staff' && <div><span className="font-medium">Session Type:</span> {sessionTypes.find(s => s.id === sessionType)?.label}</div>}
                            {sessionFor === 'company' && <div><span className="font-medium">Session Type:</span> {companySessionTypes.find(s => s.id === companySessionType)?.label}</div>}
                            {selfOrBeneficiary === 'beneficiary' && <div><span className="font-medium">Beneficiary:</span> {beneficiaries.find(b => b.id === selectedBeneficiary)?.name}</div>}
                            <div><span className="font-medium">Counselor:</span> {counselors.find(c => c.id === selectedCounselor)?.name}</div>
                            <div><span className="font-medium">Session Location:</span> {sessionLocation === 'physical' ? physicalAddress : sessionLocation.charAt(0).toUpperCase() + sessionLocation.slice(1)}</div>
                            <div><span className="font-medium">Date:</span> {selectedDate ? format(selectedDate, 'PPP') : ''}</div>
                            <div><span className="font-medium">Time:</span> {selectedTime ? `${selectedTime.start} - ${selectedTime.end}` : ''}</div>
                            {notes && <div><span className="font-medium">Notes:</span> {notes}</div>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                        <Button type="submit" disabled={isSubmitting}>Submit</Button>
                    </div>
                </>
            )}
        </form>
    );
} 