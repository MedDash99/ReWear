import { useParams } from 'next/navigation';
import en from './en.json';
import fr from './fr.json';

const translations = {
  en,
  fr,
};

type Locale = keyof typeof translations;

// A type guard to check if a string is a valid locale
function isLocale(locale: any): locale is Locale {
  return locale in translations;
}

export const useTranslation = () => {
  const params = useParams();
  // Ensure locale is a valid key, otherwise default to 'en'
  const lang = params.locale && isLocale(params.locale) ? params.locale : 'en';

  const t = (
    key: keyof (typeof en & typeof fr),
    options?: { [key: string]: string | number },
  ) => {
    let translation = translations[lang][key] || key;

    if (options) {
      Object.keys(options).forEach((optionKey) => {
        const regex = new RegExp(`{${optionKey}}`, 'g');
        translation = translation.replace(regex, String(options[optionKey]));
      });
    }

    return translation;
  };

  return { t, locale: lang };
}; 