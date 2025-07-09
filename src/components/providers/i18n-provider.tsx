'use client'

import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next' // Import i18next directly
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

// Initialize i18n for the client side
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'id',
    debug: true, // Keep debug true for now to see if it works
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    ns: ['common'],
    defaultNS: 'common',
    // This is important for hydration:
    // If resources are provided, i18next will use them instead of fetching
    // This will be populated by the server
    resources: {},
  })

export function I18nProvider({ children, resources }: { children: React.ReactNode, resources?: any }) {
  // If resources are passed from the server, add them to i18n instance
  if (resources) {
    Object.keys(resources).forEach(lng => {
      Object.keys(resources[lng]).forEach(ns => {
        i18n.addResourceBundle(lng, ns, resources[lng][ns], true, true);
      });
    });
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}
