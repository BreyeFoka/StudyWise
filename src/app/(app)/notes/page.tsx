'use client';

import { useState, useTransition } from 'react';
import { summarizeNotes, type SummarizeNotesInput } from '@/ai/flows/summarize-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/file-upload';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { FileText, Download, Share2 } from 'lucide-react';

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
        const errorMessage = error instanceof Error ? error.message : 'Failed to summarize the document. Please try again.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setSummary(null);
      }
    });
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName?.replace(/\.[^/.]+$/, '') || 'summary'}-summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Smart Note Summarization</h1>
          <p className="text-slate-600 dark:text-slate-400">Upload your documents and get AI-powered summaries in seconds.</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 dark:text-green-400">AI-Powered</span>
          </div>
        </div>
         <Button 
          onClick={handleSubmit} 
          disabled={isPending || !fileDataUri} 
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Summarize Notes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b border-blue-200 dark:border-blue-800">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Upload Document
            </CardTitle>
            <CardDescription>Select a PDF, PowerPoint, text file, or audio recording to summarize.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <FileUpload onFileSelect={handleFileSelect} />
            {fileName && (
              <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">✓ Ready to summarize: {fileName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded-lg">
                    <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Generated Summary
                </CardTitle>
                <CardDescription>
                  {fileName ? `AI summary for ${fileName}` : 'Your summarized notes will appear here.'}
                </CardDescription>
              </div>
              {summary && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload} className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="min-h-[400px] p-6">
            {isPending && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                  <p className="text-purple-600 dark:text-purple-400 font-medium">Analyzing your document...</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This may take a few moments</p>
                </div>
              </div>
            )}
            {!isPending && summary && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-2">✓ Summary Generated Successfully</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {summary.split(' ').length} words • {Math.ceil(summary.length / 1000)} min read
                  </p>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <MarkdownRenderer content={summary} />
                </div>
              </div>
            )}
            {!isPending && !summary && !fileDataUri && (
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-2">No document uploaded yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Upload a document to see its AI-generated summary</p>
              </div>
            )}
             {!isPending && !summary && fileDataUri && (
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-4">
                  <Wand2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-2">Ready to generate summary</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">Click "Summarize Notes" to process your document</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
