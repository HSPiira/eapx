"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const recentSessions = [
    {
        id: "1",
        client: "John Smith",
        provider: "Dr. Sarah Johnson",
        date: "2024-03-15",
        time: "10:00 AM",
        type: "individual",
        status: "completed",
        rating: 5,
        notes: "Anxiety management techniques discussed",
    },
    {
        id: "2",
        client: "Emma Wilson",
        provider: "Dr. Michael Brown",
        date: "2024-03-14",
        time: "2:30 PM",
        type: "couples",
        status: "completed",
        rating: 4,
        notes: "Relationship communication strategies",
    },
    {
        id: "3",
        client: "James Davis",
        provider: "Dr. Lisa Anderson",
        date: "2024-03-14",
        time: "4:00 PM",
        type: "group",
        status: "scheduled",
        rating: null,
        notes: "Stress management workshop",
    },
    {
        id: "4",
        client: "Sophia Martinez",
        provider: "Dr. Robert Taylor",
        date: "2024-03-13",
        time: "11:15 AM",
        type: "family",
        status: "completed",
        rating: 5,
        notes: "Family dynamics assessment",
    },
    {
        id: "5",
        client: "William Thompson",
        provider: "Dr. Emily White",
        date: "2024-03-13",
        time: "3:45 PM",
        type: "emergency",
        status: "cancelled",
        rating: null,
        notes: "Client requested rescheduling",
    },
]

export function RecentSessions() {
    return (
        <div className="space-y-8">
            {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://avatar.vercel.sh/${session.client}.png`} alt={session.client} />
                        <AvatarFallback>{session.client.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{session.client}</p>
                        <p className="text-sm text-muted-foreground">
                            {session.provider} • {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Therapy
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(session.date).toLocaleDateString()} at {session.time}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">
                        <Badge variant={
                            session.status === "completed" ? "default" :
                                session.status === "scheduled" ? "secondary" :
                                    "destructive"
                        }>
                            {session.status}
                        </Badge>
                        {session.rating && (
                            <span className="ml-2 text-sm text-muted-foreground">
                                {session.rating}/5
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}