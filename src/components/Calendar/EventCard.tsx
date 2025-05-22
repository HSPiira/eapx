import React from 'react';

interface EventCardProps {
    event: {
        id: string;
        title: string;
        time: string; // Formatted time string for display
        startTime: string; // ISO 8601 format
        endTime: string; // ISO 8601 format
        participants: number; // Or an array of participant objects/icons
        // Add other event details as needed for EventDetailsPanel
        date: string; // YYYY-MM-DD format
        location: string;
        attendees: { name: string; email: string; }[];
        organizer: { name: string; email: string; };
        meetingLink: string;
        meetingCode?: string;
        phoneNumber?: string;
        participantsCount: number;
        yesCount: number;
        notes?: string;
    };
    onClick: () => void; // Add onClick prop
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
    return (
        <div className="event-card" onClick={onClick}>
            <div className="event-time">{event.time}</div>
            <div className="event-title">{event.title}</div>
            {/* Placeholder for participant icons/count */}
            <div className="event-participants">{event.participants} participants</div>
        </div>
    );
};

export default EventCard;
