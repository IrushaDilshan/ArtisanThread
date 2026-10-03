/**
 * ArtisanThread Color Palette
 * Primary Theme: Deep Green (#004D40)
 */

export const COLORS = {
  // Brand Deep Green Theme
  primary: '#004D40',        // Deep Green / Teal primary
  primaryLight: '#00796B',   // Medium Teal for accents and active states
  primaryDark: '#00251A',    // Very deep forest shade for headers/bars
  primaryMuted: '#E0F2F1',   // Pale mint background for badges and highlights

  // Secondary & Artisan Accents
  accentGold: '#D4AF37',     // Heritage gold for artisan badges & ratings
  accentTerracotta: '#C86D51',// Warm terracotta pottery accent
  accentAmber: '#FFB300',    // Warning / Pending status

  // Role-Specific Theme Accents
  roles: {
    buyer: {
      primary: '#004D40',
      light: '#E0F2F1',
      tag: 'Curator & Buyer',
    },
    artisan: {
      primary: '#A0522D',    // Sienna / Clay
      light: '#FBE9E7',
      tag: 'Master Artisan',
    },
    courier: {
      primary: '#0D47A1',    // Fleet Blue
      light: '#E3F2FD',
      tag: 'Express Courier',
    },
  },

  // Semantic Feedback
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#ED6C02',
  warningLight: '#FFF4E5',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  info: '#0288D1',
  infoLight: '#E1F5FE',

  // Neutrals & Surfaces
  background: '#F7F9F8',     // Soft tinted paper-like off-white
  surface: '#FFFFFF',        // Card and modal white
  surfaceElevated: '#FFFFFF',
  
  // Typography Colors
  textPrimary: '#11221F',    // Deep slate green-black
  textSecondary: '#5A6F6B',  // Muted charcoal teal
  textMuted: '#8E9F9C',      // Subdued grey
  textInverse: '#FFFFFF',    // White text on dark green

  // Borders & Dividers
  border: '#E2E8E6',
  borderLight: '#EDF2F0',
  divider: '#EBEFEF',

  // System
  overlay: 'rgba(0, 37, 26, 0.45)',
  shadow: '#00251A',
};

export default COLORS;
