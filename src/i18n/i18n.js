import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { th, en } from './translations';

const LANG_KEY = '@app_language';

export const initI18n = async () => {
  let lng = 'th';
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored === 'th' || stored === 'en') lng = stored;
  } catch {}

  await i18n.use(initReactI18next).init({
    lng,
    resources: {
      th: { translation: th },
      en: { translation: en },
    },
    fallbackLng: 'th',
    interpolation: { escapeValue: false },
  });

  return i18n;
};

export const changeLanguage = async (code) => {
  await i18n.changeLanguage(code);
  try {
    await AsyncStorage.setItem(LANG_KEY, code);
  } catch {}
};

export default i18n;
