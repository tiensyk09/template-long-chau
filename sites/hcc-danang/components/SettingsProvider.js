'use client';
import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext({
  settings: {},
  updateSettingsState: () => {},
});

export function SettingsProvider({ children, initialSettings = {} }) {
  const [settings, setSettings] = useState(initialSettings);

  const updateSettingsState = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettingsState }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
