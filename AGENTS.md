# Comfy Homescreen — AGENTS.md

## Quick start
```bash
pnpm dev        # dev server
pnpm build      # production build
pnpm lint       # ESLint
pnpm start      # start production server
```

No test suite exists. No CI/CD. No type checker step (`tsc` is not a script, and `typescript.ignoreBuildErrors: true` in next.config.mjs — do not fix type errors unless asked).

## Stack
- **Next.js 16** (App Router, RSC by default), **React 19**
- **Tailwind CSS v4** + `tw-animate-css` (no `tailwind.config`, CSS-based config only)
- **shadcn/ui** (New York style, components in `@/components/ui/`)
- **pnpm** (package manager). Lockfile: `pnpm-lock.yaml`
- **@dnd-kit** for widget drag-and-drop reordering
- **Zustand** (`lib/timer-store.js`) for shared timer state that persists across view switches

## Project structure
```
app/                          # Next.js App Router entrypoint
  layout.js                   # Root layout — wraps in LanguageProvider + ThemeProvider (imports styles/globals.css)
  page.js                     # Main SPA (~715 lines, "use client") — state, widget rendering, focus mode
  api/ai-news/route.js        # GET route — proxies Gemini 2.0 Flash with Google Search
components/
  *.js                        # Widget implementations (all "use client")
  settings-drawer.js          # Extracted settings panel (Drawer with language, themes, backgrounds, sounds, etc.)
  global-timer-indicator.js   # Zustand-driven thin bar showing active timer state
  draggable-widget.js         # @dnd-kit sortable wrapper for widgets
  theme-provider.tsx          # next-themes wrapper
  ui/                         # shadcn primitives
  backgrounds/                # gradient-bg, grid-bg, space-bg
lib/
  utils.ts                    # cn() helper (clsx + tailwind-merge)
  widget-store.js             # localStorage layout persistence
  settings-store.js           # localStorage settings persistence
  pomodoro-store.js           # localStorage pomodoro logs
  timer-store.js              # Zustand — shared timer state (survives view switches)
  language-context.js         # i18n provider (es/en) + all translation strings
  themes.js                   # THEME_CONFIG (background→themes mapping) + backgroundOptions
hooks/
  use-toast.ts                # Legacy shadcn toast hook (sonner is used instead)
  use-mobile.ts               # Mobile detection
styles/
  globals.css                 # Active global styles (imported by layout.js)
public/
  manifest.json               # PWA manifest (standalone, dark theme)
  ambiance-audio/             # Ambient sound audio assets
```

## Architecture notes
- **Single-page SPA** — `app/page.js` manages all state via `useState`, `useCallback`, and a monolithic `state` object passed to widgets.
- **All widgets are `"use client"`** — the page itself is a client component.
- **Shadcn `components.json`**: style `new-york`, RSC enabled, `@/` maps to root.
- **i18n**: `language-context.js` contains all translation strings for `es` (default) and `en`. Uses React Context. Language is persisted in localStorage settings.
- **Settings & widget layout** persist entirely in `localStorage` (no backend DB). Keys: `comfy-homescreen-settings`, `comfy-homescreen-widget-layout`, `homescreen_pomodoros`.
- **API keys** (in `.env.local`): `NEXT_PUBLIC_WEATHER_API_KEY` (client-safe, for openweathermap) and `GEMINI_API_KEY` (server-only, via Gemini). Both are committed — do not rotate unless asked.
- **Background themes** use CSS custom properties (`--primary`, `--accent`, `--ring`) set dynamically via JS. The `THEME_CONFIG` object in `lib/themes.js` maps background type to color presets. Each theme entry also includes `particleColor` and `particleBg` for the particles background — changing a theme sets everything at once (no separate particle color UI).
- **Ruby-style text stroke/shadow** CSS classes in `styles/globals.css`: `.text-stroke-1`, `.text-shadow-sm`.

## Conventions
- **Component files are `.js` by convention** (not `.tsx`) even when they contain JSX. Only `hooks/`, `lib/utils.ts`, and `components/theme-provider.tsx` use TypeScript.
- **Imports use `@/` alias** mapped to project root.
- **Files are "use client" if they use any browser API** (React hooks, localStorage, etc.).
- **Tailwind v4** — no `tailwind.config`, no `@apply` directives except in `@layer base`. Use CSS `@import "tailwindcss"` and the `@theme inline` block for theme tokens.
- **shadcn components** live in `components/ui/` and follow the standard shadcn pattern.

## API routes
- `/api/ai-news?lang=es|en` — GET, cached server-side with `unstable_cache`. Uses Gemini 2.0 Flash with `google_search` grounding. Cache revalidates every 24h, but time-window key changes force freshness.
- Window calculation is fixed to UTC-3.

## Gotchas / pitfalls
- TypeScript errors **will not fail the build** (`ignoreBuildErrors: true`). Do not attempt to fix TS issues unless explicitly told to.
- The page is a 715-line client component. Any significant refactor should be discussed first.
- `.env.local` is gitignored by pattern but the current file is tracked (it was committed before the gitignore rule). Avoid touching it unless necessary.
- The app uses `next-themes` for dark mode but the default theme is always `dark` and the CSS variables are overridden by JS theme logic on load.
- `sonner` toasts are used in the page (not the legacy shadcn toast). See `app/page.js:28`.
