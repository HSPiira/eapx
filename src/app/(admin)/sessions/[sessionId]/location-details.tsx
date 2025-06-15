import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationData } from "./types";
import { MessageCircle, Video, Camera, Building, Briefcase, MapPin, Link2, Phone } from "lucide-react";

interface LocationDetailsProps {
    data: LocationData;
    setData: (d: LocationData) => void;
}

export const locationGroups = [
    {
        label: "Conferencing",
        options: [
            {
                value: "teams",
                label: "MS Teams",
                icon: MessageCircle,
                color: "text-indigo-600",
            },
            {
                value: "zoom",
                label: "Zoom",
                icon: Video,
                color: "text-blue-500",
            },
            {
                value: "google-meet",
                label: "Google Meet",
                icon: Camera,
                color: "text-green-600",
            },
        ],
    },
    {
        label: "In Person",
        options: [
            {
                value: "minet-office",
                label: "In Person (Minet Office)",
                icon: Building,
                color: "text-gray-700 dark:text-gray-200",
            },
            {
                value: "provider-office",
                label: "In Person (Provider Offices)",
                icon: Briefcase,
                color: "text-gray-700 dark:text-gray-200",
            },
        ],
    },
    {
        label: "Other",
        options: [
            {
                value: "custom-location",
                label: "Custom Attendee Location",
                icon: MapPin,
                color: "text-pink-600",
            },
            {
                value: "link-meeting",
                label: "Link meeting",
                icon: Link2,
                color: "text-blue-700",
            },
            {
                value: "phone-call",
                label: "Phone Call",
                icon: Phone,
                color: "text-green-700",
            },
        ],
    },
];

export function LocationDetails({ data, setData }: LocationDetailsProps) {
    const { location = '', requirements = '' } = data || {};

    const locations = locationGroups;
    const loadingLocations = false;

    const handleLocationChange = (newLocationId: string) => {
        setData({ ...data, location: newLocationId });
    };

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Location Details</h2>
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Location</Label>
                    <Select value={location} onValueChange={handleLocationChange}>
                        <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                            <SelectValue placeholder={loadingLocations ? "Loading locations..." : "Select location"} />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map(group => (
                                <div key={group.label}>
                                    <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">{group.label}</div>
                                    {group.options.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <opt.icon className={`inline w-4 h-4 mr-2 ${opt.color}`} />
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </div>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Special Requirements</Label>
                    <Textarea
                        className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background text-gray-900 dark:text-white"
                        placeholder="Any special requirements/accommodation needs."
                        value={requirements}
                        onChange={e => setData({ ...data, requirements: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}
