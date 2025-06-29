'use client';

import { useEffect } from 'react';

const ThemeInitializer = () => {
  useEffect(() => {
    try {
      // Simple theme application without complex imports
      const applySimpleTheme = () => {
        try {
          const isDarkMode = document.documentElement.classList.contains('dark');
          
          // Basic theme variables that match our globals.css
          const lightVars = {
            '--background': '210 40% 98%',
            '--foreground': '215 25% 15%',
            '--primary': '217 87% 45%',
            '--accent': '142 76% 45%',
            '--destructive': '0 84% 60%',
            '--muted': '210 30% 95%',
            '--border': '210 20% 88%',
          };
          
          const darkVars = {
            '--background': '215 28% 8%',
            '--foreground': '210 40% 96%',
            '--primary': '217 87% 55%',
            '--accent': '142 76% 55%',
            '--destructive': '0 84% 65%',
            '--muted': '215 20% 15%',
            '--border': '215 20% 18%',
          };
          
          const theme = isDarkMode ? darkVars : lightVars;
          
          // Apply theme variables
          Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
          });
          
          // Dispatch theme change event safely
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('themeChange', { 
              detail: { theme: isDarkMode ? 'dark' : 'light' } 
            }));
          }
        } catch (error) {
          console.warn('Error applying simple theme:', error);
        }
      };

      // Apply theme on initial load
      applySimpleTheme();

      // Observe changes to the class attribute on the html element
      const observer = new MutationObserver((mutations) => {
        try {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              applySimpleTheme();
            }
          });
        } catch (error) {
          console.warn('Error in theme observer:', error);
        }
      });

      if (document.documentElement) {
        observer.observe(document.documentElement, { attributes: true });
      }

      // Cleanup
      return () => {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn('Error disconnecting theme observer:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing theme system:', error);
      // If theme initialization fails, just continue without it
      return () => {};
    }
  }, []);

  return null;
};

export default ThemeInitializer;
