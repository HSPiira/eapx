"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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
    { month: "January", sessions: 186, satisfaction: 4.8 },
    { month: "February", sessions: 305, satisfaction: 4.9 },
    { month: "March", sessions: 237, satisfaction: 4.7 },
    { month: "April", sessions: 273, satisfaction: 4.9 },
    { month: "May", sessions: 309, satisfaction: 4.8 },
    { month: "June", sessions: 314, satisfaction: 4.9 },
]

const chartConfig = {
    sessions: {
        label: "Sessions",
        color: "oklch(var(--chart-1))",
    },
} satisfies ChartConfig

export function ServiceProviderStats() {
    const averageSatisfaction = chartData.reduce((acc, curr) => acc + curr.satisfaction, 0) / chartData.length

    return (
        <Card className="max-h-[430px] flex flex-col shadow-none">
            <CardHeader>
                <CardTitle>Monthly Session Overview</CardTitle>
                <CardDescription>Showing total sessions for the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex items-center justify-center">
                <ChartContainer config={chartConfig} className="w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="sessions" fill="oklch(var(--chart-1))" radius={8}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Average client satisfaction: {averageSatisfaction.toFixed(1)}/5.0
                </div>
            </CardFooter>
        </Card>
    )
}
