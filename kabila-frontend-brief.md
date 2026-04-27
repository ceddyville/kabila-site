# Kabila Frontend — Agent Implementation Brief

## What This Is

The existing `kabila-site` directory contains static HTML pages (index.html, clan.html, tribe.html, docs.html) plus pre-generated pages under `clans/` and `tribes/`. Your job is to replace these with a proper Next.js app that follows the same Imara Tech design system as the Ukoo site.

## Source Material

- **Static HTML** — the existing `index.html` contains the full landing page design with colour palette, layout, and hero card. Treat it as a reference, not code to copy.
- **Kabila API** — Django REST Framework backend (built separately in `kabila-api/`). The API serves ethnic groups, clans, sub-groups, languages, traditional authorities, and community contributions.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: CSS Modules (`.module.css` files, no Tailwind)
- **Fonts**: Google Fonts — Cormorant Garamond, Jost, DM Mono (load via `next/font/google`)
- **API**: Django REST Framework backend — `NEXT_PUBLIC_API_BASE` env var (defaults to `http://localhost:8001/api/v1`)
- **No auth** — Kabila is a read-only public reference + community contribution portal

## Page Structure

```
app/
├── layout.tsx               # Root layout: fonts, metadata, bg-grid + orbs
├── page.tsx                 # Landing page (hero, stats, features, open-data CTA, footer)
├── ethnic-groups/
│   └── page.tsx             # Browse ethnic groups (search + filter by region/lineage)
├── ethnic-groups/
│   └── [id]/
│       └── page.tsx         # Ethnic group detail: clans, sub-groups, languages, map label
├── clans/
│   └── page.tsx             # Browse clans (search + filter by group/totem)
├── clans/
│   └── [id]/
│       └── page.tsx         # Clan detail: totem, origin story, lineage, sub-clans
├── languages/
│   └── page.tsx             # Browse languages (search)
├── contribute/
│   └── page.tsx             # Contribution form (POST to /api/v1/contributions/)
└── docs/
    └── page.tsx             # API documentation overview + links to Swagger/ReDoc
```

## Component Extraction

Break these out into `components/`:

```
components/
├── nav.tsx                  # Sticky nav with Maasai stripe (shared with Ukoo)
├── maasai-stripe.tsx        # The 4-colour gradient bar (red → gold → teal → ochre)
├── divider.tsx              # Diamond divider between sections
├── stat-card.tsx            # Reusable stat cell (number + label)
├── hero-card.tsx            # Ethnic group preview card (Kikuyu example)
├── group-card.tsx           # Card for browse pages (ethnic group / clan)
├── filter-chips.tsx         # Pill-shaped filter buttons (region, lineage, etc.)
├── search-bar.tsx           # Search input used on browse pages
├── detail-header.tsx        # Dark-panel header for detail pages
├── contribution-form.tsx    # Form for community contributions
└── footer.tsx               # Landing page footer with Maasai stripe
```

## Design Tokens

Use the **same East African palette** as Ukoo — these are Imara Tech brand colours shared across all ecosystem sites. Extract into `globals.css`:

```css
/* East African Palette (Imara Tech shared) */
:root {
  --earth: #b83225; /* Maasai red */
  --earth-mid: #d94f35;
  --ocean: #0d8c7e; /* Indian Ocean teal */
  --ocean-lt: #12b8a6;
  --laterite: #c4720e; /* Laterite ochre */
  --gold: #e8b030; /* Acacia gold */
  --gold-lt: #f5cc60;
  --night: #070a10; /* Rift Valley ink */

  /* Surfaces */
  --bg: #f5f0e6;
  --bg2: #ede5d4;
  --surface: #faf6ee;
  --surface2: #ddd3bc;

  /* Text */
  --ink-dark: #1a1208;
  --ink-mid: #3d2c18;
  --ink-soft: #7a6248;

  /* Borders */
  --border: rgba(26, 18, 8, 0.12);
  --border-earth: rgba(184, 50, 37, 0.22);
  --border-ocean: rgba(13, 140, 126, 0.15);

  /* Glows */
  --glow-earth: rgba(184, 50, 37, 0.08);
  --glow-ocean: rgba(13, 140, 126, 0.08);
}
```

## Fonts (via next/font/google)

```typescript
import { Cormorant_Garamond, Jost, DM_Mono } from "next/font/google";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
});
const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-mono",
});
```

## Key Design Patterns (Shared with Ukoo)

1. **Maasai Stripe** — 4px gradient bar (red → gold → teal → ochre) at nav bottom and footer top.
2. **Diamond Dividers** — 8px rotated square in `--earth` between major sections.
3. **Dark Panel Headers** — Cards with data use `--night` background headers with `--surface` body.
4. **Stats Row** — 4-column grid with 1px gap borders, cream cells, large Cormorant numbers.
5. **Feature Cards** — Rounded cards with coloured icon backgrounds, hover lifts with earth-glow shadows.
6. **Filter Chips** — Pill-shaped, cream background, go dark (`--night` bg, `--gold` text) when active.
7. **Background Effects** — Fixed position: subtle grid lines + 3 blurred colour orbs (red, teal, gold).
8. **Fade-up Animations** — Sections animate in on load with `fade-up` class + delay variants.

## Landing Page Content

### Hero Section

- **Eyebrow**: `— African Peoples & Lineages —`
- **Heading**: `Every clan has a *story.* Every people, a *homeland.*`
- **Slogan**: `A census counts people. Kabila tells you *who they are.*`
- **Sub**: `Ethnic groups, clans, lineage systems, and language families — structured, open, and built for **researchers, educators, and diaspora communities**.`
- **CTA buttons**: `Explore Groups` (primary) · `API Docs` (ghost, links to /docs)

### Hero Card (Preview)

Dark header: `Kikuyu · Agĩkũyũ` with badge `Kenya`
Rows showing:

- Clan: Anjirû → Totem: Elephant
- Clan: Acheera → Totem: Colobus monkey
- Clan: Ambui → Totem: Dove
  Footer stats: Lineage: Patrilineal · Clans: 9 · Speakers: 8.1M

### Stats Row

- `42+` Ethnic Groups
- `200+` Clans
- `18` Language Families
- `100%` Open Data

### Features (4 cards)

1. **Ethnic Groups & Clans** — Structured data on lineage systems, totems, origin stories, and clan hierarchies. From the 9 daughters of Moombi to the 71 Sabaot clans.
   - Icon: people/group icon, bg: `var(--glow-earth)`
2. **Language Families** — Track Niger-Congo, Nilo-Saharan, Afroasiatic, and beyond — with endonyms, dialects, and speaker counts linked to ethnic groups.
   - Icon: speech/language icon, bg: `rgba(196,114,14,.08)`
3. **Mipaka Integration** — Every group and clan is linked to administrative boundaries via the Mipaka API — see both colonial-era and modern territory names.
   - Icon: map/boundary icon, bg: `var(--glow-ocean)`
4. **Community Contributions** — Anyone can propose corrections or additions. Source-verified, reviewed, and transparent — because this data belongs to everyone.
   - Icon: contribute/pen icon, bg: `var(--glow-ocean)`

### Open Data CTA (dark panel)

- Label: `Open Data`
- Heading: `African ethnographic data, structured and *freely accessible.*`
- Body: `Kabila's API is free for researchers, educators, and developers. Every record is source-cited and community-verifiable. Built on Django REST Framework with full Swagger documentation.`
- Tag: `REST API · Open Access · Source-Cited`
- Button: `View API Docs` (gold)

## Browse Pages

### /ethnic-groups

- Search bar at top
- Filter chips: Region (East Africa, West Africa, etc.), Lineage (Patrilineal, Matrilineal, etc.), Verified only toggle
- Grid of `group-card` components showing: name, endonym, clan count, region badge
- Pagination using API's `?page=` param
- Fetch from `GET /api/v1/ethnic-groups/`

### /ethnic-groups/[id]

- `detail-header` with group name, endonym, region badge
- Sections: Description, Origin Story (if present), Languages, Clans list, Sub-groups list, Mipaka location label
- Clans listed as clickable cards
- Fetch from `GET /api/v1/ethnic-groups/{id}/` + `GET /api/v1/ethnic-groups/{id}/clans/`

### /clans

- Search bar + filter chips (by ethnic group, lineage type, verified)
- Grid of clan cards: name, totem, ethnic group name
- Fetch from `GET /api/v1/clans/`

### /clans/[id]

- Detail header with clan name, totem icon/label
- Sections: Origin story, Lineage type, Taboos, Naming conventions, Sub-clans, Related clans, Geographic area + Mipaka label
- Fetch from `GET /api/v1/clans/{id}/`

### /languages

- Search + grid of language cards (name, endonym, ISO code, speaker count, family)
- Fetch from `GET /api/v1/languages/`

### /contribute

- Form with: contributor name, email, target model dropdown, target ID, proposed changes (JSON textarea), justification, sources
- POST to `GET /api/v1/contributions/`
- Success state with thank-you message

### /docs

- Overview of the Kabila API
- Links to Swagger UI and ReDoc (hosted on the API at `/api/docs/` and `/api/redoc/`)
- List of available endpoints with brief descriptions

## API Integration

Create a `lib/api.ts` with typed fetch helpers:

```typescript
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001/api/v1';

export async function fetchEthnicGroups(params?: Record<string, string>) { ... }
export async function fetchEthnicGroup(id: number) { ... }
export async function fetchClans(params?: Record<string, string>) { ... }
export async function fetchClan(id: number) { ... }
export async function fetchLanguages(params?: Record<string, string>) { ... }
export async function fetchLanguageFamilies() { ... }
export async function submitContribution(data: ContributionPayload) { ... }
```

Use Next.js Server Components for data fetching on browse/detail pages. Use Client Components only for interactive parts (search, filters, form).

## Sample Data (Fallback)

Create `lib/sample-data.ts` with hardcoded sample data matching the API response shapes. Use this as fallback when the API is unreachable during development:

```typescript
export const LANDING_STATS = [
  { num: "42+", label: "Ethnic Groups" },
  { num: "200+", label: "Clans" },
  { num: "18", label: "Language Families" },
  { num: "100%", label: "Open Data" },
];

export const FEATURES = [ ... ]; // 4 feature cards as described above

export const SAMPLE_ETHNIC_GROUPS = [ ... ]; // Kikuyu, Luo, Maasai preview
export const SAMPLE_CLANS = [ ... ]; // Anjirû, Acheera, Ambui preview
```

## What NOT to Do

- Don't use Tailwind — this project uses CSS Modules with CSS variables
- Don't add authentication — Kabila is a public read-only reference
- Don't mention Denmark in the footer — just "Imara Tech"
- Don't use localStorage
- Don't duplicate the API docs — just link to the hosted Swagger/ReDoc
- Don't modify the `kabila-api` repo from this brief

## Ecosystem Context

Kabila is part of the Imara Tech API ecosystem alongside:

- **Mipaka** (boundaries) — kabila integrates with this for location labels
- **Ulimi** (dictionary) — calls kabila's `/api/v1/ulimi/languages/` endpoint
- **Ukoo** (genealogy) — shares the same design system
- **Majina** (names) and **Pato** (currency) — future sibling APIs

The design intentionally shares fonts (Cormorant Garamond + Jost + DM Mono) and layout patterns (dark headers, diamond dividers, Maasai stripe, stats rows) with Ukoo for brand consistency. The colour palette is identical.
