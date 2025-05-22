import React, { useState, useEffect } from 'react';
import DateNavigation from './DateNavigation';
import DateRangeSelector from './DateRangeSelector';
import CalendarGrid from './CalendarGrid';
import EventDetailsPanel from './EventDetailsPanel';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(weekOfYear);
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

type CalendarViewType = 'day' | 'week' | 'month';

const CalendarView: React.FC = () => {
    // State for the currently displayed date and view type
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [viewType, setViewType] = useState<CalendarViewType>('week'); // Default view is week

    // Placeholder state for events
    const [events, setEvents] = useState<Event[]>([]); // Replace with actual data fetching
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Fetch events for the current view
    useEffect(() => {
        // In a real application, you would fetch events from an API
        // based on the current date and view type
        let startDate: dayjs.Dayjs; // Explicitly type startDate
        let endDate: dayjs.Dayjs;   // Explicitly type endDate

        if (viewType === 'week') {
            startDate = currentDate.startOf('week');
            endDate = currentDate.endOf('week');
        } else if (viewType === 'day') {
            startDate = currentDate.startOf('day');
            endDate = currentDate.endOf('day');
        } else if (viewType === 'month') {
            startDate = currentDate.startOf('month');
            endDate = currentDate.endOf('month');
        } else {
            // Default to week view if viewType is somehow not set
            startDate = currentDate.startOf('week');
            endDate = currentDate.endOf('week');
        }

        console.log(`Fetching events for ${viewType} starting ${startDate.format('YYYY-MM-DD')} and ending ${endDate.format('YYYY-MM-DD')}`);

        // Placeholder data - make sure start/end times are within the current view range
        // This dummy data will need to be updated to reflect the selected viewType and date range
        const dummyEvents: Event[] = [
            {
                id: '1',
                title: 'Daily checkin',
                startTime: currentDate.startOf('week').add(1, 'day').add(9, 'hour').toISOString(), // Monday 9 AM
                endTime: currentDate.startOf('week').add(1, 'day').add(10, 'hour').toISOString(), // Monday 10 AM
                participants: 10,
                date: currentDate.startOf('week').add(1, 'day').format('YYYY-MM-DD'),
                location: 'Google Meet',
                attendees: [{ name: 'James Brown', email: 'james11@gmail.com' }],
                organizer: { name: 'James Brown', email: 'james11@gmail.com' },
                meetingLink: '#',
                meetingCode: 'dra-jhgg-mvn',
                participantsCount: 5,
                yesCount: 5,
                notes: 'Discussed MVP.',
            },
            {
                id: '2',
                title: 'Call with Marcel - UX Designer',
                startTime: currentDate.startOf('week').add(1, 'day').add(10, 'hour').add(30, 'minute').toISOString(), // Monday 10:30 AM
                endTime: currentDate.startOf('week').add(1, 'day').add(11, 'hour').toISOString(), // Monday 11:00 AM
                participants: 3,
                date: currentDate.startOf('week').add(1, 'day').format('YYYY-MM-DD'),
                location: 'Google Meet',
                attendees: [{ name: 'Marcel Kargul', email: 'marcel@mimicdesign.co' }],
                organizer: { name: 'James Brown', email: 'james11@gmail.com' },
                meetingLink: '#',
                participantsCount: 3,
                yesCount: 3,
            },
            {
                id: '3',
                title: 'Intro call with Nova - Product Manager',
                startTime: currentDate.startOf('week').add(2, 'day').add(11, 'hour').toISOString(), // Tuesday 11 AM
                endTime: currentDate.startOf('week').add(2, 'day').add(12, 'hour').toISOString(), // Tuesday 12 PM
                participants: 4,
                date: currentDate.startOf('week').add(2, 'day').format('YYYY-MM-DD'),
                location: 'Google Meet',
                attendees: [{ name: 'Nova', email: 'nova@example.com' }],
                organizer: { name: 'James Brown', email: 'james11@gmail.com' },
                meetingLink: '#',
                participantsCount: 4,
                yesCount: 4,
            },
            // Add more dummy events here...
        ];
        // Filter dummy events based on the current view range
        const filteredEvents = dummyEvents.filter(event => {
            const eventTime = dayjs(event.startTime);
            return eventTime.isBetween(startDate, endDate, null, '[]'); // '[]' makes the comparison inclusive
        });

        setEvents(filteredEvents);

    }, [currentDate, viewType]); // Refetch events when the current date or view type changes

    // Placeholder functions for navigation and selection
    const handlePrevious = () => {
        if (viewType === 'week') {
            setCurrentDate(currentDate.subtract(1, 'week'));
        } else if (viewType === 'day') {
            setCurrentDate(currentDate.subtract(1, 'day'));
        } else if (viewType === 'month') {
            setCurrentDate(currentDate.subtract(1, 'month'));
        }
    };

    const handleNext = () => {
        if (viewType === 'week') {
            setCurrentDate(currentDate.add(1, 'week'));
        } else if (viewType === 'day') {
            setCurrentDate(currentDate.add(1, 'day'));
        } else if (viewType === 'month') {
            setCurrentDate(currentDate.add(1, 'month'));
        }
    };

    const handleToday = () => {
        setCurrentDate(dayjs());
    };

    const handleRangeChange = (range: CalendarViewType) => {
        // Logic to change date range (e.g., 'day', 'week', 'month')
        setViewType(range);
    };

    const handleEventSelect = (event: Event) => {
        setSelectedEvent(event);
    };

    // Calculate the displayed date range string based on viewType
    let displayedDateRange;
    if (viewType === 'week') {
        displayedDateRange = `${currentDate.startOf('week').format('MMM DD')} - ${currentDate.endOf('week').format('MMM DD, YYYY')}`;
    } else if (viewType === 'day') {
        displayedDateRange = currentDate.format('MMMM DD, YYYY');
    } else if (viewType === 'month') {
        displayedDateRange = currentDate.format('MMMM YYYY');
    } else {
        displayedDateRange = 'Select a date range'; // Default or initial state
    }

    return (
        <div className="calendar-view-container">
            <div className="calendar-header">
                <DateNavigation onPrevious={handlePrevious} onNext={handleNext} onToday={handleToday} />
                <DateRangeSelector currentDateRange={displayedDateRange} onRangeChange={handleRangeChange} />
                {/* Add search and filter elements here */}
            </div>
            <div className="calendar-main-content">
                {/* Pass events relevant to the current view and the viewType to CalendarGrid */}
                <CalendarGrid events={events} onEventSelect={handleEventSelect} startDate={currentDate.startOf(viewType as dayjs.OpUnitType)} viewType={viewType} />
                {selectedEvent && <EventDetailsPanel event={selectedEvent} />}
            </div>
        </div>
    );
};

export default CalendarView;
