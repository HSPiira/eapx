import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientDetailsData } from '../types';
import { SetDataFunction } from './types';

interface NotesInputProps {
    data: ClientDetailsData;
    setData: SetDataFunction;
}

export function NotesInput({ data, setData }: NotesInputProps) {
    return (
        <div className="flex flex-col gap-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
                id="notes"
                value={data.notes || ''}
                onChange={(e) => setData((prev: ClientDetailsData) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes here..."
            />
        </div>
    );
}