// This file is intentionally NOT marked with 'use server'
import { z } from 'zod';

export const FlashcardItemSchema = z.object({
  question: z.string().describe('The question for the flashcard.'),
  answer: z.string().describe('The answer to the flashcard question.'),
});

export const GenerateFlashcardsInputSchema = z.object({
  documentDataUri: z
    .string()
    .optional()
    .describe(
      "Optional: A document (PDF, PowerPoint slides, lecture notes) as a data URI to base the flashcards on. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  topic: z
    .string()
    .optional()
    .describe('Optional: A specific topic to generate flashcards about. Used if no document is provided, or to narrow down focus within a document.'),
  numFlashcards: z
    .number()
    .min(1)
    .max(20)
    .default(5)
    .describe('The number of flashcards to generate (default is 5, max 20).'),
  deckName: z
    .string()
    .min(1, { message: 'Deck name is required.'})
    .describe('The name of the deck these flashcards will belong to.'),
}).refine(data => data.documentDataUri || data.topic, {
  message: "Either a documentDataUri or a topic must be provided.",
  path: ["documentDataUri"], // Or path: ["topic"] or a general path
});

export const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardItemSchema).describe('An array of generated flashcards, each with a question and an answer.'),
});
