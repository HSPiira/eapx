import { CheckCircle } from "lucide-react";
import { Calendar, MapPin } from "lucide-react";
import { Clock4, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarItems = [
    { key: 'client-setup', label: 'Client Details', icon: Link2, description: 'Client and session information' },
    { key: 'intervention', label: 'Intervention', icon: Clock4, description: 'Select intervention and service' },
    { key: 'counselor-availability', label: 'Counselor Availability', icon: Calendar, description: 'Choose counselor, date, and time' },
    { key: 'location', label: 'Location', icon: MapPin, description: 'Set location and special requirements' },
    { key: 'review', label: 'Review', icon: CheckCircle, description: 'Review and confirm' },
];

export function Sidebar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
    const router = useRouter();

    const handleSelect = (key: string) => {
        onSelect(key);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', key);
        router.push(url.toString());
    };

    return (
        <nav className="hidden lg:block w-64 h-full pt-6 pr-2">
            {sidebarItems.map((item) => {
                const SelectedIcon = item.icon;
                const isSelected = selected === item.key;
                return (
                    <div
                        key={item.key}
                        className={
                            isSelected
                                ? 'flex items-start px-2 py-1.5 mb-1 cursor-pointer rounded-sm bg-gray-100 dark:bg-gray-800'
                                : 'flex items-start px-2 py-1.5 mb-1 cursor-pointer rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }
                        onClick={() => handleSelect(item.key)}
                    >
                        <SelectedIcon className="w-4 h-4 mr-3 text-gray-700 dark:text-gray-300 mt-0.5" />
                        <div className="flex-1">
                            <div className={isSelected ? 'font-semibold text-sm text-gray-900 dark:text-white' : 'font-semibold text-sm text-gray-900 dark:text-gray-100'}>{item.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}

export function TabBar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
    const router = useRouter();

    const handleSelect = (key: string) => {
        onSelect(key);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', key);
        router.push(url.toString());
    };

    return (
        <nav className="flex lg:hidden border-b bg-white px-2 overflow-x-auto">
            {sidebarItems.map((item) => {
                const SelectedIcon = item.icon;
                const isSelected = selected === item.key;
                return (
                    <button
                        key={item.key}
                        className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${isSelected ? 'border-blue-500 text-blue-700 bg-gray-100' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => handleSelect(item.key)}
                    >
                        <SelectedIcon className="w-4 h-4 mr-1" />
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
}