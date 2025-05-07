// This file is intentionally NOT marked with 'use server'
import { z } from 'zod';

export const QuizQuestionSchema = z.object({
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

export const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().describe('A suitable title for the generated quiz (e.g., "Quiz on Photosynthesis Basics").'),
  questions: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});
