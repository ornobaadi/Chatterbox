# Design — Chat App Take-Home

Companion to `PRD.md` / `architecture.md`. Covers visual direction for both Part 1 (chat UI) and Part 2 (landing page).

## 1. Direction

Evaluators explicitly said "we'd rather see your own creative instincts than a generic template" for the landing page, and the chat panel is the highest-scrutiny surface in Part 1. Default choice: lean into a **Material 3 Expressive-influenced, tactile UI** — intentional motion, real depth/elevation on the active conversation, rounded but not bubbly, confident use of a single accent color rather than a rainbow of pastel states.

Avoid: generic SaaS-template look (centered hero, three feature cards, gray-on-white everywhere, Inter for everything). If it looks like every other Tailwind template, it fails the "bold" ask even if it's technically complete.

## 2. Typography

Pick one pairing, don't mix more than two families:

- **Space Grotesk** or **Instrument Sans** for headings/landing page — has personality, not overused like Inter.
- **DM Sans** or **Geist** for UI body text/chat bubbles — clean at small sizes, good number rendering (timestamps).

## 3. Color

- One confident accent (not default Tailwind blue-500). Pick something the landing page and the chat app share, so Part 2 visibly "belongs" to Part 1 instead of looking like an unrelated marketing site bolted on.
- Sent vs. received bubbles: don't just flip gray/blue. Consider accent-filled for sent, a neutral surface-elevated tone for received, both with enough contrast for timestamps at small size.
- Dark mode isn't required but is a cheap, well-executed detail if time allows — skip it if it competes with core feature time.

## 4. Chat panel specifics (this is the highest-scrutiny surface)

- Message bubbles: tight vertical rhythm when the same sender sends multiple messages in a row (group them, single timestamp for the cluster, not one per bubble) — small detail, reads as senior-level polish.
- Timestamps: relative for recent ("2m ago"), absolute on hover or for older messages.
- Composer: auto-growing textarea (not a fixed single-line input), send button disabled state clearly distinct (not just lower opacity — actually looks unclickable).
- "New messages ↓" pill: small, unobtrusive, appears only when scrolled up and a new message arrives.
- Group chat: small avatar + name on messages from others, omit on your own (you know who you are).

## 5. States

- Skeletons should match the actual layout they're replacing (bubble-shaped skeletons in the message list, not a generic spinner) — spinners read as unfinished, shaped skeletons read as intentional.
- Empty states get a short line of copy + optionally an icon, not just blank space ("No messages yet — say hi").
- Error states always pair the message with a retry action, never a dead end.

## 6. Landing page (Part 2)

- Structure it around *showing the product*, not describing it: a real (or realistic mock) screenshot/animated snippet of the chat panel front and center, not stock illustration.
- One genuinely original interactive detail — e.g., a live-feeling animated chat preview that "types" a demo conversation on scroll into view, or a draggable/before-after of the empty vs. active states. Must be original per the brief — explicitly skip stock testimonial carousels and FAQ accordions, they don't count toward the bonus even done well.
- Responsive: mobile-first is safer given the timeline, then scale up.

## 7. Fonts/UX reference points (personal defaults, use if no strong preference emerges)

DM Sans, Geist, Rubik, Outfit, Space Grotesk, Instrument Sans — any of these read as "chosen," not "default."
