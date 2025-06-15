import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface Stage {
    id: string;
    name: string;
    status: 'pending' | 'loading' | 'complete' | 'error';
}

interface MeetingProgressDialogProps {
    isOpen: boolean;
    stages: Stage[];
    description?: string;
}

export function MeetingProgressDialog({ isOpen, stages, description = "Creating meeting and calendar event..." }: MeetingProgressDialogProps) {
    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Creating Meeting</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {stages.map((stage) => (
                        <div key={stage.id} className="flex items-center space-x-3">
                            {stage.status === 'loading' && (
                                <div className="animate-spin">
                                    <Loader2 className="h-5 w-5 text-blue-500" />
                                </div>
                            )}
                            {stage.status === 'complete' && (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            {stage.status === 'error' && (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            {stage.status === 'pending' && (
                                <Circle className="h-5 w-5 text-gray-300" />
                            )}
                            <span className={cn(
                                "text-sm",
                                stage.status === 'error' && "text-red-500",
                                stage.status === 'complete' && "text-green-500"
                            )}>
                                {stage.name}
                            </span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
} 