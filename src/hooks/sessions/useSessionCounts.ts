import { useQuery } from "@tanstack/react-query";

export function useSessionCounts() {
    return useQuery({
        queryKey: ['session-counts'],
        queryFn: async () => {
            const [draftRes, unconfirmedRes, scheduledRes] = await Promise.all([
                fetch('/api/services/sessions?status=DRAFT'),
                fetch('/api/services/sessions?status=UNCONFIRMED'),
                fetch('/api/services/sessions?status=SCHEDULED')
            ]);

            const [draftData, unconfirmedData, scheduledData] = await Promise.all([
                draftRes.json(),
                unconfirmedRes.json(),
                scheduledRes.json()
            ]);

            return {
                upcoming: scheduledData?.metadata?.total || 0,
                unconfirmed: unconfirmedData?.metadata?.total || 0,
                recurring: draftData?.metadata?.total || 0,
                past: draftData?.metadata?.total || 0,
                canceled: draftData?.metadata?.total || 0,
                drafts: draftData?.metadata?.total || 0
            };
        }
    });
} 