import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveIcon, IconKey } from '@/config/icon-map';

interface Stat {
    title: string;
    value: string;
    icon: IconKey;
    description: string;
}

const stats: Stat[] = [
    {
        title: "Active Services",
        value: "12",
        icon: "Briefcase",
        description: "Currently active wellness programs"
    },
    {
        title: "Total Enrollments",
        value: "1,234",
        icon: "Users",
        description: "Employees enrolled in programs"
    },
    {
        title: "Program Completion",
        value: "85%",
        icon: "BarChart",
        description: "Average completion rate"
    }
];

export function ServiceStats() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => {
                const Icon = resolveIcon(stat.icon);
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 