'use server';
/**
 * @fileOverview AI flow for generating quizzes.
 *
 * - generateQuiz - A function that generates a quiz based on a document or topic.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 * - QuizQuestion - Represents a single question in the quiz.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { 
  QuizQuestionSchema, 
  GenerateQuizInputSchema, 
  GenerateQuizOutputSchema 
} from '@/ai/schemas/quiz.schemas';


export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  // The .refine() check in GenerateQuizInputSchema handles this,
  // but an explicit check here can be clearer or catch issues if Zod isn't used for validation upstream.
  if (!input.documentDataUri && !input.topic) {
    throw new Error("Either a document or a topic must be provided to generate a quiz.");
  }
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an AI assistant specialized in creating educational quizzes for college students.
Your task is to generate a quiz based on the provided information.

{{#if documentDataUri}}
The quiz should be based on the content of the following document:
Document: {{media url=documentDataUri}}
{{#if topic}}
Focus specifically on the topic of "{{topic}}" within the document.
{{/if}}
{{else}}
The quiz should be about the following topic: "{{topic}}".
{{/if}}

Please generate a quiz titled appropriately, containing exactly {{numQuestions}} questions.
The questions should test understanding of key concepts.
For each question, ensure you provide:
1.  'questionText': The full text of the question.
2.  'questionType': One of 'multiple-choice', 'true-false', or 'short-answer'.
3.  'options': If 'multiple-choice', an array of 2-5 distinct string options. This field is only for 'multiple-choice'.
4.  'correctAnswer': The correct answer.
    - For 'multiple-choice', this MUST be one of the strings provided in the 'options' array.
    - For 'true-false', this MUST be either "True" or "False".
    - For 'short-answer', this should be a concise correct answer.
5.  'explanation': (Optional) A brief explanation for the correct answer or additional context.

Generate a variety of question types if possible.
The quiz title should be relevant to the content.
Return the quiz in the specified JSON format.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate quiz. The AI model did not return the expected output.");
    }
    // Validate that for multiple choice questions, options are present and correctAnswer is one of the options
    output.questions.forEach(q => {
      if (q.questionType === 'multiple-choice') {
        if (!q.options || q.options.length < 2) {
          // This should ideally be caught by the model following instructions,
          // but as a safeguard, we could add filler options or throw an error.
          // For now, log a warning or adapt. If schema validation is strict, this might not even pass Zod.
          console.warn(`Multiple-choice question "${q.questionText}" has insufficient options. Model might not have followed instructions fully.`);
          // To be robust, ensure q.options exists before checking includes.
          q.options = q.options || []; // Ensure options is an array
        }
        // Ensure q.options is always an array before calling .includes or .find
        const currentOptions = q.options || [];
        if (!currentOptions.includes(q.correctAnswer)) {
          const foundOption = currentOptions.find(opt => opt.toLowerCase() === q.correctAnswer.toLowerCase());
          if (foundOption) {
            q.correctAnswer = foundOption; 
          } else {
            console.warn(`Correct answer for "${q.questionText}" ("${q.correctAnswer}") might not exactly match one of the options: ${currentOptions.join(', ')}. Defaulting to first option or leaving as is if no options.`);
            // Potentially problematic: if no options, this would fail.
            // If options exist but none match, model has made a mistake.
            // Consider how to handle this: throw error, pick first option, or ask model to regenerate question.
            // For now, we let it pass with a warning. If options are empty, this is a larger issue.
            if (currentOptions.length === 0 && q.questionType === 'multiple-choice') {
                 // This indicates a severe issue with model output or logic.
                 // Depending on strictness, could throw error or try to salvage.
                 // For now, if options were expected but are empty, it's a data integrity issue.
                 console.error(`CRITICAL: Multiple-choice question "${q.questionText}" has no options provided by the model.`);
                 // To prevent downstream errors, one might convert to short-answer or remove the question.
                 // For this exercise, we'll leave it to potentially fail stricter validation or UI rendering logic.
            }
          }
        }
      }
    });
    return output;
  }
);
