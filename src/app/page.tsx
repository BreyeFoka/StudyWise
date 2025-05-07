'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Layers, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const { user, loading: authLoading, isFirebaseReady } = useAuth();

  const getStartedLink = () => {
    if (authLoading || !isFirebaseReady) return "#"; // Or a loading state/disabled button
    return user ? "/dashboard" : "/login";
  };
  
  const loginLink = () => {
    if (authLoading || !isFirebaseReady) return "#";
    return user ? "/dashboard" : "/login"; // If user exists, login button could become "Go to App" or hide
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-semibold">StudyWise</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            href={getStartedLink()} // Use dynamic link for Features as well if it should point to dashboard
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Features
          </Link>
           {authLoading || !isFirebaseReady ? (
             <Loader2 className="h-5 w-5 animate-spin" />
           ) : user ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
           ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Login
              </Link>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
           )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock Your Academic Potential with <span className="text-primary">StudyWise</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Your all-in-one AI-powered academic assistant. Summarize notes, generate flashcards, get homework help, and ace your exams.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild disabled={authLoading || !isFirebaseReady}>
                    <Link href={getStartedLink()}>
                      {authLoading || !isFirebaseReady ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                data-ai-hint="study learning"
                src="https://picsum.photos/seed/studywisehero/600/400"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  StudyWise offers a suite of powerful tools designed to help you learn smarter, not harder.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    <CardTitle>Smart Note Summarization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Upload PDFs, slides, or audio. Get concise, structured summaries instantly.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                     <Layers className="h-6 w-6 text-primary" />
                    <CardTitle>Flashcard Generator</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Automatically create flashcards from notes with spaced repetition for optimal learning.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                 <div className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    <CardTitle>AI Homework Helper</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Get step-by-step explanations for tough homework questions in various subjects.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} StudyWise. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
