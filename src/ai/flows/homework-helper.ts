'use server';

/**
 * @fileOverview An AI agent for providing step-by-step explanations for homework questions.
 *
 * - homeworkHelp - A function that handles the homework help process.
 * - HomeworkHelpInput - The input type for the homeworkHelp function.
 * - HomeworkHelpOutput - The return type for the homeworkHelp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HomeworkHelpInputSchema = z.object({
  question: z.string().describe('The homework question to be answered.'),
  subject: z.string().describe('The subject of the homework question (e.g., Math, Physics, Programming).'),
});

export type HomeworkHelpInput = z.infer<typeof HomeworkHelpInputSchema>;

const HomeworkHelpOutputSchema = z.object({
  explanation: z.string().describe('A step-by-step explanation of how to solve the homework question, including LaTeX formatting for math and code blocks.'),
});

export type HomeworkHelpOutput = z.infer<typeof HomeworkHelpOutputSchema>;

export async function homeworkHelp(input: HomeworkHelpInput): Promise<HomeworkHelpOutput> {
  return homeworkHelpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'homeworkHelpPrompt',
  input: {schema: HomeworkHelpInputSchema},
  output: {schema: HomeworkHelpOutputSchema},
  prompt: `You are an AI assistant specialized in providing step-by-step explanations for homework questions.

  Subject: {{{subject}}}
  Question: {{{question}}}

  Provide a detailed, step-by-step explanation of how to solve the question. Use LaTeX formatting for mathematical equations and code blocks where appropriate.
  Make sure to explain the reasoning behind each step.
  Your explanation should be clear, concise, and easy to understand for a student.
  `,
});

const homeworkHelpFlow = ai.defineFlow(
  {
    name: 'homeworkHelpFlow',
    inputSchema: HomeworkHelpInputSchema,
    outputSchema: HomeworkHelpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output || !output.explanation) {
      throw new Error("Failed to generate explanation. The AI model did not return the expected output or the explanation was empty.");
    }
    return output;
  }
);
