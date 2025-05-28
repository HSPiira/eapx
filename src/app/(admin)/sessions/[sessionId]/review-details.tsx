import { useEffect, useState } from "react";
import { FormData } from "./types";
import { locationGroups } from "./location-details";
import { Building, User, Users, FileText, ClipboardList, Briefcase, MapPin, MessageCircle, Video, Camera, Link2, Phone, Calendar, Clock4 } from "lucide-react";

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
function prettyPrintSectionColored(obj: Record<string, any>, indent = 2) {
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
function prettyPrintMinimalist(obj: Record<string, any>, indent = 2) {
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

export function ReviewDetails({ formData, onConfirm }: { formData: FormData; onConfirm: () => void }) {
    // State for fetched lists
    const [staffList, setStaffList] = useState<any[]>([]);
    const [dependants, setDependants] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [providerStaff, setProviderStaff] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [interventions, setInterventions] = useState<any[]>([]);
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
    }, [formData.client.clientId, formData.client.staff]);

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
    const clientDisplay = {
        company: formData.client.company || "-",
        sessionFor: formData.client.sessionFor || "-",
        whoFor: formData.client.whoFor || "-",
        sessionType: formData.client.sessionType || "-",
        numAttendees: formData.client.numAttendees || "-",
        staff: staffName,
        dependant: dependantName,
        notes: formData.client.notes || "-",
    };
    const interventionDisplay = {
        service: serviceName,
        intervention: interventionName,
        notes: formData.intervention.notes || "-",
    };
    const counselorDisplay = {
        provider: providerName,
        providerStaff: providerStaffName,
        date: formData.counselor.date ? new Date(formData.counselor.date).toLocaleDateString() : "-",
        selectedSlot: formData.counselor.selectedSlot || "-",
        duration: formData.counselor.duration ? `${formData.counselor.duration} min` : "-",
    };
    const locationDisplay = {
        location: locationLabel,
        requirements: formData.location.requirements || "-",
    };

    // Choose pretty print function
    function renderSection(obj: Record<string, any>) {
        if (style === 'classic') return <>{prettyPrintSectionColored(obj)}</>;
        if (style === 'minimalist') return <>{prettyPrintMinimalist(obj)}</>;
        return <></>;
    }

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <form
                className="w-full bg-background rounded-sm p-8 border dark:border-gray-800 space-y-8"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setIsConfirming(true);
                    try {
                        await onConfirm();
                    } catch (error) {
                        console.error('Error confirming session:', error);
                        alert(error instanceof Error ? error.message : 'Failed to confirm session');
                    } finally {
                        setIsConfirming(false);
                    }
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