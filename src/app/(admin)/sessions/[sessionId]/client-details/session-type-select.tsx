import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ClientDetailsData, SessionType } from '../types';
import { SetDataFunction } from './types';

interface SessionTypeSelectProps {
    data: ClientDetailsData;
    setData: SetDataFunction;
    validSessionTypes: SessionType[];
    isLoading: boolean;
}

export function SessionTypeSelect({ data, setData, validSessionTypes, isLoading }: SessionTypeSelectProps) {
    return (
        <div className="flex flex-col gap-1">
            <Label htmlFor="sessionType">Session Type</Label>
            <Select
                value={data.sessionType || ''}
                onValueChange={value => setData((prev: ClientDetailsData) => ({ ...prev, sessionType: value as SessionType }))}
                disabled={isLoading}
            >
                <SelectTrigger id="sessionType" className="w-full">
                    {isLoading ? 'Loading...' : data.sessionType || 'Select Session Type'}
                </SelectTrigger>
                <SelectContent>
                    {validSessionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}