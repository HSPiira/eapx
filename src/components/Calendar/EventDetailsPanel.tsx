import React from 'react';
import dayjs from 'dayjs';

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

interface EventDetailsPanelProps {
    event: Event; // Use the consistent Event interface
}

const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({ event }) => {
    return (
        <div className="event-details-panel">
            <h2>{event.title}</h2>
            <p>{dayjs(event.startTime).format('MMMM DD, YYYY')} - {dayjs(event.startTime).format('h:mm A')} - {dayjs(event.endTime).format('h:mm A')} - {event.location}</p>
            {/* Propose new time */}
            <button>Propose new time</button>

            <h3>Attendees:</h3>
            <ul>
                {event.attendees.map(attendee => (
                    <li key={attendee.email}>{attendee.name} ({attendee.email})</li>
                ))}
            </ul>

            {/* RSVP Options */}
            <div>
                <button>Yes</button>
                <button>No</button>
                <button>Maybe</button>
            </div>

            {/* Meeting Details */}
            <p>Meeting: <a href={event.meetingLink}>Join Google Meet meeting</a></p>
            {event.meetingCode && <p>Code: {event.meetingCode}</p>}

            {/* Reminder */}
            <p>Reminder: 30min before (Placeholder)</p>

            {/* Organizer */}
            <p>Organizer: {event.organizer.name} ({event.organizer.email})</p>

            {/* Phone Number */}
            {event.phoneNumber && <p>({event.phoneNumber})</p>}

            {/* Participants Count */}
            <p>{event.participantsCount} persons - {event.yesCount} yes</p>

            {/* Notes */}
            {event.notes && (
                <div>
                    <h3>Notes from Organizer:</h3>
                    <p>{event.notes}</p>
                </div>
            )}
        </div>
    );
};

export default EventDetailsPanel;
