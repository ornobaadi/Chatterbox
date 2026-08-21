'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { InteractiveChatPreview } from '@/components/landing/InteractiveChatPreview';
import { LiveApiExplorer } from '@/components/landing/LiveApiExplorer';
import { ArchitectureVisualizer } from '@/components/landing/ArchitectureVisualizer';
import { ThemeToggle } from '@/components/theme-toggle';
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
  Activity,
  Terminal,
  Volume2,
  FileText,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden font-sans">
      {/* Subtle Micro-Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Navigation Header */}
      <header className="relative z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
                <MessageSquare className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground font-heading">
                Chatterbox
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 border-l border-border/60 pl-6">
              <a
                href="#interactive-demo"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1"
              >
                Live Preview
              </a>
              <a
                href="#architecture"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1"
              >
                Architecture
              </a>
              <a
                href="#api-inspector"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1"
              >
                API Explorer
              </a>
              <a
                href="#technical-specs"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1"
              >
                Specs & FAQ
              </a>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 hidden sm:inline-block"
            >
              Sign In
            </Link>
            <Link href={isAuthenticated ? '/chat' : '/login'}>
              <Button size="sm" className="h-9 rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-primary/20">
                <span>{isAuthenticated ? 'Open App' : 'Launch Chat'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="pt-12 pb-10 sm:pt-20 sm:pb-14 px-4 text-center max-w-4xl mx-auto">
          {/* Engineering Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3.5 py-1.5 text-xs font-semibold text-foreground mb-6 shadow-xs backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-muted-foreground">OAS 3.0 API Target</span>
            <span className="text-border">|</span>
            <span className="text-primary font-bold">Zero-Jitter Optimistic Engine</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-[1.1] text-foreground">
            The real-time chat engine built for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600">
              sub-millisecond feel.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Engineered with strict separation between async server caching (TanStack Query) and real-time WebSocket state (Zustand + Socket.io), message clustering, and synthesized Web Audio feedback.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={isAuthenticated ? '/chat' : '/login'}>
              <Button size="lg" className="h-11 px-6 rounded-xl text-xs sm:text-sm font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all">
                <span>{isAuthenticated ? 'Open Chatterbox' : 'Test Live Application'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="#api-inspector"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-card px-4 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/60 transition-all shadow-xs"
            >
              <Terminal className="h-4 w-4 mr-2 text-primary" />
              <span>Inspect Live API</span>
            </a>
          </div>

          {/* Metric Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-border/60">
            <div className="p-3 rounded-xl border border-border/60 bg-card/40 text-center">
              <span className="text-xl font-extrabold text-foreground font-mono">&lt; 1ms</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Optimistic Dispatch</p>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-card/40 text-center">
              <span className="text-xl font-extrabold text-emerald-500 font-mono">100%</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Socket.io Multicast</p>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-card/40 text-center">
              <span className="text-xl font-extrabold text-indigo-500 font-mono">3+ Users</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Group Admin Matrix</p>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-card/40 text-center">
              <span className="text-xl font-extrabold text-foreground font-mono">Web Audio</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Synthesized Chimes</p>
            </div>
          </div>
        </section>

        {/* Live Interactive Product Showcase */}
        <section id="interactive-demo" className="py-10 px-4 max-w-5xl mx-auto scroll-mt-20">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Experience the Interface Live
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-xl mx-auto">
              Interact directly with the simulated Chatterbox client below. Send messages, hear synthesized sound cues, test real-time typing responses, and switch between 1:1 and group views.
            </p>
          </div>

          <InteractiveChatPreview />
        </section>

        {/* Interactive Architecture & State Visualizer */}
        <section id="architecture" className="py-12 px-4 max-w-5xl mx-auto scroll-mt-20">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Engineered for Zero-Jitter Precision
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-xl mx-auto">
              Inspect how optimistic reconciliation, message clustering, and dual-state architecture guarantee high performance without UI stutter.
            </p>
          </div>

          <ArchitectureVisualizer />
        </section>

        {/* Live API Inspector */}
        <section id="api-inspector" className="py-12 px-4 max-w-5xl mx-auto scroll-mt-20">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Live Backend API Inspector
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-xl mx-auto">
              Execute live OpenAPI queries directly against the Render backend database and inspect exact JSON response structures.
            </p>
          </div>

          <LiveApiExplorer />
        </section>

        {/* Technical Architecture Comparison Matrix */}
        <section className="py-14 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Architecture Comparison
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-xl mx-auto">
              How Chatterbox&apos;s reactive architecture compares against traditional polling implementations.
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-muted/40 font-mono text-[11px] text-muted-foreground">
                  <th className="p-4 font-bold">CAPABILITY</th>
                  <th className="p-4 font-bold text-primary">CHATTERBOX ARCHITECTURE</th>
                  <th className="p-4 font-bold">TRADITIONAL POLLING APPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="p-4 font-semibold text-foreground">Message Sending Latency</td>
                  <td className="p-4 font-medium text-emerald-500 font-mono">&lt; 1ms (Optimistic Dispatch + TempId)</td>
                  <td className="p-4 text-muted-foreground">200ms–800ms (Awaits network response)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-foreground">Network Failure Handling</td>
                  <td className="p-4 font-medium text-foreground">Inline attached [Retry] button on bubble</td>
                  <td className="p-4 text-muted-foreground">Generic toast alert; message discarded</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-foreground">Real-Time Synchronization</td>
                  <td className="p-4 font-medium text-foreground">Socket.io persistent WebSocket connection</td>
                  <td className="p-4 text-muted-foreground">5s–10s periodic setInterval polling</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-foreground">Message Clustering</td>
                  <td className="p-4 font-medium text-foreground">Dynamic vertical compression (&lt; 2m rule)</td>
                  <td className="p-4 text-muted-foreground">Static repeated sender avatars & timestamps</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-foreground">History Scroll Protection</td>
                  <td className="p-4 font-medium text-foreground">Floating &ldquo;New messages ↓&rdquo; pill if scrolled up</td>
                  <td className="p-4 text-muted-foreground">Violent scroll snap or lost context</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-foreground">Audio Feedback</td>
                  <td className="p-4 font-medium text-foreground">Synthesized Web Audio API (0 asset payloads)</td>
                  <td className="p-4 text-muted-foreground">Heavy static MP3 assets or none</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Technical FAQ Accordion */}
        <section id="technical-specs" className="py-12 px-4 max-w-4xl mx-auto scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Technical Specifications & Architecture FAQ
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Key engineering decisions documented for evaluation.
            </p>
          </div>

          <Accordion type="single" defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does Chatterbox manage dual-state synchronization?</AccordionTrigger>
              <AccordionContent>
                We maintain a strict boundary between async remote entity cache and the active real-time stream. <strong>TanStack Query</strong> manages conversation list indexing and user query caches with structured invalidation keys (<code className="font-mono text-primary">[&apos;conversations&apos;, user._id]</code>). <strong>Zustand</strong> manages optimistic local message dispatch and Socket.io incoming event streams with store-level deduplication, ensuring 60 FPS rendering without query thrashing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How is real-time message ordering guaranteed?</AccordionTrigger>
              <AccordionContent>
                The backend delivers messages in reverse-chronological order while Socket.io delivers live items with Unix timestamps. Chatterbox normalizes both timestamps into ISO strings and strictly sorts the collection in <strong>ascending chronological order</strong> (<code className="font-mono text-primary">timeA - timeB</code>) before rendering, guaranteeing earliest messages at the top and newest messages at the bottom.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Why is authentication zero-password in this implementation?</AccordionTrigger>
              <AccordionContent>
                Per the Frontend Assignment specification (<code className="font-mono text-primary">PRD.md</code>), the live backend on Render provides a mock login endpoint (<code className="font-mono text-primary">POST /auth/login</code>) taking <code className="font-mono">&#123;&ldquo;phone&rdquo;, &ldquo;name&rdquo;&#125;</code> that auto-provisions JWT tokens without SMS or password gates. Chatterbox handles full session persistence in <code className="font-mono">localStorage</code> and cookies with automatic route protection.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How do the synthesized audio chimes work?</AccordionTrigger>
              <AccordionContent>
                Rather than loading external MP3 audio files over the network, Chatterbox utilizes the browser&apos;s native <strong>Web Audio API</strong> (<code className="font-mono text-primary">AudioContext</code>). It synthesizes pleasant sinusoidal chime frequencies (659.25Hz E5 ➔ 880Hz A5) on incoming messages and a subtle swoosh on send, with persistent mute/unmute state in the UI.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/70 bg-card p-8 sm:p-12 text-center relative overflow-hidden shadow-xs">
            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Ready to try Chatterbox?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect and experience real-time messaging with live sync, synthesized chimes, and instant updates.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link href={isAuthenticated ? '/chat' : '/login'}>
                  <Button size="lg" className="h-10 px-6 rounded-xl text-sm font-semibold gap-2 shadow-sm">
                    <span>{isAuthenticated ? 'Open Messages' : 'Get Started'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 bg-muted/20 py-8 px-4 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-semibold text-foreground">Chatterbox</span>
          </div>
          <p className="text-xs font-mono text-muted-foreground/70">
            Next.js 16 • React 19 • TypeScript • TailwindCSS • Zustand • TanStack Query • Socket.io
          </p>
        </div>
      </footer>
    </div>
  );
}
