
import { verifyFeedbackToken } from "@/api/sessions";
import { useGenericQuery } from "../generic-create";

export function useVerifyFeedbackToken(sessionId: string, token: string) {
    return useGenericQuery<boolean>(['verify-feedback-token', sessionId, token], () => verifyFeedbackToken(sessionId, token));
}
