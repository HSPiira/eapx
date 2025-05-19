'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { StaffRole, WorkStatus } from "@prisma/client";

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
    fullName: string;
    email: string | null;
    role: StaffRole;
    status: WorkStatus;
    startDate: string;
    client: {
        name: string;
    };
};

export const columns: ColumnDef<Staff>[] = [
    {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => {
            return (
                <Link
                    href={`/staff/${row.original.id}`}
                    className="font-medium hover:underline"
                >
                    {row.getValue("fullName")}
                </Link>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            return (
                <Badge variant="secondary">
                    {row.getValue("role")}
                </Badge>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as WorkStatus;
            return (
                <Badge variant={status === WorkStatus.ACTIVE ? "default" : "secondary"}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "client.name",
        header: "Organization",
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => {
            return new Date(row.getValue("startDate")).toLocaleDateString();
        },
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