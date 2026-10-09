export const colors = {
  primary: '#2D7CE9',
  primaryLight: 'rgba(45, 124, 233, 0.10)',
  primarySubtle: 'rgba(45, 124, 233, 0.05)',
  text: '#1C283B',
  background: '#F5F7F7',
  card: '#FAFBFB',
  border: '#DDE2E6',
  textSecondary: '#6C7886',
  success: '#25B87A',
  successLight: 'rgba(37, 184, 122, 0.12)',
  warning: '#F7A35C',
  warningLight: 'rgba(247, 163, 92, 0.14)',
  error: '#F04F55',
  errorLight: 'rgba(240, 79, 85, 0.12)',
  info: '#2D7CE9',
  infoLight: 'rgba(45, 124, 233, 0.12)',
  secondaryLight: 'rgba(108, 120, 134, 0.10)',
  shadow: 'rgba(28, 40, 59, 0.06)',
  shadowDark: 'rgba(28, 40, 59, 0.12)',
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const font = {
  h1: 24,
  h2: 20,
  h3: 16,
  body: 14,
  small: 12,
  xs: 10,
};

export const shadows = {
  sm: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};
