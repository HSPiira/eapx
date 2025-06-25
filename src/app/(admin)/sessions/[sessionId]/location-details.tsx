import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationData } from "./types";
import { MessageCircle, Video, Camera, Building, Briefcase, MapPin, Link2, Phone, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { createMeeting } from "@/api/meetings";
import { toast } from "sonner";

interface LocationDetailsProps {
    data: LocationData;
    setData: (d: LocationData) => void;
}

export const locationGroups = [
    {
        label: "Conferencing",
        options: [
            {
                value: "MS_TEAMS",
                label: "MS Teams",
                icon: MessageCircle,
                color: "text-indigo-600",
            },
            {
                value: "ZOOM",
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
    const { data: session } = useSession();
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);

    const locations = locationGroups;
    const loadingLocations = false;

    const handleLocationChange = async (newLocationId: string) => {
        setData({ ...data, location: newLocationId, meetingLink: undefined }); // Clear meeting link when location changes
        if (newLocationId === 'MS_TEAMS' || newLocationId === 'ZOOM') {
            await handleGenerateMeetingLink(newLocationId);
        }
    };

    const handleGenerateMeetingLink = async (overrideLocation?: string) => {
        const selectedLocation = overrideLocation || location;
        if (!session?.user?.access_token) {
            toast.error('No access token found. Please sign in again.');
            return;
        }

        setIsGeneratingLink(true);
        try {
            // Prepare meeting times (ISO8601)
            const startDateTime = new Date().toISOString();
            const endDateTime = new Date(Date.now() + 60 * 60000).toISOString(); // 60 minutes duration

            const meetingData = {
                subject: 'Session Meeting',
                startDateTime,
                endDateTime,
                attendees: [], // We'll add attendees later when confirming the session
                platform: selectedLocation === 'MS_TEAMS' ? 'teams' as const : 'zoom' as const,
                body: 'Session meeting details will be added when confirming the session.',
                location: `Virtual Meeting Room (${selectedLocation === 'MS_TEAMS' ? 'MS Teams' : 'Zoom'})`,
                ...(selectedLocation === 'ZOOM' && {
                    settings: {
                        hostVideo: true,
                        participantVideo: true,
                        joinBeforeHost: false,
                        muteUponEntry: true,
                        waitingRoom: false,
                        meetingAuthentication: false
                    }
                })
            };

            const meeting = await createMeeting(meetingData, session.user.access_token);
            if (!meeting.joinUrl) {
                throw new Error(`${selectedLocation === 'MS_TEAMS' ? 'Teams' : 'Zoom'} meeting was created but no join link was returned.`);
            }

            setData({ ...data, meetingLink: meeting.joinUrl, location: selectedLocation });
            toast.success(`${selectedLocation === 'MS_TEAMS' ? 'Teams' : 'Zoom'} meeting link generated successfully!`);
        } catch (error) {
            console.error('Meeting link generation error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate meeting link');
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const isVirtualMeeting = location === 'MS_TEAMS' || location === 'ZOOM';

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Location Details</h2>
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Location</Label>
                    <div className="flex gap-2">
                        <div className="flex-1">
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
                        {isGeneratingLink && (
                            <div className="flex items-center text-blue-600 text-xs ml-2">
                                <span className="animate-spin mr-2">⟳</span> Generating link...
                            </div>
                        )}
                    </div>
                    {data.meetingLink && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-300 w-full max-w-full sm:max-w-[400px] md:max-w-[600px] lg:max-w-[880px] overflow-hidden">
                            <div className="flex items-center gap-2 w-full max-w-full overflow-hidden">
                                <Link className="w-4 h-4 flex-shrink-0" />
                                <a
                                    href={data.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-600 dark:text-blue-400 hover:underline truncate min-w-0 flex-1"
                                    title={data.meetingLink}
                                >
                                    {data.meetingLink}
                                </a>
                            </div>
                        </div>
                    )}
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
