'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    className?: string;
}

export function DataTable<T extends { id: string }>({
    data,
    columns,
    onRowClick,
    className,
}: DataTableProps<T>) {
    const renderCell = (item: T, column: Column<T>) => {
        if (column.cell) {
            return column.cell(item);
        }

        if (typeof column.accessor === 'function') {
            return column.accessor(item);
        }

        const value = item[column.accessor as keyof T] as any;
        return value?.toString() || '-';
    };

    return (
        <div className="w-full overflow-x-auto rounded-sm border border-border bg-background">
            <Table className={cn("min-w-full text-sm text-left whitespace-nowrap", className)}>
                <TableHeader>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableHead key={index} className="px-6 py-4 font-semibold tracking-wide">
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow
                            key={item.id}
                            className={cn(
                                "hover:bg-muted/50 cursor-pointer transition-colors border-b border-border",
                                { 'cursor-pointer': !!onRowClick }
                            )}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((column, index) => (
                                <TableCell key={index} className="px-6 py-3">
                                    {renderCell(item, column)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}