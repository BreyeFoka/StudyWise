import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, BookOpen, CheckCircle, Clock, FileText, Layers, Edit3, ClipboardCheck } from "lucide-react";
import type { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Dashboard - StudyWise',
};

export default function DashboardPage() {
  // Mock data - in a real app, this would come from a backend or user state
  const studyHoursThisWeek = 12;
  const flashcardsReviewed = 150;
  const upcomingDeadlines = 3;
  const overallProgress = 65; // Percentage

  const recentActivities = [
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: 'Summarized "Calculus Chapter 5" notes',
      time: "2 hours ago",
      alt: "Summarized Notes Icon",
    },
    {
      icon: <Layers className="h-6 w-6 text-primary" />,
      title: "Reviewed 50 Physics flashcards",
      time: "Yesterday",
      alt: "Flashcards Icon",
    },
    {
      icon: <ClipboardCheck className="h-6 w-6 text-primary" />,
      title: 'Completed "Introduction to AI" quiz - 85%',
      time: "3 days ago",
      alt: "Quiz Icon",
    },
  ];

  const quickActions = [
    { href: "/notes", label: "Upload New Notes", icon: <FileText className="mr-2 h-4 w-4" /> },
    { href: "/flashcards", label: "Review Flashcards", icon: <Layers className="mr-2 h-4 w-4" /> },
    { href: "/homework", label: "Get Homework Help", icon: <Edit3 className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to your Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours (Week)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyHoursThisWeek} hrs</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards Reviewed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flashcardsReviewed}</div>
            <p className="text-xs text-muted-foreground">+20 today</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">Next: Math Assignment</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{overallProgress}%</div>
            <Progress value={overallProgress} aria-label={`${overallProgress}% overall progress`} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest study sessions and achievements.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="flex items-center p-3 rounded-md hover:bg-secondary/50 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-full mr-4">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent activity to display.</p>
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
