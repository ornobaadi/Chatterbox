'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
} from 'lucide-react';

export function ArchitectureVisualizer() {
  // Tab 1: Optimistic UI Simulation State
  const [pipelineState, setPipelineState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [pipelineLog, setPipelineLog] = useState<string[]>([]);

  const handleSimulateOptimistic = (simulateFail: boolean = false) => {
    setPipelineState('sending');
    setPipelineLog(['[T+0ms] Message created in Zustand store with tempId: "temp_8921"', '[T+2ms] Rendered in DOM instantly (status: sending, spinner attached)']);

    setTimeout(() => {
      if (simulateFail) {
        setPipelineState('failed');
        setPipelineLog((prev) => [
          ...prev,
          '[T+450ms] HTTP POST /conversations/:id/messages returned 503 Service Unavailable',
          '[T+452ms] Store reconciles status: "failed" -> renders inline [Retry] button without throwing toast spam',
        ]);
      } else {
        setPipelineState('sent');
        setPipelineLog((prev) => [
          ...prev,
          '[T+110ms] HTTP POST 201 Created -> Server returns permanent _id: "6758a1f"',
          '[T+112ms] Zustand store swaps tempId with real _id (status: "sent" with double checkmarks)',
          '[T+115ms] Socket.io broadcasts message:new to conversation room with zero duplicate render',
        ]);
      }
    }, 900);
  };

  // Tab 2: Clustering Threshold State
  const [gapMinutes, setGapMinutes] = useState<number>(1);

  return (
    <Card className="border-border/70 bg-card/70 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <CardTitle className="text-base sm:text-lg">Interactive Architecture Visualizer</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Test and inspect the core mechanisms behind Chatterbox&apos;s real-time performance.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <Tabs defaultValue="optimistic">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="optimistic" className="text-xs gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Optimistic Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="clustering" className="text-xs gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Clustering Engine</span>
            </TabsTrigger>
            <TabsTrigger value="state" className="text-xs gap-1.5">
              <Database className="h-3.5 w-3.5 text-emerald-500" />
              <span>Dual-State Store</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OPTIMISTIC PIPELINE */}
          <TabsContent value="optimistic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className={`p-4 rounded-xl border transition-all ${
                pipelineState === 'sending' || pipelineState === 'sent' || pipelineState === 'failed'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border/60 bg-muted/30 text-muted-foreground'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-primary">Stage 1</span>
                  <span className="text-xs font-mono font-bold">0ms</span>
                </div>
                <h4 className="text-xs font-bold text-foreground">Local Dispatch</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Generates local <code className="text-primary font-mono font-bold">tempId</code> and inserts into UI at 60 FPS before network request fires.
                </p>
              </div>

              {/* Step 2 */}
              <div className={`p-4 rounded-xl border transition-all ${
                pipelineState === 'sent'
                  ? 'border-emerald-500 bg-emerald-500/10 text-foreground'
                  : pipelineState === 'failed'
                  ? 'border-rose-500 bg-rose-500/10 text-foreground'
                  : pipelineState === 'sending'
                  ? 'border-amber-500 bg-amber-500/10 text-foreground'
                  : 'border-border/60 bg-muted/30 text-muted-foreground'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-500">Stage 2</span>
                  <span className="text-xs font-mono font-bold">~110ms</span>
                </div>
                <h4 className="text-xs font-bold text-foreground">Server Reconciliation</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Reconciles server payload with optimistic node. If failed, attaches inline retry trigger.
                </p>
              </div>

              {/* Step 3 */}
              <div className={`p-4 rounded-xl border transition-all ${
                pipelineState === 'sent'
                  ? 'border-indigo-500 bg-indigo-500/10 text-foreground'
                  : 'border-border/60 bg-muted/30 text-muted-foreground'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-indigo-500">Stage 3</span>
                  <span className="text-xs font-mono font-bold">Socket Push</span>
                </div>
                <h4 className="text-xs font-bold text-foreground">Multi-Client Broadcast</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Broadcasts <code className="text-indigo-400 font-mono font-bold">message:new</code> via WebSocket with store-level deduplication.
                </p>
              </div>
            </div>

            {/* Pipeline Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSimulateOptimistic(false)}
                  disabled={pipelineState === 'sending'}
                  className="h-8.5 rounded-lg text-xs font-semibold gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Simulate Success Flow</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSimulateOptimistic(true)}
                  disabled={pipelineState === 'sending'}
                  className="h-8.5 rounded-lg text-xs font-semibold gap-1.5 border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Simulate Network Failure</span>
                </Button>
              </div>

              {pipelineState !== 'idle' && (
                <button
                  type="button"
                  onClick={() => {
                    setPipelineState('idle');
                    setPipelineLog([]);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Simulator</span>
                </button>
              )}
            </div>

            {/* Pipeline Event Log */}
            {pipelineLog.length > 0 && (
              <div className="rounded-xl border border-border/70 bg-zinc-950 p-3.5 text-zinc-300 font-mono text-[11px] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                  Engine Pipeline Log:
                </span>
                {pipelineLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold">&gt;</span>
                    <span className={log.includes('503') || log.includes('failed') ? 'text-rose-400' : 'text-zinc-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: CLUSTERING ENGINE */}
          <TabsContent value="clustering" className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Time Delta Slider (<code className="font-mono text-primary font-bold">{gapMinutes} min</code> gap)</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Consecutive messages by the same user within &lt; 2 minutes automatically cluster.
                  </p>
                </div>
                <Badge variant={gapMinutes <= 2 ? 'default' : 'secondary'} className="text-[11px]">
                  {gapMinutes <= 2 ? 'Clustered (2m Rule)' : 'Split (Distinct)'}
                </Badge>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={gapMinutes}
                onChange={(e) => setGapMinutes(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Visual Bubble Demonstration */}
            <div className="p-5 rounded-xl border border-border/70 bg-background/60 space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[75%] space-y-1">
                  <div className="rounded-2xl rounded-tr-md bg-primary text-primary-foreground p-3 text-xs shadow-sm">
                    Hey team, just deployed the new Socket.io transport layer!
                  </div>
                  <div
                    className={`text-xs p-3 transition-all duration-200 ${
                      gapMinutes <= 2
                        ? 'rounded-2xl rounded-tr-md rounded-br-md bg-primary text-primary-foreground mt-0.5'
                        : 'rounded-2xl rounded-tr-md bg-primary text-primary-foreground mt-3'
                    }`}
                  >
                    All messages now send optimistically in under 1ms.
                  </div>
                  <div className="flex justify-end pr-1">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {gapMinutes <= 2 ? '12:04 PM • Merged' : `12:04 PM • Separate (+${gapMinutes}m)`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: DUAL-STATE STORE */}
          <TabsContent value="state" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                    TQ
                  </div>
                  <h4 className="text-xs font-bold text-foreground">TanStack Query (Async Server State)</h4>
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Manages remote entity queries (<code className="font-mono text-primary font-semibold">['conversations']</code>, <code className="font-mono text-primary font-semibold">['users']</code>).</li>
                  <li>Configured with 30s stale time and background garbage collection.</li>
                  <li>Isolated and scoped by active <code className="font-mono text-primary font-semibold">user._id</code> to prevent cross-account cache bleed.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                    ZU
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Zustand + Socket.io (Real-Time State)</h4>
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Manages optimistic dispatch and live WebSocket event streams.</li>
                  <li>Handles local queue deduplication on <code className="font-mono text-primary font-semibold">message:new</code>.</li>
                  <li>Maintains sorted chronological order at 60 FPS without unmounting.</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
