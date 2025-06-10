import { useEffect } from "react";
import { ClientDetailsData } from "@/app/(admin)/sessions/[sessionId]/types";
import { SessionType } from "@prisma/client";

type SetDataFunction = (data: ClientDetailsData) => void;

export const useValidateSessionType = (
    sessionFor: 'organization' | 'staff',
    data: ClientDetailsData,
    setData: SetDataFunction,
    orgTypes: readonly SessionType[],
    staffTypes: readonly SessionType[]
) => {
    useEffect(() => {
        const validTypes = sessionFor === 'organization' ? orgTypes : staffTypes;
        const defaultType = validTypes[0];

        if (!data.sessionType || !validTypes.includes(data.sessionType)) {
            setData({ ...data, sessionType: defaultType });
        }
    }, [sessionFor, data, setData, orgTypes, staffTypes]);
};
