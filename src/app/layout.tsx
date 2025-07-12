import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import { AuthProvider } from '@/contexts/auth-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StudyWise - Your AI-Powered Academic Assistant',
  description: 'Transform your learning with AI-powered note summarization, flashcard generation, homework help, and smart study tools. Built for modern students.',
  keywords: ['study', 'AI', 'education', 'learning', 'notes', 'flashcards', 'homework', 'academic'],
  authors: [{ name: 'StudyWise Team' }],
  creator: 'StudyWise',
  publisher: 'StudyWise',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://studywise.app',
    title: 'StudyWise - Your AI-Powered Academic Assistant',
    description: 'Transform your learning with AI-powered study tools designed for modern students.',
    siteName: 'StudyWise',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyWise - Your AI-Powered Academic Assistant',
    description: 'Transform your learning with AI-powered study tools designed for modern students.',
    creator: '@studywise',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

const InitializeTheme = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          try {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else if (theme === 'light') {
              document.documentElement.classList.remove('dark');
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              // Fallback to system preference if no localStorage item
              document.documentElement.classList.add('dark');
            }
          } catch (e) {
            // In case localStorage is not available or other errors
            console.error('Failed to initialize theme:', e);
          }
        })();
      `,
    }}
  />
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <InitializeTheme />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
