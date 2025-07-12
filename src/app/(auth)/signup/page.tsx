
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, ArrowLeft, Mail, Lock, User, Sparkles, GraduationCap } from 'lucide-react';
import React, { useEffect, useState, Suspense } from 'react';
import type { AuthError } from 'firebase/auth';
import { Logo } from '@/components/logo';
import { SignUpSchema, type SignUpFormData } from '@/lib/schemas/auth';

function SignUpPageContent() {
  const { signUpWithEmail, user, loading: authLoading, isFirebaseReady, auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

 useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const onSubmit = async (values: SignUpFormData) => {
    setIsSubmitting(true);
    if (!isFirebaseReady || !auth) {
      toast({
        title: 'Sign Up Unavailable',
        description: 'Firebase authentication service is not ready. Please try again later or contact support if the issue persists.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }
    try {
      await signUpWithEmail(values, values.name);
      toast({ 
        title: 'Welcome to StudyWise! 🎉', 
        description: "Your account has been successfully created. Let's start your learning journey!" 
      });
      router.push('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (authError.code) {
        switch (authError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Try logging in instead.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please choose a stronger password with at least 6 characters.';
            break;
          case 'auth/configuration-not-found':
            errorMessage = 'Authentication service is not properly configured. Please contact support.';
            break;
          default:
            errorMessage = `Sign up failed: ${authError.message}. Please try again.`;
        }
      }
      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Sign up error:', authError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Creating your account...</p>
        </div>
      </div>
    );
  }

  if (!isFirebaseReady && !authLoading && !auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">Service Unavailable</CardTitle>
            <CardDescription>
              Authentication service is not configured. Please contact support or try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-6 text-center">
            <div className="mx-auto">
              <Logo />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Join StudyWise
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Create your account and start learning smarter
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 border-0">
              <GraduationCap className="w-4 h-4 mr-2" />
              100% Free to Start
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Name (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input 
                            placeholder="Your full name" 
                            className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input 
                            placeholder="your.email@example.com" 
                            className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input 
                            type="password" 
                            placeholder="Create a strong password"
                            className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Password must be at least 6 characters long
                      </p>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 text-sm">What you'll get:</h3>
              <ul className="space-y-1 text-xs text-purple-700 dark:text-purple-300">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  AI-powered study tools
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Smart flashcard generation
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Personalized homework help
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Button variant="link" asChild className="p-0 h-auto font-semibold text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400">
                <Link href="/login">Sign in here</Link>
              </Button>
            </div>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">
                  Secure & Private
                </span>
              </div>
            </div>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              By creating an account, you agree to our{' '}
              <Link href="#" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Loading sign up...</p>
        </div>
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  );
}
