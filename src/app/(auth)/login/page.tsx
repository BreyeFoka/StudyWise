
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import React, { useEffect, useState, Suspense } from 'react';
import type { AuthError } from 'firebase/auth';
import { Logo } from '@/components/logo';
import { LoginSchema, type LoginFormData } from '@/lib/schemas/auth';

function LoginPageContent() {
  const { signInWithEmail, user, loading: authLoading, isFirebaseReady, auth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  const onSubmit = async (values: LoginFormData) => {
    setIsSubmitting(true);
    if (!isFirebaseReady || !auth) { // Check if auth instance is available
      toast({
        title: 'Login Unavailable',
        description: 'Firebase authentication service is not ready. Please try again later or contact support if the issue persists.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmail(values);
      toast({ title: 'Login Successful', description: "Welcome back! You're now logged in." });
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (authError.code) {
        switch (authError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format.';
            break;
          case 'auth/configuration-not-found':
            errorMessage = 'Firebase authentication is not configured for this project. Please ensure Email/Password sign-in is enabled in the Firebase console.';
            break;
          default:
            errorMessage = `Login failed: ${authError.message}. Please try again. (Code: ${authError.code})`;
        }
      }
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Login error:', authError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isFirebaseReady && !authLoading && !auth) { // Check if auth instance is also not available
    return (
       <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
           <Link href="/" className="mb-4"><Logo /></Link>
          <CardTitle className="text-2xl">Login Unavailable</CardTitle>
          <CardDescription>
            Firebase authentication is not configured or failed to initialize. Please check environment variables or contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="items-center text-center">
         <Link href="/" className="mb-4"><Logo /></Link>
        <CardTitle className="text-2xl">Welcome Back!</CardTitle>
        <CardDescription>Enter your credentials to access your StudyWise dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} type="email" />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || !isFirebaseReady || !auth}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/signup">Sign up</Link>
          </Button>
        </p>
        {/* <Button variant="link" asChild className="p-0 h-auto text-xs">
          <Link href="/forgot-password">Forgot password?</Link>
        </Button> */}
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
