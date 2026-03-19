import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { normalizeBirthDate } from '@/utils/birthDate';

interface UserState {
  birthDate: string;
  setBirthDate: (date: string) => void;
  clearUserData: () => void;
}

const UserContext = createContext<UserState | undefined>(undefined);
const STORAGE_KEY = 'birthDate';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [localBirthDate, setLocalBirthDateState] = useState('');

  // Синхронизируем с данными из AuthProvider
  useEffect(() => {
    if (user?.birthDate) {
      const normalized = normalizeBirthDate(user.birthDate);
      setLocalBirthDateState(normalized);
      localStorage.setItem(STORAGE_KEY, normalized);
    }
  }, [user?.birthDate]);

  // Инициализация из localStorage для гостевого режима
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLocalBirthDateState(normalizeBirthDate(stored));
    }
  }, [user]);

  const setBirthDate = (date: string) => {
    const normalized = normalizeBirthDate(date);
    setLocalBirthDateState(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
  };

  const clearUserData = () => {
    setLocalBirthDateState('');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UserContext.Provider value={{ birthDate: normalizeBirthDate(user?.birthDate) || localBirthDate, setBirthDate, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within UserProvider');
  return context;
}
