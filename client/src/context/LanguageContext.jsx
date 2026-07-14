import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: 'Dashboard',
    chat: 'Chat Assistant',
    analytics: 'Crime Analytics',
    network: 'Network Analysis',
    maps: 'Hotspot Maps',
    predictions: 'Crime Forecasting',
    logout: 'Logout',
    welcome: 'Welcome back, Officer',
    search: 'Search...',
    submit: 'Submit',
    reset: 'Reset',
    totalFirs: 'Total Active Cases',
    highRiskZones: 'High Risk Zones',
    repeatOffenders: 'Repeat Offenders',
    recentActivity: 'Recent Case Alerts',
    enterMessage: 'Enter investigation query...',
    exportPdf: 'Export PDF',
    loading: 'Loading spatial dimensions...',
    languageChanged: 'Language updated successfully to English.',
    voiceActive: 'Voice input activated. Speak now...',
    voiceInferred: 'Speech processed successfully.',
    readAloud: 'Reading response aloud...',
    language: 'Language: English',
    reports: 'Audit Export Logs'
  },
  kn: {
    dashboard: 'ನಿಯಂತ್ರಣ ಫಲಕ',
    chat: 'ಚಾಟ್ ಸಹಾಯಕ',
    analytics: 'ಅಪರಾಧ ವಿಶ್ಲೇಷಣೆ',
    network: 'ನೆಟ್‌ವರ್ಕ್ ವಿಶ್ಲೇಷಣೆ',
    maps: 'ಹಾಟ್‌ಸ್ಪಾಟ್ ನಕ್ಷೆಗಳು',
    predictions: 'ಅಪರಾಧ ಮುನ್ಸೂಚನೆ',
    logout: 'ಲಾಗ್ ಔಟ್',
    welcome: 'ಸ್ವಾಗತ, ಅಧಿಕಾರಿ',
    search: 'ಹುಡುಕಿ...',
    submit: 'ಸಲ್ಲಿಸು',
    reset: 'ಮರುಹೊಂದಿಸಿ',
    totalFirs: 'ಒಟ್ಟು ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು',
    highRiskZones: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ವಲಯಗಳು',
    repeatOffenders: 'ಮರು ಅಪರಾಧಿಗಳು',
    recentActivity: 'ಇತ್ತೀಚಿನ ಪ್ರಕರಣದ ಎಚ್ಚರಿಕೆಗಳು',
    enterMessage: 'ತನಿಖೆಯ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ...',
    exportPdf: 'ಪಿಡಿಎಫ್ ರಫ್ತು',
    loading: 'ಪ್ರದೇಶದ ಆಯಾಮಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    languageChanged: 'ಭಾಷೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
    voiceActive: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ಈಗ ಮಾತನಾಡಿ...',
    voiceInferred: 'ಭಾಷಣವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ.',
    readAloud: 'ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಗಟ್ಟಿಯಾಗಿ ಓದಲಾಗುತ್ತಿದೆ...',
    language: 'ಭಾಷೆ: ಕನ್ನಡ',
    reports: 'ವರದಿ ದಾಖಲೆಗಳು'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
