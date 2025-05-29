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
import { StaffForm } from '@/components/admin/clients/staff/staff-form';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { StaffFormValues } from '@/components/admin/clients/staff/staff-form';

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
            // Create staff directly with user/profile creation
            const staffRes = await fetch(`/api/clients/${clientId}/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // User/Profile fields
                    email: data.email,
                    fullName: data.fullName,
                    phone: data.phone,
                    preferredName: data.fullName,
                    dob: data.dob,
                    gender: data.gender,
                    emergencyContactName: data.emergencyContactName,
                    emergencyContactPhone: data.emergencyContactPhone,
                    nationality: data.nationality,
                    idNumber: data.idNumber,
                    passportNumber: data.passportNumber,
                    idType: data.idType,
                    allergies: data.allergies,
                    medicalConditions: data.medicalConditions,
                    dietaryRestrictions: data.dietaryRestrictions,
                    accessibilityNeeds: data.accessibilityNeeds,
                    metadata: {
                        clientId: clientId,
                    },

                    // Staff fields
                    jobTitle: data.jobTitle,
                    managementLevel: data.managementLevel,
                    maritalStatus: data.maritalStatus,
                    startDate: data.startDate || new Date().toISOString(),
                    endDate: data.endDate,
                    status: data.status,
                    qualifications: data.qualifications,
                    specializations: data.specializations,
                    preferredWorkingHours: data.preferredWorkingHours,
                    employmentType: data.employmentType,
                    educationLevel: data.educationLevel,
                }),
            });

            if (!staffRes.ok) {
                const error = await staffRes.json();
                throw new Error(error.error || 'Failed to create staff member');
            }

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
                <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                        staff={{ companyId: clientId }}
                        onSubmit={handleSubmit}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
} 