
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Campaign } from '@/types';

const initialCampaigns: Campaign[] = [
    { 
      id: 'camp-1', 
      name: 'Facebook ad -Jagityal store', 
      slug: 'facebook-ad-jagityal-store', 
      createdAt: new Date(), 
      leadCount: 0,
      state: 'Telangana',
      period: {
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      }
    },
    { 
      id: 'camp-2', 
      name: 'youtube ad -yadagirigutta store', 
      slug: 'youtube-ad-yadagirigutta-store', 
      createdAt: new Date(), 
      leadCount: 0,
      state: 'Tamil Nadu',
      period: {
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 30)),
      }
    },
    { 
      id: 'camp-3', 
      name: 'facebook ad - madhapur', 
      slug: 'facebook-ad-madhapur', 
      createdAt: new Date('2024-05-10'), 
      leadCount: 0,
      state: 'Telangana',
      period: {
        from: new Date('2024-05-10'),
        to: new Date('2024-07-10'),
      }
    },
    { 
      id: 'camp-4', 
      name: 'facebook ad - amadhapur', 
      slug: 'facebook-ad-amadhapur', 
      createdAt: new Date('2024-06-01'), 
      leadCount: 0,
      state: 'Telangana',
      period: {
        from: new Date('2024-06-01'),
        to: new Date('2024-08-01'),
      }
    },
    { 
      id: 'camp-5', 
      name: 'youtube ad - medak', 
      slug: 'youtube-ad-medak', 
      createdAt: new Date('2024-04-20'), 
      leadCount: 0,
      state: 'Tamil Nadu',
      period: {
        from: new Date('2024-04-20'),
        to: new Date('2024-06-20'),
      }
    },
];


interface CampaignContextType {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  loading: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Force a reset to load the new data structure
      if (typeof window !== 'undefined') {
        localStorage.removeItem('allCampaigns');
      }
      
      const storedCampaigns = localStorage.getItem('allCampaigns');
      if (storedCampaigns) {
        const parsedCampaigns = JSON.parse(storedCampaigns).map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            period: c.period ? { from: new Date(c.period.from), to: new Date(c.period.to) } : undefined
        }));
        setCampaigns(parsedCampaigns);
      } else {
        setCampaigns(initialCampaigns);
        localStorage.setItem('allCampaigns', JSON.stringify(initialCampaigns));
      }
    } catch (error) {
      console.error("Failed to load or parse campaigns from localStorage", error);
      setCampaigns(initialCampaigns);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetCampaigns = (newCampaignsState: React.SetStateAction<Campaign[]>) => {
    setCampaigns(prevState => {
        const newState = typeof newCampaignsState === 'function' ? newCampaignsState(prevState) : newCampaignsState;
        localStorage.setItem('allCampaigns', JSON.stringify(newState));
        return newState;
    });
  };


  return (
    <CampaignContext.Provider value={{ campaigns, setCampaigns: handleSetCampaigns, loading }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};
