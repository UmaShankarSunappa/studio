
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Lead } from '@/types';
import { leads as initialLeads, leadStatuses } from '@/lib/data';

interface LeadContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  loading: boolean;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedLeads = localStorage.getItem('allLeads');
      let leadsToLoad: Lead[];

      if (storedLeads) {
        const parsedLeads: Lead[] = JSON.parse(storedLeads).map((lead: any) => ({
            ...lead,
            dateAdded: new Date(lead.dateAdded),
            statusHistory: lead.statusHistory.map((h: any) => ({...h, date: new Date(h.date)})),
            interactions: lead.interactions.map((i: any) => ({...i, date: new Date(i.date)})),
            notes: lead.notes.map((n: any) => ({...n, date: new Date(n.date)})),
        }));
        
        // Clean up data: check for invalid statuses and reset them.
        leadsToLoad = parsedLeads.map(lead => {
            if (!leadStatuses.includes(lead.status)) {
                return { ...lead, status: "New" as const };
            }
            return lead;
        });

      } else {
        leadsToLoad = initialLeads;
      }
      
      setLeads(leadsToLoad);
      localStorage.setItem('allLeads', JSON.stringify(leadsToLoad));

    } catch (error) {
      console.error("Failed to load or parse leads from localStorage", error);
      setLeads(initialLeads); // Fallback to initial data on error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetLeads = (newLeadsState: React.SetStateAction<Lead[]>) => {
    setLeads(prevState => {
        const newState = typeof newLeadsState === 'function' ? newLeadsState(prevState) : newLeadsState;
        localStorage.setItem('allLeads', JSON.stringify(newState));
        return newState;
    });
  };


  return (
    <LeadContext.Provider value={{ leads, setLeads: handleSetLeads, loading }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
