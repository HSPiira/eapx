import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui";

interface ConfirmDeleteCardProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    itemName: string;
}

export function ConfirmDeleteCard({ open, onConfirm, onCancel, itemName }: ConfirmDeleteCardProps) {
    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Intervention</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-end">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" className="text-white" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
