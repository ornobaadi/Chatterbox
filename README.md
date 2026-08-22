# Chatterbox — Real-Time Chat & Collaboration Platform

> **Frontend Developer Take-Home Assignment Deliverable**  
> Built with Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, Zustand, TanStack Query, and Socket.io.

- **Repository**: [https://github.com/ornobaadi/Chatterbox](https://github.com/ornobaadi/Chatterbox)  
- **Live Demo Application**: [https://chatterbox-space.vercel.app/](https://chatterbox-space.vercel.app/)  
- **API Documentation**: [`docs/API.md`](docs/API.md) · [Render Backend Swagger](https://frontend-task-chatapp.onrender.com/docs/)

| Surface | Route | Direct Link |
|---|---|---|
| **Marketing Landing (Part 2)** | `/` | [chatterbox-space.vercel.app/](https://chatterbox-space.vercel.app/) |
| **Authentication & Presets** | `/login` | [chatterbox-space.vercel.app/login](https://chatterbox-space.vercel.app/login) |
| **Core Chat Application (Part 1)** | `/chat` | [chatterbox-space.vercel.app/chat](https://chatterbox-space.vercel.app/chat) |

![Chatterbox Homepage](assets/home.webp)

---

## 1. Overview & Deliverables Summary

This repository contains the complete, production-grade implementation for all three assignment requirements:

| Deliverable | Description | Reference |
|---|---|---|
| **Part 1 — API Docs & Core Chat Application** | Standalone API documentation + full-featured real-time chat application screen. | [`docs/API.md`](docs/API.md), [`/chat`](https://chatterbox-space.vercel.app/chat) |
| **Part 2 — Creative Landing Page** | Showcase with live chat simulation widget, architecture visualizer, and live OpenAPI inspector. | [`/`](https://chatterbox-space.vercel.app/) |
| **Part 3 — Thought Process Write-up** | Architectural decisions, trade-offs, API quirks, design system rationale, and AI disclosure. | Documented below |

---

## 2. Key Features & Extra-Credit Engineering Highlights

Chatterbox was built to go significantly beyond basic chat mechanics, emphasizing sub-millisecond perceived responsiveness, bulletproof edge-case handling, and refined user ergonomics:

### ⚡ Sub-Millisecond Optimistic Dispatch & Reconciliation
- Local messages render instantly (`< 1ms`) with a unique `tempId` and `status: "sending"`.
- Seamlessly reconciles upon HTTP 201 response with server ID and ISO timestamp.
- Incoming Socket.io `message:new` events are deduplicated at the store level, preventing redundant re-renders or double-bubble glitches.

### 🛡️ Inline Retry & Network Resilience
- On network interruption or 5xx server errors, messages transition cleanly to `status: "failed"`.
- Rather than throwing disruptive toast spam that loses context, an inline `[Retry]` trigger is docked directly onto the failed bubble for one-click re-dispatch.

### 🫧 Message Clustering & Dynamic Geometry
- Consecutive messages from the same sender within 2 minutes merge vertically.
- Collapses redundant avatar columns in group chats and dynamically flattens adjacent bubble corner radii (`rounded-2xl` ➔ `rounded-br-xs` / `rounded-bl-xs`).

### ⏱️ Smart Timestamp Ergonomics & Density
- **Clean Default View**: By default, only the **very newest message** in the chat displays an inline relative timestamp (`Just now` / `2m ago`), eliminating visual clutter across older messages.
- **Hover Inspection**: Hovering over *any* message bubble displays the exact formatted time (`3:35 PM` or `Yesterday · 3:35 PM`) in a docked tooltip.
- **User Customization**: Configurable in Appearance Settings (*Last Message Only*, *All Messages*, or *Hover Only*).

### 🔔 Zero-Asset Dual-Engine Synthesized Audio
- Micro-audio feedback synthesized at runtime via the browser's native **Web Audio API** (`AudioContext`).
- Generates a pleasant two-tone chime (E5 659Hz ➔ B5 988Hz) for incoming messages and an upward swoosh (C5 ➔ G5) on send.
- Features a **16-bit PCM WAV HTML5 Audio fallback** (`data:audio/wav;base64,...`) and global user-gesture unlock handlers to guarantee 100% reliable sound across all mobile/desktop browsers with 0KB static audio asset overhead.

### 👥 Interactive Group Management & 1-Click Direct Chat
- **Instant 1:1 Direct Chat**: Clicking any member's avatar or name in a group message or group details modal immediately navigates to or initializes a direct chat with them.
- **Full Admin Matrix**: 3+ participant group creation, group renaming, promoting members to admin, adding/removing participants, and leaving groups with non-blocking confirmation dialogs.

### 🔍 In-Chat Live Substring Filter
- Dedicated search toggle (`🔍`) in the conversation header providing instant, real-time message filtering with highlighted match counters without unmounting message history.

### 🎨 Personalization & Accessibility Studio
- **Accent Themes**: Sapphire, Emerald, Violet, Coral, and Slate.
- **Message Density**: Comfortable vs. Compact.
- **Typography Scaling**: 13px, 14px, and 15px options with instant live preview.
- **Keyboard Shortcuts**: `Cmd/Ctrl+K` (global search), `Escape` (dismiss modals), `Enter` (send), and `Shift+Enter` (multiline break).

### 📱 True Mobile Viewport Responsiveness (`100dvh`)
- Fixed dynamic viewport height boundaries (`100dvh` + `overscroll-behavior: none`).
- Topbars and composers stay permanently docked on mobile screens while scrolling remains strictly isolated to the middle message stream and contact list.

---

## 3. Part 3 — Architectural & Thought Process Write-Up

### 3.1 Architecture & State Management: TanStack Query vs. Zustand
A core architectural decision was establishing a strict boundary between **Asynchronous Server Cache** and **Synchronous Real-Time Stream**:

```
┌────────────────────────────────────────────────────────┐
│                   Chatterbox Client                    │
├───────────────────────────┬────────────────────────────┤
│   TanStack Query (Async)  │     Zustand (Real-Time)    │
├───────────────────────────┼────────────────────────────┤
│ • Conversation Indexing   │ • Active Chat Message List │
│ • User Contact Searches   │ • Optimistic Local Queue   │
│ • Group Mutation Handlers │ • Socket.io Event Stream   │
│ • Scoped Invalidation     │ • Store-Level Deduplication│
│ • Background Refetching   │ • 60 FPS Bubble Rendering  │
└───────────────────────────┴────────────────────────────┘
```

- **TanStack Query (`@tanstack/react-query`)**:
  - Manages asynchronous remote entity caches (conversations list, user directory queries).
  - Uses scoped query keys (`['conversations', user._id]`) with automatic garbage collection, window refetching, and structured cache invalidation.
- **Zustand (`zustand`)**:
  - Manages active client session state and high-frequency real-time chat messages.
  - Provides a single synchronization hub where optimistic local messages and Socket.io broadcasts (`message:new`) converge, deduplicate, and sort chronologically in ascending order (`timeA - timeB`) without query thrashing.

### 3.2 Send Path Architecture: REST (`POST /messages`) + Socket.io Broadcast
- **Decision**: We chose **REST `POST /conversations/:id/messages` for message dispatch** coupled with **Socket.io `message:new` for real-time peer distribution**.
- **Trade-offs & Rationale**:
  1. *Deterministic HTTP Status Codes*: REST returns unambiguous response codes (201 Created, 400 Bad Request, 401 Unauthorized, 503 Unavailable) that map directly into mutation error handlers.
  2. *Optimistic Accuracy*: Creates an instant local node with a client `tempId`. On 201 response, the store swaps the `tempId` for the permanent server `_id`. On failure, it attaches an inline `[Retry]` trigger without dropping message text.
  3. *Socket Push Efficiency*: Other participants receive incoming messages via the persistent WebSocket room with zero polling overhead.

### 3.3 Design Choices & Typography System (Part 2)
- **Typography Pairing**:
  - Headings: **Fraunces** (a warm, editorial serif that creates a distinctive, premium feel).
  - Body & Chat Bubbles: **Geist Sans** (engineered by Vercel for modern, crisp user interfaces).
  - Code & Timestamps: **Geist Mono** (for clean tabular numerals and telemetry data).
- **Interactive Landing Page Modules**:
  - **Live Product Showcase**: A fully interactive simulated chat client allowing visitors to test optimistic dispatch, audio chimes, and group views directly on the landing page before authenticating.
  - **Interactive Architecture Visualizer**: An interactive step-by-step pipeline inspector with optimistic failure simulators and a message clustering time-delta slider.
  - **Live Backend OpenAPI Inspector**: Executes live HTTP queries against the Render backend with real-time response latency metrics.

---

## 4. API Quirks & Nuances Handled

During pre-implementation probing of the Render backend (`https://frontend-task-chatapp.onrender.com`), several undocumented behaviors and schema nuances were identified and handled:

1. **Group Creation Payload Structure**:
   - The endpoint expects `{ name: string, participantIds: string[] }` (rather than `{ participants }`). The client strictly formats this payload.
2. **Direct Conversation Payload**:
   - Starting a 1:1 chat requires `{ userId: string }` via `POST /api/conversations/direct`.
3. **Socket Message Field Discrepancies**:
   - Incoming socket events provide `id` (instead of `_id`) and Unix millisecond timestamps (`createdAt: number`). The frontend normalizer converts both into unified ISO-formatted `Message` objects.
4. **Message History Sort Direction**:
   - REST history returns messages in reverse-chronological order, while live socket events append incrementally. The client normalizes all timestamps and applies a strict ascending sort (`timeA - timeB`) before rendering.
5. **Zero-Password Auto-Registration**:
   - The backend auto-provisions JWT tokens on `POST /api/auth/login` without SMS/password verification. The client implements full session persistence in `localStorage` and cookies with automatic route guards.

---

## 5. AI Tool Usage Disclosure

In adherence to the assignment's transparency guidelines:

- **AI-Accelerated Tasks**:
  - Probing scripts used during initial API discovery.
  - TypeScript interface scaffolding and initial boilerplate generation.
  - Interactive simulation response generators for the landing page widget.
- **Independently Architected & Crafted**:
  - Dual-state cache synchronization pattern (TanStack Query + Zustand store deduplication).
  - Web Audio synthesized chime generator with 16-bit PCM WAV fallback.
  - Smart history scroll detection algorithm (`distanceFromBottom < 100`) and floating pill triggers.
  - Responsive `100dvh` mobile layout architecture.
  - Visual design tokens, custom font pairing, and color palette studio.

---

## 6. What I'd Improve With More Time

1. **Cursor-Based Message Pagination**: Currently, `GET /conversations/:id/messages` returns complete conversation history in one request. In high-volume channels (10,000+ messages), implementing bidirectional cursor-based infinite scrolling with virtualized lists (`@tanstack/react-virtual`) would minimize DOM memory footprints.
2. **Automated End-to-End Test Suite**: Adding Playwright tests simulating two concurrent browser sessions exchanging real-time Socket.io messages and verifying optimistic retry flows under artificial network throttling.
3. **Offline Outbox Queue**: An IndexedDB-persisted offline outbox that automatically flushes queued messages in order once the WebSocket reconnects after extended network drops.
4. **Typing Indicators & Read Receipts**: Emitting client-side ephemeral socket signals (`typing:start`, `message:read`) to display peer typing status.

---

## 7. Project Structure

```text
Chatterbox/
├── app/
│   ├── (chat)/chat/             # Protected chat routes & active conversation views
│   │   ├── [conversationId]/    # Dynamic chat thread route
│   │   ├── layout.tsx           # 100dvh responsive shell layout
│   │   └── page.tsx             # Empty conversation selection view
│   ├── login/                   # Zero-friction phone authentication & evaluator presets
│   ├── globals.css              # Tailwind v4 theme variables & mobile view resets
│   ├── layout.tsx               # Root typography providers & metadata
│   └── page.tsx                 # Creative landing page & live simulator
├── components/
│   ├── chat/                    # ChatShell, MessagePanel, Bubble, Composer, Modals
│   ├── landing/                 # Interactive preview, Architecture Visualizer, API Explorer
│   └── ui/                      # Dialog, Avatar, Tooltip, Skeleton, ThemeToggle
├── docs/
│   └── API.md                   # Standalone Part 1 OpenAPI documentation
├── lib/
│   ├── api/                     # Type-safe Axios/Fetch API client & endpoint handlers
│   ├── audio.ts                 # Dual-engine Web Audio synthesizer + PCM WAV fallback
│   ├── realtime/socket.ts       # Socket.io connection manager & broadcast listeners
│   ├── store/                   # Zustand stores (chatStore, authStore, uiStore)
│   └── types/                   # Shared TypeScript models & schema definitions
└── public/                      # Static assets & brand media
```

---

## 8. Tech Stack

| Layer | Technologies |
|---|---|
| **Framework & Runtime** | Next.js 16.2 (App Router, Turbopack), React 19, TypeScript |
| **State & Server Cache** | Zustand 5 (real-time stream), TanStack Query v5 (server cache) |
| **Real-Time Transport** | Socket.io Client v4 |
| **Styling & Components** | TailwindCSS v4, Radix UI Primitives, Lucide Icons, Sonner |
| **Typography** | Fraunces (Headings), Geist Sans (UI/Body), Geist Mono (Code/Telemetry) |
| **Audio Engine** | Browser Web Audio API (`AudioContext`) + 16-bit PCM WAV HTML5 Audio Fallback |
| **Dates & Formatting** | date-fns |

---

## 9. Running Locally

### Prerequisites
- Node.js 18.18+ or 20+
- `pnpm` (recommended), `npm`, or `yarn`

```bash
# 1. Clone the repository
git clone https://github.com/ornobaadi/Chatterbox.git
cd Chatterbox

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev

# 4. Open http://localhost:3000 in your browser
```

### Build & Verification Commands
```bash
# Build production bundle (Turbopack + TypeScript check)
pnpm build

# Start production server
pnpm start

# Run TypeScript type check
pnpm typecheck

# Run ESLint validation
pnpm lint
```