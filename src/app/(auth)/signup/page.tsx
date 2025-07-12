
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
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
    if (!isFirebaseReady || !auth) { // Check if auth instance is available
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
      toast({ title: 'Account Created!', description: "Welcome! Your account has been successfully created." });
      router.push('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (authError.code) {
        switch (authError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Try logging in.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please choose a stronger password.';
            break;
          case 'auth/configuration-not-found':
            errorMessage = 'Firebase authentication is not configured for this project. Please ensure Email/Password sign-in is enabled in the Firebase console.';
            break;
          default:
            errorMessage = `Sign up failed: ${authError.message}. Please try again. (Code: ${authError.code})`;
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
          <CardTitle className="text-2xl">Sign Up Unavailable</CardTitle>
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
        <CardTitle className="text-2xl">Create your StudyWise Account</CardTitle>
        <CardDescription>Join us and start studying smarter today!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
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
                    <Input placeholder="•••••••• (min. 6 characters)" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || !isFirebaseReady || !auth}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">Log in</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  );
}
