import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language } from '../types';

type Translations = { [key: string]: any };

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  loading: boolean;
  // Overload for returning an object
  t(key: string, values: Record<string, string | number> | undefined, returnObject: true): any;
  // Overload for returning a string (default)
  t(key: string, values?: Record<string, string | number>, returnObject?: boolean): string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const fetchTranslations = async (language: Language): Promise<Translations> => {
  try {
    const response = await fetch(`/locales/${language}.json`);
    if (!response.ok) {
      throw new Error(`Could not load translation file: ${language}.json, status: ${response.status}`);
    }
    const text = await response.text();
    // Prevent parsing empty responses which causes "Unexpected end of JSON input"
    if (!text) {
        throw new Error(`Received empty translation file: ${language}.json`);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error(`Failed to load translations for ${language}.`, error);
    
    // Fallback to Spanish if the requested language file fails for any reason
    if (language !== 'es') {
        console.log('Attempting to fall back to Spanish translations.');
        try {
            const fallbackResponse = await fetch('/locales/es.json');
            if (!fallbackResponse.ok) {
                throw new Error('Fallback translation file (es.json) could not be loaded.');
            }
            const fallbackText = await fallbackResponse.text();
            if(!fallbackText) {
                throw new Error('Received empty fallback translation file (es.json)');
            }
            return JSON.parse(fallbackText);
        } catch (fallbackError) {
             console.error('Fallback to Spanish translations also failed.', fallbackError);
        }
    }
    // If all fails, return an empty object to prevent app crash
    return {};
  }
};


export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const browserLang = navigator.language.split('-')[0] as Language;
    const supportedLangs: Language[] = ['es', 'ca', 'eu', 'gl', 'oc'];
    return supportedLangs.includes(browserLang) ? browserLang : 'es';
  });
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTranslations(language).then(newTranslations => {
      if (active) {
        setTranslations(newTranslations);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [language]);

  const t = useCallback((key: string, values?: Record<string, string | number>, returnObject: boolean = false): any => {
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to key if not found
        return key;
      }
    }

    if (returnObject) {
      return result;
    }

    if (typeof result === 'string') {
        if (values) {
            return Object.entries(values).reduce((acc, [placeholder, value]) => {
                return acc.replace(`{${placeholder}}`, String(value));
            }, result);
        }
        return result;
    }

    // If result is not a string and we are not returning an object, it's a problem. Fallback to key.
    console.warn(`Translation for key '${key}' is not a string, but a string was expected.`)
    return key;

  }, [translations]);

  const value = { language, setLanguage, t: t as I18nContextType['t'], loading };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};