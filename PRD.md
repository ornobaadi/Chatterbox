# PRD — Chat App Take-Home (Frontend Developer Assignment)

## 1. Context

This is a take-home assignment for a Frontend Developer role. It has three parts, built in order:

1. **Part 1** — API docs + a working chat application (login, conversations, messaging, real-time).
2. **Part 2** — A creative landing page showcasing what was built in Part 1.
3. **Part 3** — A short write-up of approach, decisions, and AI-tool usage.

Evaluators said explicitly: **the chat panel (message list, sending, real-time behavior) is where the most care and polish should go.** Everything else matters, but that's the tie-breaker.

Deadline: **Aug 22, 2026, 4:00 PM**. Deployed demo links (Part 1 + Part 2) and a GitHub repo with README are mandatory — no working demo link means no review.

## 2. Goals

- Ship a chat app that feels real: fast, no dead states, no jank on send/receive.
- Ship a landing page with genuine creative direction, not a template.
- Document the API cleanly as a standalone deliverable (this happens *before* writing code).
- Leave a paper trail of decisions in Part 3, honestly, including where AI tools were used.

## 3. Non-goals / out of scope

- No user profile editing, settings, or push notifications — not asked for.
- No mobile native app — responsive web only.
- No production-grade auth (JWT refresh flows, etc.) beyond what the given API supports — this is a take-home against a mock API, not a security exercise.

## 4. Users

Single persona: **the evaluator**, who will act as an end user logging in, searching for a contact, starting a 1:1 or group chat, and sending messages — while also reading the code.

## 5. Functional requirements (Part 1)

### 5.1 Auth
- Login screen: phone number + name.
- New phone number → auto-registers. Existing phone number → logs in (name field behavior for existing users: **assumption** — pre-fill/ignore and use stored name; note this in Part 3 if the API doesn't clarify).
- Persist session (token/local storage) across refresh.

### 5.2 Starting a conversation
- Search by phone number or name.
- Start a 1:1 conversation from search results.
- Create a group conversation with multiple selected participants (name required for the group).

### 5.3 Message list
- Full history for the active conversation.
- Sender vs. receiver visually distinct (alignment/color, not just an avatar).
- Each message timestamped (readable format, not raw ISO).
- Group chats: show sender identity per message (name/avatar), since "sender vs receiver" alone isn't enough with >2 participants.

### 5.4 Sending messages
- Text input + send action.
- Empty/whitespace-only messages are not sendable (disable send, don't just silently no-op).
- Optimistic UI: message appears immediately, reconciles with server response, shows a failed state if the send errors (this is the kind of "one-step-ahead" detail worth doing well).

### 5.5 Real-time updates
- New incoming messages appear without a manual refresh.
- Mechanism depends on what the API actually offers (WebSocket vs. polling) — **TBD, see Open Questions**.

### 5.6 Loading / empty / error states
- Conversation list: loading skeleton, "no conversations yet" empty state, error + retry.
- Message list: loading skeleton, "say hi" empty state for a brand-new conversation, error + retry.
- Search: loading, "no results", error.

### 5.7 Auto-scroll
- Default: auto-scroll to latest message on new message / on open.
- If the user has scrolled up to read history, do **not** yank them back down — show a "new messages ↓" affordance instead that scrolls on click.

### 5.8 Bonus (Part 1)
One genuinely original, small detail — decide after the core is solid, not before. Candidates: typing indicator using only client-side state if the API doesn't support it (clearly labeled as simulated in the write-up — don't misrepresent it as real), read receipts, message grouping by sender/time cluster, keyboard shortcuts (Enter to send, Shift+Enter for newline). Pick **one**, execute it well, don't scatter effort.

## 6. Functional requirements (Part 2 — Landing page)

- Presents the chat feature to "real users," own layout/palette/typography/motion.
- Responsive.
- Bonus: one original interaction/detail, not a stock testimonial/FAQ block.

(Full creative direction lives in `design.md`.)

## 7. API reference — confirmed from Swagger (Chat API v1.0.0, OAS 3.0)

Base URL: `https://frontend-task-chatapp.onrender.com/api`. Auth: `Authorization: Bearer <token>` on every protected request.

**The spec is intentionally request-only — no response bodies or status codes documented.** Inspecting live responses and formalizing them yourself *is* the Part 1 documentation deliverable, not a gap to fill in before starting.

### REST endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/login` | Log in or register — `{ phone, name }`. New phone auto-registers; existing phone logs in. Returns a JWT. | No |
| GET | `/auth/me` | Current user | Yes |
| GET | `/users/search` | Search users by name or phone | Yes |
| GET | `/conversations` | List my conversations | Yes |
| POST | `/conversations` | Start a direct (1:1) conversation | Yes |
| GET | `/conversations/{id}/messages` | Get message history (check for pagination params when you inspect the live response) | Yes |
| POST | `/conversations/group` | Create a group (3+ members, has a name, creator is the first admin) | Yes |
| POST | `/conversations/{id}/participants` | Add members to a group | Yes |
| DELETE | `/conversations/{id}/participants/{userId}` | Remove a member / leave a group | Yes |
| POST | `/conversations/{id}/admins` | Promote a member to admin | Yes |
| PATCH | `/conversations/{id}` | Rename a group | Yes |
| POST | `/messages` | Send a message (works for both direct and group — same endpoint) | Yes |
| GET | `/health` | Health check | No |

Named request schemas to inspect in Swagger and formalize in your own docs: `LoginRequest`, `StartConversationRequest`, `SendMessageRequest`, `CreateGroupRequest`, `AddParticipantsRequest`, `PromoteRequest`, `RenameGroupRequest`.

### Real-time — Socket.io (confirmed, not raw WebSocket/SSE)

- Connect to the **server root**, not the `/api` base — the socket lives at `/socket.io/`.
  ```js
  const socket = io('https://frontend-task-chatapp.onrender.com', { auth: { token } });
  ```
- Same JWT as REST, passed in the handshake `auth`. Missing/invalid token is rejected at connect time.
- Events:
  - **client → server** `message:send` — `{ conversationId, text }` (optional ack callback)
  - **server → client** `message:new` — a new message arrived for you
  - **server → client** `conversation:updated` — a group you're in changed (created, renamed, members/admins changed)

Implication for `architecture.md`: real-time is settled — Socket.io branch, not polling. Note the `message:send` socket event as an *alternative* send path to `POST /messages`; decide in your write-up which one you actually use for sending (Swagger lists both a REST endpoint and a socket event for sending — using the socket event with an ack callback is arguably the tighter, more "real-time-native" choice, but REST + reconcile-via-`message:new` is simpler to reason about and matches the optimistic-send flow in architecture.md §5 more directly. Pick one, state why).

### Groups model (confirmed)
- A conversation is either **direct** (1:1) or a **group** (3+ members).
- Groups have a name and one or more **admins**; creator starts as admin.
- Only admins add/remove members, promote to admin, and rename.
- Any member can leave.
- Group messages use the same `POST /messages` endpoint and `message:new` event as direct messages — no separate group-message plumbing needed.

### Remaining unknowns (resolve via live testing, not more spec-reading)
1. Exact response body shape for each endpoint (by design — this is what you document).
2. Pagination shape for `/conversations/{id}/messages`.
3. Behavior of `/auth/login` when phone exists but a different `name` is submitted.

## 8. Success criteria

- Meets every bullet in section 5 with no missing state (empty/loading/error) anywhere reachable.
- Chat panel specifically feels polished — this is called out by the evaluators as the focus area.
- Clean, readable, reasonably organized code — not a kitchen-sink of every library.
- Both demo links live and working at submission time. This is a hard requirement, not a nice-to-have.
- Part 3 write-up is honest about AI tool usage and what was kept/changed/rejected.

## 9. Open questions / assumptions (update as answered)

1. ~~Real-time mechanism~~ — **resolved: Socket.io**, see §7.
2. Send via `POST /messages` vs. socket `message:send` — pick one, document the choice (see §7 note).
3. Pagination shape for message history — confirm against live response.
4. What happens on login with an existing phone number but a different submitted name — server behavior unknown, confirm against live response.
5. Group conversation minimum participant count is 3+ per the Swagger overview (direct = 1:1, group = 3+) — confirmed, not an open question anymore.
