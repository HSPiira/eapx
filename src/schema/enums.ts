import { z } from "zod";

export const ServiceProviderType = z.enum([
    "COUNSELOR",
    "CLINIC",
    "HOTLINE",
    "COACH",
    "OTHER"
]);

export const ProviderEntityType = z.enum([
    "INDIVIDUAL",
    "COMPANY"
]);

export const WorkStatus = z.enum([
    "ACTIVE",
    "INACTIVE",
    "ON_LEAVE",
    "TERMINATED",
    "SUSPENDED",
    "RESIGNED"
]);