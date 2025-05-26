import React from 'react';
import { CalendarDays, Clock, MessageCircle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// UI Components
import { Button } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Utils
import { cn } from '@/lib/utils';

// Components
import { AvailabilityPicker } from '../AvailabilityPicker';

// Constants
import { DURATION_OPTIONS, formatTimeSlot } from '../sessionRequestSchema';

/**
 * Props for the SessionStep3 component
 */
interface SessionStep3Props {
    // Date and time related props
    selectedDate: Date | undefined;
    setSelectedDate: (date: Date | undefined) => void;
    selectedTime: { start: string; end: string } | undefined;
    setSelectedTime: (time: { start: string; end: string } | undefined) => void;
    selectedTimeSlot: string | null;
    setSelectedTimeSlot: (slot: string | null) => void;
    timeFormat: '12' | '24';
    setTimeFormat: (format: '12' | '24') => void;

    // Duration related props
    duration: number;
    setDuration: (duration: number) => void;

    // Special requirements props
    specialRequirements: string;
    setSpecialRequirements: (requirements: string) => void;

    // Form related props
    setValue: (field: string, value: string | number | boolean | Date | undefined) => void;
    touchedFields: Record<string, boolean>;
    isSubmitted: boolean;
    errors: Record<string, string>;
    date: Date | undefined;
}

/**
 * SessionStep3 component handles the third step of session booking form
 * It includes date selection, time slot selection, duration selection,
 * and special requirements input
 */
const SessionStep3: React.FC<SessionStep3Props> = ({
    // Date and time props
    selectedDate,
    setSelectedDate,
    setSelectedTime,
    selectedTimeSlot,
    setSelectedTimeSlot,
    timeFormat,
    setTimeFormat,

    // Duration props
    duration,
    setDuration,

    // Special requirements props
    specialRequirements,
    setSpecialRequirements,

    // Form props
    setValue,
    date
}) => {
    /**
     * Handles date selection with validation
     */
    const handleDateSelect = (date: Date | undefined) => {
        if (date instanceof Date) {
            setSelectedDate(date);
            setValue('date', date);
            setSelectedTime(undefined);
        }
    };

    /**
     * Handles time slot selection with duration calculation
     */
    const handleTimeSelect = (date: Date, startTime: string) => {
        setSelectedDate(date);
        setValue('date', date);
        setSelectedTimeSlot(startTime);

        // Calculate endTime as startTime + duration
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const end = new Date(date);
        end.setHours(startHour);
        end.setMinutes(startMinute + duration);
        const endHour = end.getHours().toString().padStart(2, '0');
        const endMinute = end.getMinutes().toString().padStart(2, '0');
        const endTime = `${endHour}:${endMinute}`;
        setSelectedTime({ start: startTime, end: endTime });
        setValue('startTime', startTime);
        setValue('endTime', endTime);
    };

    /**
     * Handles duration change
     */
    const handleDurationChange = (value: string) => {
        const newDuration = parseInt(value);
        setDuration(newDuration);
        setValue('duration', newDuration);
    };

    return (
        <div className="space-y-4">
            {/* Date Picker */}
            <div className="space-y-2">
                <Label htmlFor="counselor-date" className="flex items-center gap-2 text-base font-semibold text-orange-700">
                    <CalendarDays className="w-5 h-5 text-orange-500" />
                    Choose a Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Time Slots Heading and Format Toggle */}
            <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium flex items-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Available Time Slots <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant={timeFormat === '12' ? 'default' : 'outline'}
                        onClick={() => setTimeFormat('12')}
                        size="sm"
                        className="text-xs"
                    >
                        12-hour
                    </Button>
                    <Button
                        type="button"
                        variant={timeFormat === '24' ? 'default' : 'outline'}
                        onClick={() => setTimeFormat('24')}
                        size="sm"
                        className="text-xs"
                    >
                        24-hour
                    </Button>
                </div>
            </div>

            {/* Time Slot Selection */}
            {selectedDate && (
                <AvailabilityPicker
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    onTimeSelectAction={handleTimeSelect}
                    timeFormat={timeFormat}
                    formatTimeSlot={formatTimeSlot}
                />
            )}

            {/* Duration Picker */}
            <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2 text-base font-semibold text-amber-700">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Session Duration <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={duration.toString()}
                    onValueChange={handleDurationChange}
                >
                    <SelectTrigger id="duration" className="w-full">
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        {DURATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Special Requirements */}
            <div className="space-y-2">
                <Label htmlFor="specialRequirements" className="flex items-center gap-2 text-base font-semibold text-pink-700">
                    <MessageCircle className="w-5 h-5 text-pink-500" />
                    Special Requirements
                </Label>
                <Textarea
                    id="specialRequirements"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="Any special requirements or accommodations needed"
                    className="min-h-[80px]"
                />
            </div>
        </div>
    );
};

export default SessionStep3; 