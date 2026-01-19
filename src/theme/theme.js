export const lightTheme = {
  name: 'light',
  colors: {
    background: '#F5F7FA',
    cardBackground: '#FFFFFF',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    accentBlue: '#3B82F6',
    accentGreen: '#10B981',
    accentOrange: '#F59E0B',
    accentPurple: '#8B5CF6',
    accentPink: '#EC4899',
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.08)',
    toggleBackground: '#E5E7EB',
    toggleActive: '#3B82F6',
  },
};

export const darkTheme = {
  name: 'dark',
  colors: {
    background: '#0F0F1A',
    cardBackground: '#1A1A2E',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    accentBlue: '#60A5FA',
    accentGreen: '#34D399',
    accentOrange: '#FBBF24',
    accentPurple: '#A78BFA',
    accentPink: '#F472B6',
    border: '#374151',
    shadow: 'rgba(0, 0, 0, 0.3)',
    toggleBackground: '#374151',
    toggleActive: '#60A5FA',
  },
};

export const getTheme = (themeName) => {
  return themeName === 'dark' ? darkTheme : lightTheme;
};
