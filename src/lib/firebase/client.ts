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

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;
let firebaseInitializationError: Error | null = null;

if (isFirebaseConfigured()) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    // Ensure app is defined before trying to get auth and db
    if (app) {
      auth = getAuth(app);
      db = getFirestore(app);
    } else {
      // This case should ideally not be reached if initializeApp succeeded or getApp returned an instance.
      // If app is still undefined here, it means a fundamental issue with app initialization.
      firebaseInitializationError = new Error("Firebase app could not be initialized.");
      console.error("CRITICAL: Firebase app object is undefined after initialization attempt.");
    }
  } catch (e:any) {
    firebaseInitializationError = e instanceof Error ? e : new Error(String(e));
    console.error("CRITICAL: Firebase initialization failed despite configuration being present.", e);
    // app, auth, db will remain undefined if an error occurred
  }
} else {
  console.warn(
    'Firebase is not configured. Please provide Firebase config in environment variables to enable authentication and other Firebase features.'
  );
  // app, auth, db remain undefined
}

export { app, auth, db, firebaseInitializationError };
