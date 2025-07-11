import { Header } from "@/components/admin/header/header";
import React from "react";
import { AppSidebar } from "@/components/admin";

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Epitope Plain',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Header user={user} />
            <AppSidebar user={user} />
            <main
                className="pt-0 md:pt-0 md:ml-16 lg:ml-56 h-screen overflow-y-auto overflow-x-hidden transition-all flex flex-col"
            >
                <div className="flex-1 rounded-sm mx-auto p-6 w-full m-3 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}