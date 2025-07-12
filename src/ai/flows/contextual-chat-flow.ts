'use server';
/**
 * @fileOverview Contextual chatbot flow for StudyWise.
 *
 * - contextualChat - Handles a single turn in a chat conversation.
 * - ContextualChatInput - Input type for the chat.
 * - ContextualChatOutput - Output type for the chat.
 * - ChatMessage - Type for chat history messages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit'; 

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.object({ text: z.string() })),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ContextualChatInputSchema = z.object({
  currentMessage: z.string().describe('The latest message from the user.'),
  chatHistory: z.array(ChatMessageSchema).optional().describe('The history of the conversation so far.'),
  // documentContext: z.string().optional().describe('Contextual information from relevant documents.'), // Future enhancement
});
export type ContextualChatInput = z.infer<typeof ContextualChatInputSchema>;

const ContextualChatOutputSchema = z.object({
  responseText: z.string().describe('The AI-generated response to the user.'),
});
export type ContextualChatOutput = z.infer<typeof ContextualChatOutputSchema>;

export async function contextualChat(input: ContextualChatInput): Promise<ContextualChatOutput> {
  return contextualChatFlow(input);
}

const systemInstruction = `You are StudyWise, a friendly and helpful AI academic assistant for college students.
You are having a conversation with a student. Answer their questions clearly and concisely.
If you don't know the answer or a question is outside of an academic scope, politely say so.
Keep your responses relatively short and to the point, suitable for a chat interface.`;
// Potential future enhancement for document context:
// {{#if documentContext}}
// You have the following context from the student's uploaded documents:
// ---CONTEXT START---
// {{{documentContext}}}
// ---CONTEXT END---
// Please use this context to answer the student's questions. If the question is not related to the context or you cannot answer it based on the context, politely state that.
// {{else}}
// Answer the student's questions conversationally.
// {{/if}}

const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChatFlow',
    inputSchema: ContextualChatInputSchema,
    outputSchema: ContextualChatOutputSchema,
  },
  async (input) => {
    const messages = (input.chatHistory || []).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add the current message to the conversation
    messages.push({
      role: 'user' as const,
      content: [{ text: input.currentMessage }]
    });

    const llmResponse = await ai.generate({
      messages,
      system: systemInstruction,
      // config: { temperature: 0.7 }, // Optional: Adjust creativity
    });

    const responseText = llmResponse.text; // Corrected: Access text property directly
    
    if (!responseText) {
      // This might happen if the model's safety settings block the response or an error occurs.
      return { responseText: "I'm sorry, I couldn't generate a response at this moment. Please try rephrasing or ask again later." };
    }
    return { responseText };
  }
);

