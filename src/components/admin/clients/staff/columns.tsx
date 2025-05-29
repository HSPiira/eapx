'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle2, CircleOff } from "lucide-react";
import Link from "next/link";
import { WorkStatus } from "@prisma/client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Staff = {
    id: string;
    profile: {
        id: string;
        fullName: string;
        preferredName: string | null;
        email: string | null;
        phone: string | null;
        dob: Date | null;
        gender: string | null;
        address: string | null;
        nationality: string | null;
        bloodType: string | null;
        allergies: string[];
        medicalConditions: string[];
        dietaryRestrictions: string[];
        accessibilityNeeds: string[];
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        emergencyContactEmail: string | null;
        preferredLanguage: string | null;
        preferredContactMethod: string | null;
        metadata: Record<string, unknown>;
    };
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'OTHER';
    educationLevel: 'PRIMARY' | 'SECONDARY' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'OTHER';
    jobTitle: string;
    companyId: string;
    managementLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE' | 'OTHER';
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    startDate: Date;
    endDate: Date | null;
    status: WorkStatus;
    qualifications: string[];
    specializations: string[];
    preferredWorkingHours: Record<string, boolean>;
    metadata: Record<string, unknown>;
    client: {
        name: string;
    };
};

export const columns: ColumnDef<Staff>[] = [
    {
        accessorKey: "profile.fullName",
        header: "Name",
        cell: ({ row }) => row.original.profile.fullName,
    },
    {
        accessorKey: "profile.email",
        header: "Email",
        cell: ({ row }) => row.original.profile.email || '-',
    },
    {
        accessorKey: "profile.phone",
        header: "Phone",
        cell: ({ row }) => row.original.profile.phone || '-',
    },
    {
        accessorKey: "jobTitle",
        header: "Role",
        cell: ({ row }) => row.original.jobTitle || '-',
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return status === 'ACTIVE' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
                <CircleOff className="h-4 w-4 text-muted-foreground" />
            );
        },
    },
    {
        accessorKey: "client.name",
        header: "Organization",
        cell: ({ row }) => row.original.client?.name || '-',
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => row.original.startDate ? new Date(row.original.startDate).toLocaleDateString() : '-',
    },
    {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : '-',
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const staff = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(staff.id)}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/staff/${staff.id}`}>View details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/staff/${staff.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]; 