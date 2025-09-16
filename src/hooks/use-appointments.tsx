
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Appointment } from '@/types';

const initialAppointments: Appointment[] = [];

interface AppointmentContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  loading: boolean;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAppointments = localStorage.getItem('appointments');
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments).map((a: any) => ({
            ...a,
            date: new Date(a.date),
        })));
      } else {
        setAppointments(initialAppointments);
      }
    } catch (error) {
      console.error("Failed to load or parse appointments from localStorage", error);
      setAppointments(initialAppointments);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetAppointments = (newAppointmentsState: React.SetStateAction<Appointment[]>) => {
    setAppointments(prevState => {
        const newState = typeof newAppointmentsState === 'function' ? newAppointmentsState(prevState) : newAppointmentsState;
        localStorage.setItem('appointments', JSON.stringify(newState));
        return newState;
    });
  };

  return (
    <AppointmentContext.Provider value={{ appointments, setAppointments: handleSetAppointments, loading }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
