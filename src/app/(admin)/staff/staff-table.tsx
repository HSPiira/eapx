'use client'

import { DataTable } from "@/components/ui/data-table"
import { columns } from "../../../components/admin/clients/staff/columns"
import { Staff } from "../../../components/admin/clients/staff/columns"

interface StaffTableProps {
    data: Staff[]
}

export function StaffTable({ data }: StaffTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="fullName"
        />
    )
} 