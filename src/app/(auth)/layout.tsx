import type { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/10 p-4 dark:bg-background">
      {children}
    </div>
  );
}
