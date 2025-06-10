import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import React from 'react';
import { ClientDetailsData } from '../types';
import { SetDataFunction, Staff } from './types';

interface StaffSelectProps {
    staffList: Staff[];
    data: ClientDetailsData;
    setData: SetDataFunction;
    isLoading: boolean;
}

export function StaffSelect({ staffList, data, setData, isLoading }: StaffSelectProps) {
    const [search, setSearch] = React.useState('');

    const filteredStaff = React.useMemo(() => {
        if (!search) return staffList;
        return staffList.filter(staff =>
            staff.profile?.fullName.toLowerCase().includes(search.toLowerCase())
        );
    }, [staffList, search]);

    return (
        <div className="flex flex-col gap-1">
            <Label htmlFor="staff">Staff</Label>
            <div className="flex flex-col gap-2">
                <Input
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                />
                <Select
                    value={data.staff || ''}
                    onValueChange={value => setData((prev: ClientDetailsData) => ({ ...prev, staff: value }))}
                    disabled={isLoading}
                >
                    <SelectTrigger id="staff" className="w-full">
                        {isLoading ? 'Loading...' : data.staff ? staffList.find(s => s.id === data.staff)?.profile?.fullName || data.staff : 'Select Staff'}
                    </SelectTrigger>
                    <SelectContent>
                        {filteredStaff.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                                {staff.profile?.fullName || staff.id}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}