import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { ClientDetailsData } from '../types';
import { SetDataFunction, Dependant } from './types';
import React from 'react';

interface DependantSelectProps {
    dependants: Dependant[];
    data: ClientDetailsData;
    setData: SetDataFunction;
    isLoading: boolean;
}

export function DependantSelect({ dependants, data, setData, isLoading }: DependantSelectProps) {
    const [search, setSearch] = useState('');

    const filteredDependants = React.useMemo(() => {
        if (!search) return dependants;
        return dependants.filter(dependant =>
            dependant.profile?.fullName.toLowerCase().includes(search.toLowerCase())
        );
    }, [dependants, search]);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4 mt-2">
                <Label htmlFor="whoForSwitch" className="mr-2 whitespace-nowrap">Who for?</Label>
                <span className={`text-sm font-medium ${data.whoFor === 'self' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>Self</span>
                <Switch
                    id="whoForSwitch"
                    checked={data.whoFor === 'dependant'}
                    onCheckedChange={(checked) => {
                        const newWhoFor = checked ? 'dependant' : 'self';
                        setData((prev: ClientDetailsData) => ({
                            ...prev,
                            whoFor: newWhoFor,
                            dependant: checked ? prev.dependant : undefined,
                        }));
                    }}
                />
                <span className={`text-sm font-medium ${data.whoFor === 'dependant' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>Dependant</span>
            </div>

            {data.whoFor === 'dependant' && (
                <div className="flex flex-col gap-2">
                    <Input
                        placeholder="Search dependants..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                    <Select
                        value={data.dependant || ''}
                        onValueChange={value => setData((prev: ClientDetailsData) => ({ ...prev, dependant: value }))}
                        disabled={isLoading}
                    >
                        <SelectTrigger id="dependant" className="w-full">
                            {isLoading ? 'Loading...' : data.dependant ? dependants.find(d => d.id === data.dependant)?.profile?.fullName || data.dependant : 'Select Dependant'}
                        </SelectTrigger>
                        <SelectContent>
                            {filteredDependants.map((dependant) => (
                                <SelectItem key={dependant.id} value={dependant.id}>
                                    {dependant.profile?.fullName || dependant.id}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
