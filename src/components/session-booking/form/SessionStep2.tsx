import React from 'react';
import { User, Briefcase, MapPin } from 'lucide-react';

// UI Components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
import { ServiceProvider, Intervention } from '../sessionRequestSchema';

// Components
import { SearchableCombobox } from './SearchableCombobox';

/**
 * Interface for company staff member
 */
interface CompanyStaff {
    id: string;
    fullName: string;
}

/**
 * Props for the SessionStep2 component
 */
interface SessionStep2Props {
    // Service provider related props
    serviceProviders: ServiceProvider[];
    selectedCounselor: string;
    setSelectedCounselor: (id: string) => void;
    counselorOpen: boolean;
    setCounselorOpen: (open: boolean) => void;
    counselorId: string;

    // Service provider staff if Service provider is a company related props
    companyStaff: CompanyStaff[];
    selectedCompanyStaff: string;
    setSelectedCompanyStaff: (id: string) => void;
    companyStaffOpen: boolean;
    setCompanyStaffOpen: (open: boolean) => void;

    // Intervention related props
    interventions: Intervention[];
    selectedInterventionId: string;
    setSelectedInterventionId: (id: string) => void;
    interventionOpen: boolean;
    setInterventionOpen: (open: boolean) => void;

    // Location related props
    sessionLocation: string;
    setSessionLocation: (location: string) => void;
    physicalAddress: string;
    setPhysicalAddress: (address: string) => void;
    sessionMethod: string;

    // Form related props
    setValue: (field: string, value: string | number | boolean | Date | undefined) => void;
    touchedFields: Record<string, boolean>;
    isSubmitted: boolean;
    errors: Record<string, { message?: string }>;
    isLoading?: boolean;
}

/**
 * SessionStep2 component handles the second step of session booking form
 * It includes counselor selection, staff selection (for company providers),
 * intervention selection, and session location configuration
 */
const SessionStep2: React.FC<SessionStep2Props> = ({
    // Service provider props
    serviceProviders,
    selectedCounselor,
    setSelectedCounselor,
    counselorOpen,
    setCounselorOpen,
    counselorId,

    // Company staff props
    companyStaff,
    selectedCompanyStaff,
    setSelectedCompanyStaff,
    companyStaffOpen,
    setCompanyStaffOpen,

    // Intervention props
    interventions,
    selectedInterventionId,
    setSelectedInterventionId,
    interventionOpen,
    setInterventionOpen,

    // Location props
    sessionLocation,
    setSessionLocation,
    physicalAddress,
    setPhysicalAddress,
    sessionMethod,

    // Form props
    setValue,
    touchedFields,
    isSubmitted,
    errors,
    isLoading = false
}) => {
    /**
     * Handles counselor selection with error handling
     */
    const handleCounselorSelect = (id: string) => {
        try {
            setSelectedCounselor(id);
            setValue('counselorId', id);
            setCounselorOpen(false);
        } catch (error) {
            console.error('Error selecting counselor:', error);
        }
    };

    /**
     * Handles intervention selection with error handling
     */
    const handleInterventionSelect = (id: string) => {
        try {
            setSelectedInterventionId(id);
            setValue('interventionId', id);
            setInterventionOpen(false);
        } catch (error) {
            console.error('Error selecting intervention:', error);
        }
    };

    /**
     * Handles location change with validation
     */
    const handleLocationChange = (value: string) => {
        setSessionLocation(value);
        setValue('sessionMethod', value === 'physical' ? 'physical' : 'online');

        // Clear physical address if not physical location
        if (value !== 'physical') {
            setPhysicalAddress('');
        }
    };

    /**
     * Checks if the selected provider is a company
     */
    const isCompanyProvider = () => {
        const selectedProvider = serviceProviders.find(sp => sp.id === selectedCounselor);
        return selectedProvider?.entityType === "COMPANY";
    };

    return (
        <div className="space-y-4" role="form" aria-label="Session details">
            {/* Counselor Selection */}
            <SearchableCombobox<ServiceProvider>
                label="Choose a Counselor"
                icon={User}
                value={selectedCounselor}
                onSelect={handleCounselorSelect}
                items={serviceProviders}
                open={counselorOpen}
                setOpen={setCounselorOpen}
                placeholder="Select counselor"
                searchPlaceholder="Search counselor..."
                error={(!counselorId && (touchedFields.counselorId || isSubmitted) && errors.counselorId?.message) || undefined}
                isLoading={isLoading}
                getItemLabel={(item: ServiceProvider) => item.name}
                getItemValue={(item: ServiceProvider) => item.id}
                required
                className="text-blue-700"
            />

            {/* Staff Selection for Company Providers */}
            {isCompanyProvider() && (
                <SearchableCombobox<CompanyStaff>
                    label="Select Staff Under Company"
                    icon={User}
                    value={selectedCompanyStaff}
                    onSelect={setSelectedCompanyStaff}
                    items={companyStaff}
                    open={companyStaffOpen}
                    setOpen={setCompanyStaffOpen}
                    placeholder="Select staff"
                    searchPlaceholder="Search staff..."
                    isLoading={isLoading}
                    getItemLabel={(item: CompanyStaff) => item.fullName || 'Unnamed'}
                    getItemValue={(item: CompanyStaff) => item.id}
                    error={undefined}
                />
            )}

            {/* Intervention Selection */}
            <SearchableCombobox<Intervention>
                label="Choose an Intervention"
                icon={Briefcase}
                value={selectedInterventionId}
                onSelect={handleInterventionSelect}
                items={interventions}
                open={interventionOpen}
                setOpen={setInterventionOpen}
                placeholder="Select intervention"
                searchPlaceholder="Search intervention..."
                isLoading={isLoading}
                getItemLabel={(item: Intervention) => item.name}
                getItemValue={(item: Intervention) => item.id}
                required
                className="text-purple-700"
                error={undefined}
            />

            {/* Session Location Picker */}
            <div className="space-y-2 mt-4">
                <Label htmlFor="session-location" className="flex items-center gap-2 text-base font-semibold text-green-700">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Session Location <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={sessionLocation}
                    onValueChange={handleLocationChange}
                    disabled={isLoading}
                >
                    <SelectTrigger id="session-location" className="w-full">
                        <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                    </SelectContent>
                </Select>
                {!sessionMethod && (touchedFields.sessionMethod || isSubmitted) && errors.sessionMethod && (
                    <div className="text-red-500 text-xs mt-1">{errors.sessionMethod.message}</div>
                )}
            </div>

            {/* Physical Address Input */}
            {sessionLocation === "physical" && (
                <div className="space-y-2">
                    <Label htmlFor="physical-address" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        Location Address
                    </Label>
                    <Input
                        id="physical-address"
                        value={physicalAddress}
                        onChange={e => setPhysicalAddress(e.target.value)}
                        placeholder="Enter address or location details"
                        disabled={isLoading}
                        aria-label="Physical address"
                    />
                </div>
            )}
        </div>
    );
};

export default SessionStep2; 