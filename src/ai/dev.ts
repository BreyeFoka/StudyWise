import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-notes.ts';
import '@/ai/flows/homework-helper.ts';
import '@/ai/flows/contextual-chat-flow.ts';
import '@/ai/flows/generate-quiz-flow.ts';
import '@/ai/flows/generate-flashcards-flow.ts';
