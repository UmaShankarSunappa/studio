
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Availability } from '@/types';

const initialAvailability: Availability = {};

interface AvailabilityContextType {
  availability: Availability;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
  loading: boolean;
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined);

export const AvailabilityProvider = ({ children }: { children: ReactNode }) => {
  const [availability, setAvailability] = useState<Availability>(initialAvailability);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAvailability = localStorage.getItem('availability');
      if (storedAvailability) {
        setAvailability(JSON.parse(storedAvailability));
      } else {
        setAvailability(initialAvailability);
      }
    } catch (error) {
      console.error("Failed to load or parse availability from localStorage", error);
      setAvailability(initialAvailability);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetAvailability = (newAvailabilityState: React.SetStateAction<Availability>) => {
    setAvailability(prevState => {
        const newState = typeof newAvailabilityState === 'function' ? newAvailabilityState(prevState) : newAvailabilityState;
        localStorage.setItem('availability', JSON.stringify(newState));
        return newState;
    });
  };

  return (
    <AvailabilityContext.Provider value={{ availability, setAvailability: handleSetAvailability, loading }}>
      {children}
    </AvailabilityContext.Provider>
  );
};

export const useAvailability = () => {
  const context = useContext(AvailabilityContext);
  if (context === undefined) {
    throw new Error('useAvailability must be used within an AvailabilityProvider');
  }
  return context;
};
