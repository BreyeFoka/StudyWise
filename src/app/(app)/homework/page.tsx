'use client';

import { useState, useTransition } from 'react';
import { homeworkHelp, type HomeworkHelpInput } from '@/ai/flows/homework-helper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { FileUpload } from '@/components/file-upload'; // If allowing question upload

export default function HomeworkHelperPage() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  // const [fileDataUri, setFileDataUri] = useState<string | null>(null); // For file upload
  // const [fileName, setFileName] = useState<string | null>(null); // For file upload
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // const handleFileSelect = (file: File | null, dataUri: string | null) => {
  //   setFileDataUri(dataUri);
  //   setFileName(file?.name || null);
  //   setExplanation(null);
  //   // Optionally, extract text from file if possible or send URI to backend
  //   if (file?.type.startsWith('text/')) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => setQuestion(e.target?.result as string);
  //     reader.readAsText(file);
  //   } else {
  //     setQuestion(`Question from uploaded file: ${file?.name || 'document'}`);
  //   }
  // };

  const handleSubmit = () => {
    if (!question.trim() || !subject.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both a question and its subject.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const input: HomeworkHelpInput = { question, subject };
        // If using file upload, you might want to send the fileDataUri or extracted text
        // if (fileDataUri) {
        //   input.question = `Question related to uploaded file: ${fileName}. ${question}`;
        // }
        const result = await homeworkHelp(input);
        setExplanation(result.explanation);
        toast({
          title: 'Explanation Generated!',
          description: 'Step-by-step solution is ready.',
        });
      } catch (error) {
        console.error('Error getting homework help:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to get an explanation. Please try again.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setExplanation(null);
      }
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Homework Helper</h1>
          <p className="text-muted-foreground">Get step-by-step explanations for your homework questions.</p>
        </div>
        <Button onClick={handleSubmit} disabled={isPending || !question.trim() || !subject.trim()} size="lg">
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Get Explanation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Type your homework question below, or upload an image/document (feature coming soon).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/*
            // Uncomment for file upload functionality
            <div className="space-y-1">
              <Label htmlFor="homework-file">Upload Question (Optional)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedFileTypes="image/*,.pdf,.txt" />
            </div>
            */}
            <div className="space-y-1">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Math, Physics, Programming"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your homework question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={8}
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Step-by-Step Explanation</CardTitle>
            <CardDescription>The AI-generated explanation will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isPending && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating explanation...</p>
              </div>
            )}
            {!isPending && explanation && (
              <MarkdownRenderer content={explanation} />
            )}
            {!isPending && !explanation && (
              <p className="text-muted-foreground text-center py-10">
                Enter your question and subject, then click "Get Explanation".
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
