import React from 'react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    Building2,
    User,
    FileText,
    Briefcase,
    MapPin,
    CalendarDays,
    Clock,
    Users,
    MessageCircle
} from 'lucide-react';

// Types
import { Company, Staff, Beneficiary, ServiceProvider, Intervention } from '../sessionRequestSchema';

/**
 * Props for the SessionStep4 component
 */
interface SessionStep4Props {
    // Company related props
    companies: Company[];
    selectedCompany: string;
    sessionFor: 'company' | 'staff';

    // Staff related props
    staff: Staff[];
    selectedStaff: string;
    selfOrBeneficiary: 'self' | 'beneficiary';

    // Session type related props
    sessionType: string;
    SESSION_TYPES: string[];
    companySessionType: string;
    companySessionTypes: { id: string; label: string }[];
    watchedSessionType: string;

    // Beneficiary related props
    beneficiaries: Beneficiary[];
    selectedBeneficiary: string;

    // Intervention related props
    interventions: Intervention[];
    selectedInterventionId: string;

    // Provider related props
    serviceProviders: ServiceProvider[];
    selectedCounselor: string;
    selectedCompanyStaff: string;
    companyStaff: { id: string; fullName: string }[];

    // Location related props
    sessionLocation: string;
    physicalAddress: string;

    // Date and time related props
    selectedDate: Date | undefined;
    selectedTime: { start: string; end: string } | undefined;
    duration: number;

    // Group session related props
    groupSize: number;

    // Additional details
    specialRequirements: string;
    notes: string;
}

/**
 * SessionStep4 component displays a summary of the session request
 * It shows all selected options and details in a review format
 */
const SessionStep4: React.FC<SessionStep4Props> = ({
    // Company props
    companies,
    selectedCompany,
    sessionFor,

    // Staff props
    staff,
    selectedStaff,
    selfOrBeneficiary,

    // Session type props
    sessionType,
    SESSION_TYPES,
    companySessionType,
    companySessionTypes,
    watchedSessionType,

    // Beneficiary props
    beneficiaries,
    selectedBeneficiary,

    // Intervention props
    interventions,
    selectedInterventionId,

    // Provider props
    serviceProviders,
    selectedCounselor,
    selectedCompanyStaff,
    companyStaff,

    // Location props
    sessionLocation,
    physicalAddress,

    // Date and time props
    selectedDate,
    selectedTime,
    duration,

    // Group session props
    groupSize,

    // Additional details
    specialRequirements,
    notes
}) => {
    /**
     * Renders a summary item with an icon and label
     */
    const renderSummaryItem = (
        icon: React.ReactNode,
        label: string,
        value: React.ReactNode,
        iconColor: string
    ) => (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-4 ${iconColor}`}>{icon}</div>
            <span className="font-medium">{label}:</span> {value}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    Review your request
                </h3>
                <div className="space-y-2 text-sm">
                    {/* Company */}
                    {renderSummaryItem(
                        <Building2 className="w-4 h-4" />,
                        "Company",
                        companies.find(c => c.id === selectedCompany)?.name,
                        "text-blue-500"
                    )}

                    {/* Staff Information */}
                    {sessionFor === 'staff' && (
                        <>
                            {renderSummaryItem(
                                <User className="w-4 h-4" />,
                                "Staff",
                                staff.find(s => s.id === selectedStaff)?.name,
                                "text-purple-500"
                            )}
                            {renderSummaryItem(
                                <User className="w-4 h-4" />,
                                "Who is this for",
                                selfOrBeneficiary === 'self' ? 'Self' : 'Beneficiary',
                                "text-orange-500"
                            )}
                        </>
                    )}

                    {/* Session Type */}
                    {sessionFor === 'staff' ? (
                        renderSummaryItem(
                            <FileText className="w-4 h-4" />,
                            "Session Type",
                            SESSION_TYPES.find(s => s === sessionType)?.charAt(0).toUpperCase() + sessionType.slice(1),
                            "text-indigo-500"
                        )
                    ) : (
                        renderSummaryItem(
                            <FileText className="w-4 h-4" />,
                            "Session Type",
                            companySessionTypes.find(s => s.id === companySessionType)?.label,
                            "text-indigo-500"
                        )
                    )}

                    {/* Beneficiary */}
                    {selfOrBeneficiary === 'beneficiary' && renderSummaryItem(
                        <User className="w-4 h-4" />,
                        "Beneficiary",
                        beneficiaries.find(b => b.id === selectedBeneficiary)?.name,
                        "text-pink-500"
                    )}

                    {/* Intervention */}
                    {renderSummaryItem(
                        <Briefcase className="w-4 h-4" />,
                        "Intervention",
                        interventions.find(i => i.id === selectedInterventionId)?.name,
                        "text-purple-500"
                    )}

                    {/* Counselor */}
                    {renderSummaryItem(
                        <User className="w-4 h-4" />,
                        "Counselor",
                        serviceProviders.find(c => c.id === selectedCounselor)?.name,
                        "text-blue-500"
                    )}

                    {/* Provider Staff */}
                    {(() => {
                        const selectedProvider = serviceProviders.find(sp => sp.id === selectedCounselor);
                        if (selectedProvider?.entityType === "COMPANY" && selectedCompanyStaff) {
                            const staffObj = companyStaff.find(s => s.id === selectedCompanyStaff);
                            if (staffObj) {
                                return renderSummaryItem(
                                    <User className="w-4 h-4" />,
                                    "Provider Staff",
                                    staffObj.fullName,
                                    "text-cyan-500"
                                );
                            }
                        }
                        return null;
                    })()}

                    {/* Location */}
                    {renderSummaryItem(
                        <MapPin className="w-4 h-4" />,
                        "Session Location",
                        sessionLocation === 'physical' ? physicalAddress : sessionLocation.charAt(0).toUpperCase() + sessionLocation.slice(1),
                        "text-green-500"
                    )}

                    {/* Date */}
                    {renderSummaryItem(
                        <CalendarDays className="w-4 h-4" />,
                        "Date",
                        selectedDate ? format(selectedDate, 'PPP') : '',
                        "text-orange-500"
                    )}

                    {/* Time */}
                    {renderSummaryItem(
                        <Clock className="w-4 h-4" />,
                        "Time",
                        selectedTime ? `${selectedTime.start} - ${selectedTime.end}` : '',
                        "text-blue-500"
                    )}

                    {/* Duration */}
                    {renderSummaryItem(
                        <Clock className="w-4 h-4" />,
                        "Duration",
                        `${duration} minutes`,
                        "text-amber-500"
                    )}

                    {/* Group Size */}
                    {watchedSessionType === 'group' && renderSummaryItem(
                        <Users className="w-4 h-4" />,
                        "Group Size",
                        `${groupSize} participants`,
                        "text-rose-500"
                    )}

                    {/* Special Requirements */}
                    {specialRequirements && renderSummaryItem(
                        <MessageCircle className="w-4 h-4" />,
                        "Special Requirements",
                        specialRequirements,
                        "text-pink-500"
                    )}

                    {/* Notes */}
                    {notes && renderSummaryItem(
                        <FileText className="w-4 h-4" />,
                        "Notes",
                        notes,
                        "text-gray-400"
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionStep4; 