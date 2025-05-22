import React from 'react';

interface OverlayProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsOverlay({ open, onClose }: OverlayProps) {
    return (
        <div
            className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
            aria-hidden="true"
        />
    );
}
