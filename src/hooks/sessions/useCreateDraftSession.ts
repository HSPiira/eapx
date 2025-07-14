
import { createDraftSession } from "@/api/sessions";
import { useGenericMutation } from "../generic-create";
import { Session } from "@/types/sessions";

export function useCreateDraftSession() {
    return useGenericMutation<Session, string>(
        ['create-draft-session'],
        (clientId) => createDraftSession(clientId)
    );
}
