import { prisma } from '@/lib/prisma';
import { ChangeType, ActionType } from "@prisma/client";
import { computeFieldChanges } from "./fieldChangeUtils";

interface LogEntityChangeParams {
    entityType: string;
    entityId: string;
    changeType: ChangeType | string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    changedBy?: string;
    changeReason?: string;
    metadata?: Record<string, unknown>;
}

interface LogAuditActionParams {
    action: ActionType | string;
    entityType?: string;
    entityId?: string;
    data?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    userId?: string;
}

export async function logEntityChange(params: LogEntityChangeParams) {
    const {
        entityType,
        entityId,
        changeType,
        oldData,
        newData,
        changedBy,
        changeReason,
        metadata,
    } = params;

    const ct: ChangeType = typeof changeType === 'string'
        ? changeType.toUpperCase() as ChangeType
        : changeType;

    const fieldChanges = computeFieldChanges(oldData ?? {}, newData ?? {}, ct).map(change => ({
        ...change,
        changeType: ct,
        oldValue: change.oldValue !== undefined ? JSON.parse(JSON.stringify(change.oldValue)) : undefined,
        newValue: change.newValue !== undefined ? JSON.parse(JSON.stringify(change.newValue)) : undefined,
    }));

    return prisma.entityChange.create({
        data: {
            entityType,
            entityId,
            changeType: ct,
            oldData: oldData !== undefined ? JSON.parse(JSON.stringify(oldData)) : undefined,
            newData: newData !== undefined ? JSON.parse(JSON.stringify(newData)) : undefined,
            changedBy,
            changeReason,
            metadata: metadata !== undefined ? JSON.parse(JSON.stringify(metadata)) : undefined,
            fieldChanges: {
                create: fieldChanges,
            },
        },
    });
}

export async function logAuditAction(params: LogAuditActionParams) {
    const {
        action,
        entityType,
        entityId,
        data,
        ipAddress,
        userAgent,
        userId,
    } = params;

    const act: ActionType = typeof action === 'string'
        ? action.toUpperCase() as ActionType
        : action;

    return prisma.auditLog.create({
        data: {
            action: act,
            entityType,
            entityId,
            data: data !== undefined ? JSON.parse(JSON.stringify(data)) : undefined,
            ipAddress,
            userAgent,
            userId,
        },
    });
}
