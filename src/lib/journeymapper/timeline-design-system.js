// Timeline Design System
// Consistent styling values for all journey mapper timeline components

export const TIMELINE_DESIGN_SYSTEM = {
  // === COLORS ===
  colors: {
    // Background colors
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    quaternary: '#e2e8f0',
    
    // Text colors
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',
    
    // Border colors
    borderLight: '#e2e8f0',
    borderMedium: '#cbd5e1',
    borderDark: '#94a3b8',
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Burden colors
    burdenLow: '#10b981',
    burdenMedium: '#f59e0b',
    burdenHigh: '#ef4444',
    
    // Category colors
    invasive: '#ef4444',
    observational: '#3b82f6',
    patientReported: '#10b981',
    surgical: '#7c2d12',
    unknown: '#6b7280',
    
    // Category background colors (light versions)
    invasiveBg: '#fef2f2',
    observationalBg: '#eff6ff',
    patientReportedBg: '#f0fdf4',
    surgicalBg: '#f3f4f6',
    unknownBg: '#f9fafb',
    
    // Hover states
    hoverPrimary: '#f0f9ff',
    hoverSecondary: '#e0f2fe',
    
    // Timeline specific
    timelineAxisBg: '#f1f5f9',
    timelineContentBg: '#ffffff',
    visitNumberBg: 'rgba(59, 130, 246, 0.05)',
    studyWeekBg: 'rgba(245, 158, 11, 0.05)',
  },

  // === TYPOGRAPHY ===
  typography: {
    // Font sizes (rem values)
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    
    // Font weights
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    
    // Line heights
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },

  // === SPACING ===
  spacing: {
    // Padding/margin values (rem)
    xs: '0.25rem',      // 4px
    sm: '0.5rem',       // 8px
    md: '0.75rem',      // 12px
    lg: '1rem',         // 16px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '2rem',      // 32px
    '4xl': '2.5rem',    // 40px
    
    // Component specific spacing
    cellPadding: '0.75rem',
    headerPadding: '1rem',
    sectionGap: '1.5rem',
    itemGap: '0.5rem',
  },

  // === DIMENSIONS ===
  dimensions: {
    // Heights
    headerRowHeight: '40px',
    cellMinHeight: '60px',
    tooltipMinWidth: '250px',
    
    // Widths
    leftPanelWidth: '250px',
    cellMinWidth: '80px',
    cellMaxWidth: '200px',
    
    // Border radius
    radiusSmall: '4px',
    radiusMedium: '8px',
    radiusLarge: '12px',
    radiusRound: '50%',
    
    // Border widths
    borderThin: '1px',
    borderMedium: '2px',
    borderThick: '3px',
  },

  // === SHADOWS ===
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
    large: '0 8px 24px rgba(0, 0, 0, 0.1)',
    hover: '0 4px 16px rgba(59, 130, 246, 0.15)',
  },

  // === TRANSITIONS ===
  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease',
    slow: 'all 0.3s ease',
  },

  // === BREAKPOINTS ===
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

// Helper functions for consistent styling
export const timelineStyles = {
  // Get burden color based on score
  getBurdenColor: (score) => {
    if (score < 30) return TIMELINE_DESIGN_SYSTEM.colors.burdenLow;
    if (score < 60) return TIMELINE_DESIGN_SYSTEM.colors.burdenMedium;
    return TIMELINE_DESIGN_SYSTEM.colors.burdenHigh;
  },

  // Get category color
  getCategoryColor: (category) => {
    const colors = TIMELINE_DESIGN_SYSTEM.colors;
    switch (category?.toLowerCase()) {
      case 'invasive': return colors.invasive;
      case 'observational': return colors.observational;
      case 'patient-reported': return colors.patientReported;
      case 'surgical': return colors.surgical;
      default: return colors.unknown;
    }
  },

  // Get category background color
  getCategoryBgColor: (category) => {
    const colors = TIMELINE_DESIGN_SYSTEM.colors;
    switch (category?.toLowerCase()) {
      case 'invasive': return colors.invasiveBg;
      case 'observational': return colors.observationalBg;
      case 'patient-reported': return colors.patientReportedBg;
      case 'surgical': return colors.surgicalBg;
      default: return colors.unknownBg;
    }
  },

  // Get responsive font size
  getResponsiveFontSize: (baseSize, breakpoint = 'desktop') => {
    const typography = TIMELINE_DESIGN_SYSTEM.typography;
    if (breakpoint === 'mobile') {
      // Reduce font size by one step on mobile
      switch (baseSize) {
        case typography.base: return typography.sm;
        case typography.sm: return typography.xs;
        case typography.lg: return typography.base;
        default: return baseSize;
      }
    }
    return baseSize;
  },

  // Generate CSS custom properties
  generateCSSCustomProps: () => {
    const system = TIMELINE_DESIGN_SYSTEM;
    let cssProps = ':root {\n';
    
    // Colors
    Object.entries(system.colors).forEach(([key, value]) => {
      cssProps += `  --timeline-color-${key}: ${value};\n`;
    });
    
    // Typography
    Object.entries(system.typography).forEach(([key, value]) => {
      cssProps += `  --timeline-font-${key}: ${value};\n`;
    });
    
    // Spacing
    Object.entries(system.spacing).forEach(([key, value]) => {
      cssProps += `  --timeline-spacing-${key}: ${value};\n`;
    });
    
    // Dimensions
    Object.entries(system.dimensions).forEach(([key, value]) => {
      cssProps += `  --timeline-dim-${key}: ${value};\n`;
    });
    
    cssProps += '}\n';
    return cssProps;
  },
};

export default TIMELINE_DESIGN_SYSTEM; 