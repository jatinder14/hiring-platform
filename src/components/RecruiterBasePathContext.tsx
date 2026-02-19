'use client';

import { createContext, useContext, ReactNode } from 'react';

const RecruiterBasePathContext = createContext<string>('/dashboard/talent');

export function RecruiterBasePathProvider({
  value,
  children,
}: {
  value: '/dashboard/talent' | '/dashboard/company';
  children: ReactNode;
}) {
  return (
    <RecruiterBasePathContext.Provider value={value}>
      {children}
    </RecruiterBasePathContext.Provider>
  );
}

export function useRecruiterBasePath(): string {
  return useContext(RecruiterBasePathContext);
}
