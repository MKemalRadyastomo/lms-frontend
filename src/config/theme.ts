// LMS Brand Colors - Blue-based palette for educational platform
export const lightTheme = {
  "--background": "210 40% 98%", // Very light blue-gray
  "--foreground": "215 25% 15%", // Dark blue-gray
  "--card": "0 0% 100%", // Pure white for cards
  "--card-foreground": "215 25% 15%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "215 25% 15%",
  "--primary": "217 87% 45%", // Educational blue
  "--primary-foreground": "0 0% 98%",
  "--secondary": "210 30% 95%", // Light blue-gray
  "--secondary-foreground": "217 87% 35%",
  "--muted": "210 30% 95%",
  "--muted-foreground": "215 15% 50%",
  "--accent": "142 76% 45%", // Success green
  "--accent-foreground": "0 0% 98%",
  "--destructive": "0 84% 60%", // Error red
  "--destructive-foreground": "0 0% 98%",
  "--border": "210 20% 88%",
  "--input": "210 20% 88%",
  "--ring": "217 87% 45%",
  "--radius": "0.5rem",
  "--chart-1": "217 87% 45%", // Primary blue
  "--chart-2": "142 76% 45%", // Success green  
  "--chart-3": "38 92% 50%", // Warning yellow
  "--chart-4": "262 83% 58%", // Purple
  "--chart-5": "0 84% 60%" // Error red
};

export const darkTheme = {
  "--background": "215 28% 8%", // Dark blue-gray
  "--foreground": "210 40% 96%", // Very light blue-gray
  "--card": "215 28% 10%", // Slightly lighter dark
  "--card-foreground": "210 40% 96%",
  "--popover": "215 28% 10%",
  "--popover-foreground": "210 40% 96%",
  "--primary": "217 87% 55%", // Brighter blue for dark mode
  "--primary-foreground": "215 28% 8%",
  "--secondary": "215 20% 15%", // Dark blue-gray
  "--secondary-foreground": "210 40% 96%",
  "--muted": "215 20% 15%",
  "--muted-foreground": "215 15% 65%",
  "--accent": "142 76% 55%", // Brighter green for dark mode
  "--accent-foreground": "215 28% 8%",
  "--destructive": "0 84% 65%", // Brighter red for dark mode
  "--destructive-foreground": "0 0% 98%",
  "--border": "215 20% 18%",
  "--input": "215 20% 18%",
  "--ring": "217 87% 55%",
  "--chart-1": "217 87% 55%", // Primary blue
  "--chart-2": "142 76% 55%", // Success green
  "--chart-3": "38 92% 60%", // Warning yellow
  "--chart-4": "262 83% 68%", // Purple
  "--chart-5": "0 84% 65%" // Error red
};

export const generateThemeCSS = (theme: Record<string, string>) => {
  return Object.entries(theme)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n");
};

// Semantic color mappings for better organization
export const semanticColors = {
  // Status colors
  success: "var(--accent)",
  warning: "var(--chart-3)",
  error: "var(--destructive)",
  info: "var(--primary)",
  
  // Educational context colors
  assignment: "var(--primary)",
  submission: "var(--accent)",
  grade: "var(--chart-4)",
  course: "var(--primary)",
  student: "var(--chart-2)",
  teacher: "var(--chart-4)",
  
  // UI element colors
  surface: "var(--card)",
  overlay: "var(--popover)",
  disabled: "var(--muted)",
};

// Helper function to get CSS variable with fallback
export const getCSSVariable = (variableName: string, fallback?: string) => {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
    return value || fallback;
  }
  return fallback;
};

// Function to apply theme programmatically
export const applyTheme = (theme: Record<string, string>, isDark = false) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply theme variables
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Update theme class
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Get current theme type
export const getCurrentTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

// Theme configuration for backend integration (if needed)
export const themeConfig = {
  defaultTheme: 'light' as const,
  supportedThemes: ['light', 'dark'] as const,
  cssVariables: true,
  radius: '0.5rem',
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
};

// Export all themes for easy access
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeType = keyof typeof themes;