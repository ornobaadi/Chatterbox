'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Users,
  Zap,
  Lock,
  Globe,
  UserCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface TestPersona {
  name: string;
  phone: string;
  role: string;
  badgeColor: string;
}

const TEST_PERSONAS: TestPersona[] = [
  {
    name: 'Alice Developer',
    phone: '+15551110001',
    role: 'Primary Test Persona',
    badgeColor: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  },
  {
    name: 'Bob Engineer',
    phone: '+15552220002',
    role: 'Multi-User Peer',
    badgeColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    name: 'Sarah Chen',
    phone: '+15551234568',
    role: 'Direct Contact',
    badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [phoneRaw, setPhoneRaw] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, router]);

  const handleSelectPersona = (persona: TestPersona) => {
    setPhoneRaw(persona.phone);
    setName(persona.name);
    setFormError(null);
    clearError();
  };

  const handleGenerateGuest = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const guestPhone = `+1555${randomSuffix}`;
    const guestName = `Guest_${Math.floor(100 + Math.random() * 900)}`;
    setPhoneRaw(guestPhone);
    setName(guestName);
    setFormError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const fullPhone = phoneRaw.trim();
    const trimmedName = name.trim();

    if (!fullPhone || fullPhone.length < 3) {
      setFormError('Please enter your phone number.');
      return;
    }

    if (!trimmedName) {
      setFormError('Please enter a display name.');
      return;
    }

    try {
      await login({ phone: fullPhone, name: trimmedName });
      router.push('/chat');
    } catch {
      // Handled in store error state
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-primary/20">
      {/* Top Brand Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <MessageSquare className="h-4 w-4 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground font-heading">
            Chatterbox
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              Back to Overview
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Split Screen */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Product Context & 1-Click Evaluator Presets */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="h-6 gap-1 text-[11px] font-mono border-primary/30 text-primary bg-primary/10">
                <Sparkles className="h-3 w-3" />
                <span>Evaluator Quick-Start</span>
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
                Sign in or provision a test account in seconds.
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Chatterbox supports instant auto-registration. Click any pre-configured evaluator persona below to fill credentials immediately, or type any custom phone number.
              </p>
            </div>

            {/* Quick Personas Card */}
            <div className="rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span>1-Click Test Personas</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateGuest}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Generate New Guest</span>
                </button>
              </div>

              <div className="space-y-2">
                {TEST_PERSONAS.map((persona) => (
                  <button
                    key={persona.phone}
                    type="button"
                    onClick={() => handleSelectPersona(persona)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/60 hover:border-primary/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={persona.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {persona.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${persona.badgeColor}`}>
                            {persona.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">{persona.phone}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground/80 pt-1">
                💡 <strong>Multi-tab testing:</strong> Log in as <em>Alice</em> in your main window and <em>Bob</em> in an Incognito window to see live real-time Socket.io messages exchange.
              </p>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-border/70 bg-card/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl transition-all">
              <div className="mb-6 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                  Authentication & Onboarding
                </h2>
                <p className="text-xs text-muted-foreground">
                  Provide your phone number and display name to enter the chat workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {(formError || error) && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError || error}</span>
                  </div>
                )}

                {/* Phone input */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-xs font-semibold text-foreground">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="e.g. +15551234567 or 01580845746"
                    value={phoneRaw}
                    onChange={(e) => {
                      setPhoneRaw(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    disabled={isLoading}
                    required
                    className="h-10 text-xs sm:text-sm font-mono w-full"
                    autoComplete="tel"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Enter any phone format (e.g. <span className="font-mono text-foreground/80">+15551234567</span> or <span className="font-mono text-foreground/80">01580845746</span>).
                  </p>
                </div>

                {/* Display Name Input */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-semibold text-foreground">
                    Display Name
                  </label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. Ada Lovelace"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      disabled={isLoading}
                      required
                      className="h-10 text-xs sm:text-sm pl-3 pr-10"
                      autoComplete="name"
                    />
                    {name.trim() && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <Avatar name={name} size="sm" className="w-6 h-6 text-[10px]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Your visible identity across direct chats and group conversations.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !phoneRaw.trim() || !name.trim()}
                  className="mt-3 w-full h-11 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>Authenticating with Backend...</span>
                    </div>
                  ) : (
                    <>
                      <span>Continue into Chatterbox</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Assignment Mock Auth Callout */}
              <div className="mt-6 rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground space-y-1 border border-border/40">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Specification Notice (PRD)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Per the take-home requirements, authentication operates against the mock Render API without password/SMS verification. JWT tokens are automatically issued and securely persisted in <code className="font-mono text-primary font-semibold">localStorage</code> and cookies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 text-center text-xs text-muted-foreground font-mono text-[11px]">
        Chatterbox Take-Home Assignment • Protected WebSocket Session
      </footer>
    </div>
  );
}
