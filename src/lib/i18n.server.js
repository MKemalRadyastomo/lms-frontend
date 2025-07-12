import { createInstance } from 'i18next';
import Backend from 'i18next-fs-backend'; // Import i18next-fs-backend
import path from 'path'; // Import path
import { initReactI18next } from 'react-i18next/initReactI18next';

const initI18next = async (lng, ns) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(Backend) // Use i18next-fs-backend
    .init({
      lng,
      ns,
      fallbackLng: 'id',
      debug: false, // Set to true for debugging
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      backend: { // Configure backend
        loadPath: path.resolve('./public/locales/{{lng}}/{{ns}}.json'),
      },
    });
  return i18nInstance;
};

export async function getServerTranslation(lng, ns, options = {}) {
  const i18nextInstance = await initI18next(lng, ns);
  return {
    t: i18nextInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
    i18n: i18nextInstance,
  };
}