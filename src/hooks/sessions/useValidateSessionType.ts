import { useEffect } from "react";

export const useValidateSessionType = (sessionFor, data, setData, orgTypes, staffTypes) => {
    useEffect(() => {
        const validTypes = sessionFor === 'organization' ? orgTypes : staffTypes;
        const defaultType = validTypes[0];

        if (!data.sessionType || !validTypes.includes(data.sessionType)) {
            setData({ ...data, sessionType: defaultType });
        }
    }, [sessionFor, data, setData, orgTypes, staffTypes]);
};
