'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { StaffForm } from '@/app/(admin)/staff/_components/StaffForm';
import { Plus, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface StaffFormModalProps {
    clientId: string;
}

export function StaffFormModal({ clientId }: StaffFormModalProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (data: any) => {
        try {
            // First create the user and profile
            const userResponse = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    fullName: data.fullName,
                    phone: data.phone,
                }),
            });

            if (!userResponse.ok) {
                throw new Error('Failed to create user');
            }

            const userData = await userResponse.json();

            // Then create the staff record
            const staffResponse = await fetch('/api/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profileId: userData.profileId,
                    role: data.role,
                    qualifications: data.qualifications || [],
                    specializations: data.specializations || [],
                    emergencyContactName: data.emergencyContactName,
                    emergencyContactPhone: data.emergencyContactPhone,
                    emergencyContactEmail: data.emergencyContactEmail,
                    clientId,
                }),
            });

            if (!staffResponse.ok) {
                throw new Error('Failed to create staff member');
            }

            toast({
                title: "Success",
                description: "Staff member created successfully",
            });

            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error creating staff member:', error);
            toast({
                title: "Error",
                description: "Failed to create staff member",
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
                    <StaffForm onSubmit={handleSubmit} />
                </div>
                <DialogFooter className="">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="mr-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="staff-form"
                    >
                        Add Staff Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 