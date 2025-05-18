'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

interface ProfileFormData {
    fullName: string;
    preferredName: string;
    email: string;
    phone: string;
    about: string;
    avatar: File | null;
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
    const [formData, setFormData] = useState<ProfileFormData>({
        fullName: '',
        preferredName: '',
        email: '',
        phone: '',
        about: '',
        avatar: null,
    });

    const { data: profile, isLoading, error: fetchError } = useQuery({
        queryKey: ['profile'],
        queryFn: fetchProfile,
        enabled: !!session?.user?.id,
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                preferredName: profile.preferredName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                about: profile.about || '',
                avatar: null,
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            setIsUpdating(true);
            await updateProfile(formData);
            await queryClient.invalidateQueries({ queryKey: ['profile'] });
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">Failed to load profile data</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage settings for your careAxis profile</p>

            <div className="flex items-center gap-4 mb-6">
                <Image
                    src={profile?.image || session?.user?.image || 'https://i.pravatar.cc/100'}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                    width={48}
                    height={48}
                />
                <div>
                    <label
                        htmlFor="avatar-upload"
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded mr-2 bg-white dark:bg-black text-gray-700 dark:text-gray-200 cursor-pointer"
                    >
                        Upload Avatar
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFormData(prev => ({ ...prev, avatar: file }));
                                }
                            }}
                        />
                    </label>
                    <button
                        type="button"
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded text-red-500 bg-white dark:bg-black"
                        onClick={() => {
                            // Reset avatar in state (and optionally call API)  
                            setFormData(prev => ({ ...prev, avatar: null }));
                        }}
                    >
                        Remove
                    </button>
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
                            <button
                                type="button"
                                className="px-1 text-gray-700 dark:text-gray-200"
                                onClick={() => {
                                    const textarea = document.querySelector('textarea');
                                    if (!textarea) return;
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = formData.about;
                                    if (start === end) return;
                                    const newText =
                                        text.substring(0, start) +
                                        '**' +
                                        text.substring(start, end) +
                                        '**' +
                                        text.substring(end);
                                    setFormData(prev => ({ ...prev, about: newText }));
                                }}
                                title="Bold"
                            >
                                <b>B</b>
                            </button>
                            <button
                                type="button"
                                className="px-1 text-gray-700 dark:text-gray-200"
                                onClick={() => {
                                    const textarea = document.querySelector('textarea');
                                    if (!textarea) return;
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = formData.about;
                                    if (start === end) return;
                                    const newText =
                                        text.substring(0, start) +
                                        '*' +
                                        text.substring(start, end) +
                                        '*' +
                                        text.substring(end);
                                    setFormData(prev => ({ ...prev, about: newText }));
                                }}
                                title="Italic"
                            >
                                <i>I</i>
                            </button>
                            <button
                                type="button"
                                className="px-1 text-gray-700 dark:text-gray-200"
                                onClick={() => {
                                    // Focus the textarea for editing  
                                    document.querySelector('textarea')?.focus();
                                }}
                                title="Edit"
                            >
                                ✎
                            </button>
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