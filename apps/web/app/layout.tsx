import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Health Control Panel',
  description: 'Health tracking control panel foundation',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
          <header className="mb-10">
            <h1 className="text-3xl font-semibold">Health Control Panel</h1>
            <p className="text-sm text-slate-300">
              Track weight readings, compare units, and experiment with demo or database-backed storage.
            </p>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
            Built with Next.js 14, Tailwind CSS, and TanStack Query.
          </footer>
        </div>
      </body>
    </html>
  );
}
