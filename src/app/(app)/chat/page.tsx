'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageCircle, Send, User, Bot, Sparkles, Zap } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { contextualChat, type ContextualChatInput, type ChatMessage as AIChatMessage } from '@/ai/flows/contextual-chat-flow';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image'; 
import type { Metadata } from 'next';

// export const metadata: Metadata = { // Metadata can't be used in client components
//   title: 'Contextual Chatbot - StudyWise',
// };


interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  icon?: React.ReactNode;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    const viewport = scrollAreaRef.current?.firstElementChild;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);
  
  // Focus input after AI response or on initial load
  useEffect(() => {
    if (!isPending && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPending, messages]); // Re-focus after messages update (covers initial load & AI response)


  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newUserMessage: DisplayMessage = {
      id: `${Date.now()}-user-${Math.random()}`, // more unique id
      role: 'user',
      content: input.trim(),
      icon: <User className="h-5 w-5" />,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    const chatHistoryForAI: AIChatMessage[] = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model', // 'model' for assistant for Genkit
      content: [{ text: msg.content }],
    }));

    const aiInput: ContextualChatInput = {
      currentMessage: input.trim(),
      chatHistory: chatHistoryForAI,
    };
    
    const currentInput = input.trim();
    setInput(''); // Clear input immediately

    startTransition(async () => {
      try {
        const result = await contextualChat(aiInput);
        const newAssistantMessage: DisplayMessage = {
          id: `${Date.now()}-assistant-${Math.random()}`, // more unique id
          role: 'assistant',
          content: result.responseText,
          icon: <Bot className="h-5 w-5 text-primary" />,
        };
        setMessages((prev) => [...prev, newAssistantMessage]);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to get a response from the chatbot. Please try again.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
         const errorAssistantMessage: DisplayMessage = {
          id: `${Date.now()}-error-${Math.random()}`,
          role: 'assistant',
          content: `I'm having trouble responding: ${errorMessage.length > 100 ? errorMessage.substring(0,97) + '...' : errorMessage }`,
          icon: <Bot className="h-5 w-5 text-destructive" />,
        };
        setMessages((prev) => [...prev, errorAssistantMessage]);
      }
    });
  };

  return (
    <div className="container mx-auto py-6 md:py-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Study Assistant</h1>
          <p className="text-slate-600 dark:text-slate-400">Ask questions and get intelligent answers from StudyWise AI.</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-purple-600 dark:text-purple-400">Powered by Advanced AI</span>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full">
                <MessageCircle className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hello! I'm your AI Study Assistant
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                Ask me anything about your studies. I can help with explanations, problem-solving, research, and more!
              </p>
              
              {/* Example prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {[
                  "Explain photosynthesis in simple terms",
                  "Help me solve this math problem",
                  "What are the key points about World War II?",
                  "How does machine learning work?"
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="p-3 text-left bg-gradient-to-r from-white to-purple-50 dark:from-slate-800 dark:to-purple-950 rounded-lg border border-purple-200 dark:border-purple-800 hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950 dark:hover:to-pink-950 transition-all duration-300 text-sm"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2 text-purple-500" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-4 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full">
                      <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] lg:max-w-[70%] px-6 py-4 rounded-2xl shadow-lg break-words ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p> 
                    )}
                  </div>
                   {msg.role === 'user' && (
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full">
                       <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isPending && (
                <div className="flex items-end gap-4 justify-start">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full">
                    <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="px-6 py-4 bg-white dark:bg-slate-800 rounded-2xl rounded-bl-md shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <CardFooter className="p-6 border-t border-purple-200 dark:border-purple-800 bg-gradient-to-r from-white to-purple-50 dark:from-slate-900 dark:to-purple-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="w-full flex items-center gap-4"
          >
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything about your studies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isPending}
                className="w-full pl-4 pr-12 py-4 text-base bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Zap className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={isPending || !input.trim()} 
              className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
               <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
