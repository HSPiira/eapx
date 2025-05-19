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

export function getPaginationParams(req: NextApiRequest | URLSearchParams): PaginationParams {
    const params = req instanceof URLSearchParams ? req : new URLSearchParams(req.query as Record<string, string>);

    const page = Math.max(1, parseInt(params.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '10')));
    const offset = (page - 1) * limit;
    const search = params.get('search');
    const status = params.get('status');

    return { page, limit, offset, search, status };
}

export function validateDate(date: string | Date | null | undefined, fieldName: string): { isValid: boolean; date: Date | null; error?: string } {
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

export function validateDateRange(startDate: Date, endDate: Date, renewalDate?: Date | null): { isValid: boolean; error?: string } {
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

export function validateRequiredFields(body: Record<string, any>, fields: string[]): { isValid: boolean; error?: string } {
    const missingFields = fields.filter(field => !body[field]);
    if (missingFields.length > 0) {
        return {
            isValid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
        };
    }
    return { isValid: true };
}

export function validateEnumValue(value: string | undefined, enumType: Record<string, string>, fieldName: string): { isValid: boolean; error?: string } {
    if (!value) {
        return { isValid: true };
    }

    if (!Object.values(enumType).includes(value)) {
        return {
            isValid: false,
            error: `Invalid ${fieldName}. Must be one of: ${Object.values(enumType).join(', ')}`
        };
    }

    return { isValid: true };
}

export async function parseRequestBody<T extends Record<string, any>>(request: NextRequest): Promise<{ body: T; error?: string }> {
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

export function validateProviderData(body: Record<string, any>): { isValid: boolean; error?: string } {
    // Validate required fields
    const requiredFieldsResult = validateRequiredFields(body, ['name', 'type']);
    if (!requiredFieldsResult.isValid) {
        return requiredFieldsResult;
    }

    // Validate type
    const typeResult = validateEnumValue(body.type, ServiceProviderType, 'type');
    if (!typeResult.isValid) {
        return typeResult;
    }

    // Validate status if provided
    const statusResult = validateEnumValue(body.status, WorkStatus, 'status');
    if (!statusResult.isValid) {
        return statusResult;
    }

    return { isValid: true };
}

export function validateContractData(body: Record<string, any>): { isValid: boolean; error?: string; data?: any } {
    // Validate required fields
    const requiredFieldsResult = validateRequiredFields(body, ['clientId', 'startDate', 'endDate']);
    if (!requiredFieldsResult.isValid) {
        return requiredFieldsResult;
    }

    // Validate dates
    const startDateResult = validateDate(body.startDate, 'start date');
    if (!startDateResult.isValid) {
        return startDateResult;
    }

    const endDateResult = validateDate(body.endDate, 'end date');
    if (!endDateResult.isValid) {
        return endDateResult;
    }

    const renewalDateResult = validateDate(body.renewalDate, 'renewal date');
    if (!renewalDateResult.isValid) {
        return renewalDateResult;
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
    const paymentStatusResult = validateEnumValue(body.paymentStatus, PaymentStatus, 'payment status');
    if (!paymentStatusResult.isValid) {
        return paymentStatusResult;
    }

    // Validate contract status if provided
    const contractStatusResult = validateEnumValue(body.status, ContractStatus, 'contract status');
    if (!contractStatusResult.isValid) {
        return contractStatusResult;
    }

    return {
        isValid: true,
        data: {
            clientId: body.clientId,
            startDate: startDateResult.date!,
            endDate: endDateResult.date!,
            renewalDate: renewalDateResult.date,
            billingRate: body.billingRate ? parseFloat(body.billingRate) : 0,
            isRenewable: body.isRenewable ?? true,
            isAutoRenew: body.isAutoRenew ?? false,
            paymentStatus: body.paymentStatus || PaymentStatus.PENDING,
            paymentFrequency: body.paymentFrequency,
            paymentTerms: body.paymentTerms,
            currency: body.currency || 'UGX',
            status: body.status || ContractStatus.ACTIVE,
            notes: body.notes,
        }
    };
}

export function validateSessionData(body: Record<string, any>): { isValid: boolean; error?: string; data?: any } {
    // Validate status if provided
    const statusResult = validateEnumValue(body.status, SessionStatus, 'status');
    if (!statusResult.isValid) {
        return statusResult;
    }

    // Validate dates
    const scheduledAtResult = validateDate(body.scheduledAt, 'scheduledAt');
    if (!scheduledAtResult.isValid) {
        return scheduledAtResult;
    }

    const completedAtResult = validateDate(body.completedAt, 'completedAt');
    if (!completedAtResult.isValid) {
        return completedAtResult;
    }

    return {
        isValid: true,
        data: {
            serviceId: body.serviceId,
            providerId: body.providerId,
            beneficiaryId: body.beneficiaryId,
            scheduledAt: scheduledAtResult.date,
            completedAt: completedAtResult.date,
            status: body.status,
            notes: body.notes,
            feedback: body.feedback,
            duration: body.duration,
            location: body.location,
            cancellationReason: body.cancellationReason,
            rescheduleCount: body.rescheduleCount,
            isGroupSession: body.isGroupSession,
            metadata: body.metadata,
        }
    };
}