import { createSessionRequest } from "@/api/sessions";
import { useGenericMutation } from "../generic-create";
import { SessionRequestFormData } from "@/components/session-booking/sessionRequestSchema";

export function useCreateSessionRequest() {
    return useGenericMutation<unknown, SessionRequestFormData>(
        ['create-session-request'],
        (data) => createSessionRequest(data)
    );
}
