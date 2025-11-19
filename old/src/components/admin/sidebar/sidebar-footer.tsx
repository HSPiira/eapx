import React from "react";

interface SidebarFooterProps {
    children: React.ReactNode;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ children }) => {
    return (
        <div className="px-4 py-4 flex flex-col gap-2">
            {children}
        </div>
    );
};
export default SidebarFooter;