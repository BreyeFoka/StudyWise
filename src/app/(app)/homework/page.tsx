'use client';

import { useState, useTransition } from 'react';
import { homeworkHelp, type HomeworkHelpInput } from '@/ai/flows/homework-helper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Sparkles, Brain, Lightbulb, BookOpen, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { FileUpload } from '@/components/file-upload'; // If allowing question upload

export default function HomeworkHelperPage() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Explanation copied to clipboard.',
      });
    }
  };

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">AI Homework Helper</h1>
          <p className="text-slate-600 dark:text-slate-400">Get step-by-step explanations for your homework questions.</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-600 dark:text-emerald-400">AI-Powered Tutoring</span>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isPending || !question.trim() || !subject.trim()} 
          size="lg"
          className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-5 w-5" />
              Get Explanation
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 border-b border-emerald-200 dark:border-emerald-800">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 rounded-lg">
                <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Ask a Question
            </CardTitle>
            <CardDescription>
              Type your homework question below. Our AI tutor will provide detailed explanations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Math, Physics, Chemistry, Programming"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isPending}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your homework question here... Be as specific as possible for better explanations."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={10}
                disabled={isPending}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
              />
            </div>
            
            {/* Quick examples */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">💡 Example Questions:</p>
              <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                <li>• "Solve for x: 2x + 5 = 15"</li>
                <li>• "Explain photosynthesis process"</li>
                <li>• "How to calculate velocity in physics?"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Step-by-Step Explanation
                </CardTitle>
                <CardDescription>AI-generated detailed explanation and solution.</CardDescription>
              </div>
              {explanation && !isPending && (
                <Button variant="outline" size="sm" onClick={handleCopy} className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="min-h-[400px] p-6">
            {isPending && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">AI Tutor is thinking...</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analyzing your question and preparing explanation</p>
                </div>
              </div>
            )}
            {!isPending && explanation && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">✓ Explanation Generated</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {explanation.split(' ').length} words • {Math.ceil(explanation.length / 1000)} min read
                  </p>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <MarkdownRenderer content={explanation} />
                </div>
              </div>
            )}
            {!isPending && !explanation && (
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-2">Ready to help you learn</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Enter your question and subject to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
