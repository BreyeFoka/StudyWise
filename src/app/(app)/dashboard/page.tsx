import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, BookOpen, CheckCircle, Clock } from "lucide-react";
import type { Metadata } from 'next';
import Image from "next/image";

export const metadata: Metadata = {
  title: 'Dashboard - StudyWise',
};

export default function DashboardPage() {
  // Mock data
  const studyHoursThisWeek = 12;
  const flashcardsReviewed = 150;
  const upcomingDeadlines = 3;
  const overallProgress = 65; // Percentage

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours (Week)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyHoursThisWeek} hrs</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards Reviewed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flashcardsReviewed}</div>
            <p className="text-xs text-muted-foreground">+20 today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">Next: Math Assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{overallProgress}%</div>
            <Progress value={overallProgress} aria-label={`${overallProgress}% overall progress`} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest study sessions and achievements.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Image data-ai-hint="notes icon" src="https://picsum.photos/seed/activity1/40/40" alt="Summarized Notes" width={40} height={40} className="rounded-full mr-3" />
                <div>
                  <p className="font-medium">Summarized "Calculus Chapter 5" notes</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </li>
              <li className="flex items-center">
                <Image data-ai-hint="flashcard icon" src="https://picsum.photos/seed/activity2/40/40" alt="Flashcards" width={40} height={40} className="rounded-full mr-3" />
                <div>
                  <p className="font-medium">Reviewed 50 Physics flashcards</p>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
              </li>
              <li className="flex items-center">
                <Image data-ai-hint="quiz icon" src="https://picsum.photos/seed/activity3/40/40" alt="Quiz" width={40} height={40} className="rounded-full mr-3" />
                <div>
                  <p className="font-medium">Completed "Introduction to AI" quiz - 85%</p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            {/* These would be Links to relevant pages */}
            <button className="w-full p-3 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-left">Upload New Notes</button>
            <button className="w-full p-3 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-left">Review Flashcards</button>
            <button className="w-full p-3 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-left">Get Homework Help</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
