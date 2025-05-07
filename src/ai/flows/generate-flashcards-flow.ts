'use server';
/**
 * @fileOverview AI flow for generating flashcards.
 *
 * - generateFlashcards - A function that generates flashcards based on a document or topic.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  GenerateFlashcardsInputSchema,
  GenerateFlashcardsOutputSchema,
  FlashcardItemSchema,
} from '@/ai/schemas/flashcard.schemas';

export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;
export type FlashcardItem = z.infer<typeof FlashcardItemSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  if (!input.documentDataUri && !input.topic) {
    throw new Error("Either a document or a topic must be provided to generate flashcards.");
  }
  if (!input.deckName || input.deckName.trim() === '') {
    throw new Error("A deck name must be provided.");
  }
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an AI assistant specialized in creating educational flashcards for college students.
Your task is to generate flashcards based on the provided information for the deck named "{{deckName}}".

{{#if documentDataUri}}
The flashcards should be based on the content of the following document:
Document: {{media url=documentDataUri}}
{{#if topic}}
Focus specifically on the topic of "{{topic}}" within the document.
{{/if}}
{{else}}
The flashcards should be about the following topic: "{{topic}}".
{{/if}}

Please generate exactly {{numFlashcards}} flashcards.
Each flashcard must have a clear 'question' and a concise 'answer'.
The questions should test understanding of key concepts, definitions, or important facts.
The answers should be accurate and directly address the question.

Return the flashcards in the specified JSON format within a "flashcards" array.
Example for one flashcard: { "question": "What is photosynthesis?", "answer": "The process by which green plants use sunlight, water, and carbon dioxide to create their own food." }
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.flashcards || output.flashcards.length === 0) {
      throw new Error("Failed to generate flashcards. The AI model did not return the expected output or returned no flashcards.");
    }
    // Basic validation, though Zod schema in prompt output helps.
    if (output.flashcards.length !== input.numFlashcards) {
        console.warn(`Requested ${input.numFlashcards} flashcards, but received ${output.flashcards.length}.`)
        // Optionally, you could throw an error or try to pad/truncate, but for now, accept what the model gave.
    }
    output.flashcards.forEach(fc => {
        if (!fc.question || !fc.answer) {
            throw new Error("Generated flashcard is missing a question or answer.");
        }
    });
    return output;
  }
);
