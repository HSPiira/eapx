"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { type: "individual", sessions: 275, fill: "oklch(var(--chart-1))" },
    { type: "couples", sessions: 200, fill: "oklch(var(--chart-2))" },
    { type: "group", sessions: 287, fill: "oklch(var(--chart-3))" },
    { type: "family", sessions: 173, fill: "oklch(var(--chart-4))" },
    { type: "emergency", sessions: 190, fill: "oklch(var(--chart-5))" },
]

const chartConfig = {
    sessions: {
        label: "Sessions",
    },
    individual: {
        label: "Individual",
        color: "oklch(var(--chart-1))",
    },
    couples: {
        label: "Couples",
        color: "oklch(var(--chart-2))",
    },
    group: {
        label: "Group",
        color: "oklch(var(--chart-3))",
    },
    family: {
        label: "Family",
        color: "oklch(var(--chart-4))",
    },
    emergency: {
        label: "Emergency",
        color: "oklch(var(--chart-5))",
    },
} satisfies ChartConfig

export function ClientEngagement() {
    const totalSessions = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.sessions, 0)
    }, [])

    return (
        <Card className="flex flex-col max-h-[430px] shadow-none">
            <CardHeader className="items-center pb-0">
                <CardTitle>Session Type Distribution</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="sessions"
                            nameKey="type"
                            innerRadius={60}
                            strokeWidth={5}
                            stroke="oklch(var(--background))"
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalSessions.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Total Sessions
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing session distribution by type for the last 6 months
                </div>
            </CardFooter>
        </Card>
    )
}
