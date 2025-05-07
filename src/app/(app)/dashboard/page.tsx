'use client'; // Make this a client component to use hooks

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, BookOpen, CheckCircle, Clock, FileText, Layers, Edit3, ClipboardCheck, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth-context';
import { getFlashcards, getAllDecks, type Flashcard } from '@/services/flashcard-service';
import { useToast } from '@/hooks/use-toast';
// import type { Metadata } from 'next'; // Metadata should be in layout or server component

// export const metadata: Metadata = {
//   title: 'Dashboard - StudyWise',
// };

interface RecentActivity {
  icon: React.ReactNode;
  title: string;
  time: string; // Or Date object for more precise sorting/formatting
  alt: string;
  href?: string; // Optional link for the activity
}


export default function DashboardPage() {
  const { user, loading: authLoading, isFirebaseReady } = useAuth();
  const { toast } = useToast();

  const [studyHoursThisWeek, setStudyHoursThisWeek] = useState(0); // Placeholder
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [dueFlashcardsCount, setDueFlashcardsCount] = useState(0);
  const [totalDecks, setTotalDecks] = useState(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState(0); // Placeholder
  const [overallProgress, setOverallProgress] = useState(0); // Placeholder

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  useEffect(() => {
    document.title = 'Dashboard - StudyWise';
  }, []);


  useEffect(() => {
    if (user && isFirebaseReady) {
      setIsLoadingData(true);
      const fetchData = async () => {
        try {
          const allUserFlashcards = await getFlashcards(user.uid);
          const userDecks = await getAllDecks(user.uid);

          setTotalFlashcards(allUserFlashcards.length);
          setTotalDecks(userDecks.length);

          const today = new Date();
          today.setHours(0,0,0,0);
          const dueCards = allUserFlashcards.filter(fc => new Date(fc.dueDate) <= today);
          setDueFlashcardsCount(dueCards.length);

          // Mock recent activities based on flashcards for now
          const newRecentActivities: RecentActivity[] = [];
          if (allUserFlashcards.length > 0) {
            // Get the 3 most recently created flashcards to simulate activity
            const sortedByCreation = [...allUserFlashcards].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
            
            if (sortedByCreation.length > 0 && sortedByCreation[0].createdAt) {
                 newRecentActivities.push({
                    icon: <Layers className="h-6 w-6 text-primary" />,
                    title: `Created flashcard deck: "${sortedByCreation[0].deck}"`,
                    time: `About ${Math.floor((new Date().getTime() - sortedByCreation[0].createdAt.getTime()) / (1000*60*60))} hours ago`,
                    alt: "Flashcards Icon",
                    href: "/flashcards"
                 });
            }
            if (dueCards.length > 0) {
                 newRecentActivities.push({
                    icon: <BookOpen className="h-6 w-6 text-primary" />,
                    title: `You have ${dueCards.length} flashcards due for review!`,
                    time: "Today",
                    alt: "Flashcards Due Icon",
                    href: "/flashcards"
                 });
            }
             if (allUserFlashcards.length > 3 && sortedByCreation[1]?.createdAt) {
                 newRecentActivities.push({
                    icon: <FileText className="h-6 w-6 text-primary" />,
                    title: `Added ${Math.floor(Math.random()*5+1)} cards to "${sortedByCreation[1].deck}"`,
                    time: `About ${Math.floor((new Date().getTime() - sortedByCreation[1].createdAt.getTime()) / (1000*60*60*24))} days ago`,
                    alt: "Notes Icon",
                    href: "/flashcards"
                 });
            }

          } else {
             newRecentActivities.push({
                icon: <BookOpen className="h-6 w-6 text-primary" />,
                title: "Get started by creating your first flashcard deck!",
                time: "Now",
                alt: "Get Started Icon",
                href: "/flashcards"
            });
          }
          
          // Limit to 3 recent activities
          setRecentActivities(newRecentActivities.slice(0,3));


          // Placeholder for other stats - these would require more data sources
          setStudyHoursThisWeek(Math.floor(Math.random() * 20)); // Mock
          setUpcomingDeadlines(Math.floor(Math.random() * 5)); // Mock
          setOverallProgress(Math.floor(Math.random() * 100)); // Mock

        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
          toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    } else if (!authLoading && !user && isFirebaseReady) {
        // User logged out or Firebase not ready
        setIsLoadingData(false);
        // Reset states to default/empty
        setTotalFlashcards(0);
        setDueFlashcardsCount(0);
        setTotalDecks(0);
        setRecentActivities([]);
    }
  }, [user, authLoading, isFirebaseReady, toast]);

  const quickActions = [
    { href: "/notes", label: "Upload New Notes", icon: <FileText className="mr-2 h-4 w-4" /> },
    { href: "/flashcards", label: "Review Flashcards", icon: <Layers className="mr-2 h-4 w-4" /> },
    { href: "/quiz", label: "Generate a Quiz", icon: <ClipboardCheck className="mr-2 h-4 w-4" /> },
    { href: "/homework", label: "Get Homework Help", icon: <Edit3 className="mr-2 h-4 w-4" /> },
  ];

  if (authLoading || (!isFirebaseReady && !authLoading)) {
    return <div className="container mx-auto py-8 flex items-center justify-center h-[calc(100vh-100px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!user && isFirebaseReady) {
     return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
        <Button asChild><Link href="/login">Go to Login</Link></Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to your Dashboard, {user?.displayName || user?.email?.split('@')[0] || 'Student'}!</h1>
      
      {isLoadingData ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="shadow-md">
                    <CardHeader className="pb-2"><Skeleton className="h-5 w-3/4" /></CardHeader>
                    <CardContent><Skeleton className="h-8 w-1/2 mb-1" /><Skeleton className="h-3 w-1/4" /></CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flashcards</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFlashcards}</div>
              <p className="text-xs text-muted-foreground">{totalDecks} deck{totalDecks === 1 ? '' : 's'}</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flashcards Due</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueFlashcardsCount}</div>
              <p className="text-xs text-muted-foreground text-accent">{dueFlashcardsCount > 0 ? "Time to review!" : "All caught up!"}</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingDeadlines}</div>
              <p className="text-xs text-muted-foreground">Next: Mock Assignment</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{overallProgress}%</div>
              <Progress value={overallProgress} aria-label={`${overallProgress}% overall progress`} className="h-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest study sessions and achievements.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
                 <ul className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <li key={i} className="flex items-center p-3 rounded-md">
                            <Skeleton className="h-10 w-10 rounded-full mr-4" />
                            <div className="flex-1 space-y-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                        </li>
                    ))}
                </ul>
            ) : recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="flex items-center p-3 rounded-md hover:bg-secondary/50 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-full mr-4">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                       {activity.href ? (
                         <Link href={activity.href} className="hover:underline">
                           <p className="font-medium">{activity.title}</p>
                         </Link>
                       ) : (
                          <p className="font-medium">{activity.title}</p>
                       )}
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground py-6 text-center">No recent activity to display. Start using StudyWise features!</p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right into your study tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            {quickActions.map((action) => (
              <Button key={action.href} variant="outline" asChild className="justify-start text-left hover:bg-primary/5 hover:text-primary">
                <Link href={action.href}>
                  {action.icon}
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
