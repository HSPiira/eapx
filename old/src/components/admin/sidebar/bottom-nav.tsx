import React from 'react';

interface BottomNavProps {
    children: React.ReactNode;
}

const BottomNav: React.FC<BottomNavProps> = ({ children }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center bg-[#f8f4fc] dark:bg-[#171717] h-16 md:hidden">
            {children}
        </nav>
    );
};
export default BottomNav;