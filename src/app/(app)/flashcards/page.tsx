'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Info, PlusCircle, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Metadata } from 'next';

// export const metadata: Metadata = { // Cannot be used in client component
//   title: 'Flashcards - StudyWise',
// };

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deck: string;
  dueDate: Date; // For spaced repetition
  interval: number; // Current interval in days
  easeFactor: number; // SM2 ease factor
}

const sampleFlashcards: Flashcard[] = [
  { id: '1', question: 'What is the capital of France?', answer: 'Paris', deck: 'Geography', dueDate: new Date(), interval: 1, easeFactor: 2.5 },
  { id: '2', question: 'What is 2 + 2?', answer: '4', deck: 'Math', dueDate: new Date(Date.now() + 86400000), interval: 1, easeFactor: 2.5 },
  { id: '3', question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', deck: 'Biology', dueDate: new Date(), interval: 1, easeFactor: 2.5 },
  { id: '4', question: 'Who wrote Hamlet?', answer: 'William Shakespeare', deck: 'Literature', dueDate: new Date(Date.now() + 2*86400000), interval: 2, easeFactor: 2.6 },
];


export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(sampleFlashcards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
      const due = flashcards.filter(card => card.dueDate <= today);
      setDueFlashcards(due);
      setCurrentCardIndex(0); // Reset index when due cards change
      setSessionProgress(0); // Reset progress
    }
  }, [flashcards, isClient]);


  const currentCard = dueFlashcards.length > 0 ? dueFlashcards[currentCardIndex] : null;

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextCard = (quality: number) => { // SM2 quality: 0 (no idea) to 5 (perfect recall)
    if (!currentCard) return;

    // Basic SM2-like logic (simplified)
    let newInterval;
    let newEaseFactor = currentCard.easeFactor;

    if (quality < 3) { // If recall was poor
      newInterval = 1; // Reset interval
      newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.2); // Decrease ease factor
    } else {
      if (currentCard.interval === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentCard.interval * newEaseFactor);
      }
      newEaseFactor = currentCard.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      newEaseFactor = Math.max(1.3, newEaseFactor);
    }
    
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + newInterval);

    const updatedFlashcards = flashcards.map(card => 
      card.id === currentCard.id 
        ? { ...card, dueDate: newDueDate, interval: newInterval, easeFactor: newEaseFactor }
        : card
    );
    setFlashcards(updatedFlashcards);

    setShowAnswer(false);
    if (currentCardIndex < dueFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Session finished, or reshuffle remaining cards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const stillDue = updatedFlashcards.filter(card => card.dueDate <= today && card.id !== currentCard.id);
      setDueFlashcards(stillDue);
      setCurrentCardIndex(0);
    }
    setSessionProgress(((flashcards.length - dueFlashcards.length + 1) / flashcards.length) * 100);
  };
  
  if (!isClient) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">Review your flashcards using spaced repetition.</p>
        </div>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Deck
        </Button>
      </div>

      {dueFlashcards.length === 0 ? (
        <Card className="text-center py-10">
           <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2"><Check className="h-8 w-8 text-accent" /> All Caught Up!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have no flashcards due for review today.</p>
            <img data-ai-hint="celebration study" src="https://picsum.photos/seed/flashcardsdone/300/200" alt="All done" className="mt-4 mx-auto rounded-lg" />
          </CardContent>
        </Card>
      ) : currentCard ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentCard.deck}</CardTitle>
              <CardDescription>{currentCardIndex + 1} / {dueFlashcards.length} Due</CardDescription>
            </div>
            <Progress value={sessionProgress} className="mt-2" aria-label={`${Math.round(sessionProgress)}% of session complete`} />
          </CardHeader>
          <CardContent className="min-h-[250px] flex flex-col items-center justify-center text-center p-6">
            <p className="text-xl md:text-2xl font-semibold mb-4">{currentCard.question}</p>
            {showAnswer && (
              <p className="text-lg md:text-xl text-accent">{currentCard.answer}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!showAnswer ? (
              <Button onClick={handleShowAnswer} className="w-full">Show Answer</Button>
            ) : (
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="destructive" onClick={() => handleNextCard(0)} className="w-full">Again (0)</Button>
                <Button variant="outline" onClick={() => handleNextCard(2)} className="w-full">Hard (2)</Button>
                <Button variant="outline" onClick={() => handleNextCard(3)} className="w-full">Good (3)</Button>
                <Button variant="default" onClick={() => handleNextCard(5)} className="w-full">Easy (5)</Button>
              </div>
            )}
             <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" /> Spaced repetition helps you remember better. Rate your recall honestly.
            </p>
          </CardFooter>
        </Card>
      ) : (
         <Card className="text-center py-10">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2"><Check className="h-8 w-8 text-accent" /> All Caught Up!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You've reviewed all due flashcards for now.</p>
             <img data-ai-hint="celebration study" src="https://picsum.photos/seed/flashcardsdone2/300/200" alt="All done" className="mt-4 mx-auto rounded-lg" />
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">All Decks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(flashcards.map(fc => fc.deck))).map(deckName => {
            const cardsInDeck = flashcards.filter(fc => fc.deck === deckName);
            const dueInDeck = dueFlashcards.filter(fc => fc.deck === deckName).length;
            return (
              <Card key={deckName}>
                <CardHeader>
                  <CardTitle>{deckName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{cardsInDeck.length} cards total</p>
                  <p className={dueInDeck > 0 ? "text-accent font-semibold" : "text-muted-foreground"}>
                    {dueInDeck} cards due
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Study Deck</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
