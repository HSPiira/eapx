import { useEffect } from "react";
import { SelectContent } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InterventionData } from "./types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

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
    const queryClient = useQueryClient();

    // Prefetch all services and their interventions on mount
    useEffect(() => {
        // Prefetch services
        queryClient.prefetchQuery({
            queryKey: ['services'],
            queryFn: async () => {
                const res = await fetch('/api/services?limit=50');
                if (!res.ok) throw new Error('Failed to fetch services');
                return res.json();
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
        });

        // If we have a service, prefetch its interventions
        if (service) {
            queryClient.prefetchQuery({
                queryKey: ['interventions', service],
                queryFn: async () => {
                    const res = await fetch(`/api/services/interventions?serviceId=${service}&limit=50`);
                    if (!res.ok) throw new Error('Failed to fetch interventions');
                    return res.json();
                },
                staleTime: 5 * 60 * 1000,
                gcTime: 30 * 60 * 1000,
            });
        }
    }, [queryClient, service]);

    // If intervention is set but service is not, fetch intervention details to get serviceId
    useEffect(() => {
        if (intervention && !service) {
            (async () => {
                try {
                    const res = await fetch(`/api/services/interventions/${intervention}`);
                    if (!res.ok) throw new Error('Failed to fetch intervention details');
                    const interventionData = await res.json();
                    if (interventionData?.service?.id) {
                        setData({ ...data, service: interventionData.service.id, intervention });
                    }
                } catch (err) {
                    // Optionally show a toast or error
                }
            })();
        }
    }, [intervention, service, setData]);

    // Fetch services with caching and error handling
    const { data: servicesData, isLoading: loadingServices, error: servicesError } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await fetch('/api/services?limit=50');
            if (!res.ok) throw new Error('Failed to fetch services');
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Fetch interventions with caching and error handling
    const { data: interventionsData, isLoading: loadingInterventions, error: interventionsError } = useQuery({
        queryKey: ['interventions', service],
        queryFn: async () => {
            if (!service) return { data: [] };
            const res = await fetch(`/api/services/interventions?serviceId=${service}&limit=50`);
            if (!res.ok) throw new Error('Failed to fetch interventions');
            return res.json();
        },
        enabled: !!service,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Handle service change
    const handleServiceChange = (newServiceId: string) => {
        // Clear intervention when service changes
        setData({ ...data, service: newServiceId, intervention: '' });

        // Prefetch interventions for the new service
        queryClient.prefetchQuery({
            queryKey: ['interventions', newServiceId],
            queryFn: async () => {
                const res = await fetch(`/api/services/interventions?serviceId=${newServiceId}&limit=50`);
                if (!res.ok) throw new Error('Failed to fetch interventions');
                return res.json();
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
        });
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
            <div className="w-full flex items-start justify-start mt-6">
                <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                    <div className="text-center text-red-500">
                        <p>Error loading data. Please try again.</p>
                        <Button
                            onClick={() => {
                                // Retry loading data
                                queryClient.invalidateQueries({ queryKey: ['services'] });
                                if (service) {
                                    queryClient.invalidateQueries({ queryKey: ['interventions', service] });
                                }
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