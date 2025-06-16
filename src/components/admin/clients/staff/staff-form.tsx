'use client'

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Gender, IdType, Language, ContactMethod, ManagementLevel, EmploymentType, EducationLevel, MaritalStatus, WorkStatus } from '@prisma/client';
import { BasicInformationStep } from './form/basic-information';
import { EmergencyContactStep } from './form/emergency-contact';
import { EmploymentDetailsStep } from './form/employment-details';
import { QualificationsStep } from './form/qualifications';
import { useToast } from "@/components/ui/use-toast";

const basicInformationSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    preferredName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    dob: z.date().optional(),
    gender: z.nativeEnum(Gender),
    nationality: z.string().optional(),
    address: z.string().optional(),
    idNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    idType: z.nativeEnum(IdType),
});

const emergencyContactSchema = z.object({
    emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
    emergencyContactEmail: z.string().email('Invalid email address').optional(),
    preferredLanguage: z.nativeEnum(Language).optional(),
    preferredContactMethod: z.nativeEnum(ContactMethod).optional(),
});

const employmentDetailsSchema = z.object({
    companyId: z.string().min(1, 'Company ID is required'),
    jobTitle: z.string().optional(),
    companyStaffId: z.string().optional(),
    managementLevel: z.nativeEnum(ManagementLevel),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    maritalStatus: z.nativeEnum(MaritalStatus),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    status: z.nativeEnum(WorkStatus),
});

const healthInformationSchema = z.object({
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    accessibilityNeeds: z.array(z.string()).optional(),
});

const qualificationsSchema = z.object({
    educationLevel: z.nativeEnum(EducationLevel).optional(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    preferredWorkingHours: z.record(z.string(), z.boolean()).optional(),
});

const staffFormSchema = z.object({
    ...basicInformationSchema.shape,
    ...emergencyContactSchema.shape,
    ...employmentDetailsSchema.shape,
    ...healthInformationSchema.shape,
    ...qualificationsSchema.shape,
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

export function StaffForm({ staff, onSubmit, onCancel }: StaffFormProps) {
    const [step, setStep] = React.useState(1);
    const { toast } = useToast();
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
        "Qualifications"
    ];

    const isStep1Valid = !!form.watch('fullName') && !!form.watch('email') && !!form.watch('phone');
    const isStep2Valid = !!form.watch('emergencyContactName') && !!form.watch('emergencyContactPhone');
    const isStep3Valid = !!form.watch('managementLevel') && !!form.watch('employmentType') &&
        !!form.watch('maritalStatus') && !!form.watch('status');

    // Add form-level validation for submission
    const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

    const handleSubmit = async (data: StaffFormValues) => {
        if (!isFormValid) {
            toast({
                title: "Form Incomplete",
                description: "Please complete all required fields before submitting.",
                variant: "destructive",
                duration: 5000,
            });
            return;
        }

        try {
            await onSubmit(data);

            // Show success toast
            toast({
                title: "Staff Member Added Successfully",
                description: (
                    <div className="mt-2">
                        <p className="font-medium">{data.fullName} has been added to your staff list.</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data.employmentType ? `Employment Type: ${data.employmentType}` : ''}
                            {data.jobTitle ? ` • Position: ${data.jobTitle}` : ''}
                        </p>
                    </div>
                ),
                duration: 5000,
            });

            // Reload the page after a short delay to show the toast
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error submitting form:', error);

            // Show error toast
            toast({
                title: "Error Adding Staff Member",
                description: "There was a problem adding the staff member. Please try again.",
                variant: "destructive",
                duration: 5000,
            });
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <BasicInformationStep form={form} />;
            case 2:
                return <EmergencyContactStep form={form} />;
            case 3:
                return <EmploymentDetailsStep form={form} />;
            case 4:
                return <QualificationsStep form={form} />;
            default:
                return null;
        }
    };

    const renderNavigationButtons = () => {
        const backStep = step > 1 ? step - 1 : null;
        const nextStep = step < 4 ? step + 1 : null;

        const buttons = [];

        if (backStep) {
            buttons.push(
                <Button
                    key="back"
                    type="button"
                    variant="outline"
                    onClick={() => setStep(backStep)}
                >
                    Back
                </Button>
            );
        } else {
            buttons.push(
                <Button key="cancel" type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            );
        }

        if (step === 4) {
            buttons.push(
                <Button
                    key="submit"
                    type="submit"
                    variant="default"
                    disabled={!isFormValid}
                >
                    Add Staff
                </Button>
            );
        } else if (nextStep) {
            buttons.push(
                <Button
                    key="next"
                    type="button"
                    onClick={() => setStep(nextStep)}
                >
                    Next
                </Button>
            );
        }

        return buttons;
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Form {...form}>
                <div className="space-y-4">
                    {/* Step Indicator */}
                    <div
                        aria-live="polite"
                        className="mb-4 text-sm font-medium text-muted-foreground"
                    >
                        Step {step} of {stepTitles.length}: {stepTitles[step - 1]}
                    </div>

                    {/* Scrollable form content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
                        {renderStepContent()}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        {renderNavigationButtons()}
                    </div>
                </div>
            </Form>
        </form>
    );
} 