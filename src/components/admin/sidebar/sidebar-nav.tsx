import React from "react";

interface SidebarNavProps {
    children: React.ReactNode;
    className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ children, className = '' }) => {
    return (
        <nav className={`flex-1 px-2 py-4 space-y-0.5 ${className}`} aria-label="Sidebar Navigation">
            {children}
        </nav>
    );
};
export default SidebarNav;