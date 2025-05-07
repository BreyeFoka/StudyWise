'use client';

import { useState, useTransition } from 'react';
import { summarizeNotes, type SummarizeNotesInput } from '@/ai/flows/summarize-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/file-upload';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

export default function NotesPage() {
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileSelect = (file: File | null, dataUri: string | null) => {
    setFileDataUri(dataUri);
    setFileName(file?.name || null);
    setSummary(null); // Reset summary when a new file is selected
  };

  const handleSubmit = () => {
    if (!fileDataUri) {
      toast({
        title: 'No file selected',
        description: 'Please upload a document to summarize.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const input: SummarizeNotesInput = { documentDataUri: fileDataUri };
        const result = await summarizeNotes(input);
        setSummary(result.summary);
        toast({
          title: 'Summary Generated!',
          description: `${fileName || 'Document'} summarized successfully.`,
        });
      } catch (error) {
        console.error('Error summarizing notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to summarize the document. Please try again.',
          variant: 'destructive',
        });
        setSummary(null);
      }
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Smart Note Summarization</h1>
          <p className="text-muted-foreground">Upload your documents and get AI-powered summaries.</p>
        </div>
         <Button onClick={handleSubmit} disabled={isPending || !fileDataUri} size="lg">
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-5 w-5" />
          )}
          Summarize Notes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Select a PDF, PowerPoint, text file, or audio recording.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onFileSelect={handleFileSelect} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
            <CardDescription>
              {fileName ? `Summary for ${fileName}:` : 'Your summarized notes will appear here.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] prose dark:prose-invert max-w-none">
            {isPending && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating summary...</p>
              </div>
            )}
            {!isPending && summary && (
                <ReactMarkdown className="whitespace-pre-wrap">{summary}</ReactMarkdown>
            )}
            {!isPending && !summary && !fileDataUri && (
              <p className="text-muted-foreground text-center py-10">Upload a document to see its summary.</p>
            )}
             {!isPending && !summary && fileDataUri && (
              <p className="text-muted-foreground text-center py-10">Click "Summarize Notes" to generate the summary.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
