'use client';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Video, MapPin, Copy, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";

interface FeedbackFormProps {
    sessionId: string;
}

export function FeedbackForm({ sessionId }: FeedbackFormProps) {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [symptoms, setSymptoms] = useState('');

    // Verify token on page load
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(`/api/verify-feedback-token?sessionId=${sessionId}&token=${token}`);
                if (!response.ok) {
                    throw new Error('Invalid or expired token');
                }
                setIsAuthorized(true);
            } catch (error) {
                toast({
                    title: "Access Denied",
                    description: `This feedback page is not accessible. Please use the link provided in your email. ${error}`,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            verifyToken();
        } else {
            setIsLoading(false);
            toast({
                title: "Access Denied",
                description: "This feedback page is not accessible. Please use the link provided in your email.",
                variant: "destructive",
            });
        }
    }, [sessionId, token, toast]);

    // TODO: Fetch session data using sessionId
    const sessionData = {
        id: sessionId,
        scheduledAt: new Date(), // This will be replaced with actual data
        duration: 60, // This will be replaced with actual data
        provider: {
            name: "Dr. Sarah Johnson",
            email: "sarah.johnson@healthcare.com"
        },
        company: {
            name: "Tech Solutions Ltd"
        },
        staff: {
            name: "John Smith",
            gender: "Male",
            companyId: "TSL-2024-001",
            identifier: "ID-12345678",
            tel: "+254 712 345 678",
            email: "john.smith@techsolutions.co.ke",
            nextOfKin: {
                name: "Mary Smith",
                tel: "+254 733 456 789",
                email: "mary.smith@email.com"
            }
        },
        requestNotes: "Test notes as provided from the session request",
        service: {
            name: "individual",
            intervention: "counseling",
            rate: 0,
            issue: "",
            diagnosis: ""
        }
    };

    const [copied, setCopied] = useState(false);
    const [serviceEdit, setServiceEdit] = useState(false);
    const [interventionEdit, setInterventionEdit] = useState(false);
    const [serviceValue, setServiceValue] = useState(sessionData.service.name);
    const [interventionValue, setInterventionValue] = useState(sessionData.service.intervention);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md p-6">
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        This feedback page is not accessible. Please use the link provided in your email.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl">
            {/* Fixed Header Section */}
            <div className="sticky top-0 bg-white dark:bg-black z-10 pt-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                    {/* Session Info Row */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Session ID: {sessionData.id}</span>
                        <span>•</span>
                        <span>{format(sessionData.scheduledAt, 'PPP')}</span>
                        <span>•</span>
                        <span>{format(sessionData.scheduledAt, 'p')}</span>
                        <span>•</span>
                        <span>{sessionData.duration} minutes</span>
                    </div>

                    {/* Location Row */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {(() => {
                            const locationType = "MS Teams"; // or "Zoom" or "Physical Office"
                            const locationLink = "https://teams.microsoft.com/l/meetup-join/123456789012345678901234567890";
                            const address = "ABC Plaza, 3rd Floor, Nairobi";
                            if (locationType === "MS Teams" || locationType === "Zoom") {
                                return (
                                    <>
                                        <Video className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{locationType}</span>
                                        <span
                                            className="text-gray-900 dark:text-gray-100 font-medium font-mono bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-0.5 max-w-xs truncate inline-block align-middle cursor-pointer"
                                            title={locationLink}
                                            onClick={() => {
                                                window.open(locationLink, '_blank', 'noopener,noreferrer');
                                            }}
                                        >
                                            {locationLink}
                                        </span>
                                        <button
                                            type="button"
                                            className="ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title={copied ? 'Copied!' : 'Copy to clipboard'}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await navigator.clipboard.writeText(locationLink);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 1200);
                                            }}
                                        >
                                            <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </>
                                );
                            } else {
                                return (
                                    <>
                                        <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Address:</span>
                                        <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-xs inline-block align-middle" title={address}>{address}</span>
                                    </>
                                );
                            }
                        })()}
                    </div>

                    {/* Provider Info */}
                    <div className="text-sm flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        <span className="text-gray-600 dark:text-gray-400">Appointment by: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{sessionData.provider.name}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-6">
                {/* Bio Section */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bio Information</h2>

                    <div className="grid grid-cols-1 gap-2">
                        {/* Company Name */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.company.name}</span>
                        </div>

                        {/* Staff Name and Gender */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Staff Name:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.name}</span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-4">Gender:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.gender}</span>
                        </div>

                        {/* Staff Company ID and Identifier */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Staff Company ID:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.companyId}</span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-4">Identifier:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.identifier}</span>
                        </div>

                        {/* Contact Information */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tel:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.tel}</span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-4">Email:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.email}</span>
                        </div>

                        {/* Next of Kin Information */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Next of Kin:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.nextOfKin.name}</span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-4">Tel:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.nextOfKin.tel}</span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-4">Email:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sessionData.staff.nextOfKin.email}</span>
                        </div>
                    </div>
                </div>

                {/* Service Section */}
                <div className="mt-8 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Service Information</h2>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Request Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Notes:</label>
                            <div className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                {sessionData.requestNotes}
                            </div>
                        </div>

                        {/* Service Provider */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px]">Service Provider:</span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{sessionData.provider.name}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-8 min-w-[80px]">Email:</span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{sessionData.provider.email}</span>
                        </div>

                        {/* Service Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service:</label>
                            <div className="flex items-center gap-2">
                                <Select
                                    disabled={!serviceEdit}
                                    value={serviceValue}
                                    onValueChange={setServiceValue}
                                >
                                    <SelectTrigger className="rounded-sm flex-1">
                                        <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="group">Group</SelectItem>
                                        <SelectItem value="couple">Couple</SelectItem>
                                    </SelectContent>
                                </Select>
                                {serviceEdit ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3"
                                        onClick={() => setServiceEdit(false)}
                                    >
                                        Confirm
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setServiceEdit(true)}
                                    >
                                        <RefreshCcw className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Intervention Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Intervention:</label>
                            <div className="flex items-center gap-2">
                                <Select
                                    disabled={!interventionEdit}
                                    value={interventionValue}
                                    onValueChange={setInterventionValue}
                                >
                                    <SelectTrigger className="rounded-sm flex-1">
                                        <SelectValue placeholder="Select an intervention" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="counseling">Counseling</SelectItem>
                                        <SelectItem value="therapy">Therapy</SelectItem>
                                        <SelectItem value="coaching">Coaching</SelectItem>
                                    </SelectContent>
                                </Select>
                                {interventionEdit ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3"
                                        onClick={() => setInterventionEdit(false)}
                                    >
                                        Confirm
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setInterventionEdit(true)}
                                    >
                                        <RefreshCcw className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 