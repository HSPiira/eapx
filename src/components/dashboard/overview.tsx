"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
const chartData = [
    { date: "2024-04-01", inPerson: 222, online: 150 },
    { date: "2024-04-02", inPerson: 97, online: 180 },
    { date: "2024-04-03", inPerson: 167, online: 120 },
    { date: "2024-04-04", inPerson: 242, online: 260 },
    { date: "2024-04-05", inPerson: 373, online: 290 },
    { date: "2024-04-06", inPerson: 301, online: 340 },
    { date: "2024-04-07", inPerson: 245, online: 180 },
    { date: "2024-04-08", inPerson: 409, online: 320 },
    { date: "2024-04-09", inPerson: 59, online: 110 },
    { date: "2024-04-10", inPerson: 261, online: 190 },
    { date: "2024-04-11", inPerson: 327, online: 350 },
    { date: "2024-04-12", inPerson: 292, online: 210 },
    { date: "2024-04-13", inPerson: 342, online: 380 },
    { date: "2024-04-14", inPerson: 137, online: 220 },
    { date: "2024-04-15", inPerson: 120, online: 170 },
    { date: "2024-04-16", inPerson: 138, online: 190 },
    { date: "2024-04-17", inPerson: 446, online: 360 },
    { date: "2024-04-18", inPerson: 364, online: 410 },
    { date: "2024-04-19", inPerson: 243, online: 180 },
    { date: "2024-04-20", inPerson: 89, online: 150 },
    { date: "2024-04-21", inPerson: 137, online: 200 },
    { date: "2024-04-22", inPerson: 224, online: 170 },
    { date: "2024-04-23", inPerson: 138, online: 230 },
    { date: "2024-04-24", inPerson: 387, online: 290 },
    { date: "2024-04-25", inPerson: 215, online: 250 },
    { date: "2024-04-26", inPerson: 75, online: 130 },
    { date: "2024-04-27", inPerson: 383, online: 420 },
    { date: "2024-04-28", inPerson: 122, online: 180 },
    { date: "2024-04-29", inPerson: 315, online: 240 },
    { date: "2024-04-30", inPerson: 454, online: 380 },
    { date: "2024-05-01", inPerson: 165, online: 220 },
    { date: "2024-05-02", inPerson: 293, online: 310 },
    { date: "2024-05-03", inPerson: 247, online: 190 },
    { date: "2024-05-04", inPerson: 385, online: 420 },
    { date: "2024-05-05", inPerson: 481, online: 390 },
    { date: "2024-05-06", inPerson: 498, online: 520 },
    { date: "2024-05-07", inPerson: 388, online: 300 },
    { date: "2024-05-08", inPerson: 149, online: 210 },
    { date: "2024-05-09", inPerson: 227, online: 180 },
    { date: "2024-05-10", inPerson: 293, online: 330 },
    { date: "2024-05-11", inPerson: 335, online: 270 },
    { date: "2024-05-12", inPerson: 197, online: 240 },
    { date: "2024-05-13", inPerson: 197, online: 160 },
    { date: "2024-05-14", inPerson: 448, online: 490 },
    { date: "2024-05-15", inPerson: 473, online: 380 },
    { date: "2024-05-16", inPerson: 338, online: 400 },
    { date: "2024-05-17", inPerson: 499, online: 420 },
    { date: "2024-05-18", inPerson: 315, online: 350 },
    { date: "2024-05-19", inPerson: 235, online: 180 },
    { date: "2024-05-20", inPerson: 177, online: 230 },
    { date: "2024-05-21", inPerson: 82, online: 140 },
    { date: "2024-05-22", inPerson: 81, online: 120 },
    { date: "2024-05-23", inPerson: 252, online: 290 },
    { date: "2024-05-24", inPerson: 294, online: 220 },
    { date: "2024-05-25", inPerson: 201, online: 250 },
    { date: "2024-05-26", inPerson: 213, online: 170 },
    { date: "2024-05-27", inPerson: 420, online: 460 },
    { date: "2024-05-28", inPerson: 233, online: 190 },
    { date: "2024-05-29", inPerson: 78, online: 130 },
    { date: "2024-05-30", inPerson: 340, online: 280 },
    { date: "2024-05-31", inPerson: 178, online: 230 },
    { date: "2024-06-01", inPerson: 178, online: 200 },
    { date: "2024-06-02", inPerson: 470, online: 410 },
    { date: "2024-06-03", inPerson: 103, online: 160 },
    { date: "2024-06-04", inPerson: 439, online: 380 },
    { date: "2024-06-05", inPerson: 88, online: 140 },
    { date: "2024-06-06", inPerson: 294, online: 250 },
    { date: "2024-06-07", inPerson: 323, online: 370 },
    { date: "2024-06-08", inPerson: 385, online: 320 },
    { date: "2024-06-09", inPerson: 438, online: 480 },
    { date: "2024-06-10", inPerson: 155, online: 200 },
    { date: "2024-06-11", inPerson: 92, online: 150 },
    { date: "2024-06-12", inPerson: 492, online: 420 },
    { date: "2024-06-13", inPerson: 81, online: 130 },
    { date: "2024-06-14", inPerson: 426, online: 380 },
    { date: "2024-06-15", inPerson: 307, online: 350 },
    { date: "2024-06-16", inPerson: 371, online: 310 },
    { date: "2024-06-17", inPerson: 475, online: 520 },
    { date: "2024-06-18", inPerson: 107, online: 170 },
    { date: "2024-06-19", inPerson: 341, online: 290 },
    { date: "2024-06-20", inPerson: 408, online: 450 },
    { date: "2024-06-21", inPerson: 169, online: 210 },
    { date: "2024-06-22", inPerson: 317, online: 270 },
    { date: "2024-06-23", inPerson: 480, online: 530 },
    { date: "2024-06-24", inPerson: 132, online: 180 },
    { date: "2024-06-25", inPerson: 141, online: 190 },
    { date: "2024-06-26", inPerson: 434, online: 380 },
    { date: "2024-06-27", inPerson: 448, online: 490 },
    { date: "2024-06-28", inPerson: 149, online: 200 },
    { date: "2024-06-29", inPerson: 103, online: 160 },
    { date: "2024-06-30", inPerson: 446, online: 400 },
]

const chartConfig = {
    visitors: {
        label: "Sessions",
    },
    inPerson: {
        label: "In-Person",
        color: "oklch(var(--chart-1))",
    },
    online: {
        label: "Online",
        color: "oklch(var(--chart-2))",
    },
} satisfies ChartConfig

export function Overview() {
    const [timeRange, setTimeRange] = React.useState("90d")

    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date)
        const referenceDate = new Date("2024-06-30")
        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }
        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)
        return date >= startDate
    })

    return (
        <Card className="max-h-[430px] flex flex-col shadow-none">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Session Distribution</CardTitle>
                    <CardDescription>
                        Showing total therapy sessions for the last 3 months
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillInPerson" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="oklch(var(--chart-1))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="oklch(var(--chart-1))"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillOnline" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="oklch(var(--chart-2))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="oklch(var(--chart-2))"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="online"
                            type="natural"
                            fill="url(#fillOnline)"
                            stroke="oklch(var(--chart-2))"
                            stackId="a"
                        />
                        <Area
                            dataKey="inPerson"
                            type="natural"
                            fill="url(#fillInPerson)"
                            stroke="oklch(var(--chart-1))"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
