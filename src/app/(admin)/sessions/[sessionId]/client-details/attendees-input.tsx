import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClientDetailsData } from '../types';
import { SetDataFunction } from './types';

interface AttendeesInputProps {
    data: ClientDetailsData;
    setData: SetDataFunction;
}

export function AttendeesInput({ data, setData }: AttendeesInputProps) {
    return (
        <div className="flex flex-col gap-1">
            <Label htmlFor="numAttendees">Number of Attendees</Label>
            <Input
                id="numAttendees"
                type="number"
                min={1}
                value={data.numAttendees || 1}
                onChange={(e) => setData((prev: ClientDetailsData) => ({ ...prev, numAttendees: parseInt(e.target.value) || 1 }))}
            />
        </div>
    );
}