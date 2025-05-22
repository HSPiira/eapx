import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StaffTable } from "./staff-table"

async function getStaff() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/staff`, {
        cache: "no-store",
    })
    if (!response.ok) {
        throw new Error("Failed to fetch staff")
    }
    return response.json()
}

export default async function StaffPage() {
    const staff = await getStaff()

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Staff</h1>
                <Link href="/staff/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Staff
                    </Button>
                </Link>
            </div>
            <div className="mt-8">
                <StaffTable data={staff} />
            </div>
        </div>
    )
}