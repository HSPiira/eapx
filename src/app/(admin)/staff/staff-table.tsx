'use client'

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Staff } from "./columns"

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