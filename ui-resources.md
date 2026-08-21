# UI Component Sources

Reference for Claude Code / Codex. Before hand-building a UI piece from scratch, check whether one of these already has a well-crafted version. All entries below are React + Tailwind and compatible with this project's shadcn/ui base (either shadcn-registry installable via `npx shadcn@latest add <registry-url>`, or copy-paste component code that shares Tailwind's utility classes and shadcn's CSS-variable theming).

Use judgment on fit: pull a component because it solves something well, not because it's on this list. Prefer Tier 1 first.

## Core / theming
- **shadcn/ui** — https://ui.shadcn.com/ — base primitives (button, dialog, form, dropdown, etc.)
- **tweakcn** — https://tweakcn.com/ — theme/token editor for shadcn's CSS variables, not components
- **shadcndesign themes** — https://www.shadcndesign.com/themes — free prebuilt theme presets
- **basecn** — https://basecn.dev/ — another shadcn-flavored base component set

## Animation & motion
- **Magic UI** — https://magicui.design/ — animated text, marquees, beams
- **Motion Primitives** — https://motion-primitives.com/ — scroll/interaction micro-animations
- **Aceternity UI** — https://ui.aceternity.com/ — heavier effects: spotlight, background beams, 3D cards
- **Animate UI** — https://animate-ui.com/ — animated primitives, docs at /docs/components
- **SmoothUI** — https://smoothui.dev/ — animated component set
- **Kokonut UI** — https://kokonutui.com/ — animated, open-source
- **Wigggle UI** — https://wigggle-ui.vercel.app/ — playful motion components
- **Skiper UI** — https://skiper-ui.com/components — animated components
- **Fancy Components** — https://www.fancycomponents.dev/ — animation-heavy pieces
- **Luxe** — https://www.luxeui.com/ — polished animated UI kit
- **animata** — https://animata.design/ — free open-source animated components
- **react-kino** — https://www.react-kino.dev/playground — motion/animation playground pieces
- **COBE** — https://cobe.vercel.app/ — WebGL rotating globe, standalone, not a component kit, use only if a globe visual is actually needed

## Blocks & full sections (landing-page-shaped)
- **21st.dev** — https://21st.dev/ — community shadcn-registry blocks, browse and customize, don't ship unmodified
- **Origin UI** — https://originui.com/ — large catalog of forms/inputs/blocks
- **blocks.so** — https://blocks.so/ — free shadcn blocks
- **Shadcn Blocks (shadcnstudio)** — https://shadcnstudio.com/components — components + blocks
- **MVPBlocks** — https://blocks.mvp-subha.me/ — landing-page-oriented blocks
- **Shadcn hero-section Blocks** — https://nsui.irung.me/hero-section — hero section variants
- **Tailark (hero sections)** — https://tailark.com/hero-section — more hero references
- **HextaUI** — https://www.hextaui.com/blocks — extended components + blocks
- **Eldora UI** — https://www.eldoraui.site/ — includes bento grids and other section layouts
- **Cult UI** — https://www.cult-ui.com/ — components, blocks, templates
- **Efferd** — https://efferd.com/ — shadcn blocks/components
- **CuiCui** — https://cuicui.day/ — component/block collection
- **Sera UI** — https://seraui.seraprogrammer.com/
- **SHSF UI** — https://www.shsfui.com/
- **Simply UI** — https://www.simplyui.io/
- **ui-layouts** — https://www.ui-layouts.com/components
- **Lukacho UI** — https://ui.lukacho.com/components — includes charts, animations
- **Oxbow UI** — https://oxbowui.com/
- **Intent UI (blocks)** — https://intentui.com/blocks
- **PaceUI** — https://www.paceui.com/ — animated components and blocks
- **Extend UI** — https://www.extend.ai/ui — document-app-oriented kit
- **GAIA UI** — https://ui.heygaia.io/docs
- **Beautiful UI** — https://www.beautifului.dev/ — primitives for AI-native interfaces (relevant for any AI-feature surfaces)

## Forms & inputs
- **Kibo UI** — https://www.kibo-ui.com/ — notably `AI Input` (https://www.kibo-ui.com/components/ai-input), directly relevant to the message composer
- **Sync UI (forms)** — https://www.syncui.design/docs/forms
- **Dice UI** — https://www.diceui.com/ — includes angle-slider and other specialty inputs

## Icons
- **Koboyo Icons** — https://koboyo.com/icons — free hand-drawn SVG set, alternative when the default Lucide set doesn't have something needed

## Loading / feedback states
- **Loading UI** — https://loading-ui.com/ — spinners, loaders, loading animations, relevant to `design.md`'s skeleton/loading-state guidance

## Reference / inspiration only (not installable component kits)
- **NameThatUI** — https://namethatui.com/ — visual dictionary for identifying/naming UI patterns, browse for inspiration, nothing to install
- **Uiverse** — https://uiverse.io/ — plain HTML/CSS snippets, framework-agnostic; usable but needs manual conversion to React/Tailwind, treat as a last resort over a proper React source above

## Not compatible with this stack — do not install

Different framework or a competing full styling/component system. Don't add these as dependencies; if a specific pattern from one is genuinely needed, rebuild it with Radix + Tailwind instead.

- **Bits UI** — https://bits-ui.com/ — Svelte, not React
- **Reka UI** — https://reka-ui.com/ — Vue, not React
- **Chakra UI** — https://chakra-ui.com/ — own styling engine (Emotion), conflicts with Tailwind/shadcn tokens
- **MUI** — https://mui.com/ — own styling engine, heavy, conflicts with the design system
- **HeroUI (NextUI)** — http://heroui.com/ — own theming system, stylistically inconsistent if mixed with shadcn
- **FlyonUI** — https://flyonui.com/ — DaisyUI-derived, competing Tailwind plugin approach
- **Preline UI** — https://preline.co/ — plugin/framework approach rather than copy-paste, inconsistent with shadcn's model
- **Keep React** — https://react.keepdesign.io/ — competing full component library
- **Park UI** — https://park-ui.com/ — built on Panda CSS, not Tailwind, different styling engine
- **Untitled UI** — https://www.untitledui.com/react/components — separate paid design system with its own token system
- **Headless UI** — https://headlessui.com/ — fine in isolation (unstyled, from Tailwind Labs) but redundant here since Radix (via shadcn) already covers the same primitives, don't add both
