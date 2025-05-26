'use client';

import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    sessionRequestSchema,
    SessionRequestFormData,
    SESSION_TYPES,
    SESSION_REQUEST_DEFAULTS,
    Company,
    Staff,
    ServiceProvider,
    Beneficiary,
    Intervention
} from './sessionRequestSchema';
import { Button } from '@/components/ui';
import { toast } from 'sonner';
import { Resolver } from 'react-hook-form';

// Form Step Components
import SessionStep1 from './form/SessionStep1';
import SessionStep2 from './form/SessionStep2';
import SessionStep3 from './form/SessionStep3';
import SessionStep4 from './form/SessionStep4';

interface SessionRequestFormProps {
    companies: Company[];
    serviceProviders: ServiceProvider[];
    providerStaff: Staff[];
    staff: Staff[];
    beneficiaries: Beneficiary[];
    interventions: Intervention[];
    onSubmitAction: (data: SessionRequestFormData) => Promise<void>;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

// Define company session types
const companySessionTypes = [
    { id: 'talk', label: 'Talk' },
    { id: 'comedy', label: 'Comedy' },
    { id: 'training', label: 'Training' },
] as const;

type CompanySessionType = typeof companySessionTypes[number]['id'];
type SessionType = 'individual' | 'group' | 'couple' | CompanySessionType;

// Define step titles
const stepTitles = [
    "Details",
    "Counselor & Location",
    "Date & Time",
    "Summary"
] as const;

export function SessionRequestForm({
    companies = [],
    serviceProviders = [],
    staff = [],
    beneficiaries = [],
    interventions = [],
    onSubmitAction,
    isSubmitting = false,

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
    const [filteredStaff, setFilteredStaff] = React.useState<Staff[]>([]);
    const [notes, setNotes] = React.useState('');
    const [selectedCounselor, setSelectedCounselor] = React.useState<string>('');
    const [counselorOpen, setCounselorOpen] = React.useState(false);
    const [sessionLocation, setSessionLocation] = React.useState<string>("");
    const [physicalAddress, setPhysicalAddress] = React.useState<string>("");
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(null);
    const [sessionType, setSessionType] = React.useState<SessionType>('individual');
    const [sessionTypeOpen, setSessionTypeOpen] = React.useState(false);
    const [companySessionType, setCompanySessionType] = React.useState<CompanySessionType>('talk');
    const [companySessionTypeOpen, setCompanySessionTypeOpen] = React.useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = React.useState<string>('');
    const [beneficiaryOpen, setBeneficiaryOpen] = React.useState(false);
    const [selectedInterventionId, setSelectedInterventionId] = React.useState<string>('');
    const [interventionOpen, setInterventionOpen] = React.useState(false);
    const [duration, setDuration] = React.useState<number>(60);
    const [groupSize, setGroupSize] = React.useState<number>(1);
    const [specialRequirements, setSpecialRequirements] = React.useState<string>('');
    const [timeFormat, setTimeFormat] = React.useState<'12' | '24'>('12');
    const [companyStaff, setCompanyStaff] = React.useState<Staff[]>([]);
    const [selectedCompanyStaff, setSelectedCompanyStaff] = React.useState<string>('');
    const [companyStaffOpen, setCompanyStaffOpen] = React.useState(false);

    const methods = useForm<SessionRequestFormData>({
        resolver: zodResolver(sessionRequestSchema) as Resolver<SessionRequestFormData>,
        defaultValues: SESSION_REQUEST_DEFAULTS,
        mode: 'onChange'
    });
    const { setValue, formState: { errors, touchedFields, isSubmitted }, watch } = methods;

    // Watch all required fields
    watch('companyId');
    watch('staffId');
    const counselorId = watch('counselorId');
    const interventionId = watch('interventionId');
    const watchedSessionType = watch('sessionType');
    const sessionMethod = watch('sessionMethod');
    const date = watch('date');

    companies.find(c => c.id === selectedCompany);

    const totalSteps = stepTitles.length;

    const isStep1Valid = selectedCompany && (
        (sessionFor === 'company' && companySessionType) ||
        (sessionFor === 'staff' && selectedStaff && selfOrBeneficiary && sessionType && (selfOrBeneficiary === 'self' || (selfOrBeneficiary === 'beneficiary' && selectedBeneficiary)))
    );

    // Filter staff based on selected company
    useEffect(() => {
        if (selectedCompany) {
            const companyStaff = staff.filter(s => s.companyId === selectedCompany);
            setFilteredStaff(companyStaff);
        } else {
            setFilteredStaff([]);
        }
    }, [selectedCompany, staff]);

    useEffect(() => {
        const selectedProvider = serviceProviders.find(sp => sp.id === selectedCounselor);
        if (selectedCounselor && selectedProvider?.entityType === "COMPANY") {
            fetch(`/api/providers/${selectedCounselor}/staff`)
                .then(res => res.json())
                .then(data => {
                    const filtered = data.data as Staff[];
                    setCompanyStaff(filtered);
                });
        } else {
            setCompanyStaff([]);
            setSelectedCompanyStaff('');
        }
    }, [selectedCounselor, serviceProviders]);

    // Add useEffect hooks to sync state with form values
    useEffect(() => {
        setValue('companyId', selectedCompany);
    }, [selectedCompany, setValue]);

    useEffect(() => {
        setValue('staffId', selectedStaff);
    }, [selectedStaff, setValue]);

    useEffect(() => {
        setValue('counselorId', selectedCounselor);
    }, [selectedCounselor, setValue]);

    useEffect(() => {
        setValue('interventionId', selectedInterventionId);
    }, [selectedInterventionId, setValue]);

    useEffect(() => {
        if (selectedDate) {
            setValue('date', selectedDate);
        }
    }, [selectedDate, setValue]);

    useEffect(() => {
        if (selectedTime) {
            setValue('startTime', selectedTime.start);
            setValue('endTime', selectedTime.end);
        }
    }, [selectedTime, setValue]);

    useEffect(() => {
        setValue('sessionMethod', sessionLocation === 'physical' ? 'physical' : 'online');
    }, [sessionLocation, setValue]);

    useEffect(() => {
        setValue('isGroupSession', sessionType === 'group');
    }, [sessionType, setValue]);

    useEffect(() => {
        setValue('duration', duration);
    }, [duration, setValue]);

    useEffect(() => {
        setValue('notes', notes);
    }, [notes, setValue]);

    // Add effect to sync sessionType
    useEffect(() => {
        if (sessionFor === 'company') {
            setValue('sessionType', companySessionType);
        } else {
            setValue('sessionType', sessionType);
        }
    }, [sessionFor, companySessionType, sessionType, setValue]);

    useEffect(() => {
        setValue('metadata', {
            requestMethod: sessionLocation,
            requestNotes: notes,
            groupSize: sessionType === 'group' ? groupSize : undefined,
            specialRequirements,
        });
    }, [sessionLocation, notes, sessionType, groupSize, specialRequirements, setValue]);

    // Add validation for required props
    if (!companies || !serviceProviders || !staff || !interventions) {
        return (
            <div className="p-4 text-center text-red-500">
                Missing required data. Please try again later.
            </div>
        );
    }

    // Add validation for current step
    const validateCurrentStep = () => {
        switch (step) {
            case 1:
                return isStep1Valid;
            case 2:
                return !!counselorId && !!interventionId && !!sessionLocation;
            case 3:
                return !!selectedDate && !!selectedTime && !!duration;
            case 4:
                return true; // All validations passed if we reached step 4
            default:
                return false;
        }
    };

    const handleNextStep = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        if (validateCurrentStep()) {
            setStep(step + 1);
        }
    };

    return (
        <FormProvider {...methods}>
            <form
                className="space-y-4 w-full min-h-[500px] flex flex-col"
                onSubmit={methods.handleSubmit(
                    async (data) => {
                        console.log('Form submission started with data:', data);
                        try {
                            // Validate required fields
                            if (!data.date) {
                                toast.error('Date is required');
                                return;
                            }

                            // Check if the selected provider is a company provider
                            const selectedProvider = serviceProviders.find(sp => sp.id === data.counselorId);
                            const isCompanyProvider = selectedProvider?.entityType === "COMPANY";

                            // Validate provider staff selection for company providers
                            if (isCompanyProvider && !selectedCompanyStaff) {
                                toast.error('Please select a staff member from the provider company');
                                return;
                            }

                            // Prepare the data for the API
                            const selectedCompanyObj = companies.find(c => c.id === data.companyId);
                            const selectedStaffObj = staff.find(s => s.id === data.staffId);
                            const selectedCounselorObj = serviceProviders.find(sp => sp.id === data.counselorId);

                            const apiData = {
                                ...data,
                                preferredDate: data.date,
                                companyName: selectedCompanyObj?.name,
                                staffName: selectedStaffObj?.name,
                                counselorName: selectedCounselorObj?.name,
                                staffEmail: selectedStaffObj?.email,
                                counselorEmail: selectedCounselorObj?.email,
                                adminEmail: 'admin@example.com', // TODO: Get real admin email
                                adminName: 'Admin', // TODO: Get real admin name
                            };

                            // Call the onSubmit handler with the form data
                            await onSubmitAction(apiData);
                            console.log('Form submitted successfully');
                        } catch (error) {
                            console.error('Form submission error:', error);
                            toast.error('Failed to submit form', {
                                description: error instanceof Error ? error.message : 'An unknown error occurred',
                            });
                        }
                    },
                    (errors) => {
                        console.log('Form validation failed with errors:', errors);
                        // Log each field's error
                        Object.entries(errors).forEach(([field, error]) => {
                            console.log(`Field ${field} error:`, error);
                        });
                    }
                )}
            >
                {/* Step Indicator */}
                <div className="mb-4 text-sm font-medium text-muted-foreground">
                    Step {step} of {totalSteps}: {stepTitles[step - 1]}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto">
                    {step === 1 && (
                        <SessionStep1
                            companies={companies}
                            selectedCompany={selectedCompany}
                            setSelectedCompany={setSelectedCompany}
                            companyOpen={companyOpen}
                            setCompanyOpen={setCompanyOpen}
                            sessionFor={sessionFor}
                            setSessionFor={setSessionFor}
                            sessionType={sessionType}
                            setSessionType={(type: string) => setSessionType(type as SessionType)}
                            sessionTypeOpen={sessionTypeOpen}
                            setSessionTypeOpen={setSessionTypeOpen}
                            SESSION_TYPES={[...SESSION_TYPES]}
                            companySessionType={companySessionType}
                            setCompanySessionType={(type: string) => setCompanySessionType(type as CompanySessionType)}
                            companySessionTypeOpen={companySessionTypeOpen}
                            setCompanySessionTypeOpen={setCompanySessionTypeOpen}
                            companySessionTypes={companySessionTypes.map(type => ({ ...type }))}
                            watchedSessionType={watchedSessionType}
                            staff={staff}
                            filteredStaff={filteredStaff}
                            selectedStaff={selectedStaff}
                            setSelectedStaff={setSelectedStaff}
                            staffOpen={staffOpen}
                            setStaffOpen={setStaffOpen}
                            selfOrBeneficiary={selfOrBeneficiary}
                            setSelfOrBeneficiary={setSelfOrBeneficiary}
                            beneficiaries={beneficiaries}
                            selectedBeneficiary={selectedBeneficiary}
                            setSelectedBeneficiary={setSelectedBeneficiary}
                            beneficiaryOpen={beneficiaryOpen}
                            setBeneficiaryOpen={setBeneficiaryOpen}
                            groupSize={groupSize}
                            setGroupSize={setGroupSize}
                            selectedInterventionId={selectedInterventionId}
                            interventions={interventions}
                            notes={notes}
                            setNotes={setNotes}
                            setValue={(field: string, value: string | number | boolean | Date | undefined) =>
                                setValue(field as keyof SessionRequestFormData, value)}
                            touchedFields={touchedFields as Record<string, boolean>}
                            isSubmitted={isSubmitted}
                            errors={errors as Record<string, { message?: string }>}
                        />
                    )}
                    {step === 2 && (
                        <SessionStep2
                            serviceProviders={serviceProviders}
                            interventions={interventions}
                            selectedCounselor={selectedCounselor}
                            setSelectedCounselor={setSelectedCounselor}
                            counselorOpen={counselorOpen}
                            setCounselorOpen={setCounselorOpen}
                            selectedInterventionId={selectedInterventionId}
                            setSelectedInterventionId={setSelectedInterventionId}
                            interventionOpen={interventionOpen}
                            setInterventionOpen={setInterventionOpen}
                            sessionLocation={sessionLocation}
                            setSessionLocation={setSessionLocation}
                            physicalAddress={physicalAddress}
                            setPhysicalAddress={setPhysicalAddress}
                            companyStaff={companyStaff.map(staff => ({
                                id: staff.id,
                                fullName: staff.name || ''
                            }))}
                            selectedCompanyStaff={selectedCompanyStaff}
                            setSelectedCompanyStaff={setSelectedCompanyStaff}
                            companyStaffOpen={companyStaffOpen}
                            setCompanyStaffOpen={setCompanyStaffOpen}
                            setValue={(field: string, value: string | number | boolean | Date | undefined) =>
                                setValue(field as keyof SessionRequestFormData, value)}
                            touchedFields={touchedFields as Record<string, boolean>}
                            isSubmitted={isSubmitted}
                            errors={errors as Record<string, { message?: string }>}
                            counselorId={counselorId}
                            sessionMethod={sessionMethod}
                        />
                    )}
                    {step === 3 && (
                        <SessionStep3
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedTime={selectedTime}
                            setSelectedTime={setSelectedTime}
                            selectedTimeSlot={selectedTimeSlot}
                            setSelectedTimeSlot={setSelectedTimeSlot}
                            timeFormat={timeFormat}
                            setTimeFormat={setTimeFormat}
                            duration={duration}
                            setDuration={setDuration}
                            specialRequirements={specialRequirements}
                            setSpecialRequirements={setSpecialRequirements}
                            setValue={(field: string, value: string | number | boolean | Date | undefined) =>
                                setValue(field as keyof SessionRequestFormData, value)}
                            touchedFields={touchedFields as Record<string, boolean>}
                            isSubmitted={isSubmitted}
                            errors={errors as Record<string, string>}
                            date={date}
                        />
                    )}
                    {step === 4 && (
                        <SessionStep4
                            companies={companies}
                            selectedCompany={selectedCompany}
                            sessionFor={sessionFor}
                            staff={staff}
                            selectedStaff={selectedStaff}
                            selfOrBeneficiary={selfOrBeneficiary}
                            sessionType={sessionType}
                            SESSION_TYPES={[...SESSION_TYPES]}
                            companySessionType={companySessionType}
                            companySessionTypes={companySessionTypes.map(type => ({ ...type })) as { id: string; label: string }[]}
                            watchedSessionType={watchedSessionType}
                            beneficiaries={beneficiaries}
                            selectedBeneficiary={selectedBeneficiary}
                            interventions={interventions}
                            selectedInterventionId={selectedInterventionId}
                            serviceProviders={serviceProviders}
                            selectedCounselor={selectedCounselor}
                            selectedCompanyStaff={selectedCompanyStaff}
                            companyStaff={companyStaff.map(staff => ({
                                id: staff.id,
                                fullName: staff.name || `${staff.name ?? ''}`.trim()
                            }))}
                            sessionLocation={sessionLocation}
                            physicalAddress={physicalAddress}
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            duration={duration}
                            groupSize={groupSize}
                            specialRequirements={specialRequirements}
                            notes={notes}
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
                    {step > 1 && (
                        <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                            Back
                        </Button>
                    )}
                    {step < totalSteps ? (
                        <Button
                            type="button"
                            onClick={handleNextStep}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    )}
                </div>
            </form>
        </FormProvider>
    );
} 