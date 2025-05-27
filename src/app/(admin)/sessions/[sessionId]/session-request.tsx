import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui';
import { Building2 } from 'lucide-react';
import { SearchableCombobox } from '@/components/session-booking/form/SearchableCombobox';

interface SessionRequestModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (company: string) => void;
    companies: { id: string; name: string }[];
}

export function SessionRequestModal({ open, onClose, onConfirm, companies }: SessionRequestModalProps) {
    const [company, setCompany] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [companyOpen, setCompanyOpen] = useState(false);

    const handlePointerDownOutside = (event: Event) => {
        event.preventDefault();
    };

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
        event.preventDefault();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;

        setIsLoading(true);
        try {
            await onConfirm(company);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent
                className="min-h-[400px]"
                onPointerDownOutside={handlePointerDownOutside}
                onEscapeKeyDown={handleEscapeKeyDown}
            >
                <DialogHeader>
                    <DialogTitle>Create Session</DialogTitle>
                    <DialogDescription>
                        Select a company to create a new session. You can add more details after creation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <SearchableCombobox
                        label="Select Company"
                        icon={Building2}
                        value={company}
                        onSelect={setCompany}
                        items={companies}
                        open={companyOpen}
                        setOpen={setCompanyOpen}
                        placeholder="Select a company"
                        searchPlaceholder="Search companies..."
                        getItemLabel={c => c.name}
                        getItemValue={c => c.id}
                        required
                    />
                    <DialogFooter className="mt-6">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!company || isLoading}>
                            {isLoading ? (
                                <>
                                    <LoadingSpinner className="mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create Session'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
