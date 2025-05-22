import React from 'react';
import EventCard from './EventCard';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(isBetween);
dayjs.extend(minMax);

interface Event {
    id: string;
    title: string;
    startTime: string; // ISO 8601 format preferred for easier parsing
    endTime: string; // ISO 8601 format preferred
    participants: number; // Or an array of participant objects/icons
    // Add other event details as needed for EventDetailsPanel
    date: string; // YYYY-MM-DD format preferred
    location: string;
    attendees: { name: string; email: string; }[];
    organizer: { name: string; email: string; };
    meetingLink: string;
    meetingCode?: string;
    phoneNumber?: string;
    participantsCount: number;
    yesCount: number;
    notes?: string;
}

interface CalendarGridProps {
    events: Event[];
    onEventSelect: (event: Event) => void;
    startDate: dayjs.Dayjs; // Add startDate prop
    viewType: 'day' | 'week' | 'month'; // Add viewType prop
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ events, onEventSelect, startDate, viewType }) => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i % 12 === 0 ? 12 : i % 12}${i < 12 ? ' AM' : ' PM'}`);

    // Generate days based on the startDate prop and viewType
    let days: dayjs.Dayjs[] = [];
    if (viewType === 'week') {
        days = Array.from({ length: 7 }, (_, i) => startDate.add(i, 'day'));
    } else if (viewType === 'day') {
        days = [startDate]; // Only the start date for day view
    } else if (viewType === 'month') {
        // For month view, we might need to show days from the previous/next month
        // to fill the grid, but for now, let's just generate days within the month
        // A proper month view grid is more complex and would require a different rendering approach.
        // For this step, we'll keep the week-like structure but show days of the month.
        const startOfMonth = startDate.startOf('month');
        const endOfMonth = startDate.endOf('month');
        // Calculate the start date of the first week to display (could be in the prev month)
        const firstDayOfMonth = startOfMonth.day(); // 0 for Sunday, 6 for Saturday
        const displayStartDate = startOfMonth.subtract(firstDayOfMonth, 'day');

        // Calculate the end date of the last week to display (could be in the next month)
        const lastDayOfMonth = endOfMonth.day();
        const displayEndDate = lastDayOfMonth === 6 ? endOfMonth : endOfMonth.add(6 - lastDayOfMonth, 'day');

        let currentDay = displayStartDate;
        while (currentDay.isBefore(displayEndDate) || currentDay.isSame(displayEndDate, 'day')) {
            days.push(currentDay);
            currentDay = currentDay.add(1, 'day');
        }
    }

    // Calculate the vertical position and height of an event within a day
    const calculateEventPosition = (event: Event, day: dayjs.Dayjs) => {
        const start = dayjs(event.startTime);
        const end = dayjs(event.endTime);
        const startOfDay = day.startOf('day');

        // Ensure event is within the current day
        // We check if the start *or* end time is on the current day, or if the event spans across the day
        if (!start.isSame(day, 'day') && !end.isSame(day, 'day') && !(start.isBefore(day.startOf('day')) && end.isAfter(day.endOf('day')))) {
            return null;
        }

        // Adjust start and end times to be within the current day's bounds for calculation
        const effectiveStart = dayjs.max(start, day.startOf('day'));
        const effectiveEnd = dayjs.min(end, day.endOf('day'));

        // Calculate the number of minutes from the start of the day to the effective start time
        const startMinutes = effectiveStart.diff(startOfDay, 'minute');
        // Calculate the duration in minutes based on effective start and end times
        const durationMinutes = effectiveEnd.diff(effectiveStart, 'minute');

        // Assuming each hour row represents 60 minutes, adjust the pixel height accordingly
        // You would need to define the height of an hour row in your CSS (e.g., using CSS variables)
        const pixelsPerMinute = 60 / 60; // Assuming 60px per hour row, 1px per minute

        const top = startMinutes * pixelsPerMinute;
        const height = durationMinutes * pixelsPerMinute;

        return { top, height };
    };

    // Function to calculate layout for overlapping events within a set of events
    const calculateOverlapLayout = (events: Event[]) => {
        // Sort events by start time
        const sortedEvents = [...events].sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());

        const eventLayouts: { event: Event; left: number; width: number; overlapGroup?: number }[] = [];
        const overlapGroups: Event[][] = [];

        sortedEvents.forEach(event => {
            let placed = false;
            // Try to place the event in an existing overlap group
            for (let i = 0; i < overlapGroups.length; i++) {
                const group = overlapGroups[i];
                // Check if the current event overlaps with any event in this group
                const overlapsWithGroup = group.some(groupEvent =>
                    dayjs(event.startTime).isBefore(dayjs(groupEvent.endTime)) && dayjs(event.endTime).isAfter(dayjs(groupEvent.startTime))
                );

                if (!overlapsWithGroup) {
                    // If it doesn't overlap with the group, add it to this group
                    group.push(event);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                // If it overlaps with all existing groups, create a new group
                overlapGroups.push([event]);
            }
        });

        // Now calculate layout within each overlap group
        overlapGroups.forEach(group => {
            const groupSize = group.length;
            group.forEach((event, index) => {
                // For simplicity, divide the width equally among events in the group
                // More advanced algorithms can optimize placement to minimize width reduction
                const width = 100 / groupSize; // Width in percentage
                const left = index * width; // Left position in percentage
                eventLayouts.push({ event, left, width });
            });
        });

        return eventLayouts.reduce((acc, layout) => {
            acc[layout.event.id] = { left: layout.left, width: layout.width };
            return acc;
        }, {} as Record<string, { left: number; width: number }>);
    };

    // Group events by day and calculate overlap layouts
    const dailyEventLayouts: Record<string, Record<string, { left: number; width: number }>> = {};
    days.forEach(day => {
        const dayString = day.startOf('day').toISOString();
        const dayEvents = events.filter(event =>
            dayjs(event.startTime).isSame(day, 'day') || dayjs(event.endTime).isSame(day, 'day') || (dayjs(event.startTime).isBefore(day.startOf('day')) && dayjs(event.endTime).isAfter(day.endOf('day')))
        );
        if (dayEvents.length > 0) {
            dailyEventLayouts[dayString] = calculateOverlapLayout(dayEvents);
        }
    });

    return (
        <div className="calendar-grid">
            <div className="time-axis">
                {/* Render time axis only in day and week view */}
                {(viewType === 'day' || viewType === 'week') && hours.map(hour => <div key={hour} className="hour-label">{hour}</div>)}
            </div>
            <div className="days-grid">
                <div className="days-header">
                    {days.map(day => (
                        <div key={day.toISOString()} className="day-header">
                            {day.format('ddd')}
                            <br />
                            {day.format('MMM DD')}
                        </div>
                    ))}
                </div>
                <div className="grid-body">
                    {/* Structure: column for each day, with events absolutely positioned within */}
                    {days.map((day, dayIndex) => {
                        const dayString = day.startOf('day').toISOString();
                        const dayEvents = events.filter(event =>
                            dayjs(event.startTime).isSame(day, 'day') || dayjs(event.endTime).isSame(day, 'day') || (dayjs(event.startTime).isBefore(day.startOf('day')) && dayjs(event.endTime).isAfter(day.endOf('day')))
                        );
                        const eventLayouts = dailyEventLayouts[dayString] || {};

                        // Render events differently based on viewType (simplified for now)
                        if (viewType === 'day' || viewType === 'week') {
                            return (
                                <div key={dayIndex} className="day-column">
                                    {/* Time slots - optional, can be used for visual guides or drop targets */}
                                    {hours.map((hour, hourIndex) => (
                                        <div key={hourIndex} className="time-slot-hour-mark"></div>
                                    ))}
                                    {/* Absolutely positioned events */}
                                    {dayEvents.map(event => {
                                        const position = calculateEventPosition(event, day);
                                        const layout = eventLayouts[event.id];

                                        if (!position || !layout) return null; // Don't render if event is not on this day or layout not calculated

                                        const { top, height } = position;
                                        const { left, width } = layout;

                                        return (
                                            <div
                                                key={event.id}
                                                className="event-container"
                                                style={{
                                                    position: 'absolute',
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: `${left}%`,
                                                    width: `${width}%`,
                                                    // Add z-index for stacking if needed
                                                }}
                                            >
                                                {/* Pass full event object to EventCard with formatted time */}
                                                <EventCard event={{ ...event, time: `${dayjs(event.startTime).format('h:mm A')} - ${dayjs(event.endTime).format('h:mm A')}` }} onClick={() => onEventSelect(event)} />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        } else if (viewType === 'month') {
                            // Month view rendering - simplified list of events for the day
                            return (
                                <div key={dayIndex} className="month-day-cell">
                                    <h4>{day.format('D')}</h4>
                                    {dayEvents.map(event => (
                                        <div key={event.id} className="month-event-item" onClick={() => onEventSelect(event)}>
                                            {dayjs(event.startTime).format('h:mm A')} {event.title}
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return null; // Should not happen
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarGrid;
