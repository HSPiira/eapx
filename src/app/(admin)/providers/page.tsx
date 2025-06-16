'use client';

import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { MeetingProgressDialog } from "@/components/MeetingProgressDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createMeeting } from "@/api/meetings";
import { createCalendar } from "@/api/calendars";
import { sendEmail } from "@/api/email";

export default function ProvidersPage() {
    // Meeting creation states
    const [meetingLoading, setMeetingLoading] = useState(false);
    const [meetingError, setMeetingError] = useState<string | null>(null);
    const [meetingLink, setMeetingLink] = useState<string | null>(null);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const { data: session } = useSession();
    const [meetingStages, setMeetingStages] = useState<Array<{ id: string; name: string; status: 'pending' | 'loading' | 'complete' | 'error' }>>([
        { id: 'teams-meeting', name: 'Creating Teams meeting link', status: 'pending' },
        { id: 'teams-calendar', name: 'Creating calendar event', status: 'pending' }
    ]);
    const [zoomMeetingStages, setZoomMeetingStages] = useState<Array<{ id: string; name: string; status: 'pending' | 'loading' | 'complete' | 'error' }>>([
        { id: 'zoom-meeting', name: 'Creating Zoom meeting', status: 'pending' },
        { id: 'zoom-calendar', name: 'Creating calendar event', status: 'pending' }
    ]);
    const [zoomMeetingLoading, setZoomMeetingLoading] = useState(false);
    const [zoomMeetingError, setZoomMeetingError] = useState<string | null>(null);
    const [zoomMeetingLink, setZoomMeetingLink] = useState<string | null>(null);
    const [calendarEventError, setCalendarEventError] = useState<string | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);
    const [simDialogOpen, setSimDialogOpen] = useState(false);
    const sessionSimSteps = useMemo(() => [
        "Checking session details validity",
        "Generating session MS Teams meeting link",
        "Creating calendar event for the session",
        "Confirming session"
    ], []);
    const confirmingSubSteps = useMemo(() => [
        "Generating client booking confirmation email",
        "Generating provider confirmation booking email",
        "Generating provider session feedback email",
        "Sending client confirmation email",
        "Sending provider confirmation email"
    ], []);
    const [simSteps, setSimSteps] = useState(
        sessionSimSteps.map((name) => ({ name, status: "pending" as 'pending' | 'loading' | 'complete' }))
    );
    const [subSteps, setSubSteps] = useState(
        confirmingSubSteps.map((name) => ({ name, status: "pending" as 'pending' | 'loading' | 'complete' }))
    );

    // Store active timeout IDs
    const timeoutRef = useRef<number[]>([]);

    // Start simulation when dialog opens
    useEffect(() => {
        if (simDialogOpen) {
            let step = 0;
            let subStep = 0;
            setSimSteps(sessionSimSteps.map((name, i) => ({ name, status: i === 0 ? 'loading' : 'pending' })));
            setSubSteps(confirmingSubSteps.map((name) => ({ name, status: 'pending' })));

            const runStep = () => {
                if (step < 3) { // Main steps before confirming session
                    setSimSteps((prev) =>
                        prev.map((s, i) =>
                            i < step
                                ? { ...s, status: 'complete' }
                                : i === step
                                    ? { ...s, status: 'loading' }
                                    : { ...s, status: 'pending' }
                        )
                    );
                    const timeoutId = window.setTimeout(() => {
                        step++;
                        runStep();
                    }, 1200);
                    timeoutRef.current.push(timeoutId);
                } else if (step === 3) { // Confirming session
                    setSimSteps((prev) =>
                        prev.map((s, i) =>
                            i < step
                                ? { ...s, status: 'complete' }
                                : i === step
                                    ? { ...s, status: 'loading' }
                                    : { ...s, status: 'pending' }
                        )
                    );
                    // Start sub-steps
                    const runSubStep = () => {
                        setSubSteps((prev) =>
                            prev.map((s, i) =>
                                i < subStep
                                    ? { ...s, status: 'complete' }
                                    : i === subStep
                                        ? { ...s, status: 'loading' }
                                        : { ...s, status: 'pending' }
                            )
                        );
                        const timeoutId = window.setTimeout(() => {
                            if (subStep < confirmingSubSteps.length - 1) {
                                subStep++;
                                runSubStep();
                            } else {
                                setSubSteps((prev) => prev.map((s, i) => ({ ...s, status: i <= subStep ? 'complete' : 'pending' })));
                                setSimSteps((prev) => prev.map((s, i) => i < step ? { ...s, status: 'complete' } : i === step ? { ...s, status: 'complete' } : s));
                            }
                        }, 1200);
                        timeoutRef.current.push(timeoutId);
                    };
                    runSubStep();
                }
            };
            runStep();
        } else {
            setSimSteps(sessionSimSteps.map((name) => ({ name, status: "pending" })));
            setSubSteps(confirmingSubSteps.map((name) => ({ name, status: "pending" })));
        }

        // Cleanup function to clear all timeouts
        return () => {
            timeoutRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
            timeoutRef.current = [];
        };
    }, [simDialogOpen, sessionSimSteps, confirmingSubSteps]);

    // Helper function to handle API errors
    const handleApiError = (error: unknown, defaultMessage: string) => {
        console.error('API Error:', error);
        // Check if it's a Zoom API error
        if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
            return `Zoom API Error: ${error.message}`;
        }
        if (typeof error === 'object' && error !== null && 'response' in error &&
            typeof error.response === 'object' && error.response !== null && 'status' in error.response) {
            if (error.response.status === 401) {
                return 'Your session has expired. Please sign in again.';
            }
            if (error.response.status === 403) {
                return 'You do not have permission to perform this action.';
            }
        }
        if (typeof error === 'object' && error !== null && 'message' in error &&
            typeof error.message === 'string' && error.message.includes('access token')) {
            return 'Authentication failed. Please sign in again.';
        }
        // Return the full error message if available
        if (typeof error === 'object' && error !== null) {
            return (error as { error?: string; message?: string }).error || (error as { error?: string; message?: string }).message || defaultMessage;
        }
        return defaultMessage;
    };

    // Handler to create MS Teams meeting
    const handleCreateMeeting = async () => {
        setMeetingLoading(true);
        setMeetingError(null);
        setMeetingLink(null);
        setCalendarEventError(null);
        setMeetingStages([
            { id: 'teams-meeting', name: 'Creating Teams meeting link', status: 'loading' },
            { id: 'teams-calendar', name: 'Creating calendar event', status: 'pending' }
        ]);

        try {
            const accessToken = session?.user.access_token;
            if (!accessToken) {
                throw new Error('No access token found. Please sign in again.');
            }

            // Prepare meeting times (ISO8601)
            const startDateTime = new Date().toISOString();
            const endDateTime = new Date(Date.now() + 60 * 60000).toISOString(); // 60 minutes duration

            // Step 1: Create Teams meeting
            const meetingData = {
                subject: 'Test Session with Dr. Sarah Johnson',
                startDateTime,
                endDateTime,
                attendees: ['sekiboh@gmail.com', 'henry.ssekibo@minet.co.ug'],
                body: 'This is a test meeting created from the providers page.',
                location: 'Virtual Meeting Room (MS Teams)',
                platform: 'teams' as const
            };

            const meeting = await createMeeting(meetingData, accessToken);
            const meetingUrl = meeting.joinUrl;
            if (!meetingUrl) {
                throw new Error('Teams meeting was created but no join link was returned.');
            }

            setMeetingStages([
                { id: 'teams-meeting', name: 'Creating Teams meeting link', status: 'complete' },
                { id: 'teams-calendar', name: 'Creating calendar event', status: 'loading' }
            ]);

            // Step 2: Create Calendar event
            const calendarData = {
                subject: meetingData.subject,
                startDateTime,
                endDateTime,
                attendees: meetingData.attendees,
                body: meetingData.body,
                location: meetingData.location,
                joinUrl: meetingUrl
            };

            await createCalendar(calendarData);
            setMeetingStages([
                { id: 'teams-meeting', name: 'Creating Teams meeting link', status: 'complete' },
                { id: 'teams-calendar', name: 'Creating calendar event', status: 'complete' }
            ]);

            setMeetingLink(meetingUrl);

            // Wait a bit before closing the dialog
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMeetingStages([
                { id: 'teams-meeting', name: 'Creating Teams meeting link', status: 'pending' },
                { id: 'teams-calendar', name: 'Creating calendar event', status: 'pending' }
            ]);

        } catch (err) {
            console.error('Meeting creation error:', err);
            setMeetingStages([
                { id: 'teams-meeting', name: 'Creating Teams meeting link', status: 'error' },
                { id: 'teams-calendar', name: 'Creating calendar event', status: 'error' }
            ]);
            setMeetingError(handleApiError(err, 'Failed to create meeting. Please try again.'));
        } finally {
            setMeetingLoading(false);
        }
    };

    // Handler to create Zoom meeting
    const handleCreateZoomMeeting = async () => {
        setZoomMeetingLoading(true);
        setZoomMeetingError(null);
        setZoomMeetingLink(null);
        setCalendarEventError(null);
        setZoomMeetingStages([
            { id: 'zoom-meeting', name: 'Creating Zoom meeting', status: 'loading' },
            { id: 'zoom-calendar', name: 'Creating calendar event', status: 'pending' }
        ]);

        try {
            const accessToken = session?.user.access_token;
            if (!accessToken) {
                throw new Error('No access token found. Please sign in again.');
            }

            // Prepare meeting times (ISO8601)
            const startDateTime = new Date().toISOString();
            const endDateTime = new Date(Date.now() + 60 * 60000).toISOString(); // 60 minutes duration

            // Step 1: Create Zoom meeting
            const meetingData = {
                subject: 'Test Session with Dr. Sarah Johnson',
                startDateTime,
                endDateTime,
                attendees: [
                    'sekiboh@gmail.com',
                    'henry.ssekibo@minet.co.ug'
                ],
                platform: 'zoom' as const,
                settings: {
                    hostVideo: true,
                    participantVideo: true,
                    joinBeforeHost: false,
                    muteUponEntry: true,
                    waitingRoom: false,
                    meetingAuthentication: false
                }
            };

            const meeting = await createMeeting(meetingData, accessToken);
            const meetingUrl = meeting.joinUrl;
            if (!meetingUrl) {
                throw new Error('Zoom meeting was created but no join link was returned.');
            }

            setZoomMeetingStages([
                { id: 'zoom-meeting', name: 'Creating Zoom meeting', status: 'complete' },
                { id: 'zoom-calendar', name: 'Creating calendar event', status: 'loading' }
            ]);

            // Step 2: Create Calendar event
            const calendarData = {
                subject: meetingData.subject,
                startDateTime,
                endDateTime,
                attendees: meetingData.attendees,
                body: `This is a Zoom meeting created from the providers page.
                
Join Zoom Meeting
${meetingUrl}

Meeting ID: ${meeting.id}
Password: ${meeting.settings?.password || 'No password required'}
Host: Hope Minet

If you have any questions, please contact the meeting organizer.`,
                location: 'Virtual Meeting Room (Zoom)',
                joinUrl: meetingUrl
            };

            await createCalendar(calendarData);
            setZoomMeetingStages([
                { id: 'zoom-meeting', name: 'Creating Zoom meeting', status: 'complete' },
                { id: 'zoom-calendar', name: 'Creating calendar event', status: 'complete' }
            ]);

            setZoomMeetingLink(meetingUrl);

            // Wait a bit before closing the dialog
            await new Promise(resolve => setTimeout(resolve, 1000));
            setZoomMeetingStages([
                { id: 'zoom-meeting', name: 'Creating Zoom meeting', status: 'pending' },
                { id: 'zoom-calendar', name: 'Creating calendar event', status: 'pending' }
            ]);

        } catch (err) {
            console.error('Zoom meeting creation error:', err);
            setZoomMeetingStages([
                { id: 'zoom-meeting', name: 'Creating Zoom meeting', status: 'error' },
                { id: 'zoom-calendar', name: 'Creating calendar event', status: 'error' }
            ]);
            setZoomMeetingError(handleApiError(err, 'Failed to create Zoom meeting. Please try again.'));
        } finally {
            setZoomMeetingLoading(false);
        }
    };

    // Handler to send test email
    const handleSendTestEmail = async () => {
        setEmailLoading(true);
        setEmailError(null);
        setEmailSuccess(false);
        try {
            if (!session?.user?.email) {
                throw new Error('No email address found. Please sign in with an email address.');
            }

            await sendEmail({
                to: session.user.email,
                subject: 'Test Email from Providers Page',
                template: 'vercel-invite-user',
                templateProps: {
                    username: session.user.name || 'User',
                    invitedByUsername: 'System',
                    inviteLink: 'https://example.com/invite',
                    invitedByEmail: 'system@example.com'
                }
            });

            setEmailSuccess(true);
        } catch (err) {
            console.error('Email sending error:', err);
            setEmailError(handleApiError(err, 'Failed to send email. Please try again.'));
        } finally {
            setEmailLoading(false);
        }
    };

    // Handler to test feedback link
    const handleTestFeedbackLink = async () => {
        setFeedbackLoading(true);
        setFeedbackError(null);
        setFeedbackSuccess(false);
        try {
            const accessToken = session?.user.access_token;
            if (!accessToken) {
                throw new Error('No access token found. Please sign in again.');
            }

            // Create a test session
            const createResponse = await fetch('/api/test/create-test-session', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const createData = await createResponse.json();
            if (!createResponse.ok) {
                throw new Error(createData.error || 'Failed to create test session');
            }

            // Send feedback request
            const response = await fetch(`/api/sessions/${createData.sessionId}/send-feedback-link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send feedback link');
            }

            setFeedbackSuccess(true);
        } catch (err) {
            console.error('Feedback link error:', err);
            setFeedbackError(handleApiError(err, 'Failed to send feedback link. Please try again.'));
        } finally {
            setFeedbackLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Simulate Session Creation Button */}
            <div className="space-y-4">
                <Button
                    onClick={() => setSimDialogOpen(true)}
                    variant="secondary"
                    className="w-full sm:w-auto"
                >
                    Simulate Session Creation
                </Button>
            </div>
            <Dialog open={simDialogOpen} onOpenChange={setSimDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Simulate Session Creation</DialogTitle>
                        <DialogDescription>
                            This dialog simulates the creation of a session, showing each step in the process.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {simSteps.map((step) => (
                            <div key={step.name} className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    {step.status === 'loading' && <Loader2 className="animate-spin text-blue-500" />}
                                    {step.status === 'complete' && <CheckCircle2 className="text-green-600" />}
                                    {step.status === 'pending' && <div className="w-5 h-5 rounded-full border border-gray-300" />}
                                    <span className={step.status === 'complete' ? 'text-green-700' : step.status === 'loading' ? 'text-blue-700' : 'text-gray-500'}>
                                        {step.name}
                                    </span>
                                </div>
                                {/* Show sub-steps indented under Confirming session */}
                                {step.name === 'Confirming session' && (step.status === 'loading' || step.status === 'complete') && (
                                    <div className="ml-8 mt-2 space-y-2">
                                        {subSteps.map((sub) => (
                                            <div key={sub.name} className="flex items-center gap-3">
                                                {sub.status === 'loading' && <Loader2 className="animate-spin text-blue-500" />}
                                                {sub.status === 'complete' && <CheckCircle2 className="text-green-600" />}
                                                {sub.status === 'pending' && <div className="w-4 h-4 rounded-full border border-gray-300" />}
                                                <span className={sub.status === 'complete' ? 'text-green-700' : sub.status === 'loading' ? 'text-blue-700' : 'text-gray-500'}>
                                                    {sub.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Meeting Creation */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={handleCreateMeeting}
                        disabled={meetingLoading}
                    >
                        {meetingLoading ? 'Creating Teams Meeting...' : 'Create Teams Meeting'}
                    </Button>
                    <Button
                        onClick={handleCreateZoomMeeting}
                        disabled={zoomMeetingLoading}
                        variant="secondary"
                    >
                        {zoomMeetingLoading ? 'Creating Zoom Meeting...' : 'Create Zoom Meeting'}
                    </Button>
                </div>
                {meetingError && (
                    <div className="text-red-500">{meetingError}</div>
                )}
                {meetingLink && (
                    <div className="text-green-700 text-sm bg-green-50 p-2 rounded">
                        Teams meeting created successfully!{' '}
                        <a
                            href={meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-medium"
                        >
                            Join Meeting
                        </a>
                    </div>
                )}
                {zoomMeetingError && (
                    <div className="text-red-500">{zoomMeetingError}</div>
                )}
                {zoomMeetingLink && (
                    <div className="text-green-700 text-sm bg-green-50 p-2 rounded">
                        Zoom meeting created successfully!{' '}
                        <a
                            href={zoomMeetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-medium"
                        >
                            Join Meeting
                        </a>
                    </div>
                )}
            </div>

            {/* Email Test Section */}
            <div className="space-y-4">
                <Button
                    onClick={handleSendTestEmail}
                    disabled={emailLoading}
                    variant="outline"
                    className="w-full sm:w-auto"
                >
                    {emailLoading ? 'Sending Email…' : 'Send Test Email'}
                </Button>
                {/* Email Feedback */}
                {(emailError || emailSuccess) && (
                    <div className="mt-2">
                        {emailError && (
                            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                                {emailError}
                            </div>
                        )}
                        {emailSuccess && (
                            <div className="text-green-700 text-sm bg-green-50 p-2 rounded">
                                Test email sent successfully! Check your inbox.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Feedback Link Test Section */}
            <div className="space-y-4">
                <Button
                    onClick={handleTestFeedbackLink}
                    disabled={feedbackLoading}
                    variant="outline"
                    className="w-full sm:w-auto"
                >
                    {feedbackLoading ? 'Sending Feedback Link…' : 'Test Feedback Link'}
                </Button>
                {/* Feedback Link Feedback */}
                {(feedbackError || feedbackSuccess) && (
                    <div className="mt-2">
                        {feedbackError && (
                            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                                {feedbackError}
                            </div>
                        )}
                        {feedbackSuccess && (
                            <div className="text-green-700 text-sm bg-green-50 p-2 rounded">
                                Feedback link sent successfully! Check your email.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {calendarEventError && (
                <div className="text-yellow-800 bg-yellow-100 px-4 py-2 rounded mt-2">
                    {calendarEventError}
                </div>
            )}

            <MeetingProgressDialog
                isOpen={meetingStages.some(stage => stage.status === 'loading' || stage.status === 'complete') ||
                    zoomMeetingStages.some(stage => stage.status === 'loading' || stage.status === 'complete')}
                stages={[...meetingStages, ...zoomMeetingStages]}
            />
        </div>
    );
}