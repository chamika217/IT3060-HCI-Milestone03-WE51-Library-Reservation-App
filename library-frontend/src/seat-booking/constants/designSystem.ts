export const Colors = {
  primary: '#2D7CE9',
  textDark: '#1C283B',
  background: '#F5F7F7',
  card: '#FAFBFB',
  border: '#DDE2E6',
  textSecondary: '#6C7886',
  
  // Status colors
  success: '#25B87A',
  warning: '#F7A35C',
  error: '#F04F55',
  info: '#2D7CE9',

  // Soft badge & highlight backgrounds
  successSoft: '#E8F8F1',
  warningSoft: '#FEF4EC',
  errorSoft: '#FDEEEF',
  neutralSoft: '#F0F4F8',
  primarySoft: '#EBF2FC',

  // Misc UI
  searchBg: '#FFFFFF',
  cardBorder: '#E6EAEE',
  shadowColor: '#000000',
  trackBg: '#E9ECEF',
};

export const Shadows = {
  card: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  soft: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
};