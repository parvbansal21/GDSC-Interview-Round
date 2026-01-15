// LeetCode-inspired design system
export const colors = {
  // Backgrounds
  bgPrimary: '#ffffff',
  bgSecondary: '#f7f8fa',
  bgTertiary: '#eff0f1',
  bgDark: '#1a1a1a',
  bgEditor: '#1e1e1e',
  bgEditorHeader: '#2d2d2d',
  
  // Text
  textPrimary: '#262626',
  textSecondary: '#595959',
  textTertiary: '#8c8c8c',
  textLight: '#d4d4d4',
  textWhite: '#ffffff',
  
  // Accent colors
  primary: '#0a84ff',
  primaryHover: '#0066cc',
  success: '#00b341',
  successBg: '#e6f7ed',
  error: '#ff375f',
  errorBg: '#fff0f0',
  warning: '#ffa116',
  warningBg: '#fff7e6',
  
  // Difficulty colors
  easy: '#00b8a3',
  easyBg: '#e6f7f5',
  medium: '#ffc01e',
  mediumBg: '#fff9e6',
  hard: '#ff375f',
  hardBg: '#fff0f3',
  
  // Borders
  border: '#e5e5e5',
  borderLight: '#f0f0f0',
  borderDark: '#3d3d3d',
  
  // Editor
  editorBg: '#1e1e1e',
  editorLine: '#2d2d2d',
  editorText: '#d4d4d4',
  editorKeyword: '#569cd6',
  editorString: '#ce9178',
  editorComment: '#6a9955',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  code: {
    fontFamily: 'Menlo, Monaco, Consolas, monospace',
    fontSize: 13,
    lineHeight: 20,
  },
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return { color: colors.easy, bg: colors.easyBg };
    case 'medium':
      return { color: colors.medium, bg: colors.mediumBg };
    case 'hard':
      return { color: colors.hard, bg: colors.hardBg };
    default:
      return { color: colors.textSecondary, bg: colors.bgSecondary };
  }
};
