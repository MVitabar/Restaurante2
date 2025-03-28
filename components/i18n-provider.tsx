"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18n from 'i18next';

// Import language-specific translation files
import enTranslations from './i18n/i18n-provider-en';
import esTranslations from './i18n/i18n-provider-es';
import ptTranslations from './i18n/i18n-provider-pt';

// Configure i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      pt: { translation: ptTranslations }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already escapes values
    }
  });

// Language type definition
export type Language = 'en' | 'es' | 'pt';

// Language Context
interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: () => {},
  setLanguage: () => {}
});

// Safely get language from localStorage
const getSavedLanguage = (): Language => {
  // Ensure this works both on client and server
  if (typeof window !== 'undefined') {
    try {
      const savedLang = localStorage.getItem('appLanguage');
      
      // Validate that the saved language is a valid Language type
      if (savedLang === 'en' || savedLang === 'es' || savedLang === 'pt') {
        return savedLang as Language;
      }
    } catch (error) {
      console.error('CRITICAL: Error accessing localStorage:', error);
    }
  }
  
  // Default to 'en' if no valid language is found
  return 'en';
};

// Safely set language in localStorage
const setSavedLanguage = (lang: Language) => {
  // Ensure this works both on client and server
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('appLanguage', lang);
    } catch (error) {
      console.error('CRITICAL: Error setting localStorage:', error);
    }
  }
};

// Language Provider Component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Use effect to set initial language and handle changes
  useEffect(() => {
    // Ensure this only runs on client-side
    if (typeof window !== 'undefined') {
      const savedLanguage = getSavedLanguage();
      
      // Force language change in i18next
      i18n.changeLanguage(savedLanguage);
      
      // Update local state
      setLanguageState(savedLanguage);
      setIsInitialized(true);

      // Add a language change listener
      const handleLanguageChange = (lng: string) => {
        if (['en', 'es', 'pt'].includes(lng)) {
          const validLng = lng as Language;
          
          // Prevent unexpected language switches
          if (validLng !== language) {
            i18n.changeLanguage(language);
            return;
          }
          
          setLanguageState(validLng);
          setSavedLanguage(validLng);
        }
      };

      i18n.on('languageChanged', handleLanguageChange);

      // Cleanup listener
      return () => {
        i18n.off('languageChanged', handleLanguageChange);
      };
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const changeLanguage = (lang: Language) => {
    // Validate language
    const validLanguages: Language[] = ['en', 'es', 'pt'];
    if (!validLanguages.includes(lang)) {
      console.warn(`CRITICAL: Invalid language: ${lang}. Defaulting to English.`);
      lang = 'en';
    }

    // Change language in i18next
    i18n.changeLanguage(lang);
    
    // Save to localStorage
    setSavedLanguage(lang);
    
    // Update state
    setLanguageState(lang);
  };

  const setLanguage = (lang: Language) => {
    // Ensure the language is valid
    const validLanguages: Language[] = ['en', 'es', 'pt'];
    if (!validLanguages.includes(lang)) {
      console.warn(`CRITICAL: Invalid language: ${lang}. Defaulting to English.`);
      lang = 'en';
    }

    // Change language in i18next
    i18n.changeLanguage(lang);
    
    // Save to localStorage
    setSavedLanguage(lang);
    
    // Update state
    setLanguageState(lang);
  };

  // Only render children when initialized to prevent flickering
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Alias for I18nProvider to match common naming convention
export const I18nProvider = LanguageProvider;

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// New hook to match the import in other files
export const useI18n = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const { language, changeLanguage, setLanguage } = useLanguage();
  
  return {
    t,
    i18n: i18nInstance,
    language,
    changeLanguage,
    setLanguage
  };
};

// Export i18n instance for direct use if needed
export { i18n };

// Optional: Wrapper hook for translations
export const useAppTranslation = () => {
  const { t } = useTranslation();
  return t;
};

export default LanguageProvider;
