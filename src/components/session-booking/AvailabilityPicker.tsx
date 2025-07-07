'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface TimeSlot {
    startTime: Date;
    endTime: Date;
    isAvailable: boolean;
}

interface AvailabilityPickerProps {
    onTimeSelectAction: (date: Date, startTime: string) => void;
    selectedDate?: Date;
    selectedTimeSlot?: string | null;
    timeFormat?: '12' | '24';
    formatTimeSlot?: (time: string, format: '12' | '24') => string;
    className?: string;
}

export function AvailabilityPicker({
    onTimeSelectAction,
    selectedDate,
    selectedTimeSlot,
    timeFormat = '12',
    formatTimeSlot,
    className
}: AvailabilityPickerProps) {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    // Generate time slots when selectedDate changes
    React.useEffect(() => {
        if (!selectedDate) {
            setTimeSlots([]);
            return;
        }
        // TODO: Replace with actual API call to get counselor availability
        const slots: TimeSlot[] = [];
        const startHour = 9; // 9 AM
        const endHour = 17; // 5 PM
        const duration = 30; // 30 minutes per slot

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += duration) {
                const startTime = dayjs(selectedDate)
                    .hour(hour)
                    .minute(minute)
                    .second(0)
                    .millisecond(0)
                    .toDate();
                const endTime = dayjs(selectedDate)
                    .hour(hour)
                    .minute(minute + duration)
                    .second(0)
                    .millisecond(0)
                    .toDate();

                // Randomly mark some slots as unavailable for demo
                const isAvailable = Math.random() > 0.3;

                slots.push({
                    startTime,
                    endTime,
                    isAvailable
                });
            }
        }
        setTimeSlots(slots);
    }, [selectedDate]);

    // Handle time slot selection
    const handleTimeSelect = (slot: TimeSlot) => {
        if (!slot.isAvailable || !selectedDate) return;
        onTimeSelectAction(selectedDate, dayjs(slot.startTime).format('HH:mm'));
    };

    if (!selectedDate) return null;

    return (
        <div className={cn("grid gap-4", className)}>
            <Card>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {timeSlots.map((slot) => {
                            const start = slot.startTime;
                            const timeString = dayjs(start).format('HH:mm');
                            return (
                                <Button
                                    key={start.toISOString()}
                                    type="button"
                                    variant={selectedTimeSlot === timeString ? "default" : "outline"}
                                    className={cn(
                                        "justify-start",
                                        !slot.isAvailable && "opacity-50 cursor-not-allowed"
                                    )}
                                    disabled={!slot.isAvailable}
                                    onClick={() => handleTimeSelect(slot)}
                                >
                                    {formatTimeSlot ? formatTimeSlot(timeString, timeFormat) : dayjs(start).format('h:mm A')}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 