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
import { z } from 'genkit';

const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The text of the quiz question.'),
  questionType: z
    .enum(['multiple-choice', 'true-false', 'short-answer'])
    .describe('The type of the question (e.g., multiple-choice, true-false, short-answer).'),
  options: z
    .array(z.string())
    .optional()
    .describe('An array of possible answers for multiple-choice questions. Required if questionType is multiple-choice. Should contain between 2 and 5 options.'),
  correctAnswer: z
    .string()
    .describe('The correct answer to the question. For multiple-choice, this must be one of the strings from the options array. For true-false, it should be "True" or "False".'),
  explanation: z
    .string()
    .optional()
    .describe('A brief explanation of why the answer is correct, or additional context.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const GenerateQuizInputSchema = z.object({
  documentDataUri: z
    .string()
    .optional()
    .describe(
      "Optional: A document (PDF, PowerPoint slides, lecture notes) as a data URI to base the quiz on. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  topic: z
    .string()
    .optional()
    .describe('Optional: A specific topic to generate the quiz about. Used if no document is provided, or to narrow down focus within a document.'),
  numQuestions: z
    .number()
    .min(1)
    .max(20)
    .default(5)
    .describe('The number of questions to generate for the quiz (default is 5, max 20).'),
}).refine(data => data.documentDataUri || data.topic, {
  message: "Either a documentDataUri or a topic must be provided.",
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().describe('A suitable title for the generated quiz (e.g., "Quiz on Photosynthesis Basics").'),
  questions: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
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
          throw new Error(`Multiple-choice question "${q.questionText}" must have at least 2 options.`);
        }
        if (!q.options.includes(q.correctAnswer)) {
          // Attempt to find a case-insensitive match as a fallback
          const foundOption = q.options.find(opt => opt.toLowerCase() === q.correctAnswer.toLowerCase());
          if (foundOption) {
            q.correctAnswer = foundOption; // Correct the casing
          } else {
            // If still not found, this is an issue. For now, we'll let it pass but ideally, it should be fixed or reported.
            // This could be a sign the model didn't follow instructions perfectly.
            // To be stricter, uncomment the line below:
            // throw new Error(`Correct answer for "${q.questionText}" is not among the options.`);
            console.warn(`Correct answer for "${q.questionText}" ("${q.correctAnswer}") might not exactly match one of the options: ${q.options.join(', ')}`);
          }
        }
      }
    });
    return output;
  }
);
