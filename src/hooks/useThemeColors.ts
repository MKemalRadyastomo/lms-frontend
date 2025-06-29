'use client';

import { useEffect, useState } from 'react';
import { getCSSVariable, getCurrentTheme, type ThemeType } from '@/config/theme';

/**
 * Hook to access theme colors and utilities
 */
export function useThemeColors() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('light');

  useEffect(() => {
    // Set initial theme
    setCurrentTheme(getCurrentTheme());

    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  // Get a CSS variable value
  const getColor = (variableName: string, fallback?: string) => {
    return getCSSVariable(variableName, fallback);
  };

  // Get semantic colors
  const colors = {
    // Status colors
    success: getColor('--accent'),
    warning: getColor('--chart-3'),
    error: getColor('--destructive'),
    info: getColor('--primary'),
    
    // Educational context colors
    assignment: getColor('--primary'),
    submission: getColor('--accent'),
    grade: getColor('--chart-4'),
    course: getColor('--primary'),
    student: getColor('--chart-2'),
    teacher: getColor('--chart-4'),
    
    // UI element colors
    surface: getColor('--card'),
    overlay: getColor('--popover'),
    disabled: getColor('--muted'),
    
    // Core theme colors
    background: getColor('--background'),
    foreground: getColor('--foreground'),
    primary: getColor('--primary'),
    secondary: getColor('--secondary'),
    muted: getColor('--muted'),
    accent: getColor('--accent'),
    destructive: getColor('--destructive'),
    border: getColor('--border'),
    input: getColor('--input'),
    ring: getColor('--ring'),
  };

  return {
    currentTheme,
    colors,
    getColor,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
  };
}

/**
 * Hook to get status-specific colors for assignments, submissions, etc.
 */
export function useStatusColors() {
  const { colors } = useThemeColors();

  return {
    // Assignment status colors
    assignment: {
      draft: colors.muted,
      published: colors.primary,
      overdue: colors.error,
      completed: colors.success,
    },
    
    // Submission status colors
    submission: {
      pending: colors.warning,
      submitted: colors.info,
      graded: colors.success,
      late: colors.error,
    },
    
    // Grade colors (based on percentage)
    grade: {
      excellent: colors.success, // 90-100%
      good: colors.info,         // 80-89%
      average: colors.warning,   // 70-79%
      poor: colors.error,        // Below 70%
    },
    
    // User role colors
    role: {
      admin: colors.destructive,
      teacher: colors.teacher,
      student: colors.student,
    },
  };
}

/**
 * Utility function to get grade color based on percentage
 * Note: This function cannot use hooks, so it returns CSS variable strings
 */
export function getGradeColor(percentage: number): string {
  if (percentage >= 90) return 'hsl(var(--accent))'; // Excellent
  if (percentage >= 80) return 'hsl(var(--primary))'; // Good
  if (percentage >= 70) return 'hsl(var(--chart-3))'; // Average
  return 'hsl(var(--destructive))'; // Poor
}

/**
 * Utility function to get assignment status color
 * Note: This function cannot use hooks, so it returns CSS variable strings
 */
export function getAssignmentStatusColor(status: string, dueDate?: string): string {
  const now = new Date();
  const due = dueDate ? new Date(dueDate) : null;
  
  switch (status.toLowerCase()) {
    case 'draft':
      return 'hsl(var(--muted))';
    case 'published':
      if (due && due < now) {
        return 'hsl(var(--destructive))'; // Overdue
      }
      return 'hsl(var(--primary))';
    case 'completed':
      return 'hsl(var(--accent))';
    default:
      return 'hsl(var(--primary))';
  }
}

export type { ThemeType };
