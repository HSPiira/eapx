'use client';

import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StaffTable } from "./staff-table"

import { useStaffList } from '@/hooks/staff/useStaffList';
import { LoadingSpinner } from '@/components/ui';

export default function StaffPage() {
    const { data: staff, isLoading, error } = useStaffList();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                Error: {error.message}
            </div>
        );
    }

    return (
        <div className="container mx-auto py-5">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Staff</h1>
                <Link href="/staff/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Staff
                    </Button>
                </Link>
            </div>
            <div className="mt-4">
                <StaffTable data={staff || []} />
            </div>
        </div>
    )
}