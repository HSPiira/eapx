import SettingsLayout from '@/components/admin/settings/settings-layout';
import React from "react";

export default function SettingsPageLayout({ children }: { children: React.ReactNode }) {
    return <SettingsLayout>{children}</SettingsLayout>;
}
