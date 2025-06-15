import React from "react";
import { Button } from "@/components/ui";
import { SessionRequestModal } from "@/app/(admin)/sessions/[sessionId]/session-request";

export function SessionsHeader({
    modalOpen,
    setModalOpen,
    handleCreateDraftSession,
    clients
}: {
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    handleCreateDraftSession: (clientId: string) => Promise<void>;
    clients: Array<{ id: string; name: string }>;
}) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Sessions</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    See upcoming and past sessions booked through your event type links.
                </p>
            </div>
            <Button onClick={() => setModalOpen(true)}>Request Session</Button>
            <SessionRequestModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleCreateDraftSession}
                companies={clients}
            />
        </div>
    );
} 