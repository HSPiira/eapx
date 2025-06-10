import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ClientDetailsData } from '../types';
import { SetDataFunction } from './types';
import { SessionType as PrismaSessionType } from '@prisma/client';

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

interface SessionForToggleProps {
    data: ClientDetailsData;
    setData: SetDataFunction;
}

export function SessionForToggle({ data, setData }: SessionForToggleProps) {
    return (
        <div className="flex items-center gap-4 mt-2">
            <Label htmlFor="sessionForSwitch" className="mr-2 whitespace-nowrap">Session for?</Label>
            <span className={`text-sm font-medium ${data.sessionFor === 'organization' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>Organization</span>
            <Switch
                id="sessionForSwitch"
                checked={data.sessionFor === 'staff'}
                onCheckedChange={(checked) => {
                    const newSessionFor = checked ? 'staff' : 'organization';
                    const validTypes = newSessionFor === 'organization' ? ORG_SESSION_TYPES : STAFF_SESSION_TYPES;
                    setData((prev: ClientDetailsData) => ({
                        ...prev,
                        sessionFor: newSessionFor,
                        sessionType: validTypes[0],
                        whoFor: checked ? prev.whoFor : undefined,
                        dependant: checked ? prev.dependant : undefined,
                        staff: checked ? prev.staff : undefined,
                    }));
                }}
            />
            <span className={`text-sm font-medium ${data.sessionFor === 'staff' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>Staff</span>
        </div>
    );
}