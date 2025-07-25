import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employer } from '@/types/employer';
import { supabase } from '@/lib/supabase';

interface EmployerContextType {
  currentEmployer: Employer | null;
  employers: Employer[];
  loading: boolean;
  setCurrentEmployer: (employer: Employer | null) => void;
  refreshEmployers: () => Promise<void>;
}

const EmployerContext = createContext<EmployerContextType | undefined>(undefined);

export function EmployerProvider({ children }: { children: ReactNode }) {
  const [currentEmployer, setCurrentEmployer] = useState<Employer | null>(null);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .order('name');

      if (error) throw error;

      setEmployers(data || []);
      
      // Load saved employer from localStorage
      const savedEmployerId = localStorage.getItem('selectedEmployerId');
      if (savedEmployerId && data) {
        const savedEmployer = data.find(e => e.id === savedEmployerId);
        if (savedEmployer) {
          setCurrentEmployer(savedEmployer);
        }
      }
    } catch (error) {
      console.error('Error loading employers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrentEmployer = (employer: Employer | null) => {
    setCurrentEmployer(employer);
    if (employer) {
      localStorage.setItem('selectedEmployerId', employer.id);
    } else {
      localStorage.removeItem('selectedEmployerId');
    }
  };

  return (
    <EmployerContext.Provider 
      value={{
        currentEmployer,
        employers,
        loading,
        setCurrentEmployer: handleSetCurrentEmployer,
        refreshEmployers: loadEmployers
      }}
    >
      {children}
    </EmployerContext.Provider>
  );
}

export function useEmployerContext() {
  const context = useContext(EmployerContext);
  if (context === undefined) {
    throw new Error('useEmployerContext must be used within an EmployerProvider');
  }
  return context;
}