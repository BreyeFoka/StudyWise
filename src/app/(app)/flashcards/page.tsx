'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Info, PlusCircle, RefreshCw, BookOpen, Edit, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';


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
  { id: '5', question: 'What element has the atomic number 1?', answer: 'Hydrogen', deck: 'Chemistry', dueDate: new Date(), interval: 1, easeFactor: 2.5 },
  { id: '6', question: 'In what year did World War II end?', answer: '1945', deck: 'History', dueDate: new Date(), interval: 1, easeFactor: 2.3 },
  { id: '7', question: 'Solve for x: 2x + 5 = 11', answer: 'x = 3', deck: 'Math', dueDate: new Date(), interval: 1, easeFactor: 2.7 },
];


export default function FlashcardsPage() {
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>(sampleFlashcards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const [activeDeckFilter, setActiveDeckFilter] = useState<string | null>(null);
  const [sessionTotalDueCards, setSessionTotalDueCards] = useState(0);
  const [answeredCardIdsInSession, setAnsweredCardIdsInSession] = useState<Set<string>>(new Set());

  // State for Add/Edit Flashcard Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [newCardDeck, setNewCardDeck] = useState(''); // Can be existing or new deck name
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);


  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    document.title = 'Flashcards - StudyWise';
  }, []);

  const allDecks = useMemo(() => Array.from(new Set(allFlashcards.map(fc => fc.deck))).sort(), [allFlashcards]);

  // Effect to determine and set up the current review session
  useEffect(() => {
    if (isClient) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      let cardsToReviewQuery = allFlashcards.filter(card => new Date(card.dueDate) <= today);
      
      if (activeDeckFilter) {
        cardsToReviewQuery = cardsToReviewQuery.filter(card => card.deck === activeDeckFilter);
      }
      
      // Shuffle cards to review for variety
      cardsToReviewQuery.sort(() => Math.random() - 0.5);

      setDueFlashcards(cardsToReviewQuery);
      setSessionTotalDueCards(cardsToReviewQuery.length); // Total for this session
      setCurrentCardIndex(0); // Start from the first card of the new set
      setAnsweredCardIdsInSession(new Set()); // Reset session tracking
      setSessionProgress(0); // Reset progress
      setShowAnswer(false); // Hide answer for new card
    }
  }, [allFlashcards, isClient, activeDeckFilter]);

  const currentCard = dueFlashcards.length > 0 ? dueFlashcards[currentCardIndex] : null;

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleSaveFlashcard = () => {
    if (!newCardQuestion.trim() || !newCardAnswer.trim() || !newCardDeck.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in question, answer, and deck name.",
        variant: "destructive",
      });
      return;
    }

    if (editingFlashcard) {
      // Update existing flashcard
      const updatedCards = allFlashcards.map(fc => 
        fc.id === editingFlashcard.id 
        ? { ...fc, question: newCardQuestion, answer: newCardAnswer, deck: newCardDeck.trim() } 
        : fc
      );
      setAllFlashcards(updatedCards);
      toast({ title: "Flashcard Updated", description: "Your flashcard has been successfully updated." });
    } else {
      // Add new flashcard
      const newFlashcard: Flashcard = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        question: newCardQuestion.trim(),
        answer: newCardAnswer.trim(),
        deck: newCardDeck.trim(),
        dueDate: new Date(), // Due immediately for first review
        interval: 1,
        easeFactor: 2.5, // Standard starting EF
      };
      setAllFlashcards(prev => [...prev, newFlashcard]);
      toast({ title: "Flashcard Created", description: "New flashcard added to your collection." });
    }
    
    // Reset form and close modal
    setNewCardQuestion('');
    setNewCardAnswer('');
    setNewCardDeck('');
    setEditingFlashcard(null);
    setIsCreateModalOpen(false);
  };

  const handleOpenCreateModal = (cardToEdit: Flashcard | null = null) => {
    if (cardToEdit) {
      setEditingFlashcard(cardToEdit);
      setNewCardQuestion(cardToEdit.question);
      setNewCardAnswer(cardToEdit.answer);
      setNewCardDeck(cardToEdit.deck);
    } else {
      setEditingFlashcard(null);
      setNewCardQuestion('');
      setNewCardAnswer('');
      setNewCardDeck(''); // Default to empty or last used deck
    }
    setIsCreateModalOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    // Add a confirmation dialog here in a real app
    setAllFlashcards(prev => prev.filter(fc => fc.id !== cardId));
    toast({ title: "Flashcard Deleted", description: "The flashcard has been removed.", variant: "destructive" });
  };


  const handleNextCard = (quality: number) => { // SM2 quality: 0 (no idea) to 5 (perfect recall)
    if (!currentCard) return;

    let newInterval;
    let newEaseFactor = currentCard.easeFactor;

    if (quality < 3) { 
      newInterval = 1; 
      newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.2); 
    } else {
      if (currentCard.interval === 1 && quality >=3) { // First successful recall
        newInterval = 6;
      } else {
        newInterval = Math.round(currentCard.interval * newEaseFactor);
      }
      newEaseFactor = currentCard.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      newEaseFactor = Math.max(1.3, newEaseFactor);
    }
    newInterval = Math.max(1, newInterval); // Ensure interval is at least 1 day
    
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + newInterval);
    newDueDate.setHours(0,0,0,0); // Normalize due date

    const updatedFlashcards = allFlashcards.map(card => 
      card.id === currentCard.id 
        ? { ...card, dueDate: newDueDate, interval: newInterval, easeFactor: newEaseFactor }
        : card
    );
    
    const newAnsweredIds = new Set(answeredCardIdsInSession);
    newAnsweredIds.add(currentCard.id);
    setAnsweredCardIdsInSession(newAnsweredIds);

    if (sessionTotalDueCards > 0) {
      setSessionProgress(Math.min(100, (newAnsweredIds.size / sessionTotalDueCards) * 100));
    }

    setShowAnswer(false);
    setAllFlashcards(updatedFlashcards);
    // Let useEffect handle moving to the next card or finishing the session
  };

  const handleStudyDeck = (deckName: string) => {
    setActiveDeckFilter(deckName);
  };

  const handleStudyAllDue = () => {
    setActiveDeckFilter(null);
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
          {activeDeckFilter && (
            <p className="text-sm text-primary">Currently studying: <strong>{activeDeckFilter}</strong></p>
          )}
        </div>
        <div className="flex gap-2">
          {activeDeckFilter && (
            <Button variant="outline" onClick={handleStudyAllDue}>
              <RefreshCw className="mr-2 h-4 w-4" /> Study All Due
            </Button>
          )}
           <Button variant="default" onClick={() => handleOpenCreateModal()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Flashcard
          </Button>
        </div>
      </div>

      {/* Add/Edit Flashcard Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingFlashcard ? 'Edit Flashcard' : 'Create New Flashcard'}</DialogTitle>
            <DialogDescription>
              {editingFlashcard ? 'Modify the details of your flashcard.' : 'Add a new question and answer to your collection.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="question" className="text-right">
                Question
              </Label>
              <Textarea
                id="question"
                value={newCardQuestion}
                onChange={(e) => setNewCardQuestion(e.target.value)}
                className="col-span-3"
                placeholder="Enter the question"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="answer" className="text-right">
                Answer
              </Label>
              <Textarea
                id="answer"
                value={newCardAnswer}
                onChange={(e) => setNewCardAnswer(e.target.value)}
                className="col-span-3"
                placeholder="Enter the answer"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deck" className="text-right">
                Deck
              </Label>
              <Input
                id="deck"
                value={newCardDeck}
                onChange={(e) => setNewCardDeck(e.target.value)}
                className="col-span-3"
                placeholder="Enter deck name (e.g., Biology)"
                list="deck-suggestions"
              />
              <datalist id="deck-suggestions">
                {allDecks.map(deck => <option key={deck} value={deck} />)}
              </datalist>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveFlashcard}>{editingFlashcard ? 'Save Changes' : 'Create Flashcard'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {currentCard ? (
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentCard.deck}</CardTitle>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => handleOpenCreateModal(currentCard)} title="Edit this card">
                    <Edit className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(currentCard.id)} title="Delete this card" className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                 </Button>
                <CardDescription>
                  {answeredCardIdsInSession.size + 1} / {sessionTotalDueCards}
                </CardDescription>
              </div>
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
              <Button onClick={handleShowAnswer} className="w-full" size="lg">Show Answer</Button>
            ) : (
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="destructive" onClick={() => handleNextCard(0)} className="w-full">Again (0)</Button>
                <Button variant="outline" onClick={() => handleNextCard(2)} className="w-full">Hard (2)</Button>
                <Button variant="outline" onClick={() => handleNextCard(3)} className="w-full">Good (3)</Button>
                <Button variant="default" onClick={() => handleNextCard(5)} className="w-full">Easy (5)</Button>
              </div>
            )}
             <p className="text-xs text-muted-foreground flex items-center gap-1 text-center">
              <Info className="h-3 w-3 flex-shrink-0" /> Spaced repetition helps you remember better. Rate your recall honestly.
            </p>
          </CardFooter>
        </Card>
      ) : (
        <Card className="text-center py-10 shadow-xl">
           <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Check className="h-8 w-8 text-green-500" /> {/* Changed to green */}
                {activeDeckFilter ? `All caught up on ${activeDeckFilter}!` : "All Caught Up!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {sessionTotalDueCards > 0 && answeredCardIdsInSession.size === sessionTotalDueCards 
                ? `You've reviewed all ${sessionTotalDueCards} cards for this ${activeDeckFilter ? `deck's ` : ''}session.`
                : `You have no flashcards due for review in ${activeDeckFilter ? activeDeckFilter : 'any deck'} right now.`}
            </p>
            <Image 
                data-ai-hint="celebration study" 
                src="https://picsum.photos/seed/flashcardsdone/300/200" 
                alt="All done illustration" 
                width={300} 
                height={200} 
                className="mt-4 mx-auto rounded-lg shadow-md" 
            />
            {activeDeckFilter && (
                 <Button onClick={handleStudyAllDue} className="mt-6">
                    Review Other Due Cards
                </Button>
            )}
             {!activeDeckFilter && allFlashcards.length > 0 && dueFlashcards.length === 0 && (
                <p className="mt-4 text-muted-foreground">Check back later for more cards to review!</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">All Decks</h2>
        {allDecks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allDecks.map(deckName => {
              const cardsInDeck = allFlashcards.filter(fc => fc.deck === deckName);
              const today = new Date(); today.setHours(0,0,0,0);
              const dueInDeckCount = cardsInDeck.filter(fc => new Date(fc.dueDate) <= today).length;
              return (
                <Card key={deckName} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {deckName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{cardsInDeck.length} card{cardsInDeck.length === 1 ? '' : 's'} total</p>
                    <p className={dueInDeckCount > 0 ? "text-accent font-semibold" : "text-muted-foreground"}>
                      {dueInDeckCount > 0 ? `${dueInDeckCount} card${dueInDeckCount === 1 ? '' : 's'} due` : "No cards due"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleStudyDeck(deckName)}
                      disabled={activeDeckFilter === deckName && dueFlashcards.length > 0} // Disable if currently studying this deck and cards are loaded
                    >
                      Study {deckName} Deck
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No flashcard decks yet.</p>
                <Button onClick={() => handleOpenCreateModal()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Flashcard
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}

