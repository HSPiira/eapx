'use client';
import React, { useState, useEffect } from 'react';
import { ProviderStaffModal } from '@/components/admin/providers/provider-staff-modal';
import { useToast } from '@/components/ui/use-toast';

interface Provider {
    id: string;
    name: string;
    entityType: string;
}

interface StaffMember {
    id: string;
    providerId?: string;
    serviceProviderId?: string;
    fullName: string;
    role: string;
    email: string;
    status?: string;
}

export default function ProvidersStaffPage() {
    // Replace with actual providerId from context/router as needed
    const providerId = '1';
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [formError, setFormError] = useState<string | null>(null);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [interventions, setInterventions] = useState<{ id: string; name: string; service: string }[]>([]);
    const [services, setServices] = useState<{ id: string; name: string }[]>([]);

    // Fetch staff and providers from API
    React.useEffect(() => {
        async function fetchStaffAndProviders() {
            // Fetch all providers
            let allProviders: Provider[] = [];
            try {
                const res = await fetch('/api/providers');
                const json = await res.json();
                allProviders = (json.data || []).map((p: Provider) => ({ id: p.id, name: p.name, entityType: p.entityType }));
                setProviders(allProviders);
            } catch (error) {
                console.error('Error fetching providers:', error);
                setProviders([]);
            }
            // Fetch staff
            try {
                const res = await fetch(`/api/providers/staff`);
                const json = await res.json();
                console.log('Fetched staff:', json);
                setStaff(json.data || []);
            } catch (error) {
                console.error('Error fetching staff:', error);
                setStaff([]);
            }
        }
        fetchStaffAndProviders();
    }, [providerId]);

    useEffect(() => {
        async function fetchData() {
            // Fetch company-type providers
            try {
                const res = await fetch('/api/providers');
                const json = await res.json();
                const companyProviders = (json.data || [])
                    .map((p: Provider) => ({ id: p.id, name: p.name, entityType: p.entityType }));
                setProviders(companyProviders);
            } catch (error) {
                console.error('Error fetching providers:', error);
                setProviders([]);
            }
            // Fetch interventions
            try {
                const res = await fetch('/api/services/interventions?limit=200');
                const json = await res.json();
                const interventions = (json.data || [])
                    .map((i: { id: string; name: string; service: string }) => ({ id: i.id, name: i.name, service: i.service }));
                setInterventions(interventions);
            } catch (error) {
                console.error('Error fetching interventions:', error);
                setInterventions([]);
            }
            // Fetch services
            try {
                const res = await fetch('/api/services?limit=200');
                const json = await res.json();
                setServices(json.data || []);
            } catch (error) {
                console.error('Error fetching services:', error);
                setServices([]);
            }
        }
        fetchData();
    }, []);

    const handleAdd = () => {
        setSelectedStaff(null);
        setModalMode('add');
        setModalOpen(true);
    };

    const handleEdit = (member: StaffMember) => {
        setSelectedStaff(member);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleSubmit = async (data: Partial<StaffMember>) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            let res;
            const staffProviderId = data.providerId || providerId;
            if (modalMode === 'add') {
                res = await fetch(`/api/providers/${staffProviderId}/staff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } else if (modalMode === 'edit' && selectedStaff) {
                res = await fetch(`/api/providers/${staffProviderId}/staff/${selectedStaff.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            }
            if (res && !res.ok) {
                let errorData: { error?: string } = {};
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    errorData = await res.json();
                }
                setFormError(errorData.error || 'Failed to save staff');
                toast({ title: 'Error', description: errorData.error || 'Failed to save staff', variant: 'destructive' });
                return;
            }
            // Refresh staff list
            const refreshed = await fetch(`/api/providers/${staffProviderId}/staff`);
            let json: { data?: StaffMember[] } = {};
            const contentType = refreshed.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                json = await refreshed.json();
            }
            setStaff(json.data || []);
            setModalOpen(false);
            toast({ title: 'Success', description: modalMode === 'add' ? 'Staff added.' : 'Staff updated.' });
        } catch (error) {
            console.error('Error submitting staff:', error);
            setFormError('An unexpected error occurred');
            toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            const res = await fetch(`/api/providers/${providerId}/staff/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errorData = await res.json();
                toast({ title: 'Error', description: errorData.error || 'Failed to remove staff', variant: 'destructive' });
                return;
            }
            const refreshed = await fetch(`/api/providers/${providerId}/staff`);
            const json = await refreshed.json();
            setStaff(json.data || []);
            toast({ title: 'Success', description: 'Staff removed.' });
        } catch (error) {
            console.error('Error removing staff:', error);
            toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
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
                        {staff.map((member: StaffMember) => {
                            // Find the provider name for this staff member
                            const provider = providers.find(p => p.id === (member.providerId || member.serviceProviderId));
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