import { useState, useEffect, useCallback } from 'react';

interface NotificationPreferences {
  budgetAlerts: boolean;
  budgetWarningThreshold: boolean;
  recurringReminders: boolean;
  dailyReminders: boolean;
}

const STORAGE_KEY = 'khorcha-notification-preferences';

const defaultPreferences: NotificationPreferences = {
  budgetAlerts: true,
  budgetWarningThreshold: true,
  recurringReminders: true,
  dailyReminders: false,
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notification preferences');
      }
    }
    setIsLoaded(true);
  }, []);

  // Get specific preference
  const getPreference = useCallback((key: keyof NotificationPreferences): boolean => {
    return preferences[key];
  }, [preferences]);

  return {
    preferences,
    isLoaded,
    getPreference,
  };
};
