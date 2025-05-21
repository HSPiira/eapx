'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { StaffForm } from '@/app/(admin)/staff/_components/StaffForm';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { StaffFormValues } from '@/app/(admin)/staff/_components/StaffForm';

interface StaffFormModalProps {
    clientId: string;
    onClose: () => void;
}

export function StaffFormModal({ clientId }: StaffFormModalProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (data: StaffFormValues) => {
        try {
            // 1. Check if user exists by email
            const userCheckRes = await fetch(`/api/users?email=${encodeURIComponent(data.email)}`);
            let user, profileId;

            if (userCheckRes.ok) {
                const existing = await userCheckRes.json();
                if (existing && existing.id && existing.profileId) {
                    // User exists, update profile
                    user = existing;
                    profileId = existing.profileId;

                    await fetch(`/api/profiles/${profileId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fullName: data.fullName,
                            phone: data.phone,
                            // ...other profile fields as needed
                        }),
                    });
                }
            }

            // 2. If user does not exist, create user (and profile)
            if (!user || !profileId) {
                const userRes = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: data.email,
                        fullName: data.fullName,
                        phone: data.phone,
                        // ...other user/profile fields as needed
                    }),
                });
                const newUser = await userRes.json();
                if (!newUser.id || !newUser.profileId) throw new Error('User/Profile creation failed');
                user = newUser;
                profileId = newUser.profileId;
            }

            // 3. Create staff
            const staffRes = await fetch(`/api/clients/${clientId}/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle: data.jobTitle,
                    managementLevel: data.managementLevel,
                    maritalStatus: data.maritalStatus,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: data.status,
                    qualifications: data.qualifications,
                    specializations: data.specializations,
                    preferredWorkingHours: data.preferredWorkingHours,
                    profileId,
                    userId: user.id,
                    // ...other staff fields as needed
                }),
            });

            if (!staffRes.ok) throw new Error('Staff creation failed');

            toast({
                title: "Success",
                description: "Staff member created successfully",
            });
            setOpen(false);
            router.refresh();
        } catch (error: Error | unknown) {
            console.error('Error creating staff member:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create staff member",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Staff Member</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new staff member to your organization.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <StaffForm
                        onSubmit={handleSubmit}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
} 