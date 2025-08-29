
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Campaign } from '@/types';

const initialCampaigns: Campaign[] = [
    { id: 'camp-1', name: 'Facebook ad -Jagityal store', slug: 'facebook-ad-jagityal-store', createdAt: new Date(), leadCount: 0 },
    { id: 'camp-2', name: 'youtube ad -yadagirigutta store', slug: 'youtube-ad-yadagirigutta-store', createdAt: new Date(), leadCount: 0 },
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
      const storedCampaigns = localStorage.getItem('allCampaigns');
      if (storedCampaigns) {
        const parsedCampaigns = JSON.parse(storedCampaigns).map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
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
