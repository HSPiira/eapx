import React from 'react';
import { LucideIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';

/**
 * Props for the SearchableCombobox component
 */
interface SearchableComboboxProps<T> {
    label: string;
    icon: LucideIcon;
    value: string;
    onSelect: (value: string) => void;
    items: T[];
    open: boolean;
    setOpen: (open: boolean) => void;
    placeholder: string;
    searchPlaceholder: string;
    error?: string;
    isLoading?: boolean;
    getItemLabel: (item: T) => string;
    getItemValue: (item: T) => string;
    required?: boolean;
    className?: string;
}

/**
 * A reusable combobox component with search functionality
 * @template T The type of items in the combobox
 */
export const SearchableCombobox = <T,>({
    label,
    icon: Icon,
    value,
    onSelect,
    items,
    open,
    setOpen,
    placeholder,
    searchPlaceholder,
    error,
    isLoading = false,
    getItemLabel,
    getItemValue,
    required = false,
    className = ""
}: SearchableComboboxProps<T>) => (
    <div className={cn("space-y-2", className)}>
        <Label htmlFor={label.toLowerCase()} className="flex items-center gap-2 text-base font-semibold">
            {Icon && <Icon className="w-5 h-5" />}
            {label}
            {required && <span className="text-red-500">*</span>}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={isLoading || items.length === 0}
                    aria-label={`Select ${label.toLowerCase()}`}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <>
                            {value && items.find(item => getItemValue(item) === value)
                                ? getItemLabel(items.find(item => getItemValue(item) === value)!)
                                : placeholder}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {items.map((item) => (
                            <CommandItem
                                key={getItemValue(item)}
                                value={getItemLabel(item)}
                                onSelect={() => {
                                    onSelect(getItemValue(item));
                                    setOpen(false);
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", value === getItemValue(item) ? "opacity-100" : "opacity-0")} />
                                {getItemLabel(item)}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
); 