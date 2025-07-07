/**
 * LMS Theme Configuration
 * 
 * This file contains the centralized theme configuration that can be used
 * both in frontend and backend (if needed). It provides a consistent
 * color scheme and branding across the entire LMS platform.
 */

// Brand Colors
export const brandColors = {
  // Primary educational blue palette
  blue: {
    50: 'hsl(217, 87%, 95%)',
    100: 'hsl(217, 87%, 90%)',
    200: 'hsl(217, 87%, 80%)',
    300: 'hsl(217, 87%, 70%)',
    400: 'hsl(217, 87%, 60%)',
    500: 'hsl(217, 87%, 45%)', // Primary
    600: 'hsl(217, 87%, 35%)',
    700: 'hsl(217, 87%, 25%)',
    800: 'hsl(217, 87%, 15%)',
    900: 'hsl(217, 87%, 10%)',
  },
  
  // Success green palette
  green: {
    50: 'hsl(142, 76%, 95%)',
    100: 'hsl(142, 76%, 90%)',
    200: 'hsl(142, 76%, 80%)',
    300: 'hsl(142, 76%, 70%)',
    400: 'hsl(142, 76%, 60%)',
    500: 'hsl(142, 76%, 45%)', // Success
    600: 'hsl(142, 76%, 35%)',
    700: 'hsl(142, 76%, 25%)',
    800: 'hsl(142, 76%, 15%)',
    900: 'hsl(142, 76%, 10%)',
  },
  
  // Warning yellow palette
  yellow: {
    50: 'hsl(38, 92%, 95%)',
    100: 'hsl(38, 92%, 90%)',
    200: 'hsl(38, 92%, 80%)',
    300: 'hsl(38, 92%, 70%)',
    400: 'hsl(38, 92%, 60%)',
    500: 'hsl(38, 92%, 50%)', // Warning
    600: 'hsl(38, 92%, 40%)',
    700: 'hsl(38, 92%, 30%)',
    800: 'hsl(38, 92%, 20%)',
    900: 'hsl(38, 92%, 10%)',
  },
  
  // Error red palette
  red: {
    50: 'hsl(0, 84%, 95%)',
    100: 'hsl(0, 84%, 90%)',
    200: 'hsl(0, 84%, 80%)',
    300: 'hsl(0, 84%, 70%)',
    400: 'hsl(0, 84%, 65%)',
    500: 'hsl(0, 84%, 60%)', // Error
    600: 'hsl(0, 84%, 50%)',
    700: 'hsl(0, 84%, 40%)',
    800: 'hsl(0, 84%, 30%)',
    900: 'hsl(0, 84%, 20%)',
  },
  
  // Purple palette for grades/analytics
  purple: {
    50: 'hsl(262, 83%, 95%)',
    100: 'hsl(262, 83%, 90%)',
    200: 'hsl(262, 83%, 80%)',
    300: 'hsl(262, 83%, 70%)',
    400: 'hsl(262, 83%, 68%)',
    500: 'hsl(262, 83%, 58%)', // Grade
    600: 'hsl(262, 83%, 48%)',
    700: 'hsl(262, 83%, 38%)',
    800: 'hsl(262, 83%, 28%)',
    900: 'hsl(262, 83%, 18%)',
  },
  
  // Neutral grays
  gray: {
    50: 'hsl(210, 40%, 98%)',
    100: 'hsl(210, 30%, 95%)',
    200: 'hsl(210, 20%, 88%)',
    300: 'hsl(210, 15%, 75%)',
    400: 'hsl(215, 15%, 50%)',
    500: 'hsl(215, 25%, 35%)',
    600: 'hsl(215, 25%, 25%)',
    700: 'hsl(215, 25%, 15%)',
    800: 'hsl(215, 28%, 10%)',
    900: 'hsl(215, 28%, 8%)',
  },
};

// Educational context semantic mappings
export const semanticMappings = {
  // User roles
  admin: 'red.500',
  teacher: 'purple.500', 
  student: 'green.500',
  
  // Assignment types
  essay: 'blue.500',
  file_upload: 'purple.500',
  quiz: 'yellow.500',
  
  // Assignment status
  draft: 'gray.400',
  published: 'blue.500',
  overdue: 'red.500',
  completed: 'green.500',
  
  // Submission status
  pending: 'yellow.500',
  submitted: 'blue.500',
  graded: 'green.500',
  late: 'red.500',
  
  // Grade levels
  excellent: 'green.500', // 90-100%
  good: 'blue.500',       // 80-89%
  average: 'yellow.500',  // 70-79%
  poor: 'red.500',        // Below 70%
};

// Theme configuration that can be exported to backend
export const themeConfiguration = {
  name: 'LMS Educational Theme',
  version: '1.0.0',
  description: 'Blue-based educational platform theme with accessibility focus',
  
  // Color spaces
  colorSpace: 'hsl',
  supportsDarkMode: true,
  
  // Brand identity
  brand: {
    primary: brandColors.blue[500],
    secondary: brandColors.gray[100],
    accent: brandColors.green[500],
  },
  
  // Status colors
  status: {
    success: brandColors.green[500],
    warning: brandColors.yellow[500],
    error: brandColors.red[500],
    info: brandColors.blue[500],
  },
  
  // Typography (if needed for backend generated content)
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
  
  // Spacing and sizing
  spacing: {
    radius: '0.5rem',
    containerPadding: '1rem',
    cardPadding: '1.5rem',
  },
  
  // Animation preferences
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
};

// Export function to convert semantic mappings to actual colors
export function resolveSemanticColor(semantic: string): string {
  const mapping = semanticMappings[semantic as keyof typeof semanticMappings];
  if (!mapping) return semantic;
  
  const [colorGroup, shade] = mapping.split('.');
  const colorPalette = brandColors[colorGroup as keyof typeof brandColors];
  
  if (!colorPalette) return semantic;
  
  // Type-safe access to color palette
  const validShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
  type ValidShade = typeof validShades[number];
  
  if (validShades.includes(shade as ValidShade)) {
    return colorPalette[shade as ValidShade] || semantic;
  }
  
  return semantic;
}

// Export function to get theme config for API responses
export function getThemeConfigForAPI() {
  return {
    colors: brandColors,
    semantics: semanticMappings,
    config: themeConfiguration,
  };
}

// Indonesian text mappings for consistency
export const indonesianLabels = {
  // User roles
  admin: 'Administrator',
  teacher: 'Guru',
  student: 'Siswa',
  
  // Assignment types  
  essay: 'Esai',
  file_upload: 'Upload File',
  quiz: 'Kuis',
  
  // Assignment status
  draft: 'Draf',
  published: 'Diterbitkan',
  overdue: 'Terlambat',
  completed: 'Selesai',
  
  // Submission status
  pending: 'Menunggu',
  submitted: 'Dikirim',
  graded: 'Dinilai',
  late: 'Terlambat',
  
  // Grade levels
  excellent: 'Sangat Baik',
  good: 'Baik',
  average: 'Cukup',
  poor: 'Kurang',
  
  // Common UI terms
  save: 'Simpan',
  cancel: 'Batal',
  edit: 'Edit',
  delete: 'Hapus',
  create: 'Buat',
  update: 'Update',
  submit: 'Kirim',
  loading: 'Memuat',
  error: 'Error',
  success: 'Berhasil',
};

export default themeConfiguration;
