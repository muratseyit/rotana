import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const VALID_ACCESS_CODE = 'CONVERTA2025';
const STORAGE_KEY = 'converta_access_granted';

interface AccessCodeContextType {
  hasAccess: boolean;
  validateCode: (code: string) => boolean;
  clearAccess: () => void;
}

const AccessCodeContext = createContext<AccessCodeContextType | undefined>(undefined);

export const AccessCodeProvider = ({ children }: { children: ReactNode }) => {
  const [hasAccess, setHasAccess] = useState<boolean>(() => {
    // Check localStorage on mount
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const validateCode = (code: string): boolean => {
    const isValid = code.trim().toUpperCase() === VALID_ACCESS_CODE;
    if (isValid) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setHasAccess(true);
    }
    return isValid;
  };

  const clearAccess = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasAccess(false);
  };

  return (
    <AccessCodeContext.Provider value={{ hasAccess, validateCode, clearAccess }}>
      {children}
    </AccessCodeContext.Provider>
  );
};

export const useAccessCode = () => {
  const context = useContext(AccessCodeContext);
  if (!context) {
    throw new Error('useAccessCode must be used within AccessCodeProvider');
  }
  return context;
};
