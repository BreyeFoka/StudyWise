'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { AuthError } from 'firebase/auth';
import { Logo } from '@/components/logo';

export const SignUpSchema = z.object({
  // name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
// Add .refine(data => data.password === data.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] })
// if confirmPassword field is added.

export default function SignUpPage() {
  const { signUpWithEmail, user, loading: authLoading, isFirebaseReady } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      // name: '',
      email: '',
      password: '',
    },
  });

 useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);


  const onSubmit = async (values: z.infer<typeof SignUpSchema>) => {
    setIsSubmitting(true);
    try {
      await signUpWithEmail(values);
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
          default:
            errorMessage = 'Sign up failed. Please try again.';
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
  
  if (!isFirebaseReady && !authLoading) {
     return (
       <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
           <Link href="/" className="mb-4"><Logo /></Link>
          <CardTitle className="text-2xl">Sign Up Unavailable</CardTitle>
          <CardDescription>
            Firebase is not configured. Please contact support.
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
            {/* <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
