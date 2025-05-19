import { NextApiRequest } from "next";
import { NextRequest } from 'next/server';
import { ServiceProviderType, WorkStatus, PaymentStatus, ContractStatus, SessionStatus } from '@prisma/client';

interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
    search?: string | null;
    status?: string | null;
}

interface ValidationResult<T = unknown> {
    isValid: boolean;
    error?: string;
    data?: T;
}

interface DateValidationResult {
    isValid: boolean;
    date: Date | null;
    error?: string;
}

interface ContractData {
    clientId: string;
    startDate: Date;
    endDate: Date;
    renewalDate: Date | null;
    billingRate: number;
    isRenewable: boolean;
    isAutoRenew: boolean;
    paymentStatus: PaymentStatus;
    paymentFrequency?: string | null;
    paymentTerms?: string | null;
    currency: string;
    status: ContractStatus;
    notes?: string | null;
}

interface SessionData {
    serviceId: string;
    providerId: string;
    beneficiaryId: string;
    scheduledAt: Date | null;
    completedAt: Date | null;
    status?: SessionStatus;
    notes?: string | null;
    feedback?: string | null;
    duration?: number | null;
    location?: string | null;
    cancellationReason?: string | null;
    rescheduleCount?: number | null;
    isGroupSession?: boolean | null;
    metadata?: Record<string, unknown> | null;
}

interface ProviderData {
    name: string;
    type: ServiceProviderType;
    status?: WorkStatus;
}

export function getPaginationParams(req: NextApiRequest | URLSearchParams): PaginationParams {
    const params = req instanceof URLSearchParams ? req : new URLSearchParams(req.query as Record<string, string>);

    const page = Math.max(1, parseInt(params.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '10')));
    const offset = (page - 1) * limit;
    const search = params.get('search');
    const status = params.get('status');

    return { page, limit, offset, search, status };
}

export function validateDate(date: string | Date | null | undefined, fieldName: string): DateValidationResult {
    if (!date) {
        return { isValid: true, date: null };
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return {
            isValid: false,
            date: null,
            error: `Invalid ${fieldName} format`
        };
    }

    return { isValid: true, date: parsedDate };
}

export function validateDateRange(startDate: Date, endDate: Date, renewalDate?: Date | null): ValidationResult<never> {
    if (endDate <= startDate) {
        return {
            isValid: false,
            error: 'End date must be after start date'
        };
    }

    if (renewalDate && renewalDate <= endDate) {
        return {
            isValid: false,
            error: 'Renewal date must be after end date'
        };
    }

    return { isValid: true };
}

export function validateRequiredFields(body: Record<string, unknown>, fields: string[]): ValidationResult<never> {
    const missingFields = fields.filter(field => !body[field]);
    if (missingFields.length > 0) {
        return {
            isValid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
        };
    }
    return { isValid: true };
}

export function validateEnumValue<T extends string>(
    value: string | undefined,
    enumType: Record<string, T>,
    fieldName: string
): ValidationResult<never> {
    if (!value) {
        return { isValid: true };
    }

    if (!Object.values(enumType).includes(value as T)) {
        return {
            isValid: false,
            error: `Invalid ${fieldName}. Must be one of: ${Object.values(enumType).join(', ')}`
        };
    }

    return { isValid: true };
}

export async function parseRequestBody<T extends Record<string, unknown>>(request: NextRequest): Promise<{ body: T; error?: string }> {
    try {
        const body = await request.json();
        return { body };
    } catch {
        return {
            body: {} as T,
            error: 'Invalid JSON in request body'
        };
    }
}

export function validateProviderData(body: Record<string, unknown>): ValidationResult<ProviderData> {
    // Validate required fields
    const requiredFieldsResult = validateRequiredFields(body, ['name', 'type']);
    if (!requiredFieldsResult.isValid) {
        return requiredFieldsResult;
    }

    // Validate type
    const typeResult = validateEnumValue(body.type as string, ServiceProviderType, 'type');
    if (!typeResult.isValid) {
        return typeResult;
    }

    // Validate status if provided
    if (body.status) {
        const statusResult = validateEnumValue(body.status as string, WorkStatus, 'status');
        if (!statusResult.isValid) {
            return statusResult;
        }
    }

    return {
        isValid: true,
        data: {
            name: body.name as string,
            type: body.type as ServiceProviderType,
            status: body.status as WorkStatus | undefined
        }
    };
}

export function validateContractData(body: Record<string, unknown>): ValidationResult<ContractData> {
    // Validate required fields
    const requiredFieldsResult = validateRequiredFields(body, ['clientId', 'startDate', 'endDate']);
    if (!requiredFieldsResult.isValid) {
        return requiredFieldsResult;
    }

    // Validate dates
    const startDateResult = validateDate(body.startDate as string, 'start date');
    if (!startDateResult.isValid) {
        return { isValid: false, error: startDateResult.error };
    }

    const endDateResult = validateDate(body.endDate as string, 'end date');
    if (!endDateResult.isValid) {
        return { isValid: false, error: endDateResult.error };
    }

    const renewalDateResult = validateDate(body.renewalDate as string, 'renewal date');
    if (!renewalDateResult.isValid) {
        return { isValid: false, error: renewalDateResult.error };
    }

    // Validate date ranges
    const dateRangeResult = validateDateRange(
        startDateResult.date!,
        endDateResult.date!,
        renewalDateResult.date
    );
    if (!dateRangeResult.isValid) {
        return dateRangeResult;
    }

    // Validate payment status if provided
    if (body.paymentStatus) {
        const paymentStatusResult = validateEnumValue(body.paymentStatus as string, PaymentStatus, 'payment status');
        if (!paymentStatusResult.isValid) {
            return paymentStatusResult;
        }
    }

    // Validate contract status if provided
    if (body.status) {
        const contractStatusResult = validateEnumValue(body.status as string, ContractStatus, 'contract status');
        if (!contractStatusResult.isValid) {
            return contractStatusResult;
        }
    }

    return {
        isValid: true,
        data: {
            clientId: body.clientId as string,
            startDate: startDateResult.date!,
            endDate: endDateResult.date!,
            renewalDate: renewalDateResult.date,
            billingRate: body.billingRate ? parseFloat(body.billingRate as string) : 0,
            isRenewable: body.isRenewable as boolean ?? true,
            isAutoRenew: body.isAutoRenew as boolean ?? false,
            paymentStatus: (body.paymentStatus as PaymentStatus) || PaymentStatus.PENDING,
            paymentFrequency: body.paymentFrequency as string | null,
            paymentTerms: body.paymentTerms as string | null,
            currency: (body.currency as string) || 'UGX',
            status: (body.status as ContractStatus) || ContractStatus.ACTIVE,
            notes: body.notes as string | null,
        }
    };
}

export function validateSessionData(body: Record<string, unknown>): ValidationResult<SessionData> {
    // Validate status if provided
    if (body.status) {
        const statusResult = validateEnumValue(body.status as string, SessionStatus, 'status');
        if (!statusResult.isValid) {
            return statusResult;
        }
    }

    // Validate dates
    const scheduledAtResult = validateDate(body.scheduledAt as string, 'scheduledAt');
    if (!scheduledAtResult.isValid) {
        return { isValid: false, error: scheduledAtResult.error };
    }

    const completedAtResult = validateDate(body.completedAt as string, 'completedAt');
    if (!completedAtResult.isValid) {
        return { isValid: false, error: completedAtResult.error };
    }

    return {
        isValid: true,
        data: {
            serviceId: body.serviceId as string,
            providerId: body.providerId as string,
            beneficiaryId: body.beneficiaryId as string,
            scheduledAt: scheduledAtResult.date,
            completedAt: completedAtResult.date,
            status: body.status as SessionStatus | undefined,
            notes: body.notes as string | null,
            feedback: body.feedback as string | null,
            duration: body.duration as number | null,
            location: body.location as string | null,
            cancellationReason: body.cancellationReason as string | null,
            rescheduleCount: body.rescheduleCount as number | null,
            isGroupSession: body.isGroupSession as boolean | null,
            metadata: body.metadata as Record<string, unknown> | null,
        }
    };
}