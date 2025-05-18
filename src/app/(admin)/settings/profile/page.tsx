'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Profile {
    id: string;
    fullName: string;
    preferredName?: string;
    email?: string;
    image?: string;
    phone?: string;
    about?: string;
}

const fetchProfile = async (): Promise<Profile> => {
    const res = await fetch('/api/auth/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
};

const updateProfile = async (data: Partial<Profile>) => {
    const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
};

const ProfilePage = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: fetchProfile,
        enabled: !!session?.user?.id,
    });

    const updateProfileMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsUpdating(false);
        },
        onError: (error) => {
            setError('Failed to update profile. Please try again.');
            setIsUpdating(false);
        },
    });

    const [formData, setFormData] = useState<Partial<Profile>>({
        fullName: '',
        preferredName: '',
        email: '',
        phone: '',
        about: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                preferredName: profile.preferredName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                about: profile.about || '',
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsUpdating(true);
        updateProfileMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage settings for your careAxis profile</p>

            <div className="flex items-center gap-4 mb-6">
                <img
                    src={profile?.image || session?.user?.image || 'https://i.pravatar.cc/100'}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                    <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded mr-2 bg-white dark:bg-black text-gray-700 dark:text-gray-200">Upload Avatar</button>
                    <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded text-red-500 bg-white dark:bg-black">Remove</button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Full name</label>
                    <Input
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Preferred name</label>
                    <Input
                        type="text"
                        value={formData.preferredName}
                        onChange={e => setFormData(prev => ({ ...prev, preferredName: e.target.value }))}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Email</label>
                    <div className="flex items-center gap-2 mb-1">
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="flex-1"
                        />
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded">Primary</span>
                        <button type="button" className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-700 dark:text-gray-200">+ Add Email</button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Phone</label>
                    <Input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">About</label>
                    <div className="border border-gray-300 dark:border-gray-700 rounded p-2 bg-gray-50 dark:bg-gray-900">
                        <div className="flex gap-2 mb-2">
                            <button type="button" className="px-1 text-gray-700 dark:text-gray-200"><b>B</b></button>
                            <button type="button" className="px-1 text-gray-700 dark:text-gray-200"><i>I</i></button>
                            <button type="button" className="px-1 text-gray-700 dark:text-gray-200">✎</button>
                        </div>
                        <Textarea
                            value={formData.about}
                            onChange={e => setFormData(prev => ({ ...prev, about: e.target.value }))}
                            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                            rows={4}
                        />
                    </div>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={isUpdating}
                    className={`mt-4 px-6 py-2 rounded ${isUpdating
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                        }`}
                >
                    {isUpdating ? (
                        <div className="flex items-center gap-2">
                            <LoadingSpinner className="w-4 h-4" />
                            <span>Updating...</span>
                        </div>
                    ) : (
                        'Update'
                    )}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;