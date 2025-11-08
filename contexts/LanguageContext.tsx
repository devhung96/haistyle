import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import en from './../locales/en.json';
import vi from './../locales/vi.json';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, any>> = { en, vi };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        // Add type check to prevent returning non-string values.
        if (typeof fallbackResult === 'string') {
          return fallbackResult;
        }
        // If the resolved value is not a string (e.g., an object for a partial key), return the key.
        return key;
      }
    }
    // Add type check to prevent returning non-string values.
    if (typeof result === 'string') {
      return result;
    }
    // If the resolved value is not a string (e.g., an object for a partial key), return the key.
    return key;
  };
  
  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};