import { StaffFormModal } from '@/components/admin/clients/staff/staff-form-modal';
import { Staff } from '@/components/admin/clients/staff/columns';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const statusColors: Record<string, string> = {
    ACTIVE: 'text-green-500 dark:text-green-400',
    INACTIVE: 'text-gray-400',
    ON_LEAVE: 'text-yellow-500 dark:text-yellow-400',
    TERMINATED: 'text-red-500 dark:text-red-400',
    SUSPENDED: 'text-orange-500 dark:text-orange-400',
    RESIGNED: 'text-blue-500 dark:text-blue-400',
};

export default function StaffList({ clientId, data }: { clientId: string, data: Staff[] }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-md p-8 border border-zinc-200 dark:border-zinc-800 w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white ml-4">Staff</h2>
                <StaffFormModal clientId={clientId} onClose={() => { }} />
            </div>
            <div className="overflow-x-auto">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                        <p className="text-lg">No staff members found</p>
                        <p className="text-sm mt-2">Click the &quot;Add Staff&quot; button to add your first staff member</p>
                    </div>
                ) : (
                    <table className="min-w-full text-sm text-left text-zinc-800 dark:text-gray-300">
                        <thead className="uppercase text-xs text-zinc-500 dark:text-gray-400 border-b border-zinc-200 dark:border-gray-700">
                            <tr>
                                <th className="py-3 px-4 whitespace-nowrap">Name</th>
                                <th className="py-3 px-4 whitespace-nowrap">Email</th>
                                <th className="py-3 px-4 whitespace-nowrap">Job Title</th>
                                <th className="py-3 px-4 whitespace-nowrap">Management Level</th>
                                <th className="py-3 px-4 whitespace-nowrap">Employment Type</th>
                                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                                <th className="py-3 px-4 whitespace-nowrap">Start Date</th>
                                <th className="py-3 px-4 whitespace-nowrap">End Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((staff: Staff) => (
                                <tr key={staff.id} className="border-b border-zinc-100 dark:border-gray-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-white whitespace-nowrap">{staff.profile.fullName}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">{staff.profile.email}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">{staff.jobTitle}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">{staff.managementLevel}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">{staff.employmentType}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {staff.status === 'ACTIVE' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                            <span className={statusColors[staff.status] || 'text-gray-400'}>{staff.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">{new Date(staff.startDate).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">{staff.endDate ? new Date(staff.endDate).toLocaleDateString() : <span className="text-green-500 dark:text-green-400">Active</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}