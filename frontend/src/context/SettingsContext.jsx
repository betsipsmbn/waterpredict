import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(undefined);

export function SettingsProvider({ children }) {
  const [thresholds, setThresholds] = useState({
    phMin: 6.8,
    phMax: 7.8,
    tdsMax: 300,
    temperatureMin: 20,
    temperatureMax: 28,
  });

  const [telegramSettings, setTelegramSettings] = useState({
    enabled: false,
    botToken: '',
    chatId: '',
  });

  return (
    <SettingsContext.Provider
      value={{
        thresholds,
        setThresholds,
        telegramSettings,
        setTelegramSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
