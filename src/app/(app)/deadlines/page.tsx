import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Deadline Tracker - StudyWise',
};

export default function DeadlinesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deadline Tracker</h1>
          <p className="text-muted-foreground">Manage your assignments and test deadlines effectively.</p>
        </div>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Deadline
        </Button>
      </div>

      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <CalendarCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Deadline Tracker Coming Soon!</CardTitle>
          <CardDescription>
            Soon, you'll be able to input your deadlines and get AI-powered time estimations.
            <br />
            Stay organized and never miss an important date!
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Image 
            data-ai-hint="calendar planning"
            src="https://picsum.photos/seed/deadlinesoon/400/250" 
            alt="Coming Soon" 
            width={400} 
            height={250} 
            className="mx-auto rounded-lg shadow-md" 
          />
          <p className="mt-6 text-muted-foreground">
            Get reminders, prioritize tasks, and let AI help you manage your study schedule.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
