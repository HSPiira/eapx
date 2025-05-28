import React, { ChangeEvent } from 'react';
import { Building2, User, FileText, Users } from 'lucide-react';

// UI Components
import { Label } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Utils

// Types
import { Company, Staff, Beneficiary } from '../sessionRequestSchema';

// Components
import { SearchableCombobox } from './SearchableCombobox';

/**
 * Props for the SessionStep1 component
 */
interface SessionStep1Props {
    // Company related props
    companies: Company[];
    selectedCompany: string;
    setSelectedCompany: (id: string) => void;
    companyOpen: boolean;
    setCompanyOpen: (open: boolean) => void;

    // Session type related props
    sessionFor: 'company' | 'staff';
    setSessionFor: (val: 'company' | 'staff') => void;
    sessionType: string;
    setSessionType: (type: string) => void;
    sessionTypeOpen: boolean;
    setSessionTypeOpen: (open: boolean) => void;
    SESSION_TYPES: string[];
    companySessionType: string;
    setCompanySessionType: (type: string) => void;
    companySessionTypeOpen: boolean;
    setCompanySessionTypeOpen: (open: boolean) => void;
    companySessionTypes: { id: string; label: string }[];
    watchedSessionType: string;

    // Staff related props
    staff: Staff[];
    filteredStaff: Staff[];
    selectedStaff: string;
    setSelectedStaff: (id: string) => void;
    staffOpen: boolean;
    setStaffOpen: (open: boolean) => void;

    // Beneficiary related props
    selfOrBeneficiary: 'self' | 'beneficiary';
    setSelfOrBeneficiary: (val: 'self' | 'beneficiary') => void;
    beneficiaries: Beneficiary[];
    selectedBeneficiary: string;
    setSelectedBeneficiary: (id: string) => void;
    beneficiaryOpen: boolean;
    setBeneficiaryOpen: (open: boolean) => void;

    // Group session related props
    groupSize: number;
    setGroupSize: (size: number) => void;
    selectedInterventionId: string;
    interventions: { id: string; name: string; capacity: number }[];

    // Notes related props
    notes: string;
    setNotes: (notes: string) => void;

    // Form related props
    setValue: (field: string, value: string | number | boolean | Date | undefined) => void;
    touchedFields: Record<string, boolean>;
    isSubmitted: boolean;
    errors: Record<string, { message?: string }>;
}

/**
 * SessionStep1 component handles the first step of session booking form
 * It includes company selection, staff selection, beneficiary selection,
 * session type selection, and additional details like group size and notes
 */
const SessionStep1: React.FC<SessionStep1Props> = ({
    // Company props
    companies,
    selectedCompany,
    setSelectedCompany,
    companyOpen,
    setCompanyOpen,

    // Session type props
    sessionFor,
    setSessionFor,
    sessionType,
    setSessionType,
    sessionTypeOpen,
    setSessionTypeOpen,
    SESSION_TYPES,
    companySessionType,
    setCompanySessionType,
    companySessionTypeOpen,
    setCompanySessionTypeOpen,
    companySessionTypes,
    watchedSessionType,
    // Staff props
    filteredStaff,
    selectedStaff,
    setSelectedStaff,
    staffOpen,
    setStaffOpen,

    // Beneficiary props
    selfOrBeneficiary,
    setSelfOrBeneficiary,
    beneficiaries,
    selectedBeneficiary,
    setSelectedBeneficiary,
    beneficiaryOpen,
    setBeneficiaryOpen,

    // Group session props
    groupSize,
    setGroupSize,
    selectedInterventionId,
    interventions,

    // Notes props
    notes,
    setNotes,

    // Form props
    setValue,
    touchedFields,
    isSubmitted,
    errors
}) => {
    /**
     * Handles company selection
     */
    const handleCompanySelect = (companyId: string) => {
        setSelectedCompany(companyId);
        setValue('companyId', companyId);
        setCompanyOpen(false);
    };

    /**
     * Handles staff selection
     */
    const handleStaffSelect = (staffId: string) => {
        setSelectedStaff(staffId);
        setValue('staffId', staffId);
        setStaffOpen(false);
    };

    /**
     * Handles session type selection
     */
    const handleSessionTypeSelect = (type: string) => {
        setSessionType(type);
        setValue('sessionType', type);
        setSessionTypeOpen(false);
    };

    /**
     * Handles company session type selection
     */
    const handleCompanySessionTypeSelect = (typeId: string) => {
        setCompanySessionType(typeId);
        setCompanySessionTypeOpen(false);
    };

    return (
        <div className="space-y-4">
            {/* Company Selection */}
            <SearchableCombobox<Company>
                label="Select Company"
                icon={Building2}
                value={selectedCompany}
                onSelect={handleCompanySelect}
                items={companies}
                open={companyOpen}
                setOpen={setCompanyOpen}
                placeholder="Select company"
                searchPlaceholder="Search company..."
                error={(!selectedCompany && (touchedFields.companyId || isSubmitted) && errors.companyId?.message) || undefined}
                getItemLabel={(item: Company) => item.name}
                getItemValue={(item: Company) => item.id}
                required
                className="text-blue-500"
            />

            {/* Session For Selection */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                    <User className="w-4 h-4 text-green-500" />
                    Session for? <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                    value={sessionFor}
                    onValueChange={value => setSessionFor(value as 'company' | 'staff')}
                    className="flex flex-row items-center gap-6 mt-2"
                >
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

            {/* Staff Selection Section */}
            {sessionFor === 'staff' && (
                <>
                    {/* Staff Member Selection */}
                    <SearchableCombobox<Staff>
                        label="Select Staff Member"
                        icon={User}
                        value={selectedStaff}
                        onSelect={handleStaffSelect}
                        items={filteredStaff}
                        open={staffOpen}
                        setOpen={setStaffOpen}
                        placeholder={!selectedCompany ? "Select a company first" : filteredStaff.length === 0 ? "No staff available" : "Select staff member"}
                        searchPlaceholder="Search staff..."
                        error={(!selectedStaff && (touchedFields.staffId || isSubmitted) && errors.staffId?.message) || undefined}
                        getItemLabel={(item: Staff) => item.name}
                        getItemValue={(item: Staff) => item.id}
                        required
                        className="text-purple-500"
                    />

                    {/* Who is this for? */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <User className="w-4 h-4 text-orange-500" />
                            Who is this for? <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                            value={selfOrBeneficiary}
                            onValueChange={value => setSelfOrBeneficiary(value as 'self' | 'beneficiary')}
                            className="flex flex-row items-center gap-6 mt-2"
                        >
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

                    {/* Beneficiary Selection */}
                    {selfOrBeneficiary === 'beneficiary' && (
                        <SearchableCombobox<Beneficiary>
                            label="Choose Beneficiary"
                            icon={User}
                            value={selectedBeneficiary}
                            onSelect={setSelectedBeneficiary}
                            items={beneficiaries}
                            open={beneficiaryOpen}
                            setOpen={setBeneficiaryOpen}
                            placeholder={beneficiaries.length === 0 ? "No beneficiaries available" : "Select beneficiary"}
                            searchPlaceholder="Search beneficiary..."
                            getItemLabel={(item: Beneficiary) => item.name}
                            getItemValue={(item: Beneficiary) => item.id}
                            className="text-pink-500"
                        />
                    )}

                    {/* Session Type Selection */}
                    <SearchableCombobox<string>
                        label="Session Type"
                        icon={FileText}
                        value={sessionType}
                        onSelect={handleSessionTypeSelect}
                        items={SESSION_TYPES}
                        open={sessionTypeOpen}
                        setOpen={setSessionTypeOpen}
                        placeholder="Select session type"
                        searchPlaceholder="Search session type..."
                        error={(!sessionType && (touchedFields.sessionType || isSubmitted) && errors.sessionType?.message) || undefined}
                        getItemLabel={(item: string) => item.charAt(0).toUpperCase() + item.slice(1)}
                        getItemValue={(item: string) => item}
                        required
                        className="text-indigo-500"
                    />
                </>
            )}

            {/* Company Session Type Selection */}
            {sessionFor === 'company' && (
                <SearchableCombobox<{ id: string; label: string }>
                    label="Session Type"
                    icon={FileText}
                    value={companySessionType}
                    onSelect={handleCompanySessionTypeSelect}
                    items={companySessionTypes}
                    open={companySessionTypeOpen}
                    setOpen={setCompanySessionTypeOpen}
                    placeholder="Select session type"
                    searchPlaceholder="Search session type..."
                    getItemLabel={(item: { id: string; label: string }) => item.label}
                    getItemValue={(item: { id: string; label: string }) => item.id}
                    required
                    className="text-indigo-500"
                />
            )}

            {/* Group Size Input */}
            {sessionFor === 'staff' && watchedSessionType === 'group' && (
                <div className="space-y-2">
                    <Label htmlFor="groupSize" className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-500" />
                        Group Size <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="groupSize"
                        type="number"
                        min={2}
                        max={selectedInterventionId ? interventions.find(i => i.id === selectedInterventionId)?.capacity || 10 : 10}
                        value={Number.isNaN(groupSize) ? '' : groupSize}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupSize(Number(e.target.value))}
                        placeholder="Enter number of participants"
                    />
                </div>
            )}

            {/* Notes Input */}
            <div className="space-y-2">
                <Label htmlFor="session-notes" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Notes (optional)
                </Label>
                <Textarea
                    id="session-notes"
                    value={notes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    placeholder="Enter any additional information or requirements"
                    className="min-h-[80px] text-base"
                />
            </div>
        </div>
    );
};

export default SessionStep1; 