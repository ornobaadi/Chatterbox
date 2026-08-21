# Architecture — Chat App Take-Home

Companion to `PRD.md`. Read that first for *what*, this is *how*.

## 1. Stack

- **Next.js (App Router) + TypeScript** — required by the assignment.
- **TailwindCSS** — utility styling, fast to make it look intentional rather than default.
- **Zustand** (or React Context if you want zero deps) — chat/session state. Zustand recommended: less boilerplate than Context for cross-component real-time updates (message list + conversation list both need to react to the same incoming-message event).
- **TanStack Query** — server state (conversations, message history, search) — gives you loading/error states, caching, and refetch-on-focus for free, which directly covers PRD §5.6.
- **Zod** — validate/parse API responses at the boundary, so a shape you didn't expect fails loudly in dev instead of silently breaking the UI.
- Deploy target: **Vercel** (zero-config for Next.js).

Trade-off to note in Part 3: TanStack Query + Zustand is two state systems. Justify it as "server cache vs. client/session state," don't blend them into one store.

## 2. Real-time strategy — **confirmed: Socket.io**

Client library: `socket.io-client`. Connect to the **server root** after login, not the `/api` REST base — the socket lives at `/socket.io/`:

```js
const socket = io('https://frontend-task-chatapp.onrender.com', { auth: { token } });
```

Auth uses the same JWT as REST, passed in the handshake. An invalid/missing token is rejected at connect time — so the connection attempt itself is a signal to check before rendering the chat shell (don't silently show an empty conversation list if the socket failed to auth).

Events:
- **client → server** `message:send` — `{ conversationId, text }`, optional ack callback.
- **server → client** `message:new` — a new message arrived for you (append to store for the relevant conversation).
- **server → client** `conversation:updated` — a group changed (created, renamed, membership/admins changed) — invalidate/refetch the conversation list or patch it in place.

**Send path decision (state this explicitly in the Part 3 write-up):** the API exposes two ways to send — `POST /messages` (REST) and `message:send` (socket, with an optional ack). Recommended default: use `POST /messages` for the actual send (simpler error handling via normal HTTP status codes, plays cleanly with the optimistic-mutation flow in §5), and rely purely on `message:new` for receiving, including your own echoed-back message if the server sends it that way — check for and dedupe against the optimistic local copy by a client-generated temp id. Using `message:send`'s ack callback instead is a valid alternative (arguably more "real-time-native") if you'd rather avoid the dedupe step — pick one, don't implement both.

One socket connection, opened once after login (e.g., in a top-level provider or the chat layout), disposed on logout. `conversation:updated` and `message:new` dispatch into the same Zustand store `POST`-based mutations write to — the message list component doesn't need to know or care whether a given message arrived via the REST response or the socket event, both end in the same "append/reconcile message in store" action. Keep that boundary clean.

## 3. Auth

- Login writes `{ token, user }` to Zustand + `localStorage` (or a cookie if you want SSR-protected routes — Next.js middleware can check a cookie; localStorage can't be read in middleware).
- Simple choice for a 24h build: **cookie** if the API sets one, otherwise localStorage + a client-side route guard (redirect to `/login` in a top-level layout effect if no session). Don't over-engineer refresh-token flows — not what's being evaluated.

## 4. Folder structure

```
app/
  login/
    page.tsx
  (chat)/
    layout.tsx              # sidebar (conversation list) + panel shell
    page.tsx                 # empty state — no conversation selected
    [conversationId]/
      page.tsx               # message list + composer
components/
  chat/
    ConversationList.tsx
    ConversationListItem.tsx
    MessagePanel.tsx
    MessageBubble.tsx
    MessageComposer.tsx
    NewMessagesPill.tsx      # "new messages ↓" affordance
    SearchStartConversation.tsx
    GroupCreateModal.tsx
  ui/                        # generic building blocks (Avatar, Skeleton, EmptyState, ErrorState)
lib/
  api/                       # typed fetch functions, one file per resource
  store/                     # zustand stores
  realtime/                  # socket or polling implementation, isolated behind one hook: useRealtimeMessages()
  schemas/                   # zod schemas per API resource
```

Rationale: the API layer and realtime layer are isolated so that if the real-time mechanism turns out to be different than assumed, only `lib/realtime/` changes — nothing in `components/`.

## 5. Data flow (message send)

1. User submits composer → optimistic message object pushed into store immediately (`status: "sending"`).
2. `POST` fires via TanStack Query mutation.
3. On success: reconcile optimistic message with server response (real id, timestamp), `status: "sent"`.
4. On error: `status: "failed"`, show inline retry on that bubble — don't toast-and-forget, keep it attached to the message.
5. Incoming messages from other users arrive via whichever real-time transport, appended directly to store — no optimistic step needed for those.

## 6. Error handling

- Network/API errors surface as typed errors from `lib/api/` (don't let raw fetch rejections leak into components).
- Every data-fetching component consumes `{ data, isLoading, isError }` from TanStack Query and renders one of: skeleton / content / `<ErrorState retry={...} />`. No silent blank screens.

## 7. What NOT to build

- No custom router, no Redux, no CSS-in-JS lib beyond Tailwind — keep the dependency list defensible in the Part 3 write-up.
- No test suite required by the brief, but 2–3 focused tests (message send, empty-message guard, auto-scroll-pause-on-scroll-up) are a cheap credibility signal if time allows — not a priority over the core features.
