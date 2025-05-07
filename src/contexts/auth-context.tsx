'use client';

import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import type { z } from 'zod';
import type { LoginSchema } from '@/app/(auth)/login/page';
import type { SignUpSchema } from '@/app/(auth)/signup/page';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithEmail: (data: z.infer<typeof LoginSchema>) => Promise<FirebaseUser>;
  signUpWithEmail: (data: z.infer<typeof SignUpSchema>) => Promise<FirebaseUser>;
  signOutUser: () => Promise<void>;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      setIsFirebaseReady(true);
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        },
        (error) => {
          console.error('Auth state change error:', error);
          setUser(null);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setIsFirebaseReady(false);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (data: z.infer<typeof LoginSchema>): Promise<FirebaseUser> => {
    if (!isFirebaseReady) throw new Error("Firebase not configured for sign in.");
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    return userCredential.user;
  };

  const signUpWithEmail = async (data: z.infer<typeof SignUpSchema>): Promise<FirebaseUser> => {
    if (!isFirebaseReady) throw new Error("Firebase not configured for sign up.");
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    // Optionally update profile here if name is collected: await updateProfile(userCredential.user, { displayName: data.name });
    return userCredential.user;
  };

  const signOutUser = async (): Promise<void> => {
    if (!isFirebaseReady) throw new Error("Firebase not configured for sign out.");
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOutUser, isFirebaseReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
