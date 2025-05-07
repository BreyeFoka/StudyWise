'use server';
/**
 * @fileOverview Service functions for managing flashcards in Firestore.
 */

import { db } from '@/lib/firebase/client';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import type { FlashcardItem as AIFlashcardItem } from '@/ai/flows/generate-flashcards-flow';


// This is the shape of Flashcard data as used in the frontend component
// and what these service functions will return/accept (with ID).
export interface Flashcard {
  id: string; // Firestore document ID
  question: string;
  answer: string;
  deck: string;
  dueDate: Date;
  interval: number;
  easeFactor: number;
  createdAt?: Date; // Optional, will be filled by server timestamp
  updatedAt?: Date; // Optional, will be filled by server timestamp
}

// This is the shape of data stored in Firestore (uses Timestamps)
interface FlashcardDocument {
  question: string;
  answer: string;
  deck: string;
  dueDate: Timestamp;
  interval: number;
  easeFactor: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

function flashcardFromDoc(docSnapshot: any): Flashcard {
  const data = docSnapshot.data() as FlashcardDocument;
  return {
    id: docSnapshot.id,
    question: data.question,
    answer: data.answer,
    deck: data.deck,
    dueDate: data.dueDate.toDate(),
    interval: data.interval,
    easeFactor: data.easeFactor,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
}


export async function addFlashcard(userId: string, cardData: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!userId) throw new Error("User ID is required to add a flashcard.");
  try {
    const flashcardsCol = collection(db, `users/${userId}/flashcards`);
    const docRef = await addDoc(flashcardsCol, {
      ...cardData,
      dueDate: Timestamp.fromDate(cardData.dueDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId: userId, // Storing userId for potential broader queries if rules change
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding flashcard to Firestore: ", error);
    throw new Error("Failed to save flashcard.");
  }
}

export async function addMultipleFlashcards(userId: string, deckName: string, aiFlashcards: AIFlashcardItem[]): Promise<string[]> {
  if (!userId) throw new Error("User ID is required to add flashcards.");
  if (!deckName) throw new Error("Deck name is required.");
  if (!aiFlashcards || aiFlashcards.length === 0) return [];

  const batch = writeBatch(db);
  const flashcardsCol = collection(db, `users/${userId}/flashcards`);
  const newIds: string[] = [];

  aiFlashcards.forEach(item => {
    const newDocRef = doc(flashcardsCol); // Create a new doc reference to get ID upfront
    newIds.push(newDocRef.id);
    batch.set(newDocRef, {
      question: item.question,
      answer: item.answer,
      deck: deckName,
      dueDate: Timestamp.fromDate(new Date()), // Due immediately
      interval: 1,
      easeFactor: 2.5,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId: userId,
    });
  });

  try {
    await batch.commit();
    return newIds;
  } catch (error) {
    console.error("Error adding multiple flashcards to Firestore: ", error);
    throw new Error("Failed to save AI generated flashcards.");
  }
}


export async function updateFlashcard(userId: string, flashcardId: string, updates: Partial<Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  if (!flashcardId) throw new Error("Flashcard ID is required.");
  try {
    const flashcardRef = doc(db, `users/${userId}/flashcards`, flashcardId);
    const updateData: any = { ...updates, updatedAt: serverTimestamp() };
    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    await updateDoc(flashcardRef, updateData);
  } catch (error) {
    console.error("Error updating flashcard in Firestore: ", error);
    throw new Error("Failed to update flashcard.");
  }
}

export async function deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  if (!flashcardId) throw new Error("Flashcard ID is required.");
  try {
    const flashcardRef = doc(db, `users/${userId}/flashcards`, flashcardId);
    await deleteDoc(flashcardRef);
  } catch (error) {
    console.error("Error deleting flashcard from Firestore: ", error);
    throw new Error("Failed to delete flashcard.");
  }
}

export async function getFlashcards(userId: string): Promise<Flashcard[]> {
  if (!userId) return [];
  try {
    const flashcardsCol = collection(db, `users/${userId}/flashcards`);
    // Consider ordering, e.g., by createdAt or deck name
    const q = query(flashcardsCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(flashcardFromDoc);
  } catch (error) {
    console.error("Error fetching flashcards from Firestore: ", error);
    // Gracefully return empty or throw, depending on desired UX
    return []; 
  }
}

export async function getDueFlashcards(userId: string, deckName?: string | null): Promise<Flashcard[]> {
  if (!userId) return [];
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Ensure we get all cards due up to end of today

    let q = query(
      collection(db, `users/${userId}/flashcards`),
      where("dueDate", "<=", Timestamp.fromDate(today))
    );

    if (deckName) {
      q = query(q, where("deck", "==", deckName));
    }
    // Order by dueDate to review earliest due cards first
    q = query(q, orderBy("dueDate", "asc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(flashcardFromDoc);
  } catch (error) {
    console.error("Error fetching due flashcards: ", error);
    return [];
  }
}


export async function getAllDecks(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const flashcards = await getFlashcards(userId);
    const deckNames = new Set(flashcards.map(fc => fc.deck));
    return Array.from(deckNames).sort();
  } catch (error) {
    console.error("Error fetching decks: ", error);
    return [];
  }
}
