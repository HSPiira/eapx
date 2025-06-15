import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useConfirmSession() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await fetch(`/api/sessions/${sessionId}/confirm`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to confirm session');
            return response.json();
        },
        onSuccess: () => {
            toast.success('Session confirmed successfully');
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            router.push('/sessions/confirmed');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to confirm session');
        },
    });
} 