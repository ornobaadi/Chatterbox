'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Play, CheckCircle2, Clock, Terminal, Globe, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestBody?: object;
  requiresAuth?: boolean;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'login',
    name: 'Login & Auto-Register',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticates with phone & display name, issuing a JWT token.',
    requestBody: {
      phone: '+15551234568',
      name: 'Sarah Chen',
    },
    requiresAuth: false,
  },
  {
    id: 'search-users',
    name: 'Search Users',
    method: 'GET',
    path: '/api/users/search?q=naz',
    description: 'Searches contacts by prefix or substring with server-side query parameter q.',
    requiresAuth: true,
  },
  {
    id: 'get-conversations',
    name: 'Fetch Conversations',
    method: 'GET',
    path: '/api/conversations',
    description: 'Retrieves all 1:1 and group conversations with last message previews.',
    requiresAuth: true,
  },
  {
    id: 'create-group',
    name: 'Create Group (3+ Members)',
    method: 'POST',
    path: '/api/conversations/group',
    description: 'Initializes a multi-participant conversation with group metadata.',
    requestBody: {
      name: 'Engineering Core',
      participantIds: ['user_alice_id', 'user_bob_id'],
    },
    requiresAuth: true,
  },
];

export function LiveApiExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleRunRequest = async () => {
    setIsLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    setLatencyMs(null);

    const startTime = performance.now();
    try {
      // 1. First get a fresh test token
      let token = '';
      const loginRes = await fetch('https://frontend-task-chatapp.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+15551234568', name: 'Sarah Chen' }),
      });
      const loginData = await loginRes.json();
      token = loginData.token;

      let res: Response;
      if (selectedEndpoint.id === 'login') {
        res = loginRes;
        const endTime = performance.now();
        setLatencyMs(Math.round(endTime - startTime));
        setResponseStatus(res.status);
        setResponseData(loginData);
        setIsLoading(false);
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const url = `https://frontend-task-chatapp.onrender.com${selectedEndpoint.path}`;
      if (selectedEndpoint.method === 'GET') {
        res = await fetch(url, { headers });
      } else {
        res = await fetch(url, {
          method: selectedEndpoint.method,
          headers,
          body: JSON.stringify(selectedEndpoint.requestBody),
        });
      }

      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));
      setResponseStatus(res.status);
      const json = await res.json();
      setResponseData(json);
    } catch (err: any) {
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseData({ error: 'Network error or backend cold start', details: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
    setCopied(true);
    toast.success('Response JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/70 bg-card/70 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <CardTitle className="text-base sm:text-lg">Live OpenAPI Spec & Backend Inspector</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Execute live HTTP queries against the Render API server (<span className="font-mono text-foreground/80">frontend-task-chatapp.onrender.com</span>)
            </CardDescription>
          </div>
          <Badge variant="outline" className="h-6 w-fit gap-1 text-[11px] font-mono border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
            <Globe className="h-3 w-3" />
            <span>OAS 3.0 Live Target</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Endpoint Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setResponseData(null);
                  setResponseStatus(null);
                }}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    ep.method === 'POST' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {ep.method}
                  </span>
                </div>
                <span className="text-xs font-semibold truncate text-foreground">{ep.name}</span>
                <span className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{ep.path}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Endpoint Details & Run Bar */}
        <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                selectedEndpoint.method === 'POST' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {selectedEndpoint.method}
              </span>
              <span className="text-xs font-mono font-medium text-foreground truncate">
                {selectedEndpoint.path}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{selectedEndpoint.description}</p>
          </div>

          <Button
            size="sm"
            onClick={handleRunRequest}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl text-xs font-bold gap-2 shadow-md shadow-primary/20 shrink-0"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>Executing...</span>
              </div>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Execute Live Query</span>
              </>
            )}
          </Button>
        </div>

        {/* Live Response Panel */}
        <div className="rounded-xl border border-border/70 bg-zinc-950 text-zinc-100 p-4 font-mono text-xs overflow-hidden relative min-h-[160px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
            <div className="flex items-center gap-3">
              <span>RESPONSE</span>
              {responseStatus && (
                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  responseStatus === 200 || responseStatus === 201 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  HTTP {responseStatus}
                </span>
              )}
              {latencyMs !== null && (
                <span className="flex items-center gap-1 text-zinc-400">
                  <Clock className="h-3 w-3" />
                  <span>{latencyMs}ms</span>
                </span>
              )}
            </div>

            {responseData && (
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer text-[11px]"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-[11px]">Querying backend on Render...</span>
            </div>
          ) : responseData ? (
            <pre className="overflow-x-auto text-[11px] leading-relaxed max-h-64 text-emerald-400">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-center gap-1.5">
              <Terminal className="h-5 w-5 opacity-40" />
              <p className="text-xs">Click &ldquo;Execute Live Query&rdquo; to test live responses against Render API.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
