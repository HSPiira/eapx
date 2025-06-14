import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Stage {
    name: string;
    status: 'pending' | 'loading' | 'complete' | 'error';
}

interface MeetingProgressDialogProps {
    isOpen: boolean;
    stages: Stage[];
}

export function MeetingProgressDialog({ isOpen, stages }: MeetingProgressDialogProps) {
    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogTitle>Creating Meeting</DialogTitle>
                <div className="space-y-4">
                    <div className="space-y-2">
                        {stages.map((stage, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                {stage.status === 'loading' && (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                )}
                                {stage.status === 'complete' && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                                {stage.status === 'pending' && (
                                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                )}
                                {stage.status === 'error' && (
                                    <div className="h-5 w-5 rounded-full border-2 border-red-500" />
                                )}
                                <span className="text-sm">{stage.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 