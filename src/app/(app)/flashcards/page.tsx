'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Info, PlusCircle, RefreshCw, BookOpen, Edit, Trash2, Sparkles, Loader2, AlertTriangle, CalendarIcon } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';


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
          const errorMessage = error instanceof Error ? error.message : "Could not load your flashcards.";
          toast({ title: "Error Loading Flashcards", description: errorMessage, variant: "destructive" });
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
            const errorMessage = error instanceof Error ? error.message : "Could not save review progress.";
            toast({ title: "Review Error", description: errorMessage, variant: "destructive" });
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Flashcards</h1>
          <p className="text-slate-600 dark:text-slate-400">Review your flashcards using spaced repetition.</p>
          {activeDeckFilter && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <p className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
                Currently studying: <strong>{activeDeckFilter}</strong>
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {activeDeckFilter && (
            <Button variant="outline" onClick={handleStudyAllDue} disabled={isUIDisabled} className="border-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:border-slate-600 dark:hover:from-blue-950 dark:hover:to-purple-950">
              <RefreshCw className="mr-2 h-4 w-4" /> Study All Due
            </Button>
          )}
          <Button variant="outline" onClick={handleOpenAIGenerateModal} disabled={isUIDisabled} className="border-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950 dark:hover:to-pink-950">
            <Sparkles className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" /> Generate with AI
          </Button>
          <Button onClick={() => handleOpenCreateModal()} disabled={isUIDisabled} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Manually
          </Button>
        </div>
      </div>

      {/* Manual Add/Edit Flashcard Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingFlashcard ? 'Edit Flashcard' : 'Create New Flashcard'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {editingFlashcard ? 'Modify the flashcard details below.' : 'Add a new question and answer to your deck.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Question</Label>
              <Textarea 
                id="question" 
                value={newCardQuestion} 
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCardQuestion(e.target.value)} 
                className="min-h-[100px] bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl" 
                placeholder="Enter your question here..." 
                rows={3} 
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Answer</Label>
              <Textarea 
                id="answer" 
                value={newCardAnswer} 
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCardAnswer(e.target.value)} 
                className="min-h-[100px] bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl" 
                placeholder="Enter the answer here..." 
                rows={3} 
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deck" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Deck Name</Label>
              <Input 
                id="deck" 
                value={newCardDeck} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCardDeck(e.target.value)} 
                className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl" 
                placeholder="e.g., Biology, History, Math..." 
                list="deck-suggestions" 
                disabled={isSaving}
              />
              <datalist id="deck-suggestions">
                {allDecks.map(deck => <option key={deck} value={deck} />)}
              </datalist>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSaving} className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleSaveFlashcard} 
              disabled={isSaving || !newCardQuestion.trim() || !newCardAnswer.trim() || !newCardDeck.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {editingFlashcard ? 'Save Changes' : 'Create Flashcard'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generate Flashcards Modal */}
      <Dialog open={isAIGenerateModalOpen} onOpenChange={setIsAIGenerateModalOpen}>
        <DialogContent className="sm:max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate Flashcards with AI
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Let our AI create personalized flashcards from your document or topic.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-deckName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Deck Name</Label>
              <Input 
                id="ai-deckName" 
                value={aiGenDeckName} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAiGenDeckName(e.target.value)} 
                placeholder="Enter a name for your new deck" 
                list="deck-suggestions-ai" 
                disabled={isGeneratingAI}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
              />
              <datalist id="deck-suggestions-ai">
                {allDecks.map(deck => <option key={`ai-${deck}`} value={deck} />)}
              </datalist>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Source Material</Label>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <FileUpload onFileSelect={handleAiFileSelect} acceptedFileTypes="application/pdf,text/plain,.md,.txt" />
                {aiGenFileName && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                    ✓ Selected: {aiGenFileName}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800"></div>
              <span className="text-sm text-slate-500 dark:text-slate-400 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 px-3 py-1 rounded-full">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800"></div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ai-topic" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Topic</Label>
              <Input 
                id="ai-topic" 
                value={aiGenTopic} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAiGenTopic(e.target.value)} 
                placeholder="e.g., Photosynthesis, World War II, Calculus Derivatives" 
                disabled={isGeneratingAI}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-pink-500 dark:focus:border-pink-400 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ai-numFlashcards" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Number of Flashcards</Label>
              <Input 
                id="ai-numFlashcards" 
                type="number" 
                min="1" 
                max="20" 
                value={aiGenNumFlashcards} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAiGenNumFlashcards(Math.max(1, Math.min(20, parseInt(e.target.value,10) || 5)))} 
                disabled={isGeneratingAI}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl w-32"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose between 1-20 flashcards</p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button variant="outline" disabled={isGeneratingAI} className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleAIGenerateFlashcards} 
              disabled={isGeneratingAI || !aiGenDeckName.trim() || (!aiGenFileDataUri && !aiGenTopic.trim())}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentCard ? (
        <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{currentCard.deck}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenCreateModal(currentCard)} title="Edit this card" disabled={isUIDisabled} className="hover:bg-blue-100 dark:hover:bg-blue-900">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(currentCard.id)} title="Delete this card" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" disabled={isUIDisabled}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="ml-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full">
                  <CardDescription className="text-xs font-medium text-blue-700 dark:text-blue-300">{answeredCardIdsInSession.size + 1} / {sessionTotalDueCards}</CardDescription>
                </div>
              </div>
            </div>
            <Progress value={sessionProgress} className="mt-3 h-2 bg-slate-200 dark:bg-slate-700" aria-label={`${Math.round(sessionProgress)}% of session complete`} />
          </CardHeader>
          <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
            <div className="max-w-lg">
              <p className="text-xl md:text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200 leading-relaxed">{currentCard.question}</p>
              {showAnswer && (
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <p className="text-lg md:text-xl text-emerald-800 dark:text-emerald-200 font-medium">{currentCard.answer}</p>
                </div>
              )}
              {isSaving && currentCard.id === (editingFlashcard?.id || currentCard?.id) && (
                <div className="mt-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6">
            {!showAnswer ? (
              <Button onClick={handleShowAnswer} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" size="lg" disabled={isUIDisabled || isSaving}>
                <BookOpen className="mr-2 h-5 w-5" />
                Show Answer
              </Button>
            ) : (
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="destructive" onClick={() => handleNextCard(0)} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300" disabled={isUIDisabled || isSaving}>
                  Again
                  <span className="block text-xs opacity-80">0</span>
                </Button>
                <Button variant="outline" onClick={() => handleNextCard(2)} className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950 shadow-md hover:shadow-lg transition-all duration-300" disabled={isUIDisabled || isSaving}>
                  Hard
                  <span className="block text-xs opacity-80">2</span>
                </Button>
                <Button variant="outline" onClick={() => handleNextCard(3)} className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950 shadow-md hover:shadow-lg transition-all duration-300" disabled={isUIDisabled || isSaving}>
                  Good
                  <span className="block text-xs opacity-80">3</span>
                </Button>
                <Button onClick={() => handleNextCard(5)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300" disabled={isUIDisabled || isSaving}>
                  Easy
                  <span className="block text-xs opacity-80">5</span>
                </Button>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info className="h-3 w-3 flex-shrink-0" />
              <span>Spaced repetition helps you remember better. Rate your recall honestly.</span>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Card className="text-center py-12 border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 rounded-full flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="flex items-center justify-center gap-3 text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {activeDeckFilter ? `All caught up on ${activeDeckFilter}!` : "All Caught Up!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {sessionTotalDueCards > 0 && answeredCardIdsInSession.size === sessionTotalDueCards
                ? `Amazing! You've reviewed all ${sessionTotalDueCards} cards for this ${activeDeckFilter ? `deck's ` : ''}session. Great job staying consistent!`
                : `You have no flashcards due for review in ${activeDeckFilter ? activeDeckFilter : 'any deck'} right now. Check back later or create new cards!`}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">All Decks</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800"></div>
        </div>
        {isLoadingFlashcards && user ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <Card key={`skeleton-${i}`} className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
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
                <Card key={deckName} className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-slate-800 dark:text-slate-200">{deckName}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{cardsInDeck.length} card{cardsInDeck.length === 1 ? '' : 's'} total</p>
                    <p className={`text-sm font-medium ${dueInDeckCount > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {dueInDeckCount > 0 ? `${dueInDeckCount} card${dueInDeckCount === 1 ? '' : 's'} due` : "✓ All caught up"}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:border-slate-600 dark:hover:from-blue-950 dark:hover:to-purple-950 transition-all duration-300" 
                      onClick={() => handleStudyDeck(deckName)} 
                      disabled={isUIDisabled || (activeDeckFilter === deckName && dueFlashcards.length > 0)}
                    >
                      Study {deckName} Deck
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">No flashcard decks yet.</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mb-6">Create your first deck to start learning!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => handleOpenCreateModal()} disabled={isUIDisabled} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Flashcard
                  </Button>
                  <Button onClick={handleOpenAIGenerateModal} variant="outline" disabled={isUIDisabled} className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950">
                    <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
                  </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
