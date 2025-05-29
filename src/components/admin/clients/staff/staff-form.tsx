'use client'

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Gender, IdType, Language, ContactMethod, ManagementLevel, EmploymentType, EducationLevel, MaritalStatus, WorkStatus } from '@prisma/client';

const staffFormSchema = z.object({
    // Profile fields
    fullName: z.string().min(1, 'Full name is required'),
    preferredName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    dob: z.date().optional(),
    gender: z.nativeEnum(Gender).optional(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    idNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    idType: z.nativeEnum(IdType).optional(),

    // Health & Support Info
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    accessibilityNeeds: z.array(z.string()).optional(),

    // Contact & Metadata
    emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
    emergencyContactEmail: z.string().email('Invalid email address'),
    preferredLanguage: z.nativeEnum(Language).optional(),
    preferredContactMethod: z.nativeEnum(ContactMethod).optional(),

    // Staff specific fields
    companyId: z.string().min(1, 'Company ID is required'),
    jobTitle: z.string().optional(),
    managementLevel: z.nativeEnum(ManagementLevel),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    educationLevel: z.nativeEnum(EducationLevel).optional(),
    maritalStatus: z.nativeEnum(MaritalStatus),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    status: z.nativeEnum(WorkStatus),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    preferredWorkingHours: z.record(z.string(), z.boolean()).optional(),
}).refine((data) => {
    // If ID type is selected, ID number is required
    if (data.idType && !data.idNumber) {
        return false;
    }
    // If ID number is provided, ID type is required
    if (data.idNumber && !data.idType) {
        return false;
    }
    return true;
}, {
    message: "Both ID type and ID number are required when providing identification",
    path: ["idNumber"]
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
    staff?: Partial<StaffFormValues>;
    onSubmit: (data: StaffFormValues) => Promise<void>;
    onCancel: () => void;
}

// Add label maps for enums
const managementLevelLabels = {
    JUNIOR: "Junior",
    MID: "Mid",
    SENIOR: "Senior",
    EXECUTIVE: "Executive",
    OTHER: "Other"
};
const employmentTypeLabels = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    CONTRACT: "Contract",
    TEMPORARY: "Temporary",
    INTERN: "Intern",
    VOLUNTEER: "Volunteer",
    OTHER: "Other"
};
const educationLevelLabels = {
    HIGH_SCHOOL: "High School",
    DIPLOMA: "Diploma",
    BACHELORS: "Bachelors",
    MASTERS: "Masters",
    DOCTORATE: "Doctorate",
    OTHER: "Other"
};
const maritalStatusLabels = {
    SINGLE: "Single",
    MARRIED: "Married",
    DIVORCED: "Divorced",
    WIDOWED: "Widowed"
};
const workStatusLabels = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ON_LEAVE: "On Leave",
    TERMINATED: "Terminated"
};
const genderLabels = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other"
};
const idTypeLabels = {
    NATIONAL_ID: "National ID",
    PASSPORT: "Passport",
    DRIVER_LICENSE: "Driver's License",
    OTHER: "Other"
};
const languageLabels = {
    ENGLISH: "English",
    FRENCH: "French",
    SPANISH: "Spanish",
};
const contactMethodLabels = {
    EMAIL: "Email",
    PHONE: "Phone",
    SMS: "SMS",
    WHATSAPP: "WhatsApp",
};

export function StaffForm({ staff, onSubmit, onCancel }: StaffFormProps) {
    const [step, setStep] = React.useState(1);
    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            // Profile fields
            fullName: staff?.fullName || '',
            preferredName: staff?.preferredName || '',
            email: staff?.email || '',
            phone: staff?.phone || '',
            dob: staff?.dob || undefined,
            gender: staff?.gender || undefined,
            nationality: staff?.nationality || '',
            address: staff?.address || '',
            idNumber: staff?.idNumber || '',
            passportNumber: staff?.passportNumber || '',
            idType: staff?.idType || undefined,

            // Health & Support Info
            allergies: staff?.allergies || [],
            medicalConditions: staff?.medicalConditions || [],
            dietaryRestrictions: staff?.dietaryRestrictions || [],
            accessibilityNeeds: staff?.accessibilityNeeds || [],

            // Contact & Metadata
            emergencyContactName: staff?.emergencyContactName || '',
            emergencyContactPhone: staff?.emergencyContactPhone || '',
            emergencyContactEmail: staff?.emergencyContactEmail || '',
            preferredLanguage: staff?.preferredLanguage || undefined,
            preferredContactMethod: staff?.preferredContactMethod || undefined,

            // Staff specific fields
            companyId: staff?.companyId || '',
            jobTitle: staff?.jobTitle || '',
            managementLevel: staff?.managementLevel || ManagementLevel.JUNIOR,
            employmentType: staff?.employmentType || undefined,
            educationLevel: staff?.educationLevel || undefined,
            maritalStatus: staff?.maritalStatus || MaritalStatus.SINGLE,
            startDate: staff?.startDate || undefined,
            endDate: staff?.endDate || undefined,
            status: staff?.status || WorkStatus.ACTIVE,
            qualifications: staff?.qualifications || [],
            specializations: staff?.specializations || [],
            preferredWorkingHours: staff?.preferredWorkingHours || undefined,
        },
    });

    const stepTitles = [
        "Basic Information",
        "Emergency Contact",
        "Employment Details",
        "Health Information",
        "Qualifications & Preferences"
    ];

    const isStep1Valid = !!form.watch('fullName') && !!form.watch('email') && !!form.watch('phone');
    const isStep2Valid = !!form.watch('emergencyContactName') && !!form.watch('emergencyContactPhone');
    const isStep3Valid = !!form.watch('managementLevel') && !!form.watch('employmentType') &&
        !!form.watch('maritalStatus') && !!form.watch('status');
    const isStep4Valid = true; // Optional step
    const isStep5Valid = isStep1Valid && isStep2Valid && isStep3Valid;

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                if (step === 5) {
                    form.handleSubmit(onSubmit)(e);
                }
            }} className="space-y-4">
                {/* Step Indicator */}
                <div className="mb-4 text-sm font-medium text-muted-foreground">
                    Step {step} of {stepTitles.length}: {stepTitles[step - 1]}
                </div>

                {/* Fixed height container for form content */}
                <div className="min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter full name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(genderLabels).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="idType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ID Type</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    form.setValue('idNumber', '');
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select ID type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(idTypeLabels).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="idNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ID Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={form.watch('idType') ? `Enter ${form.watch('idType')} number` : "Enter ID number"}
                                                    {...field}
                                                    disabled={!form.watch('idType')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="emergencyContactName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Emergency Contact Name <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter emergency contact name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="emergencyContactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Emergency Contact Phone <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter emergency contact phone" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="emergencyContactEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Emergency Contact Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter emergency contact email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preferredLanguage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Language</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(languageLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preferredContactMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Contact Method</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select contact method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(contactMethodLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="jobTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter job title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="managementLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Management Level <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(managementLevelLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="employmentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employment Type <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(employmentTypeLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="maritalStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marital Status <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(maritalStatusLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(workStatusLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="allergies"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Allergies</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter allergies (one per line)"
                                                value={field.value?.join('\n') || ''}
                                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="medicalConditions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medical Conditions</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter medical conditions (one per line)"
                                                value={field.value?.join('\n') || ''}
                                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dietaryRestrictions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dietary Restrictions</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter dietary restrictions (one per line)"
                                                value={field.value?.join('\n') || ''}
                                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="accessibilityNeeds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Accessibility Needs</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter accessibility needs (one per line)"
                                                value={field.value?.join('\n') || ''}
                                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="qualifications"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Qualifications</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter qualifications (one per line)"
                                                value={field.value?.join('\n') || ''}
                                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="specializations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specializations</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter specializations (one per line)"
                                                value={field.value?.join('\n') || ''}
                                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preferredWorkingHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Working Hours</FormLabel>
                                        <div className="space-y-2">
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                <div key={day} className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={field.value?.[day] || false}
                                                        onCheckedChange={(checked) => {
                                                            const newValue = { ...field.value, [day]: checked };
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                    <span>{day}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="educationLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Education Level</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select education level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(educationLevelLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    {step === 1 ? (
                        <>
                            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                            <Button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!isStep1Valid}
                            >
                                Next
                            </Button>
                        </>
                    ) : step === 2 ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setStep(3)}
                                disabled={!isStep2Valid}
                            >
                                Next
                            </Button>
                        </>
                    ) : step === 3 ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(2)}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setStep(4)}
                                disabled={!isStep3Valid}
                            >
                                Next
                            </Button>
                        </>
                    ) : step === 4 ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(3)}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setStep(5)}
                                disabled={!isStep4Valid}
                            >
                                Next
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(4)}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="bg-black text-white"
                                disabled={!isStep5Valid}
                            >
                                Add Staff Member
                            </Button>
                        </>
                    )}
                </div>
            </form>
        </Form>
    );
} 