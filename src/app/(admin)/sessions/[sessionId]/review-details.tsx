import { useEffect, useState } from "react";
import { FormData, ClientDetailsData, CounselorAvailabilityData, InterventionData, LocationData } from "./types";
import { locationGroups } from "./location-details";
import { Building, User, Users, FileText, ClipboardList, Briefcase, MapPin, Calendar, Clock4 } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MeetingPlatform } from "@/schema/meeting";
import { useCalendar } from "@/hooks/calendar/useCalendar";
import { useMeetings } from "@/hooks/meetings/useMeetings";
import type { CalendarEventData } from '@/hooks/calendar/useCalendar';
import type { CreateMeetingData } from '@/hooks/meetings/useMeetings';

interface StaffMember {
    id: string;
    name: string;
    profile?: {
        fullName: string;
        email?: string;
    };
}

interface Dependant {
    id: string;
    name: string;
}

interface Provider {
    id: string;
    name: string;
    entityType: 'INDIVIDUAL' | 'COMPANY';
}

interface ProviderStaff {
    id: string;
    fullName: string;
    email?: string;
}

interface Service {
    id: string;
    name: string;
}

interface Intervention {
    id: string;
    name: string;
}

interface DisplayObject {
    [key: string]: string | number;
}

interface Counselor {
    staff: string;
    date: string;
    selectedSlot: string;
    duration: number;
}

// Helper to map location value to label
function getLocationLabel(value?: string) {
    for (const group of locationGroups) {
        const found = group.options.find((opt: { value: string; label: string }) => opt.value === value);
        if (found) return found.label;
    }
    return value || "-";
}

// Map keys to icons and colors
const keyIconMap: Record<string, { icon: React.ElementType; color: string }> = {
    company: { icon: Building, color: "text-blue-600" },
    sessionFor: { icon: ClipboardList, color: "text-purple-600" },
    whoFor: { icon: User, color: "text-green-600" },
    sessionType: { icon: Users, color: "text-pink-600" },
    numAttendees: { icon: Users, color: "text-pink-600" },
    staff: { icon: User, color: "text-green-600" },
    dependant: { icon: User, color: "text-yellow-600" },
    notes: { icon: FileText, color: "text-gray-600" },
    service: { icon: ClipboardList, color: "text-indigo-600" },
    intervention: { icon: ClipboardList, color: "text-indigo-600" },
    provider: { icon: Briefcase, color: "text-blue-700" },
    providerStaff: { icon: User, color: "text-green-700" },
    date: { icon: Calendar, color: "text-orange-600" },
    selectedSlot: { icon: Clock4, color: "text-orange-600" },
    duration: { icon: Clock4, color: "text-orange-600" },
    location: { icon: MapPin, color: "text-pink-600" },
    requirements: { icon: FileText, color: "text-gray-600" },
};

// Helper to pretty-print a section with colored keys and icons
function prettyPrintSectionColored(obj: DisplayObject, indent = 2) {
    return Object.entries(obj)
        .map(([key, value]) => {
            const Icon = keyIconMap[key]?.icon;
            const color = keyIconMap[key]?.color || "text-blue-600";
            return (
                <span key={key} className="block">
                    {" ".repeat(indent)}
                    {Icon && <Icon className={`inline w-4 h-4 mr-1 align-text-bottom ${color}`} />}
                    <span className={`font-mono font-semibold ${color}`}>{key}:</span> <span className="font-mono">{value}</span>
                </span>
            );
        });
}

// Minimalist: no icons, no color, just bold keys
function prettyPrintMinimalist(obj: DisplayObject, indent = 2) {
    return Object.entries(obj).map(([key, value]) => (
        <span key={key} className="block">
            {" ".repeat(indent)}
            <span className="font-semibold">{key}:</span> <span className="font-mono">{value}</span>
        </span>
    ));
}

const styleOptions = [
    { label: "Classic", value: "classic" },
    { label: "Minimalist", value: "minimalist" },
];

// Helper function to get attendee emails
async function getAttendeeEmails(formData: FormData, staffList: StaffMember[], providerStaff: ProviderStaff[]) {
    const attendees: string[] = [];

    // Add counselor email
    const counselor = providerStaff.find(s => s.id === formData.counselor.staff);
    if (counselor?.email) {
        attendees.push(counselor.email);
    }

    // Add client email based on session type
    if (formData.client.sessionFor === 'organization') {
        // For organization sessions, use the organization contact person
        const staff = staffList.find(s => s.id === formData.client.staff);
        if (staff?.profile?.email) {
            attendees.push(staff.profile.email);
        }
    } else {
        // For staff sessions, use the staff member's email
        const staff = staffList.find(s => s.id === formData.client.staff);
        if (staff?.profile?.email) {
            attendees.push(staff.profile.email);
        }
    }

    return attendees;
}

// Helper function to create a valid date from date and time strings
function createValidDate(dateStr: string | undefined, timeStr: string | undefined): string {
    if (!dateStr || !timeStr) {
        throw new Error('Date and time are required');
    }

    console.log('Date string:', dateStr, 'Time string:', timeStr);

    // Parse the date string
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }

    // Parse the time string (handle 12-hour format)
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM|am|pm)?$/);
    if (!timeMatch) {
        throw new Error('Invalid time format');
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3]?.toUpperCase();

    // Convert 12-hour format to 24-hour format
    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    // Validate ranges
    if (hours < 0 || hours > 23) throw new Error('Invalid hours');
    if (minutes < 0 || minutes > 59) throw new Error('Invalid minutes');

    // Set the time on the date
    date.setHours(hours, minutes, 0, 0);

    // Validate the final date
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date or time values');
    }

    return date.toISOString();
}

// Helper function to add minutes to an ISO string and return a new ISO string
function addMinutesToISOString(isoString: string, minutes: number): string {
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
}

export function ReviewDetails({ formData, onConfirm }: { formData: FormData; onConfirm: () => void }) {
    const params = useParams();
    const { createEvent, isCreating: isCreatingEvent } = useCalendar();
    const { createMeeting, isCreating: isCreatingMeeting } = useMeetings();

    // State for fetched lists
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [dependants, setDependants] = useState<Dependant[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [providerStaff, setProviderStaff] = useState<ProviderStaff[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);

    // Style toggle state
    const [style, setStyle] = useState('classic');

    // Fetch staff and dependants if needed
    useEffect(() => {
        const { clientId, staff } = formData.client;
        if (clientId) {
            fetch(`/api/clients/${clientId}/staff`).then(res => res.json()).then(data => setStaffList(data.data || []));
            if (staff) {
                fetch(`/api/clients/${clientId}/staff/${staff}/beneficiaries`).then(res => res.json()).then(data => setDependants(data.data || []));
            }
        }
    }, [formData.client]);

    // Fetch providers and provider staff if needed
    useEffect(() => {
        fetch('/api/providers').then(res => res.json()).then(data => setProviders(data.data || []));
        if (formData.counselor.provider) {
            fetch(`/api/providers/${formData.counselor.provider}/staff`).then(res => res.json()).then(data => setProviderStaff(data.data || []));
        }
    }, [formData.counselor.provider]);

    // Fetch services and interventions if needed
    useEffect(() => {
        fetch('/api/services?limit=50').then(res => res.json()).then(data => setServices(data.data || []));
        if (formData.intervention.service) {
            fetch(`/api/services/interventions?serviceId=${formData.intervention.service}&limit=50`).then(res => res.json()).then(data => setInterventions(data.data || []));
        }
    }, [formData.intervention.service]);

    // Map IDs to names
    const staffName = staffList.find(s => s.id === formData.client.staff)?.profile?.fullName || staffList.find(s => s.id === formData.client.staff)?.name || formData.client.staff || "-";
    const dependantName = dependants.find(d => d.id === formData.client.dependant)?.name || formData.client.dependant || "-";
    const providerName = providers.find(p => p.id === formData.counselor.provider)?.name || formData.counselor.provider || "-";
    const providerStaffName = providerStaff.find(s => s.id === formData.counselor.staff)?.fullName || formData.counselor.staff || "-";
    const serviceName = services.find(s => s.id === formData.intervention.service)?.name || formData.intervention.service || "-";
    const interventionName = interventions.find(i => i.id === formData.intervention.intervention)?.name || formData.intervention.intervention || "-";
    const locationLabel = getLocationLabel(formData.location.location);

    // Build display objects for each section
    const clientDisplay: DisplayObject = {
        company: formData.client.company || "-",
        sessionFor: formData.client.sessionFor || "-",
        whoFor: formData.client.whoFor || "-",
        sessionType: formData.client.sessionType || "-",
        numAttendees: formData.client.numAttendees || "-",
        staff: staffName,
        dependant: dependantName,
        notes: formData.client.notes || "-",
    };
    const interventionDisplay: DisplayObject = {
        service: serviceName,
        intervention: interventionName,
        notes: formData.intervention.notes || "-",
    };
    const counselorDisplay: DisplayObject = {
        provider: providerName,
        providerStaff: providerStaffName,
        date: formData.counselor.date ? new Date(formData.counselor.date).toLocaleDateString() : "-",
        selectedSlot: formData.counselor.selectedSlot || "-",
        duration: formData.counselor.duration ? `${formData.counselor.duration} min` : "-",
    };
    const locationDisplay: DisplayObject = {
        location: locationLabel,
        requirements: formData.location.requirements || "-",
    };

    // Choose pretty print function
    function renderSection(obj: DisplayObject) {
        if (style === 'classic') return <>{prettyPrintSectionColored(obj)}</>;
        if (style === 'minimalist') return <>{prettyPrintMinimalist(obj)}</>;
        return <></>;
    }

    const handleConfirm = async () => {
        setIsConfirming(true);
        let meetingLink: string | undefined = formData.location.meetingLink;

        try {
            // Get attendee emails first
            const attendeeEmails = await getAttendeeEmails(formData, staffList, providerStaff);
            if (attendeeEmails.length === 0) {
                throw new Error('No valid attendees found for the meeting');
            }

            if (!formData.counselor.date || !formData.counselor.selectedSlot) {
                throw new Error('Date and time are required');
            }

            if (!formData.counselor.duration) {
                throw new Error('Session duration is required');
            }

            const startDateTime = createValidDate(String(formData.counselor.date), String(formData.counselor.selectedSlot));
            const durationMinutes = typeof formData.counselor.duration === 'string' ? parseInt(formData.counselor.duration) : formData.counselor.duration;
            const endDateTime = addMinutesToISOString(startDateTime, durationMinutes);

            // Generate meeting link if location is Teams or Zoom and no link exists
            let isTeamsMeeting = false;
            if ((formData.location.location === 'MS_TEAMS' || formData.location.location === 'ZOOM') && !meetingLink) {
                const meetingData: CreateMeetingData = {
                    subject: `Session with ${providerStaffName}`,
                    startDateTime,
                    endDateTime,
                    attendees: attendeeEmails,
                    platform: formData.location.location === 'MS_TEAMS' ? 'teams' : 'zoom',
                    body: `Session Details:\n- Service: ${formData.intervention.service}\n- Intervention: ${formData.intervention.intervention}\n- Location: ${formData.location.location}${formData.location.requirements ? `\nRequirements: ${formData.location.requirements}` : ''}${formData.client.notes ? `\nNotes: ${formData.client.notes}` : ''}`,
                };
                const meeting = await createMeeting.mutateAsync(meetingData);
                meetingLink = meeting.joinUrl;
                isTeamsMeeting = formData.location.location === 'MS_TEAMS';
            }

            // Create calendar event with attendees
            const eventData: CalendarEventData = {
                subject: `Session with ${providerStaffName}`,
                startDateTime,
                endDateTime,
                body: `Session Details:\n\nClient: ${formData.client?.company || 'N/A'}\nService: ${formData.intervention?.service || 'N/A'}\nProvider: ${formData.counselor?.provider || 'N/A'}\nLocation: ${formData.location?.location || 'N/A'}${formData.location?.location === 'MS_TEAMS' || formData.location?.location === 'ZOOM' ? `\nMeeting Link: ${meetingLink}` : ''}\n\nAdditional Notes:\n${formData.client?.notes || 'No additional notes provided.'}\n\nIf you have any questions, please contact the session organizer.`,
                location: (formData.location?.location === 'MS_TEAMS' || formData.location?.location === 'ZOOM') ? 'Virtual Meeting Room' : formData.location?.location || 'N/A',
                isOnlineMeeting: formData.location?.location === 'MS_TEAMS' || formData.location?.location === 'ZOOM',
                onlineMeetingUrl: (formData.location?.location === 'MS_TEAMS' || formData.location?.location === 'ZOOM') ? meetingLink : undefined,
                onlineMeetingProvider: formData.location?.location === 'MS_TEAMS' ? 'teamsForBusiness' : formData.location?.location === 'ZOOM' ? 'zoom' : undefined,
                attendees: attendeeEmails,
            };

            // Create calendar event with attendees
            const calendarData = {
                subject: eventData.subject,
                startDateTime: eventData.startDateTime,
                endDateTime: eventData.endDateTime,
                attendees: eventData.attendees,
                body: eventData.body,
                location: eventData.location,
                joinUrl: eventData.onlineMeetingUrl,
                isOnlineMeeting: eventData.isOnlineMeeting,
                onlineMeetingProvider: eventData.onlineMeetingProvider,
                onlineMeeting: eventData.onlineMeetingUrl ? {
                    joinUrl: eventData.onlineMeetingUrl
                } : undefined
            };

            await createEvent.mutateAsync(calendarData);
            onConfirm();
        } catch (error) {
            console.error('Error confirming session:', error);
            toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <form
                className="w-full bg-background rounded-sm p-8 border dark:border-gray-800 space-y-8"
                onSubmit={async (e) => {
                    e.preventDefault();
                    await handleConfirm();
                }}
            >
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Review Details</h2>
                {/* Style Toggle */}
                <div className="mb-4 flex items-center">
                    {styleOptions.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`px-3 py-1 border text-sm font-mono transition-colors ${style === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            onClick={() => setStyle(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Client Details</h3>
                    <pre className="bg-muted p-2 rounded text-sm font-mono text-gray-900 dark:text-gray-100" style={{ background: 'inherit', border: 'none', margin: 0, padding: 0 }}>{renderSection(clientDisplay)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Intervention</h3>
                    <pre className="bg-muted p-2 rounded text-sm font-mono text-gray-900 dark:text-gray-100" style={{ background: 'inherit', border: 'none', margin: 0, padding: 0 }}>{renderSection(interventionDisplay)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Counselor & Availability</h3>
                    <pre className="bg-muted p-2 rounded text-sm font-mono text-gray-900 dark:text-gray-100" style={{ background: 'inherit', border: 'none', margin: 0, padding: 0 }}>{renderSection(counselorDisplay)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Location</h3>
                    <pre className="bg-muted p-2 rounded text-sm font-mono text-gray-900 dark:text-gray-100" style={{ background: 'inherit', border: 'none', margin: 0, padding: 0 }}>{renderSection(locationDisplay)}</pre>
                </div>
                <div className="flex gap-4 justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isConfirming}
                    >
                        {isConfirming ? 'Confirming...' : 'Confirm Session'}
                    </button>
                </div>
            </form>
        </div>
    );
}