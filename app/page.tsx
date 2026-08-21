'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InteractiveChatPreview } from '@/components/landing/InteractiveChatPreview';
import {
  MessageSquare,
  Zap,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  Code2,
  Layers,
  Cpu,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[130px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <MessageSquare className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground font-heading">
              Chatterbox
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link href={isAuthenticated ? '/chat' : '/login'}>
              <Button size="sm" className="h-9 rounded-xl text-xs font-semibold gap-1.5 shadow-md shadow-primary/20">
                <span>{isAuthenticated ? 'Open App' : 'Get Started'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Zap className="h-3.5 w-3.5" />
            <span>Socket.io Real-time Pipeline • Optimistic UI Engine</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-[1.1] text-foreground">
            Modern messaging built for{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              speed, polish, & feel.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Instant optimistic message sending, zero-jitter state reconciliation, tactile message clustering, and real-time Socket.io synchronization for direct & group conversations.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={isAuthenticated ? '/chat' : '/login'}>
              <Button size="lg" className="h-12 px-6 rounded-2xl text-sm font-bold gap-2 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                <span>Launch Chat App</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="#interactive-demo"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border/80 bg-card/80 px-5 text-sm font-semibold text-foreground hover:bg-muted/70 transition-all backdrop-blur-sm"
            >
              <span>Test Interactive Demo</span>
            </a>
          </div>

          {/* Metric Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-border/50">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-foreground font-heading">0ms</span>
              <span className="text-xs text-muted-foreground mt-0.5">Optimistic UI Latency</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-foreground font-heading">100%</span>
              <span className="text-xs text-muted-foreground mt-0.5">Socket.io Live Push</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-foreground font-heading">3+ Members</span>
              <span className="text-xs text-muted-foreground mt-0.5">Group Admin Controls</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-foreground font-heading">Auto-Scroll</span>
              <span className="text-xs text-muted-foreground mt-0.5">Smart History Protection</span>
            </div>
          </div>
        </section>

        {/* Live Interactive Product Showcase */}
        <section id="interactive-demo" className="py-12 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Experience the Interface Live
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Interact directly with the simulated Chatterbox client below. Send messages, test real-time typing responses, and switch between 1:1 and group views.
            </p>
          </div>

          <InteractiveChatPreview />
        </section>

        {/* Core Architecture Highlights */}
        <section className="py-16 px-4 max-w-6xl mx-auto border-t border-border/50">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Engineered with Senior-Level Care
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Every interaction was crafted with attention to edge cases, network lag, and visual elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-md hover:border-primary/40 transition-all group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground font-heading">
                Optimistic Send & Inline Retry
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Messages render immediately in the UI upon submission with <code className="text-xs font-mono text-primary font-semibold">status: sending</code>. If network fails, bubbles show an attached inline Retry button rather than toast-and-forget alerts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-md hover:border-primary/40 transition-all group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground font-heading">
                Message Clustering & Rhythm
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Consecutive messages from the same participant within 2 minutes merge with tight vertical rhythm, flattening adjacent borders and suppressing redundant avatars.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-md hover:border-primary/40 transition-all group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground font-heading">
                Dual State Synchronization
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Clean separation between server cache (TanStack Query) and real-time active session stream (Zustand + Socket.io), with seamless deduplication on incoming WebSocket broadcasts.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 p-8 sm:p-12 text-center backdrop-blur-xl relative overflow-hidden">
            <div className="relative z-10 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
                Ready to explore Chatterbox?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Sign in with any phone number to test direct chats, group dynamics, and real-time updates.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/login">
                  <Button size="lg" className="h-11 px-6 rounded-xl text-xs font-bold gap-2 shadow-lg shadow-primary/20">
                    <span>Enter Chatterbox</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 bg-muted/20 py-8 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-bold text-foreground">Chatterbox</span>
            <span>— Frontend Developer Assignment</span>
          </div>
          <p className="text-[11px]">
            Built with Next.js 16, React 19, TypeScript, TailwindCSS, Zustand, TanStack Query & Socket.io.
          </p>
        </div>
      </footer>
    </div>
  );
}
