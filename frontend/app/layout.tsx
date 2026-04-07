import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: 'Automata — Cross-Chain AI Agent',
  description: 'Swap, bridge, and stake across any chain. In plain English.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
