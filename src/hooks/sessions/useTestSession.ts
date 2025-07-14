import { createTestSession, sendFeedbackLink } from "@/api/sessions";
import { useGenericMutation } from "../generic-create";

interface TestSessionResponse {
    success: boolean;
    sessionId?: string;
}

interface SendFeedbackLinkResponse {
    success: boolean;
}

export function useCreateTestSession() {
    return useGenericMutation<TestSessionResponse, string>(
        ['create-test-session'],
        (accessToken) => createTestSession(accessToken)
    );
}

export function useSendFeedbackLink() {
    return useGenericMutation<SendFeedbackLinkResponse, { sessionId: string; accessToken: string }>(
        ['send-feedback-link'],
        ({ sessionId, accessToken }) => sendFeedbackLink(sessionId, accessToken)
    );
}
