'use client';
import React, { useState, useEffect } from 'react';
import { ProviderStaffModal } from '@/components/admin/providers/provider-staff-modal';
import { useToast } from '@/components/ui/use-toast';
import { fetchProviders } from '@/api/providers';
import { fetchServices } from '@/api/services';
import { fetchInterventions } from '@/api/interventions';
import { useProviderStaff } from '@/hooks/providers/useProviderStaff';
import { ProviderStaff } from '@/types/provider-staff';

interface Provider {
    id: string;
    name: string;
    entityType: string;
}

interface CreateStaffInput {
    fullName: string;
    role: string | null;
    email: string | null;
    phone: string | null;
    serviceProviderId?: string;
    qualifications: string[];
    specializations: string[];
    isPrimaryContact: boolean;
}

interface UpdateStaffInput extends Partial<CreateStaffInput> {
    id: string;
}

export default function ProvidersStaffPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedStaff, setSelectedStaff] = useState<ProviderStaff | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [interventions, setInterventions] = useState<{ id: string; name: string; service: string }[]>([]);
    const [services, setServices] = useState<{ id: string; name: string }[]>([]);
    const { toast } = useToast();

    const {
        staff,
        isLoading: isLoadingStaff,
        error: staffError,
        createStaff,
        updateStaff,
        deleteStaff,
        isCreating,
        isUpdating,
        isDeleting
    } = useProviderStaff();

    // Debug logs
    useEffect(() => {
        if (providersData) {
            setProviders(providersData.data.map((p: any) => ({ id: p.id, name: p.name, entityType: p.entityType })));
        }
    }, [providersData]);

    useEffect(() => {
        if (interventionsData) {
            setInterventions(interventionsData.data.map((i: any) => ({ id: i.id, name: i.name, service: i.service.name })));
        }
    }, [interventionsData]);

    useEffect(() => {
        if (servicesData) {
            setServices(servicesData.data);
        }
    }, [servicesData]);

    useEffect(() => {
        async function fetchData() {
            try {
                const providersResponse = await fetchProviders();
                const allProviders = (providersResponse.data || [])
                    .map((p: Provider) => ({ id: p.id, name: p.name, entityType: p.entityType }));
                setProviders(allProviders);

                const interventionsResponse = await fetchInterventions();
                const interventions = (interventionsResponse.data || [])
                    .map((i) => ({
                        id: i.id,
                        name: i.name,
                        service: i.service.name,
                    }));
                setInterventions(interventions);

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
        fetchData();
    }, [toast]);

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
        setFormError(null);
        try {
            const staffProviderId = data.serviceProviderId || selectedStaff?.serviceProviderId;
            if (!staffProviderId) throw new Error('Provider is required');

            if (modalMode === 'add') {
                const createData: CreateStaffInput = {
                    fullName: data.fullName || '',
                    role: data.role || null,
                    email: data.email || null,
                    phone: data.phone || null,
                    serviceProviderId: staffProviderId,
                    qualifications: data.qualifications || [],
                    specializations: data.specializations || [],
                    isPrimaryContact: data.isPrimaryContact || false,
                };
                await createStaff({ providerId: staffProviderId, data: createData });
                toast({ title: 'Success', description: 'Staff added.' });
            } else if (modalMode === 'edit' && selectedStaff) {
                const updateData: UpdateStaffInput = {
                    id: selectedStaff.id,
                    fullName: data.fullName || selectedStaff.fullName,
                    role: data.role || selectedStaff.role,
                    email: data.email || selectedStaff.email,
                    phone: data.phone || selectedStaff.phone,
                    serviceProviderId: staffProviderId,
                    qualifications: data.qualifications || selectedStaff.qualifications,
                    specializations: data.specializations || selectedStaff.specializations,
                    isPrimaryContact: data.isPrimaryContact || selectedStaff.isPrimaryContact,
                };
                await updateStaff({ providerId: staffProviderId, data: updateData });
                toast({ title: 'Success', description: 'Staff updated.' });
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Error submitting staff:', error);
            setFormError(error instanceof Error ? error.message : 'An unexpected error occurred');
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'An unexpected error occurred',
                variant: 'destructive'
            });
        }
    };

    const handleRemove = async (id: string, serviceProviderId: string) => {
        try {
            await deleteStaff({ providerId: serviceProviderId, id });
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

    if (staffError) {
        return (
            <div className="text-red-500">
                Error loading staff: {staffError instanceof Error ? staffError.message : 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Provider Staff</h1>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    onClick={handleAdd}
                >
                    Add Staff
                </button>
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
                        {isLoadingStaff ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center">Loading staff...</td>
                            </tr>
                        ) : staff.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center">No staff members found</td>
                            </tr>
                        ) : staff.map((member: ProviderStaff) => {
                            const provider = providers.find(p => p.id === member.serviceProviderId);
                            return (
                                <tr key={member.id} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{provider ? provider.name : ''}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{member.fullName}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{member.role}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{member.email}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700">{member.status || ''}</td>
                                    <td className="p-2 border border-gray-200 dark:border-gray-700 space-x-2">
                                        <button
                                            className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700"
                                            onClick={() => handleEdit(member)}
                                            disabled={isUpdating}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-700"
                                            onClick={() => handleRemove(member.id, member.serviceProviderId!)}
                                            disabled={isDeleting}
                                        >
                                            Remove
                                        </button>
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
                isSubmitting={isCreating || isUpdating}
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