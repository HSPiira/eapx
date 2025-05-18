// src/app/clients/page.tsx
'use client';

import React from 'react';
import { ClientHeader, ClientFilters, ClientStats, ClientList } from '@/components/admin/clients';

export default function ClientsPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <ClientHeader />
            <ClientStats />
            <ClientFilters />
            <ClientList />
        </div>
    );
}