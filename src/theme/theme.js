/**
 * Theme Configuration for Daily Coding Question App
 * 
 * This file contains all theme-related colors and styles.
 * Easy to extend and modify for future needs.
 * 
 * FIREBASE CONNECTION (Future):
 * - User's theme preference can be stored in Firestore
 * - Load preference on app start from users/{uid}/preferences
 */

export const lightTheme = {
  name: 'light',
  colors: {
    // Main backgrounds
    background: '#F5F7FA',
    cardBackground: '#FFFFFF',
    
    // Text colors
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    
    // Accent colors for stats
    accentBlue: '#3B82F6',
    accentGreen: '#10B981',
    accentOrange: '#F59E0B',
    accentPurple: '#8B5CF6',
    accentPink: '#EC4899',
    
    // UI elements
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.08)',
    
    // Toggle button
    toggleBackground: '#E5E7EB',
    toggleActive: '#3B82F6',
  },
};

export const darkTheme = {
  name: 'dark',
  colors: {
    // Main backgrounds
    background: '#0F0F1A',
    cardBackground: '#1A1A2E',
    
    // Text colors
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    
    // Accent colors for stats (slightly brighter for dark mode)
    accentBlue: '#60A5FA',
    accentGreen: '#34D399',
    accentOrange: '#FBBF24',
    accentPurple: '#A78BFA',
    accentPink: '#F472B6',
    
    // UI elements
    border: '#374151',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    // Toggle button
    toggleBackground: '#374151',
    toggleActive: '#60A5FA',
  },
};

/**
 * Get theme by name
 * @param {string} themeName - 'light' or 'dark'
 * @returns {object} theme object
 */
export const getTheme = (themeName) => {
  return themeName === 'dark' ? darkTheme : lightTheme;
};
