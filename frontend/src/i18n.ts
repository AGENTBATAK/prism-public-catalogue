import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: document.documentElement.lang === 'hi' ? 'hi' : 'en', fallbackLng: 'en', interpolation: { escapeValue: false },
  missingKeyHandler: (_lng, _ns, key) => console.warn(`[PRISM i18n] Missing key: ${key}`),
});

export default i18n;
