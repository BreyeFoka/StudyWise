'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Info, PlusCircle, RefreshCw, BookOpen, Edit, Trash2, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/file-upload';
import { generateFlashcards, type GenerateFlashcardsInput, type FlashcardItem as AIFlashcardItem } from '@/ai/flows/generate-flashcards-flow';
import { useAuth } from '@/contexts/auth-context';
import { 
  addFlashcard, 
  addMultipleFlashcards,
  updateFlashcard, 
  deleteFlashcard, 
  getFlashcards, 
  getDueFlashcards, 
  getAllDecks,
  type Flashcard 
} from '@/services/flashcard-service';


// Flashcard interface is now imported from flashcard-service

export default function FlashcardsPage() {
  const { user, loading: authLoading, isFirebaseReady } = useAuth();
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [sessionProgress, setSessionProgress] = useState(0);
  
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);
  const [activeDeckFilter, setActiveDeckFilter] = useState<string | null>(null);
  const [sessionTotalDueCards, setSessionTotalDueCards] = useState(0);
  const [answeredCardIdsInSession, setAnsweredCardIdsInSession] = useState<Set<string>>(new Set());

  // State for Add/Edit Flashcard Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [newCardDeck, setNewCardDeck] = useState('');
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);

  // State for AI Flashcard Generation Modal
  const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
  const [aiGenFileDataUri, setAiGenFileDataUri] = useState<string | null>(null);
  const [aiGenFileName, setAiGenFileName] = useState<string | null>(null);
  const [aiGenTopic, setAiGenTopic] = useState('');
  const [aiGenNumFlashcards, setAiGenNumFlashcards] = useState<number>(5);
  const [aiGenDeckName, setAiGenDeckName] = useState('');
  const [isGeneratingAI, startAIGeneratingTransition] = useTransition();
  const [isSaving, startSavingTransition] = useTransition();


  const { toast } = useToast();

  useEffect(() => {
    document.title = 'Flashcards - StudyWise';
  }, []);

  // Fetch all flashcards for the user
  useEffect(() => {
    if (user && isFirebaseReady) {
      setIsLoadingFlashcards(true);
      getFlashcards(user.uid)
        .then(cards => {
          setAllFlashcards(cards);
        })
        .catch(error => {
          console.error("Failed to load flashcards:", error);
          toast({ title: "Error", description: "Could not load your flashcards.", variant: "destructive" });
        })
        .finally(() => setIsLoadingFlashcards(false));
    } else if (!authLoading && !user && isFirebaseReady) {
      // User is logged out, clear cards and stop loading
      setAllFlashcards([]);
      setIsLoadingFlashcards(false);
    }
  }, [user, authLoading, isFirebaseReady, toast]);

  const allDecks = useMemo(() => {
    const uniqueDecks = new Set(allFlashcards.map(fc => fc.deck));
    return Array.from(uniqueDecks).sort();
  }, [allFlashcards]);

  // Determine due flashcards based on allFlashcards and activeDeckFilter
  useEffect(() => {
    if (!user || isLoadingFlashcards) { // Don't run if still loading or no user
        setDueFlashcards([]); // Clear due cards if user logs out or data is loading
        setSessionTotalDueCards(0);
        setCurrentCardIndex(0);
        setAnsweredCardIdsInSession(new Set());
        setSessionProgress(0);
        setShowAnswer(false);
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let cardsToReviewQuery = allFlashcards.filter(card => new Date(card.dueDate) <= today);
    
    if (activeDeckFilter) {
      cardsToReviewQuery = cardsToReviewQuery.filter(card => card.deck === activeDeckFilter);
    }
    
    // Shuffle the due cards for variety
    cardsToReviewQuery.sort(() => Math.random() - 0.5);

    setDueFlashcards(cardsToReviewQuery);
    setSessionTotalDueCards(cardsToReviewQuery.length);
    setCurrentCardIndex(0);
    setAnsweredCardIdsInSession(new Set());
    setSessionProgress(0);
    setShowAnswer(false);
  }, [allFlashcards, activeDeckFilter, user, isLoadingFlashcards]);

  const currentCard = dueFlashcards.length > 0 ? dueFlashcards[currentCardIndex] : null;

  const handleShowAnswer = () => setShowAnswer(true);

  const handleSaveFlashcard = async () => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to save flashcards.", variant: "destructive" });
      return;
    }
    if (!newCardQuestion.trim() || !newCardAnswer.trim() || !newCardDeck.trim()) {
      toast({ title: "Missing Information", description: "Please fill in question, answer, and deck name.", variant: "destructive" });
      return;
    }

    startSavingTransition(async () => {
      try {
        if (editingFlashcard) {
          const updates: Partial<Flashcard> = {
            question: newCardQuestion.trim(),
            answer: newCardAnswer.trim(),
            deck: newCardDeck.trim(),
            // SM2 fields like dueDate, interval, easeFactor are not reset on simple edit.
            // If you wanted to reset them, you'd add them here.
          };
          await updateFlashcard(user.uid, editingFlashcard.id, updates);
          setAllFlashcards(prev => prev.map(fc => 
            fc.id === editingFlashcard.id ? { ...fc, ...updates } : fc
          ));
          toast({ title: "Flashcard Updated" });
        } else {
          const newFlashcardData: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = {
            question: newCardQuestion.trim(),
            answer: newCardAnswer.trim(),
            deck: newCardDeck.trim(),
            dueDate: new Date(), // New cards are due immediately
            interval: 1, 
            easeFactor: 2.5,
          };
          const newId = await addFlashcard(user.uid, newFlashcardData);
          setAllFlashcards(prev => [...prev, { ...newFlashcardData, id: newId, createdAt: new Date(), updatedAt: new Date() }]);
          toast({ title: "Flashcard Created" });
        }
        
        setNewCardQuestion(''); setNewCardAnswer(''); setNewCardDeck('');
        setEditingFlashcard(null); setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Error saving flashcard:", error);
        toast({ title: "Save Failed", description: (error as Error).message || "Could not save the flashcard.", variant: "destructive" });
      }
    });
  };

  const handleOpenCreateModal = (cardToEdit: Flashcard | null = null) => {
    if (cardToEdit) {
      setEditingFlashcard(cardToEdit);
      setNewCardQuestion(cardToEdit.question);
      setNewCardAnswer(cardToEdit.answer);
      setNewCardDeck(cardToEdit.deck);
    } else {
      setEditingFlashcard(null);
      setNewCardQuestion(''); setNewCardAnswer('');
      setNewCardDeck(activeDeckFilter || allDecks[0] || ''); // Pre-fill with active deck, first deck, or empty
    }
    setIsCreateModalOpen(true);
  };

  const handleDeleteCard = async (cardId: string) => {
     if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    startSavingTransition(async () => {
      try {
        await deleteFlashcard(user.uid, cardId);
        setAllFlashcards(prev => prev.filter(fc => fc.id !== cardId));
        // If the deleted card was the current one, advance or handle empty state
        if (currentCard && currentCard.id === cardId) {
            const newDue = dueFlashcards.filter(fc => fc.id !== cardId);
            if (newDue.length === 0) {
                // Handled by the main useEffect for dueFlashcards changing
            } else if (currentCardIndex >= newDue.length) {
                setCurrentCardIndex(newDue.length -1);
            }
            // The main useEffect on allFlashcards will update dueFlashcards, etc.
        }
        toast({ title: "Flashcard Deleted", variant: "destructive" });
      } catch (error) {
         console.error("Error deleting flashcard:", error);
         toast({ title: "Delete Failed", description: (error as Error).message || "Could not delete the flashcard.", variant: "destructive" });
      }
    });
  };

  const handleNextCard = async (quality: number) => {
    if (!currentCard || !user) return;

    let newInterval;
    let newEaseFactor = currentCard.easeFactor;

    if (quality < 3) { 
      newInterval = 1; 
      newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.2); 
    } else {
      newInterval = currentCard.interval === 1 ? 6 : Math.round(currentCard.interval * newEaseFactor);
      newEaseFactor = currentCard.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      newEaseFactor = Math.max(1.3, newEaseFactor);
    }
    newInterval = Math.max(1, newInterval);
    
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + newInterval);
    newDueDate.setHours(0,0,0,0);

    const updates = { 
      dueDate: newDueDate, 
      interval: newInterval, 
      easeFactor: newEaseFactor 
    };

    startSavingTransition(async () => {
        try {
            await updateFlashcard(user.uid, currentCard.id, updates);
            
            const updatedCardInAll = { ...currentCard, ...updates };
            setAllFlashcards(prevAll => prevAll.map(fc => fc.id === currentCard.id ? updatedCardInAll : fc));
            
            const newAnsweredIds = new Set(answeredCardIdsInSession).add(currentCard.id);
            setAnsweredCardIdsInSession(newAnsweredIds);

            if (sessionTotalDueCards > 0) {
                setSessionProgress(Math.min(100, (newAnsweredIds.size / sessionTotalDueCards) * 100));
            }
            setShowAnswer(false);
            // The main useEffect will re-filter due cards and pick the next one
            // No need to setCurrentCardIndex here if allFlashcards update triggers the effect

        } catch (error) {
            console.error("Error updating flashcard after review:", error);
            toast({ title: "Review Error", description: "Could not save review progress.", variant: "destructive" });
        }
    });
  };

  const handleStudyDeck = (deckName: string) => setActiveDeckFilter(deckName);
  const handleStudyAllDue = () => setActiveDeckFilter(null);

  // AI Generation Modal Logic
  const handleOpenAIGenerateModal = () => {
    setAiGenFileDataUri(null);
    setAiGenFileName(null);
    setAiGenTopic('');
    setAiGenNumFlashcards(5);
    setAiGenDeckName(activeDeckFilter || allDecks[0] || ''); // Pre-fill if studying a deck
    setIsAIGenerateModalOpen(true);
  };

  const handleAiFileSelect = (file: File | null, dataUri: string | null) => {
    setAiGenFileDataUri(dataUri);
    setAiGenFileName(file?.name || null);
  };

  const handleAIGenerateFlashcards = () => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!aiGenDeckName.trim()) {
      toast({ title: "Deck Name Required", description: "Please enter a name for the deck.", variant: "destructive" });
      return;
    }
    if (!aiGenFileDataUri && !aiGenTopic.trim()) {
      toast({ title: "Input Required", description: "Please upload a document or enter a topic.", variant: "destructive" });
      return;
    }

    startAIGeneratingTransition(async () => {
      try {
        const input: GenerateFlashcardsInput = {
          deckName: aiGenDeckName.trim(),
          numFlashcards: aiGenNumFlashcards,
        };
        if (aiGenFileDataUri) input.documentDataUri = aiGenFileDataUri;
        if (aiGenTopic.trim()) input.topic = aiGenTopic.trim();

        const result = await generateFlashcards(input); // This is the AI call
        
        // Now save these AI-generated cards to Firestore
        const newAiFlashcardItems: AIFlashcardItem[] = result.flashcards;
        if (newAiFlashcardItems.length > 0) {
            const newIds = await addMultipleFlashcards(user.uid, aiGenDeckName.trim(), newAiFlashcardItems);
            
            // For local state update, map AIFlashcardItem to Flashcard
            const newlySavedFlashcards: Flashcard[] = newAiFlashcardItems.map((item, index) => ({
                id: newIds[index], // This ID comes from Firestore after saving
                question: item.question,
                answer: item.answer,
                deck: aiGenDeckName.trim(),
                dueDate: new Date(), // Due immediately
                interval: 1,
                easeFactor: 2.5,
                createdAt: new Date(), // Approximate, actual is serverTimestamp
                updatedAt: new Date(),
            }));

            setAllFlashcards(prev => [...prev, ...newlySavedFlashcards]);
            toast({ title: "AI Flashcards Generated & Saved!", description: `${newlySavedFlashcards.length} flashcards added to "${aiGenDeckName.trim()}".` });
        } else {
            toast({ title: "AI Flashcards", description: `No flashcards were generated by the AI.`, variant: "default" });
        }
        
        setIsAIGenerateModalOpen(false);
      } catch (error) {
        console.error("Error generating or saving AI flashcards:", error);
        toast({ title: "AI Generation Failed", description: (error as Error).message || "Could not generate or save flashcards.", variant: "destructive" });
      }
    });
  };

  const isLoading = authLoading || isLoadingFlashcards;
  const isUIDisabled = isLoading || isSaving || isGeneratingAI;

  if (isLoading && !user) { // Initial load, checking auth
    return <div className="container mx-auto py-8 flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-3 text-lg">Loading your StudyWise experience...</p></div>;
  }
  if (!authLoading && !user && isFirebaseReady) { // User is definitively logged out
     return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">Please log in to manage and review your flashcards.</p>
        <Button asChild><a href="/login">Go to Login</a></Button>
      </div>
    );
  }
  if (!isFirebaseReady && !authLoading) { // Firebase not configured
    return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Feature Unavailable</h2>
        <p className="text-muted-foreground">Flashcard functionality requires Firebase configuration.</p>
      </div>
    );
  }
  if (isLoadingFlashcards && user) { // User logged in, but flashcards still loading
    return <div className="container mx-auto py-8 flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-3 text-lg">Loading your flashcards...</p></div>;
  }


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">Review your flashcards using spaced repetition.</p>
          {activeDeckFilter && <p className="text-sm text-primary">Currently studying: <strong>{activeDeckFilter}</strong></p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {activeDeckFilter && <Button variant="outline" onClick={handleStudyAllDue} disabled={isUIDisabled}><RefreshCw className="mr-2 h-4 w-4" /> Study All Due</Button>}
          <Button variant="outline" onClick={handleOpenAIGenerateModal} disabled={isUIDisabled}><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</Button>
          <Button variant="default" onClick={() => handleOpenCreateModal()} disabled={isUIDisabled}><PlusCircle className="mr-2 h-4 w-4" /> Add Manually</Button>
        </div>
      </div>

      {/* Manual Add/Edit Flashcard Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingFlashcard ? 'Edit Flashcard' : 'Create New Flashcard'}</DialogTitle>
            <DialogDescription>{editingFlashcard ? 'Modify details.' : 'Add a new question and answer.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="question" className="text-right">Question</Label><Textarea id="question" value={newCardQuestion} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCardQuestion(e.target.value)} className="col-span-3" placeholder="Enter question" rows={3} disabled={isSaving}/></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="answer" className="text-right">Answer</Label><Textarea id="answer" value={newCardAnswer} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCardAnswer(e.target.value)} className="col-span-3" placeholder="Enter answer" rows={3} disabled={isSaving}/></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="deck" className="text-right">Deck</Label><Input id="deck" value={newCardDeck} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCardDeck(e.target.value)} className="col-span-3" placeholder="Deck name (e.g., Biology)" list="deck-suggestions" disabled={isSaving}/><datalist id="deck-suggestions">{allDecks.map(deck => <option key={deck} value={deck} />)}</datalist></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose><Button onClick={handleSaveFlashcard} disabled={isSaving || !newCardQuestion.trim() || !newCardAnswer.trim() || !newCardDeck.trim()}>
            {isSaving ? <Loader2 className="animate-spin mr-2"/> : (editingFlashcard ? 'Save Changes' : 'Create Flashcard')}
            </Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generate Flashcards Modal */}
      <Dialog open={isAIGenerateModalOpen} onOpenChange={setIsAIGenerateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Flashcards with AI</DialogTitle>
            <DialogDescription>Let AI create flashcards from your document or a topic.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label htmlFor="ai-deckName">Deck Name</Label><Input id="ai-deckName" value={aiGenDeckName} onChange={(e: ChangeEvent<HTMLInputElement>) => setAiGenDeckName(e.target.value)} placeholder="Enter deck name" list="deck-suggestions-ai" disabled={isGeneratingAI}/><datalist id="deck-suggestions-ai">{allDecks.map(deck => <option key={`ai-${deck}`} value={deck} />)}</datalist></div>
            <div><Label>Source Material</Label><FileUpload onFileSelect={handleAiFileSelect} acceptedFileTypes="application/pdf,text/plain,.md,.txt" /><p className="text-xs text-muted-foreground mt-1">Upload document (PDF, TXT, MD). {aiGenFileName && `Selected: ${aiGenFileName}`}</p></div>
            <div className="text-center my-1 text-sm text-muted-foreground">OR</div>
            <div><Label htmlFor="ai-topic">Topic</Label><Input id="ai-topic" value={aiGenTopic} onChange={(e: ChangeEvent<HTMLInputElement>) => setAiGenTopic(e.target.value)} placeholder="e.g., Photosynthesis Process" disabled={isGeneratingAI}/></div>
            <div><Label htmlFor="ai-numFlashcards">Number of Flashcards (1-20)</Label><Input id="ai-numFlashcards" type="number" min="1" max="20" value={aiGenNumFlashcards} onChange={(e: ChangeEvent<HTMLInputElement>) => setAiGenNumFlashcards(Math.max(1, Math.min(20, parseInt(e.target.value,10) || 5)))} disabled={isGeneratingAI}/></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isGeneratingAI}>Cancel</Button></DialogClose>
            <Button onClick={handleAIGenerateFlashcards} disabled={isGeneratingAI || !aiGenDeckName.trim() || (!aiGenFileDataUri && !aiGenTopic.trim())}>
              {isGeneratingAI ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Flashcards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentCard ? (
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentCard.deck}</CardTitle>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => handleOpenCreateModal(currentCard)} title="Edit this card" disabled={isUIDisabled}><Edit className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(currentCard.id)} title="Delete this card" className="text-destructive hover:text-destructive/80" disabled={isUIDisabled}><Trash2 className="h-4 w-4" /></Button>
                <CardDescription>{answeredCardIdsInSession.size + 1} / {sessionTotalDueCards}</CardDescription>
              </div>
            </div>
            <Progress value={sessionProgress} className="mt-2" aria-label={`${Math.round(sessionProgress)}% of session complete`} />
          </CardHeader>
          <CardContent className="min-h-[250px] flex flex-col items-center justify-center text-center p-6">
            <p className="text-xl md:text-2xl font-semibold mb-4">{currentCard.question}</p>
            {showAnswer && <p className="text-lg md:text-xl text-accent">{currentCard.answer}</p>}
            {isSaving && currentCard.id === (editingFlashcard?.id || currentCard?.id) && <Loader2 className="h-5 w-5 animate-spin text-primary my-2" />}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!showAnswer ? (
              <Button onClick={handleShowAnswer} className="w-full" size="lg" disabled={isUIDisabled || isSaving}>Show Answer</Button>
            ) : (
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="destructive" onClick={() => handleNextCard(0)} className="w-full" disabled={isUIDisabled || isSaving}>Again (0)</Button>
                <Button variant="outline" onClick={() => handleNextCard(2)} className="w-full" disabled={isUIDisabled || isSaving}>Hard (2)</Button>
                <Button variant="outline" onClick={() => handleNextCard(3)} className="w-full" disabled={isUIDisabled || isSaving}>Good (3)</Button>
                <Button variant="default" onClick={() => handleNextCard(5)} className="w-full" disabled={isUIDisabled || isSaving}>Easy (5)</Button>
              </div>
            )}
             <p className="text-xs text-muted-foreground flex items-center gap-1 text-center"><Info className="h-3 w-3 flex-shrink-0" /> Spaced repetition helps you remember better. Rate your recall honestly.</p>
          </CardFooter>
        </Card>
      ) : ( // No current card to review
        <Card className="text-center py-10 shadow-xl">
           <CardHeader><CardTitle className="flex items-center justify-center gap-2 text-2xl"><Check className="h-8 w-8 text-green-500" />{activeDeckFilter ? `All caught up on ${activeDeckFilter}!` : "All Caught Up!"}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{sessionTotalDueCards > 0 && answeredCardIdsInSession.size === sessionTotalDueCards ? `You've reviewed all ${sessionTotalDueCards} cards for this ${activeDeckFilter ? `deck's ` : ''}session.` : `You have no flashcards due for review in ${activeDeckFilter ? activeDeckFilter : 'any deck'} right now.`}</p>
            <Image data-ai-hint="celebration study" src="https://picsum.photos/seed/flashcardsdone/300/200" alt="All done illustration" width={300} height={200} className="mt-4 mx-auto rounded-lg shadow-md" />
            {activeDeckFilter && <Button onClick={handleStudyAllDue} className="mt-6" disabled={isUIDisabled}>Review Other Due Cards</Button>}
            {!activeDeckFilter && allFlashcards.length > 0 && dueFlashcards.length === 0 && <p className="mt-4 text-muted-foreground">Check back later for more cards to review!</p>}
             {allFlashcards.length === 0 && !isLoadingFlashcards && (
                <p className="mt-4 text-lg text-muted-foreground">
                    Looks like you don&apos;t have any flashcards yet.
                    <br />
                    <Button onClick={() => handleOpenCreateModal()} variant="link" className="text-lg px-1" disabled={isUIDisabled}>Create some manually</Button>
                    or
                    <Button onClick={handleOpenAIGenerateModal} variant="link" className="text-lg px-1" disabled={isUIDisabled}>generate with AI!</Button>
                </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">All Decks</h2>
        {isLoadingFlashcards && user ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <Card key={`skeleton-${i}`} className="shadow-lg">
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))}
          </div>
        ) : allDecks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allDecks.map(deckName => {
              const cardsInDeck = allFlashcards.filter(fc => fc.deck === deckName);
              const today = new Date(); today.setHours(0,0,0,0);
              const dueInDeckCount = cardsInDeck.filter(fc => new Date(fc.dueDate) <= today).length;
              return (
                <Card key={deckName} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />{deckName}</CardTitle></CardHeader>
                  <CardContent>
                    <p>{cardsInDeck.length} card{cardsInDeck.length === 1 ? '' : 's'} total</p>
                    <p className={dueInDeckCount > 0 ? "text-accent font-semibold" : "text-muted-foreground"}>{dueInDeckCount > 0 ? `${dueInDeckCount} card${dueInDeckCount === 1 ? '' : 's'} due` : "No cards due"}</p>
                  </CardContent>
                  <CardFooter><Button variant="outline" className="w-full" onClick={() => handleStudyDeck(deckName)} disabled={isUIDisabled || (activeDeckFilter === deckName && dueFlashcards.length > 0)}>Study {deckName} Deck</Button></CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No flashcard decks yet.</p>
                <Button onClick={() => handleOpenCreateModal()} disabled={isUIDisabled}><PlusCircle className="mr-2 h-4 w-4" /> Create Your First Flashcard</Button>
                <Button onClick={handleOpenAIGenerateModal} variant="outline" className="ml-2" disabled={isUIDisabled}><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</Button>
            </div>
        )}
      </div>
    </div>
  );
}
