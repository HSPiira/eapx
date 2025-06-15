'use client';
import React, { useState, useEffect } from 'react';
import { ProviderStaffModal } from '@/components/admin/providers/provider-staff-modal';
import { useToast } from '@/components/ui/use-toast';
import { useParams } from 'next/navigation';
import { fetchProviders } from '@/api/providers';
import { fetchServices } from '@/api/services';
import { fetchInterventions } from '@/api/interventions';
import { fetchProviderStaff, createProviderStaff, updateProviderStaff, deleteProviderStaff } from '@/api/provider-staff';
import { ProviderStaff } from '@/types/provider-staff';

interface Provider {
    id: string;
    name: string;
    entityType: string;
}

export default function ProvidersStaffPage() {
    const params = useParams();
    const providerId = params.id as string;
    const [staff, setStaff] = useState<ProviderStaff[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedStaff, setSelectedStaff] = useState<ProviderStaff | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [formError, setFormError] = useState<string | null>(null);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [interventions, setInterventions] = useState<{ id: string; name: string; service: string }[]>([]);
    const [services, setServices] = useState<{ id: string; name: string }[]>([]);

    // Fetch staff and providers from API
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch providers
                const providersResponse = await fetchProviders();
                const allProviders = (providersResponse.data || [])
                    .map((p: Provider) => ({ id: p.id, name: p.name, entityType: p.entityType }));
                setProviders(allProviders);

                // Fetch staff for this provider
                const staffResponse = await fetchProviderStaff(providerId);
                setStaff(staffResponse.data || []);

                // Fetch interventions
                const interventionsResponse = await fetchInterventions();
                const interventions = (interventionsResponse.data || [])
                    .map((i) => ({
                        id: i.id,
                        name: i.name,
                        service: i.service.name,
                    }));
                setInterventions(interventions);

                // Fetch services
                const servicesResponse = await fetchServices();
                setServices(servicesResponse.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to fetch data. Please try again.',
                    variant: 'destructive'
                });
            }
        }

        if (providerId) {
            fetchData();
        }
    }, [providerId, toast]);

    if (!providerId) {
        return <div className="text-red-500">Invalid provider ID</div>;
    }

    const handleAdd = () => {
        setSelectedStaff(null);
        setModalMode('add');
        setModalOpen(true);
    };

    const handleEdit = (member: ProviderStaff) => {
        setSelectedStaff(member);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleSubmit = async (data: Partial<ProviderStaff>) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            const staffProviderId = data.id || providerId;
            if (modalMode === 'add') {
                await createProviderStaff(staffProviderId, data as any);
            } else if (modalMode === 'edit' && selectedStaff) {
                await updateProviderStaff(staffProviderId, { ...data, id: selectedStaff.id });
            }

            // Refresh staff list
            const refreshed = await fetchProviderStaff(staffProviderId);
            setStaff(refreshed.data || []);
            setModalOpen(false);
            toast({ title: 'Success', description: modalMode === 'add' ? 'Staff added.' : 'Staff updated.' });
        } catch (error) {
            console.error('Error submitting staff:', error);
            setFormError(error instanceof Error ? error.message : 'An unexpected error occurred');
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'An unexpected error occurred',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await deleteProviderStaff(providerId, id);
            const refreshed = await fetchProviderStaff(providerId);
            setStaff(refreshed.data || []);
            toast({ title: 'Success', description: 'Staff removed.' });
        } catch (error) {
            console.error('Error removing staff:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'An unexpected error occurred',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Provider Staff</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800" onClick={handleAdd}>Add Staff</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Provider</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Name</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Role</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Email</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Status</th>
                            <th className="p-2 border border-gray-200 dark:border-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((member: ProviderStaff) => {
                            // Find the provider name for this staff member
                            const provider = providers.find(p => p.id === (member.id));
                            return (
                                <tr key={member.id} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{provider ? provider.name : ''}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{member.fullName}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{member.role}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{member.email}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{member.status || ''}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700 space-x-2">
                                        <button className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700" onClick={() => handleEdit(member)}>Edit</button>
                                        <button className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-700" onClick={() => handleRemove(member.id)}>Remove</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <ProviderStaffModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                initialData={selectedStaff || undefined}
                mode={modalMode}
                error={formError}
                providers={providers}
                interventions={interventions}
                services={services}
            />
        </div>
    );
} 