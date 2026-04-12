import type { Metadata, Viewport } from 'next';
import { Syne, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-plex-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Automata — Cross-Chain AI Agent',
  description: 'Swap, bridge, and stake across any chain. In plain English.',
  icons: {
    icon: [
      { url: '/Automata.png', type: 'image/png' },
      { url: '/Automata.ico', type: 'image/x-icon' }
    ],
    shortcut: '/Automata.ico',
    apple: '/Automata.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${plexMono.variable} dark`}>
      <body className="antialiased min-h-screen bg-background text-foreground tracking-tight select-none font-sans">
        <Providers>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          {/* Clean global Toaster call */}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}