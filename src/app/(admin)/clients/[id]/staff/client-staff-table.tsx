'use client'

import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(admin)/staff/columns'
import { Staff } from '@/app/(admin)/staff/columns'

interface ClientStaffTableProps {
    staff: Staff[]
}

export function ClientStaffTable({ staff }: ClientStaffTableProps) {
    return (
        <DataTable
            columns={columns}
            data={staff}
            searchKey="fullName"
            searchPlaceholder="Search staff..."
        />
    )
} 