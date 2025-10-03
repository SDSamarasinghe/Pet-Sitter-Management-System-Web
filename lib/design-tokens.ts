/**
 * Design Tokens - Centralized design system configuration
 * This file contains all design constants for consistent styling across the application
 */

export const designTokens = {
  // Spacing scale (in rem)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  // Typography scale
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Breakpoints (matches Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(26, 42, 108, 0.05)',
    md: '0 4px 6px -1px rgba(26, 42, 108, 0.1), 0 2px 4px -2px rgba(26, 42, 108, 0.1)',
    lg: '0 10px 15px -3px rgba(26, 42, 108, 0.1), 0 4px 6px -4px rgba(26, 42, 108, 0.1)',
    xl: '0 20px 25px -5px rgba(26, 42, 108, 0.1), 0 8px 10px -6px rgba(26, 42, 108, 0.1)',
    '2xl': '0 25px 50px -12px rgba(26, 42, 108, 0.25)',
  },

  // Transitions
  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Animation durations
  animation: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // Layout dimensions
  layout: {
    headerHeight: '4rem',          // 64px
    headerHeightLg: '5rem',        // 80px
    sidebarWidth: '16rem',         // 256px
    sidebarWidthCollapsed: '4rem', // 64px
    footerHeight: '4rem',          // 64px
    containerMaxWidth: '1280px',
  },
} as const;

// Type helper for design tokens
export type DesignTokens = typeof designTokens;
