'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface TimeSlot {
    startTime: Date;
    endTime: Date;
    isAvailable: boolean;
}

interface AvailabilityPickerProps {
    onTimeSelect: (date: Date, startTime: string) => void;
    selectedDate?: Date;
    selectedTimeSlot?: string | null;
    className?: string;
}

export function AvailabilityPicker({
    onTimeSelect,
    selectedDate,
    selectedTimeSlot,
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
        onTimeSelect(selectedDate, dayjs(slot.startTime).format('HH:mm'));
    };

    if (!selectedDate) return null;

    return (
        <div className={cn("grid gap-4", className)}>
            <Card>
                <CardHeader>
                    <CardTitle>Available Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {timeSlots.map((slot) => {
                            const start = slot.startTime instanceof Date ? slot.startTime : new Date(slot.startTime);
                            return (
                                <Button
                                    key={start.toISOString()}
                                    type="button"
                                    variant={selectedTimeSlot === dayjs(start).format('HH:mm') ? "default" : "outline"}
                                    className={cn(
                                        "justify-start",
                                        !slot.isAvailable && "opacity-50 cursor-not-allowed"
                                    )}
                                    disabled={!slot.isAvailable}
                                    onClick={() => handleTimeSelect(slot)}
                                >
                                    {dayjs(start).format('h:mm A')}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 