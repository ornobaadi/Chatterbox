# Phases — Chat App Take-Home

Companion to PRD.md / architecture.md / design.md. Deadline: **Aug 22, 2026, 4:00 PM**. Use this to track progress across sessions/tools without re-explaining context each time — each phase should be completable and checkable independently.

## Phase 0 — Unblock (do first, ~30 min)
- [ ] Get the real API spec (endpoints, request/response shapes, auth flow, real-time mechanism). Fill in `PRD.md 7`.
- [ ] Confirm real-time transport → lock the branch in `architecture.md 2`.
- [ ] `npx create-next-app` (TS, App Router, Tailwind), push empty repo, confirm Vercel deploy works end-to-end *before* writing features — catches deploy issues early, not at 3:55 PM.

## Phase 1 — API documentation (standalone deliverable)
- [ ] Write API docs in Markdown (or Postman/OpenAPI) covering every endpoint you'll use: method, path, params, request body, response shape, error shape.
- [ ] Note any renamed/added/removed endpoints and why.
- [ ] This ships as-is in the repo — don't treat it as throwaway notes.

## Phase 2 — Auth
- [ ] Login page: phone + name form, validation, submit.
- [ ] Wire to API, persist session, redirect to chat shell on success.
- [ ] Loading + error state on the login form itself.

## Phase 3 — Chat shell + conversation list
- [ ] Layout: sidebar (conversation list) + main panel.
- [ ] Conversation list: fetch, loading skeleton, empty state, error+retry.
- [ ] Search-to-start-conversation flow (1:1).
- [ ] Group conversation creation flow.

## Phase 4 — Message panel (the part that gets the most scrutiny — budget the most time here)
- [ ] Message history fetch + render, sender/receiver visually distinct, timestamps.
- [ ] Composer: send, empty-message guard, optimistic send + failed/retry state.
- [ ] Real-time incoming messages wired per the Phase 0 decision.
- [ ] Auto-scroll on new message; "new messages ↓" pill when scrolled up.
- [ ] Loading/empty/error states for the message panel specifically.

## Phase 5 — Bonus detail (Part 1)
- [ ] Pick exactly one original addition (see PRD 5.8). Build it only after Phase 4 is solid — don't start this with unfinished core features.

## Phase 6 — Landing page (Part 2)
- [ ] Direction/wireframe (mental or quick sketch) before code — avoid drifting into default-template layout.
- [ ] Build hero + product showcase section.
- [ ] One original interactive detail (see design.md 6).
- [ ] Responsive pass.
- [ ] Deploy (can be same Vercel project, separate route, or separate deploy — either is fine, just needs its own live link).

## Phase 7 — Write-up + submission
- [ ] Part 3 write-up in README: architecture/library reasoning, design reasoning, AI tool usage (honest — what you kept/changed/rejected), what you'd improve with more time, any API issues encountered.
- [ ] Verify both live links work in an incognito window (not just localhost).
- [ ] Verify repo is public or access is granted.
- [ ] Send submission.

## Rough time budget (24h window)
- Phase 0–1: ~1.5h
- Phase 2–3: ~3h
- Phase 4: ~6h (largest single chunk, this is the graded core)
- Phase 5: ~1.5h
- Phase 6: ~4h
- Phase 7: ~1h
- Remainder: buffer for debugging real-time/deploy issues, which always take longer than expected.
