'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { UserCircle, Bell, Palette, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
// import type { Metadata } from 'next'; // Metadata for client components is set via useEffect
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';


export default function SettingsPage() {
  const { user, loading: authLoading, isFirebaseReady, auth } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.title = 'Settings - StudyWise';
    if (user) {
      setDisplayName(user.displayName || '');
    }
    // Check initial dark mode state
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !auth) {
      toast({ title: "Not Authenticated", description: "Please log in to update your profile.", variant: "destructive" });
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile(auth.currentUser!, { displayName: displayName });
      toast({ title: "Profile Updated", description: "Your display name has been updated." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: "Could not update your profile.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    // Apply theme from localStorage on initial load
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);


  if (authLoading || (!isFirebaseReady && !authLoading)) {
    return <div className="container mx-auto py-8 flex items-center justify-center h-[calc(100vh-100px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!user && isFirebaseReady) {
     return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">Please log in to access settings.</p>
        <Button asChild><Link href="/login">Go to Login</Link></Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-primary" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>Manage your account information and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                disabled={isSavingProfile}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>
            <Button onClick={handleUpdateProfile} disabled={isSavingProfile || displayName === (user?.displayName || '')}>
              {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
            <Separator />
            <Button variant="outline" disabled>Change Password (Coming Soon)</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications from StudyWise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="deadline-reminders" className="flex flex-col gap-1 cursor-pointer">
                <span>Deadline Reminders</span>
                <span className="text-xs text-muted-foreground">Get notified about upcoming deadlines.</span>
              </Label>
              <Switch id="deadline-reminders" defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="study-suggestions" className="flex flex-col gap-1 cursor-pointer">
                <span>Study Suggestions</span>
                <span className="text-xs text-muted-foreground">Receive AI-powered study tips.</span>
              </Label>
              <Switch id="study-suggestions" disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="new-feature-updates" className="flex flex-col gap-1 cursor-pointer">
                <span>New Feature Updates</span>
                <span className="text-xs text-muted-foreground">Stay informed about new StudyWise features.</span>
              </Label>
              <Switch id="new-feature-updates" defaultChecked disabled />
            </div>
             <p className="text-xs text-muted-foreground pt-2">Notification preferences are illustrative and not yet functional.</p>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode" className="flex flex-col gap-1 cursor-pointer">
                <span>Dark Mode</span>
                 <span className="text-xs text-muted-foreground">Toggle between light and dark themes.</span>
              </Label>
              <Switch 
                id="theme-mode" 
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy & Data Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle>Privacy & Data</CardTitle>
            </div>
            <CardDescription>Manage your data and privacy settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="link" className="p-0 h-auto" disabled>View Privacy Policy (Coming Soon)</Button>
            <br/>
            <Button variant="link" className="p-0 h-auto" disabled>Download Your Data (Coming Soon)</Button>
            <Separator />
            <Button variant="destructive" disabled>Delete Account (Coming Soon)</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
