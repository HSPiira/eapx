import {Header} from "@/components/admin/header/header";
import React from "react";
import {AppSidebar} from "@/components/admin";

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Epitope Plain',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black">
            <Header user={user} />
            <AppSidebar user={user} />
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
                <div className="px-4 md:px-4 py-4">
                    {children}
                </div>
            </main>
            {/*<FloatingActionButton />*/}
        </div>
    );
}