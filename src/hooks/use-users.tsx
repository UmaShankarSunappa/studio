
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';
import { allUsers as initialUsers } from '@/lib/data';

interface UserContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('allUsers');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(initialUsers);
        localStorage.setItem('allUsers', JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error("Failed to load or parse users from localStorage", error);
      setUsers(initialUsers);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetUsers = (newUsersState: React.SetStateAction<User[]>) => {
    setUsers(prevState => {
        const newState = typeof newUsersState === 'function' ? newUsersState(prevState) : newUsersState;
        localStorage.setItem('allUsers', JSON.stringify(newState));
        return newState;
    });
  };


  return (
    <UserContext.Provider value={{ users, setUsers: handleSetUsers, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
