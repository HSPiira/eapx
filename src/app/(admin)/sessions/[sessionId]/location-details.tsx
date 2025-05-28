import { Label } from "@/components/ui/label";
import { SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationData } from "./types";

interface LocationDetailsProps {
    data: LocationData;
    setData: (d: LocationData) => void;
}

export function LocationDetails({ data, setData }: LocationDetailsProps) {
    const { location = '', requirements = '' } = data || {};
    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Location</h2>
                {/* Location Combobox */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Location</Label>
                    <Select value={location} onValueChange={v => setData({ ...data, location: v })}>
                        <SelectTrigger className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">Conferencing</div>
                            <SelectItem value="teams">MS Teams</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="google-meet">Google Meet</SelectItem>
                            <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">In Person</div>
                            <SelectItem value="minet-office">In Person (Minet Office)</SelectItem>
                            <SelectItem value="provider-office">In Person (Provider Offices)</SelectItem>
                            <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">Other</div>
                            <SelectItem value="custom-location">Custom Attendee Location</SelectItem>
                            <SelectItem value="link-meeting">Link meeting</SelectItem>
                            <SelectItem value="phone-call">Phone Call</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Special Requirements */}
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
