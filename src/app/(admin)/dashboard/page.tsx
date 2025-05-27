import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentSessions } from "@/components/dashboard/recent-sessions"
import { ServiceProviderStats } from "@/components/dashboard/service-provider-stats"
import { ClientEngagement } from "@/components/dashboard/client-engagement"

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,350</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">
                            +2 new this month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94.2%</div>
                        <p className="text-xs text-muted-foreground">
                            +2.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4">
                <Overview />
            </div>
            <div className="grid gap-4 md:grid-cols-3">

                <Card className="max-h-[430px] flex flex-col shadow-none">
                    <CardHeader>
                        <CardTitle>Recent Sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto flex-1">
                        <RecentSessions />
                    </CardContent>
                </Card>
                <ServiceProviderStats />
                <ClientEngagement />
            </div>
        </div>
    )
}