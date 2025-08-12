"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { LoaderCircle } from 'lucide-react';

export type UserPlan = 'gratuito' | 'pro' | 'ultra';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userCredits: number;
  userPlan: UserPlan | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userCredits: 0,
  userPlan: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUserCredits(data.credits);
                setUserPlan(data.plan || 'gratuito');
            }
            setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setLoading(false);
        setUserCredits(0);
        setUserPlan(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, userCredits, userPlan }}>
      {children}
    </AuthContext.Provider>
  );
};
