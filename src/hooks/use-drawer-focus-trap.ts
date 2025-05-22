import { useEffect, RefObject } from 'react';

export function useDrawerFocusTrap(open: boolean, onClose: () => void, ref: RefObject<HTMLElement>) {
    useEffect(() => {
        if (!open || !ref.current) return;

        const drawer = ref.current;
        const prevFocused = document.activeElement as HTMLElement;
        drawer.focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose();
            }
            if (e.key === 'Tab') {
                const focusableElements = drawer.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length === 0) return;

                const first = focusableElements[0];
                const last = focusableElements[focusableElements.length - 1];

                if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            }
        }

        drawer.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            drawer.removeEventListener('keydown', onKeyDown);
            prevFocused?.focus();
            document.body.style.overflow = '';
        };
    }, [open, onClose, ref]);
}
