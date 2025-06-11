import { useEffect } from "react";
import { SelectContent } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InterventionData } from "./types";
import { useServices } from "@/hooks/services";
import { useInterventions } from "@/hooks/interventions";
import { useInterventionDetails } from "@/hooks/interventions/useInterventionDetails";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Service {
    id: string;
    name: string;
}

interface Intervention {
    id: string;
    name: string;
    serviceId: string;
}

interface InterventionDetailsProps {
    data: InterventionData;
    setData: (d: InterventionData) => void;
}

export function InterventionDetails({ data, setData }: InterventionDetailsProps) {
    const { service = '', intervention = '', notes = '' } = data || {};

    // Use hooks for services and interventions
    const { data: servicesData, isLoading: loadingServices, error: servicesError } = useServices();
    const { data: interventionsData, isLoading: loadingInterventions, error: interventionsError } = useInterventions();
    const { data: interventionDetails } = useInterventionDetails(intervention);

    // Update service when intervention details are loaded
    useEffect(() => {
        if (interventionDetails?.service?.id && !service) {
            setData({ ...data, service: interventionDetails.service.id, intervention });
        }
    }, [interventionDetails, service, intervention, setData, data]);

    // Handle service change
    const handleServiceChange = (newServiceId: string) => {
        setData({ ...data, service: newServiceId, intervention: '' });
    };

    // Reset intervention if not in new list
    useEffect(() => {
        if (intervention && interventionsData?.data) {
            const interventionExists = interventionsData.data.find((i: Intervention) => i.id === intervention);
            if (!interventionExists) {
                setData({ ...data, intervention: '' });
            }
        }
    }, [interventionsData?.data, intervention, data, setData]);

    // Show error states
    if (servicesError || interventionsError) {
        return (
            <div className="w-full flex items-start justify-start">
                <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                    <div className="text-center text-red-500">
                        <p>Error loading data. Please try again.</p>
                        <Button
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="mt-4"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const services = servicesData?.data || [];
    const interventions = interventionsData?.data || [];

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Intervention Details</h2>
                {/* Service */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Service</Label>
                    <Select value={service} onValueChange={handleServiceChange}>
                        <SelectTrigger
                            className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                            <SelectValue placeholder={loadingServices ? "Loading services..." : "Select service"} />
                        </SelectTrigger>
                        <SelectContent>
                            {services.map((s: Service) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Intervention */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Intervention</Label>
                    <Select value={intervention} onValueChange={v => setData({ ...data, intervention: v })} disabled={!service}>
                        <SelectTrigger
                            className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background">
                            <SelectValue placeholder={loadingInterventions ? "Loading interventions..." : "Select intervention"} />
                        </SelectTrigger>
                        <SelectContent>
                            {interventions.map((i: Intervention) => (
                                <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Notes */}
                <div className="space-y-1">
                    <Label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Notes</Label>
                    <Textarea
                        className="w-full border dark:border-gray-700 rounded-sm px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition bg-background text-gray-900 dark:text-white"
                        placeholder="Add intervention notes..." value={notes} onChange={e => setData({ ...data, notes: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}