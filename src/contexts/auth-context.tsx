
'use client';

import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth as authInstance, firebaseInitializationError } from '@/lib/firebase/client'; // Renamed to authInstance
import { isFirebaseConfigured } from '@/lib/firebase/config';
import type { z } from 'zod';
import type { LoginSchema } from '@/app/(auth)/login/page';
import type { SignUpSchema } from '@/app/(auth)/signup/page';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithEmail: (data: z.infer<typeof LoginSchema>) => Promise<FirebaseUser>;
  signUpWithEmail: (data: z.infer<typeof SignUpSchema>, displayName?: string) => Promise<FirebaseUser>;
  signOutUser: () => Promise<void>;
  isFirebaseReady: boolean; // True if config is present AND initialization was successful
  auth: Auth | undefined; // Expose the auth instance
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured() && authInstance && !firebaseInitializationError) {
      setIsFirebaseReady(true);
      const unsubscribe = onAuthStateChanged(
        authInstance,
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
      if (firebaseInitializationError) {
        console.error("Firebase AuthProvider: Initialization error detected.", firebaseInitializationError);
      } else if (!isFirebaseConfigured()) {
        console.warn("Firebase AuthProvider: Firebase is not configured.");
      } else if (!authInstance) {
        console.warn("Firebase AuthProvider: Auth instance is not available after configuration check.");
      }
    }
  }, []);

  const signInWithEmail = async (data: z.infer<typeof LoginSchema>): Promise<FirebaseUser> => {
    if (!isFirebaseReady || !authInstance) throw new Error("Firebase Auth is not available for sign in.");
    const userCredential = await signInWithEmailAndPassword(authInstance, data.email, data.password);
    return userCredential.user;
  };

  const signUpWithEmail = async (data: z.infer<typeof SignUpSchema>, displayName?: string): Promise<FirebaseUser> => {
    if (!isFirebaseReady || !authInstance) throw new Error("Firebase Auth is not available for sign up.");
    const userCredential = await createUserWithEmailAndPassword(authInstance, data.email, data.password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  };

  const signOutUser = async (): Promise<void> => {
    if (!isFirebaseReady || !authInstance) throw new Error("Firebase Auth is not available for sign out.");
    await signOut(authInstance);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOutUser, isFirebaseReady, auth: authInstance }}>
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
