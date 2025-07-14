import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { confirmSession } from "@/api/sessions";

export function useConfirmSession() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: confirmSession,
        onSuccess: () => {
            toast.success('Session confirmed successfully');
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            router.push('/sessions/upcoming');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to confirm session');
        },
    });
} 