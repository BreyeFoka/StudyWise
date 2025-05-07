import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Contextual Chatbot - StudyWise',
};

export default function ChatbotPage() {
  return (
    <div className="container mx-auto py-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contextual Chatbot</h1>
          <p className="text-muted-foreground">Ask questions based on your uploaded course materials.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <MessageCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Chatbot Feature Coming Soon!</CardTitle>
          <CardDescription>
            Get ready to interact with an AI chatbot trained on your course content.
            <br />
            Ask specific questions and get contextual answers in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center">
           <Image 
            data-ai-hint="chatbot conversation"
            src="https://picsum.photos/seed/chatsoon/400/250" 
            alt="Coming Soon" 
            width={400} 
            height={250} 
            className="mx-auto rounded-lg shadow-md" 
          />
          <p className="mt-6 text-muted-foreground">
            Your personal AI tutor, always ready to help you understand your study materials better.
          </p>
        </CardContent>
        <div className="p-4 border-t">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Chatbot is evolving..."
                    className="w-full p-3 pr-12 border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                    disabled
                />
                <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" disabled>
                    <Send className="h-4 w-4"/>
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
