'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  Layers, 
  Zap, 
  MessageCircle,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  const { user, loading: authLoading, isFirebaseReady } = useAuth();

  const getStartedLink = () => {
    if (authLoading || !isFirebaseReady) return "#";
    return user ? "/dashboard" : "/signup";
  };

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Smart Note Summarization",
      description: "Upload PDFs, slides, or audio recordings and get AI-powered summaries that capture key concepts instantly.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: "Flashcard Generator",
      description: "Automatically create intelligent flashcards from your notes with spaced repetition algorithms for optimal retention.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Homework Helper",
      description: "Get step-by-step explanations for complex problems across subjects with detailed reasoning and examples.",
      gradient: "from-pink-500 to-red-600"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Contextual AI Chat",
      description: "Ask questions about your materials and get intelligent responses based on your uploaded content.",
      gradient: "from-red-500 to-orange-600"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Smart Deadlines",
      description: "Track assignments and exams with intelligent reminders and study schedule recommendations.",
      gradient: "from-orange-500 to-yellow-600"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Quiz Generator",
      description: "Create practice quizzes from your notes to test knowledge and identify areas for improvement.",
      gradient: "from-yellow-500 to-green-600"
    }
  ];

  const benefits = [
    "Save 5+ hours per week on study preparation",
    "Improve retention rates by up to 40%",
    "Get instant help 24/7 with AI assistance",
    "Organize all study materials in one place",
    "Track progress with detailed analytics"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center" prefetch={false}>
            <Logo />
          </Link>
          
          <nav className="ml-auto flex gap-6 items-center">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              prefetch={false}
            >
              Features
            </Link>
            <Link
              href="#benefits"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              prefetch={false}
            >
              Benefits
            </Link>
            
            {authLoading || !isFirebaseReady ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : !user ? (
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            ) : (
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950" />
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
          
          <div className="relative container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col space-y-8">
                <div className="space-y-6">
                  <Badge variant="secondary" className="w-fit bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 border-0">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI-Powered Learning Platform
                  </Badge>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    Transform Your 
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
                      Academic Success
                    </span>
                    with AI
                  </h1>
                  
                  <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                    StudyWise is your intelligent academic companion. Summarize notes, generate flashcards, get homework help, and master any subject with our cutting-edge AI tools.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    asChild 
                    disabled={authLoading || !isFirebaseReady}
                  >
                    <Link href={getStartedLink()}>
                      {authLoading || !isFirebaseReady ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <GraduationCap className="mr-2 h-5 w-5" />
                      )}
                      Start Learning Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-all duration-300"
                    asChild
                  >
                    <Link href="#features">
                      Explore Features
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span>Trusted by 10,000+ students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>100% Free to start</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-3xl opacity-20" />
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-1">
                  <Image
                    src="https://picsum.photos/seed/studywisehero/800/600"
                    width="800"
                    height="600"
                    alt="StudyWise AI Platform Interface"
                    className="w-full h-auto rounded-xl object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-6 mb-16">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 border-0">
                Powerful Features
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Everything You Need to
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                  Excel Academically
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Our comprehensive suite of AI-powered tools transforms how you study, learn, and succeed in your academic journey.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <CardHeader className="space-y-4 relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 md:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 text-green-700 dark:text-green-300 border-0">
                    Proven Results
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Why Students Choose
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent block">
                      StudyWise
                    </span>
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    Join thousands of students who have transformed their academic performance with our AI-powered platform.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-xl"
                  asChild
                >
                  <Link href={getStartedLink()}>
                    Start Your Success Story
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur-3xl opacity-20" />
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-1">
                  <Image
                    src="https://picsum.photos/seed/studywisestats/700/500"
                    width="700"
                    height="500"
                    alt="StudyWise Success Statistics"
                    className="w-full h-auto rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Logo variant="light" />
              <p className="text-slate-400 text-sm">
                Empowering students worldwide with AI-driven academic tools for better learning outcomes.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">Features</Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">Pricing</Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">API</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">Help Center</Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">Contact</Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">Status</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="#" className="block text-slate-400 hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} StudyWise. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
