'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();

    if (!trimmedPhone) {
      setFormError('Please enter your phone number.');
      return;
    }

    if (!trimmedName) {
      setFormError('Please enter your name.');
      return;
    }

    // Basic format hint check
    if (trimmedPhone.length < 5) {
      setFormError('Please enter a valid phone number (e.g. +1234567890).');
      return;
    }

    try {
      await login({ phone: trimmedPhone, name: trimmedName });
      router.push('/chat');
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12 selection:bg-primary/20">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
              <MessageSquare className="h-6 w-6 fill-current" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Chatterbox
            </span>
          </Link>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
            Sign in to start chatting
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Fast, real-time messaging with direct & group chats.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-border/70 bg-card/70 p-7 shadow-xl backdrop-blur-xl transition-all">
          <form onSubmit={handleSubmit} className="space-y-4.5">
            {(formError || error) && (
              <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 019 2834"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (formError) setFormError(null);
                }}
                disabled={isLoading}
                required
                className="text-base"
                autoComplete="tel"
              />
              <p className="text-[11px] text-muted-foreground/80">
                Include country code (e.g. <span className="font-mono text-foreground/80">+15551234567</span> or local format)
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Display Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError(null);
                }}
                disabled={isLoading}
                required
                className="text-base"
                autoComplete="name"
              />
              <p className="text-[11px] text-muted-foreground/80">
                Used for new account registration or avatar display.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !phone.trim() || !name.trim()}
              className="mt-2 w-full h-11 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Helper Callout */}
          <div className="mt-6 rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground flex items-start gap-3 border border-border/40">
            <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Zero friction login</p>
              <p className="text-[11px] leading-relaxed">
                If the phone number is new, a fresh account is created automatically. Existing accounts will seamlessly log in.
              </p>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Real-time WebSocket connection enabled</span>
        </div>
      </div>
    </div>
  );
}
