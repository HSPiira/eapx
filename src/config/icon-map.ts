import * as Icons from 'lucide-react';
import React from "react"; // or react-icons/fi if still using those

export const iconMap = {
    Home: Icons.Home,
    Calendar: Icons.Calendar,
    Users: Icons.Users,
    BarChart: Icons.BarChart,
    Settings: Icons.Settings,
    Briefcase: Icons.Briefcase,
    Clipboard: Icons.Clipboard,
    List: Icons.List,
    MessageSquare: Icons.MessageSquare,
    MoreHorizontal: Icons.MoreHorizontal,
};

export type IconKey = keyof typeof iconMap;

export function resolveIcon(name: IconKey): React.ElementType {
    return iconMap[name] ?? Icons.Circle;
}
