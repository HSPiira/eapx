import { ChangeType } from '@prisma/client';

interface FieldChange {
    fieldName: string;
    oldValue?: unknown;
    newValue?: unknown;
    changeType: ChangeType;
}

export function computeFieldChanges<T extends Record<string, unknown>>(
    oldData: Partial<T> | null,
    newData: Partial<T>,
    changeType: ChangeType
): FieldChange[] {
    const changes: FieldChange[] = [];

    if (changeType === ChangeType.CREATE) {
        for (const key in newData) {
            changes.push({
                fieldName: key,
                newValue: newData[key],
                changeType: ChangeType.CREATE,
            });
        }
    } else if (changeType === ChangeType.UPDATE) {
        for (const key in newData) {
            if (JSON.stringify(newData[key]) !== JSON.stringify(oldData?.[key])) {
                changes.push({
                    fieldName: key,
                    oldValue: oldData?.[key],
                    newValue: newData[key],
                    changeType: ChangeType.UPDATE,
                });
            }
        }
    } else if (changeType === ChangeType.DELETE) {
        for (const key in oldData || {}) {
            changes.push({
                fieldName: key,
                oldValue: oldData?.[key],
                changeType: ChangeType.DELETE,
            });
        }
    }

    return changes;
}
