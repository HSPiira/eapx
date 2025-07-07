'use client'

import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle2, CircleOff } from "lucide-react";
import Link from "next/link";
import { StaffApiResponse } from "@/types/staff";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the Column type from DataTable
type Column<T> = {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    cell?: (item: T) => React.ReactNode;
};

const columns: Column<StaffApiResponse>[] = [
    {
        header: "Name",
        accessor: "name",
    },
    {
        header: "Email",
        accessor: "email",
        cell: (item) => item.email || '-',
    },
    {
        header: "Role",
        accessor: "jobTitle",
        cell: (item) => item.jobTitle || '-',
    },
    {
        header: "Status",
        accessor: (item: StaffApiResponse) => {
            const status = item.status;
            return status === 'ACTIVE' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
                <CircleOff className="h-4 w-4 text-muted-foreground" />
            );
        },
    },
    {
        header: "Organization",
        accessor: (item: StaffApiResponse) => item.client?.name || '-',
    },
    {
        header: "Start Date",
        accessor: (item: StaffApiResponse) => item.startDate ? new Date(item.startDate).toLocaleDateString() : '-',
    },
    {
        header: "Actions",
        accessor: (item: StaffApiResponse) => {
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
                            onClick={() => navigator.clipboard.writeText(item.id)}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/staff/${item.id}`}>View details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/staff/${item.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

interface StaffTableProps {
    data: StaffApiResponse[]
}

export function StaffTable({ data }: StaffTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
        />
    )
} 