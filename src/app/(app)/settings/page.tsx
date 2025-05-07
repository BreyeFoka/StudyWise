import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { UserCircle, Bell, Palette, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - StudyWise',
};

export default function SettingsPage() {
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
              <Input id="name" defaultValue="Demo User" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="demo@studywise.app" disabled />
            </div>
            <Button>Update Profile</Button>
            <Separator />
            <Button variant="outline">Change Password</Button>
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
              <Label htmlFor="deadline-reminders" className="flex flex-col gap-1">
                <span>Deadline Reminders</span>
                <span className="text-xs text-muted-foreground">Get notified about upcoming deadlines.</span>
              </Label>
              <Switch id="deadline-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="study-suggestions" className="flex flex-col gap-1">
                <span>Study Suggestions</span>
                <span className="text-xs text-muted-foreground">Receive AI-powered study tips.</span>
              </Label>
              <Switch id="study-suggestions" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="new-feature-updates" className="flex flex-col gap-1">
                <span>New Feature Updates</span>
                <span className="text-xs text-muted-foreground">Stay informed about new StudyWise features.</span>
              </Label>
              <Switch id="new-feature-updates" defaultChecked />
            </div>
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
              <Label htmlFor="theme-mode" className="flex flex-col gap-1">
                <span>Dark Mode</span>
                 <span className="text-xs text-muted-foreground">Toggle between light and dark themes.</span>
              </Label>
              {/* Basic toggle, actual theme switching would require more logic (e.g. next-themes) */}
              <Switch id="theme-mode" onCheckedChange={(checked) => {
                if (checked) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              }}/>
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
            <Button variant="link" className="p-0 h-auto">View Privacy Policy</Button>
            <br/>
            <Button variant="link" className="p-0 h-auto">Download Your Data</Button>
            <Separator />
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
