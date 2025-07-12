'use client';

import type React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { SidebarNav, SidebarFooterNav } from './sidebar-nav';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings as SettingsIcon, HelpCircle as SupportIcon } from 'lucide-react'; // Renamed Settings to SettingsIcon
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOutUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({ title: 'Logged Out', description: "You've been successfully logged out." });
      router.push('/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <Logo />
            <SidebarTrigger className="hidden group-data-[collapsible=icon]:block md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <SidebarFooterNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 px-4 backdrop-blur-xl shadow-sm md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Placeholder for breadcrumbs or page title */}
          </div>
          
          {authLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950 transition-all duration-300">
                  <UserCircle className="h-5 w-5" />
                  <span className="sr-only">User Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <SupportIcon className="mr-2 h-4 w-4" />
                  <span>Support (Coming Soon)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
             </Button>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/50 dark:from-slate-950/50 dark:via-slate-900 dark:to-blue-950/50 min-h-screen">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
