'use client'

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

interface StaffTableProps {
    data: any[]
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