import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'AI Quizzes - StudyWise',
};

export default function QuizPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI-Generated Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge with quizzes based on your notes.</p>
        </div>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Generate New Quiz
        </Button>
      </div>

      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Lightbulb className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Quiz Feature Coming Soon!</CardTitle>
          <CardDescription>
            This section will allow you to generate quizzes from your uploaded content.
            <br />
            Check back later for updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image 
            data-ai-hint="coming soon construction"
            src="https://picsum.photos/seed/quizsoon/400/250" 
            alt="Coming Soon" 
            width={400} 
            height={250} 
            className="mx-auto rounded-lg shadow-md" 
          />
          <p className="mt-6 text-muted-foreground">
            Imagine testing yourself on key concepts automatically extracted from your lecture notes!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
