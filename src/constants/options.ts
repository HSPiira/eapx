export const THEME_OPTIONS = [
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
    { value: 'system' as const, label: 'System' }
] as const;

export const COLOR_SCHEME_OPTIONS = [
    { value: 'default' as const, label: 'default' },
    { value: 'blue' as const, label: 'blue' },
    { value: 'green' as const, label: 'green' },
    { value: 'purple' as const, label: 'purple' }
] as const;

export const FONT_SIZE_OPTIONS = [
    { value: 'small' as const, label: 'small' },
    { value: 'medium' as const, label: 'medium' },
    { value: 'large' as const, label: 'large' }
] as const;