import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveIcon } from '@/config/icon-map';

const services = [
    {
        title: "Employee Wellness Programs",
        description: "Comprehensive wellness programs designed to support physical and mental health of your workforce.",
        icon: "Briefcase"
    },
    {
        title: "Health Assessments",
        description: "Regular health check-ups and assessments to monitor and maintain employee wellbeing.",
        icon: "Clipboard"
    },
    {
        title: "Mental Health Support",
        description: "Professional counseling and mental health resources for employees.",
        icon: "Users"
    },
    {
        title: "Fitness Programs",
        description: "Customized fitness programs and activities to promote physical health.",
        icon: "BarChart"
    }
];

export default function ServicesPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                <p className="text-lg text-muted-foreground">
                    Comprehensive wellness solutions for your organization
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => {
                    const Icon = resolveIcon(service.icon as any);
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Icon className="w-8 h-8 text-primary" />
                                    <CardTitle>{service.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    {service.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
} 