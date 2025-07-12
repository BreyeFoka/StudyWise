'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageCircle, Send, User, Bot } from 'lucide-react';
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
          <h1 className="text-3xl font-bold">Contextual Chatbot</h1>
          <p className="text-muted-foreground">Ask questions and get answers from StudyWise AI.</p>
        </div>
        {/* Future: Add button for uploading/selecting context documents */}
      </div>

      <Card className="flex-1 flex flex-col shadow-xl overflow-hidden">
        <ScrollArea className="flex-1 p-4 pr-1" ref={scrollAreaRef}>
          {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold">Hello! How can I help you today?</p>
              <p className="text-muted-foreground">Type your question below to get started with StudyWise AI.</p>
              <Image 
                data-ai-hint="friendly robot chat"
                src="https://picsum.photos/seed/chatempty/300/200" 
                alt="Chatbot illustration" 
                width={300} 
                height={200} 
                className="mt-6 rounded-lg opacity-75 shadow-md"
              />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 mb-4 ${ // items-end for better bubble alignment
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="flex-shrink-0 p-2 bg-primary/10 rounded-full self-start"> {/* self-start for icon alignment */}
                    {msg.icon || <Bot className="h-5 w-5 text-primary" />}
                  </span>
                )}
                <div
                  className={`max-w-[75%] lg:max-w-[70%] px-4 py-3 rounded-xl shadow-md break-words ${ // break-words
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card border text-card-foreground rounded-bl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p> 
                  )}
                </div>
                 {msg.role === 'user' && (
                  <span className="flex-shrink-0 p-2 bg-secondary rounded-full self-start"> {/* self-start for icon alignment */}
                     {msg.icon || <User className="h-5 w-5" />}
                  </span>
                )}
              </div>
            ))
          )}
        </ScrollArea>
        <CardFooter className="p-4 border-t bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="w-full flex items-center gap-3"
          >
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type your message to StudyWise AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isPending}
              className="flex-1 text-base py-3" // Slightly larger text and padding
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button type="submit" size="lg" disabled={isPending || !input.trim()} className="px-5">
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
               <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
