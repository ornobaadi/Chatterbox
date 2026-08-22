import type { Metadata } from 'next';
import { Fraunces, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const frauncesHeading = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
});
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: 'Chatterbox — Real-Time Messaging Platform',
    template: '%s | Chatterbox',
  },
  description: 'Fast, minimal, real-time messaging application powered by Socket.io, React 19, and Next.js.',
  applicationName: 'Chatterbox',
  keywords: ['chat', 'messaging', 'socket.io', 'real-time', 'chatterbox'],
  authors: [{ name: 'Chatterbox Team' }],
  openGraph: {
    title: 'Chatterbox — Real-Time Messaging Platform',
    description: 'Fast, minimal, real-time messaging application powered by Socket.io, React 19, and Next.js.',
    type: 'website',
    siteName: 'Chatterbox',
  },
  twitter: {
    card: 'summary',
    title: 'Chatterbox — Real-Time Messaging',
    description: 'Fast, minimal, real-time messaging application powered by Socket.io.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geistSans.variable, frauncesHeading.variable)}
    >
      <body>
        <ThemeProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
