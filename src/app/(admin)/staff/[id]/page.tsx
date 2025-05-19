import React from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getStaffMember(id: string) {
    const staff = await prisma.staff.findUnique({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            profile: true,
            client: {
                select: {
                    name: true,
                },
            },
            beneficiaries: {
                include: {
                    profile: true,
                },
            },
            ServiceSession: {
                include: {
                    service: true,
                    beneficiary: {
                        include: {
                            profile: true,
                        },
                    },
                },
            },
        },
    });

    if (!staff) {
        return null;
    }

    return {
        ...staff,
        fullName: staff.profile.fullName,
        email: staff.profile.email,
        phone: staff.profile.phone,
    };
}

type Params = Promise<{ id: string }>;

export default async function StaffDetailsPage({
    params,
}: {
    params: Params;
}) {
    const { id } = await params;
    const staff = await getStaffMember(id);

    if (!staff) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{staff.fullName}</h1>
                    <p className="text-muted-foreground">{staff.email}</p>
                </div>
                <Link href={`/staff/${id}/edit`}>
                    <Button>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Staff
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
                    <TabsTrigger value="sessions">Service Sessions</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium">Role</p>
                                    <Badge variant="secondary">{staff.role}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge variant={staff.status === "ACTIVE" ? "default" : "secondary"}>
                                        {staff.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Organization</p>
                                    <p>{staff.client.name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p>{staff.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Emergency Contact</p>
                                    <p>{staff.emergencyContactName || 'Not provided'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {staff.emergencyContactPhone || 'No phone number'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium">Start Date</p>
                                    <p>{new Date(staff.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">End Date</p>
                                    <p>{staff.endDate ? new Date(staff.endDate).toLocaleDateString() : 'Not set'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Qualifications & Specializations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Qualifications</p>
                                    <div className="flex flex-wrap gap-2">
                                        {staff.qualifications.map((qualification, index) => (
                                            <Badge key={index} variant="outline">
                                                {qualification}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-2">Specializations</p>
                                    <div className="flex flex-wrap gap-2">
                                        {staff.specializations.map((specialization, index) => (
                                            <Badge key={index} variant="outline">
                                                {specialization}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="beneficiaries">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Beneficiaries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {staff.beneficiaries.length > 0 ? (
                                <div className="space-y-4">
                                    {staff.beneficiaries.map((beneficiary) => (
                                        <div key={beneficiary.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{beneficiary.profile.fullName}</p>
                                                <p className="text-sm text-muted-foreground">{beneficiary.relation}</p>
                                            </div>
                                            <Link href={`/beneficiaries/${beneficiary.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No beneficiaries assigned</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {staff.ServiceSession.length > 0 ? (
                                <div className="space-y-4">
                                    {staff.ServiceSession.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{session.service.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(session.scheduledAt).toLocaleString()}
                                                </p>
                                                {session.beneficiary && (
                                                    <p className="text-sm">
                                                        Beneficiary: {session.beneficiary.profile.fullName}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant={session.status === "COMPLETED" ? "default" : "secondary"}>
                                                {session.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No service sessions found</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Documents feature coming soon</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 