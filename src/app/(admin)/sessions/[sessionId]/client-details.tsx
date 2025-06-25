import React, { useEffect, useMemo } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useValidateSessionType } from '@/hooks/sessions/useValidateSessionType';
import { useStaff } from '@/hooks/staff';
import { useStaffDependants } from '@/hooks/staff-dependants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SessionType as PrismaSessionType } from '@prisma/client';
import { ClientDetailsData } from './types';

const ORG_SESSION_TYPES = [
    PrismaSessionType.TALK,
    PrismaSessionType.WEBINAR,
    PrismaSessionType.TRAINING,
    PrismaSessionType.WORKSHOP,
    PrismaSessionType.SEMINAR,
    PrismaSessionType.CONFERENCE
] as const;

const STAFF_SESSION_TYPES = [
    PrismaSessionType.INDIVIDUAL,
    PrismaSessionType.COUPLE,
    PrismaSessionType.FAMILY,
    PrismaSessionType.GROUP
] as const;

type OrgSessionType = typeof ORG_SESSION_TYPES[number];
type StaffSessionType = typeof STAFF_SESSION_TYPES[number];
type SessionType = OrgSessionType | StaffSessionType;

type SessionFor = 'organization' | 'staff';


interface ClientDetailsProps {
    sessionFor: SessionFor;
    data: ClientDetailsData;
    setData: (data: ClientDetailsData) => void;
    clientId: string;
}

const ClientDetails = ({ data, setData, clientId }: ClientDetailsProps) => {
    const sessionFor = data.sessionFor || 'organization';
    const whoFor = data.whoFor || 'self';

    const { data: staffData, isLoading: isStaffLoading, } = useStaff(clientId);
    const { data: dependantsData, isLoading: isDependantsLoading } = useStaffDependants(
        sessionFor === 'staff' ? clientId : undefined,
        sessionFor === 'staff' ? data.staff ?? "" : undefined,
        whoFor
    );

    const staffList = useMemo(() => staffData?.data || [], [staffData]);
    const dependants = useMemo(() => dependantsData?.data || [], [dependantsData]);

    useValidateSessionType(sessionFor, data, setData, ORG_SESSION_TYPES, STAFF_SESSION_TYPES);

    useEffect(() => {
        if (sessionFor === 'staff' && staffList.length === 1 && !data.staff) {
            setData({
                ...data,
                staff: staffList[0].id,
                whoFor: 'self',
            });
        }
    }, [sessionFor, staffList, data, setData]);

    const [staffSearch, setStaffSearch] = React.useState('');
    const [dependantSearch, setDependantSearch] = React.useState('');

    return (
        <div className="w-full flex items-start justify-start mt-6">
            <div className="w-full rounded-sm p-8 border dark:border-gray-800 space-y-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Client Details</h2>
                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" value={data.company || ''} disabled />
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <Label htmlFor="sessionForSwitch" className="mr-2 whitespace-nowrap">Session for?</Label>
                        <span className={
                            `text-sm font-medium transition-colors ${sessionFor === 'organization' ? 'text-primary font-semibold' : 'text-muted-foreground'}`
                        }>
                            Organization
                        </span>
                        <Switch
                            id="sessionForSwitch"
                            checked={sessionFor === 'staff'}
                            onCheckedChange={(checked) => {
                                const newSessionFor = checked ? 'staff' : 'organization';
                                const validTypes: SessionType[] = newSessionFor === 'organization'
                                    ? Array.from(ORG_SESSION_TYPES)
                                    : Array.from(STAFF_SESSION_TYPES);
                                setData({
                                    ...data,
                                    sessionFor: newSessionFor,
                                    sessionType: validTypes[0],
                                    whoFor: checked ? data.whoFor : undefined,
                                    dependant: checked ? data.dependant : undefined,
                                });
                            }}
                            className="relative"
                        >
                            {sessionFor === 'staff' && (
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-primary-foreground text-base">✓</span>
                            )}
                        </Switch>
                        <span className={
                            `text-sm font-medium transition-colors ${sessionFor === 'staff' ? 'text-primary font-semibold' : 'text-muted-foreground'}`
                        }>
                            Staff
                        </span>
                    </div>

                    {sessionFor === 'staff' && (
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="staff">Staff</Label>
                            <Select
                                value={data.staff || ''}
                                onValueChange={(value) => setData({ ...data, staff: value })}
                                disabled={isStaffLoading}
                            >
                                <SelectTrigger id="staff" className="w-full">
                                    {isStaffLoading
                                        ? 'Loading...'
                                        : staffList.length === 0
                                            ? 'No staff available'
                                            : staffList.find(staff => staff.id === data.staff)?.profile?.fullName ||
                                            staffList.find(staff => staff.id === data.staff)?.id ||
                                            'Select staff'}
                                </SelectTrigger>
                                <SelectContent className="max-h-56 overflow-y-auto">
                                    <Input
                                        placeholder="Search staff..."
                                        value={staffSearch}
                                        onChange={e => setStaffSearch(e.target.value)}
                                        className="mb-2"
                                    />
                                    {staffList.length === 0 ? (
                                        <SelectItem value="__no_staff__" disabled>No staff available</SelectItem>
                                    ) : (
                                        staffList
                                            .filter(staff =>
                                                (staff.profile?.fullName || staff.id)
                                                    .toLowerCase()
                                                    .includes(staffSearch.toLowerCase())
                                            )
                                            .map((staff) => (
                                                <SelectItem key={staff.id} value={staff.id}>
                                                    {staff.profile?.fullName || staff.id}
                                                </SelectItem>
                                            ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {sessionFor === 'staff' && (
                        <div className="flex items-center gap-4 mt-2">
                            <Label htmlFor="whoForSwitch" className="mr-2 whitespace-nowrap">Who is it for?</Label>
                            <span className={
                                `text-sm font-medium transition-colors ${data.whoFor === 'self' ? 'text-primary font-semibold' : 'text-muted-foreground'}`
                            }>
                                Self
                            </span>
                            <Switch
                                id="whoForSwitch"
                                checked={data.whoFor === 'dependant'}
                                onCheckedChange={(checked) => setData({
                                    ...data,
                                    whoFor: checked ? 'dependant' : 'self',
                                    dependant: checked ? data.dependant : undefined,
                                })}
                                className="relative"
                            >
                                {data.whoFor === 'dependant' && (
                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-primary-foreground text-base">✓</span>
                                )}
                            </Switch>
                            <span className={
                                `text-sm font-medium transition-colors ${data.whoFor === 'dependant' ? 'text-primary font-semibold' : 'text-muted-foreground'}`
                            }>
                                Dependant
                            </span>
                        </div>
                    )}

                    {sessionFor === 'staff' && data.whoFor === 'dependant' && (
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="dependant">Dependant</Label>
                            <Select
                                value={data.dependant || ''}
                                onValueChange={value => setData({ ...data, dependant: value })}
                                disabled={isDependantsLoading}
                            >
                                <SelectTrigger id="dependant" className="w-full">
                                    {isDependantsLoading
                                        ? 'Loading...'
                                        : dependants.length === 0
                                            ? 'No dependants available'
                                            : dependants.find(dep => dep.id === data.dependant)?.profile?.fullName ||
                                            dependants.find(dep => dep.id === data.dependant)?.id ||
                                            'Select dependant'}
                                </SelectTrigger>
                                <SelectContent className="max-h-56 overflow-y-auto">
                                    <Input
                                        placeholder="Search dependant..."
                                        value={dependantSearch}
                                        onChange={e => setDependantSearch(e.target.value)}
                                        className="mb-2"
                                    />
                                    {dependants.length === 0 ? (
                                        <SelectItem value="__no_dependants__" disabled>No dependants available</SelectItem>
                                    ) : (
                                        dependants
                                            .filter(dep =>
                                                (dep.profile?.fullName || dep.id)
                                                    .toLowerCase()
                                                    .includes(dependantSearch.toLowerCase())
                                            )
                                            .map(dep => (
                                                <SelectItem key={dep.id} value={dep.id}>
                                                    {dep.profile?.fullName || dep.id}
                                                </SelectItem>
                                            ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="sessionType">Session Type</Label>
                        <Select
                            value={data.sessionType || ''}
                            onValueChange={(value: string) => {
                                setData({
                                    ...data, sessionType: value as PrismaSessionType
                                });
                            }}
                            disabled={isStaffLoading || isDependantsLoading}
                        >
                            <SelectTrigger id="sessionType" className="w-full">
                                {data.sessionType || 'Select Session Type'}
                            </SelectTrigger>
                            <SelectContent className="max-h-56 overflow-y-auto">
                                {(sessionFor === 'organization' ? ORG_SESSION_TYPES : STAFF_SESSION_TYPES).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="numberOfAttendees">Number of Attendees</Label>
                        <Input
                            id="numberOfAttendees"
                            type="number"
                            min={1}
                            value={data.numAttendees || 1}
                            onChange={e => setData({ ...data, numAttendees: Number(e.target.value) })}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="comments">Notes</Label>
                        <Textarea
                            id="comments"
                            placeholder="Add any additional notes..."
                            value={data.notes || ''}
                            onChange={(e) => setData({ ...data, notes: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetails;
