/**
 * @fileOverview Firebase client-side initialization.
 * Initializes Firebase app and exports auth, app, and db instances.
 */
import type { FirebaseApp } from 'firebase/app';
import { initializeApp, getApps, getApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isFirebaseConfigured()) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('Error initializing Firebase app:', error);
      // Fallback to prevent hard crash, but features will be broken.
      app = {} as FirebaseApp; 
    }
  } else {
    app = getApp();
  }
  
  try {
    auth = getAuth(app);
  } catch (error) {
    console.error('Error getting Firebase auth instance:', error);
    // Fallback for auth
    auth = {} as Auth;
  }

  try {
    db = getFirestore(app);
  } catch (error)
  {
    console.error('Error getting Firebase Firestore instance:', error);
    db = {} as Firestore;
  }

} else {
  console.warn(
    'Firebase is not configured. Please provide Firebase config in environment variables to enable authentication and other Firebase features.'
  );
  // Provide dummy objects to prevent app from crashing if Firebase is not configured
  // Features requiring Firebase will not work.
  app = { name: 'mock-app', options: {}, automaticDataCollectionEnabled: false } as FirebaseApp;
  auth = { currentUser: null } as unknown as Auth; 
  db = {} as Firestore;
}

export { app, auth, db };
