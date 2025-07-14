interface CalendarSettings {
    workingHours: {
        start: string;
        end: string;
    };
    timeZone: string;
    defaultDuration: number;
    bufferTime: number;
    workingDays: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
    autoConfirm: boolean;
}
