'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { SessionsHeader } from '@/components/shared/SessionsHeader';
import { SessionsTabs } from '@/components/shared/SessionsTabs';
import { useClients } from '@/hooks/clients';
import { useSessionCounts } from '@/hooks/sessions/useSessionCounts';

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    

    const { data: clientsResponse } = useClients();
    const clients = clientsResponse?.data || [];
    const { data: counts = {
        upcoming: 0,
        unconfirmed: 0,
        recurring: 0,
        past: 0,
        canceled: 0,
        drafts: 0
    } } = useSessionCounts();

    useSession();

    const sessionDetailRegex = /^\/sessions\/([^/]+)$/;
    const knownTabs = [
        '/sessions/upcoming',
        '/sessions/unconfirmed',
        '/sessions/recurring',
        '/sessions/past',
        '/sessions/canceled',
    ];
    const isSessionDetail = sessionDetailRegex.test(pathname) && !knownTabs.includes(pathname);
    const isFeedback = pathname.includes('/feedback');

    const handleCreateDraftSession = async (clientId: string) => {
        try {
            const { data: draft } = await createDraftSessionMutation(clientId);
            toast.success('Draft session created!');
            setModalOpen(false);
            router.push(`/sessions/${draft.id}`);
        } catch (err) {
            console.error('Draft session error:', err);
            toast.error('Failed to create draft session', {
                description: err instanceof Error ? err.message : 'An unknown error occurred',
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
            <div className="py-3">
                {!(isSessionDetail || isFeedback) && (
                    <>
                        <SessionsHeader
                            modalOpen={modalOpen}
                            setModalOpen={setModalOpen}
                            handleCreateDraftSession={handleCreateDraftSession}
                            clients={clients}
                        />
                        <div className="overflow-x-auto">
                            <SessionsTabs
                                pathname={pathname}
                                counts={counts}
                            />
                        </div>
                    </>
                )}
                {children}
            </div>
        </div>
    );
}