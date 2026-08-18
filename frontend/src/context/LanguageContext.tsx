import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../i18n/index.js';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['pt-br']) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'pt-br',
  setLang: () => {},
  t: (key) => key as string,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('fitpulse_lang');
    return (saved === 'en' || saved === 'pt-br') ? saved : 'pt-br';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('fitpulse_lang', newLang);
  };

  const t = (key: keyof typeof translations['pt-br']): string => {
    const dict = translations[lang] || translations['pt-br'];
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
