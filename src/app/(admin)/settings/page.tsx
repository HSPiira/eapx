import { redirect } from 'next/navigation';
import { settingsSections } from '@/config';

export default function SettingsIndex() {
    const firstSection = settingsSections.find(section => section.items && section.items.length > 0);
    const firstHref = firstSection?.items[0]?.href || '/settings/profile';
    redirect(firstHref);
    return null;
}