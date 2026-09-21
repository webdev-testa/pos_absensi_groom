# Design Specification — Dr. Meow (Absensi & POS)

Version: 2.0.0  
Date: 2026-09-15  
Status: Phase 3 Finalized (Refined Direction)  
Authority: Source of truth for Dr. Meow UI design and implementation craft.

---

## 1. Design Thesis

**"Warm Clinic Daylight Meets High-Speed Operational Precision"**

Absen Dr. Meow is a purpose-built veterinary operational operating system. It merges **Intercom's humane daylight cream ground (`#FAF8F5`)**, charcoal typography (`#1D262C`), and warm hairlines (`#E2DDD5`) with **Cal.com's high-speed scheduling scannability** and **Linear's action triage hierarchy**. 

It delivers uncompromising clinical authority, financial accuracy (IDR currency, GPS logs, payroll deductions), and ergonomic touch efficiency (44px tap targets) while retaining the approachable, compassionate warmth essential to a veterinary practice.

---

## 2. Visual Personality

- **Incumbent Identity Preserved:**
  - Daylight warm cream ground (`#FAF8F5`) with crisp elevated white tiles (`#FFFFFF`).
  - Authoritative Navy/Charcoal anchors (`#0C1D2A` / `#1D262C`).
  - Warm subtle hairlines (`#E2DDD5` / `#EBE7E1`).
  - High-voltage Brand Orange (`#FF5600`) and Amber Gold (`#F5A940`) reserved strictly for primary interactive actions and urgent status alerts.
- **Evolved & Refined:**
  - **From Fragmented Cards to Contiguous Metric Strips:** Replaced multiple floating boxes with cohesive, hairline-divided metric bars (Cal.com inspired).
  - **From Decorative Emoji Noise to Intentional Warmth:** Removed loose emojis from operational table headers and titles; clinic warmth is now expressed through empathetic microcopy, soft daylight atmosphere, and tactile border craftsmanship.
  - **From Flat Clutter to Action Triage:** Elevated pending actions ("Attention Needed") to the primary focal point of the dashboard (Linear inspired).
  - **From Ad-Hoc Hex Colors to Strict Token Discipline:** Unified all colors into semantic CSS custom properties.

---

## 3. Typography Strategy

Three dedicated type families with strict role separation:

1. **Heading Display (`--font-heading`):** `Plus Jakarta Sans`, system-ui, sans-serif
   - Bold, modern geometric sans with warm apertures. Used for page titles, section titles, and modal headers.
2. **Interface Body (`--font-sans`):** `Inter`, system-ui, -apple-system, sans-serif
   - High legibility at 12px–15px sizes. Used for all form labels, table cells, descriptions, and button text.
3. **Tabular & Numerics (`--font-mono`):** `JetBrains Mono`, ui-monospace, monospace
   - Clean tabular figures with `font-feature-settings: "tnum"`. Used for all Indonesian Rupiah (IDR) currency amounts, clock times (HH:mm:ss), dates, GPS coordinates, and badge counters.

### Typographic Scale

| Token | Family | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `display-xl` | Plus Jakarta Sans | 30px (1.875rem) | 700 (Bold) | 1.2 | -0.5px | Top Page Titles |
| `display-lg` | Plus Jakarta Sans | 24px (1.5rem) | 700 (Bold) | 1.25 | -0.3px | Modal Titles, Primary Headings |
| `heading-md` | Plus Jakarta Sans | 18px (1.125rem) | 600 (Semibold) | 1.3 | -0.2px | Section Titles, Card Headers |
| `body-base` | Inter | 14px (0.875rem) | 400 / 500 | 1.5 | 0 | Default UI Body, Form Inputs |
| `body-sm` | Inter | 13px (0.8125rem) | 400 / 500 | 1.45 | 0 | Secondary Descriptions, Subtext |
| `caption` | Inter | 12px (0.75rem) | 500 | 1.4 | +0.2px | Badges, Helper Text |
| `table-header`| Inter | 11px (0.6875rem) | 600 (Semibold) | 1.4 | +0.6px | Table Column Headers (UPPERCASE) |
| `mono-stat` | JetBrains Mono | 26px–30px | 700 (Bold) | 1.1 | -0.5px | Dashboard Metric Numbers (`tabular-nums`) |
| `mono-data` | JetBrains Mono | 13px (0.8125rem) | 500 / 600 | 1.4 | -0.2px | Currency (Rp), Times, Coordinates |

---

## 4. Color Strategy & Token Architecture

All colors resolve through semantic CSS variables in `src/index.css`. Inline raw hex codes are strictly prohibited.

### Ground & Surfaces
- **Canvas Ground (`--canvas` / `bg-background`):** `#FAF8F5` (Daylight cream ground)
- **Elevated Cards (`--surface-card` / `bg-card`):** `#FFFFFF` (Crisp white elevated tile)
- **Subtle Surface (`--surface-soft`):** `#F3EFE9` (Input backgrounds, table hover states)
- **Muted Surface (`--surface-muted`):** `#EBE6DE` (Pill backgrounds, secondary chips)
- **Border / Hairlines (`--hairline` / `border-border`):** `#E2DDD5` (Warm hairline separator)
- **Hairline Soft (`--hairline-soft`):** `#EBE7E1` (Table inner row dividers)

### Text & Ink
- **Primary Ink (`--foreground` / `--ink`):** `#1D262C` (Deep charcoal, WCAG AAA contrast on cream)
- **Muted Ink (`--muted-foreground` / `--ink-muted`):** `#5C6B73` (Secondary text, helper notes)
- **Subtle Ink (`--ink-subtle`):** `#8A9BA8` (Placeholder text, tertiary captions)

### Brand & Interactive Accents
- **Primary Dark (`--primary`):** `#0C1D2A` (Navy/Slate anchor for primary branding and headers)
- **Primary Hover (`--primary-hover`):** `#152E42`
- **Brand Orange (`--brand-orange`):** `#FF5600` (High-voltage operational CTA: Check-In, Clock In, Bayar)
- **Brand Accent Amber (`--brand-accent`):** `#F5A940` (Active sidebar indicator, warnings)
- **Brand Cyan (`--brand-cyan`):** `#4DC8F5` (Grooming stage accents, informational icons)

### Semantic Status Matrix

| Status | Background Token | Border Token | Text Token | Class | Usage |
|---|---|---|---|---|---|
| **Success / Ontime** | `#E6F7F0` | `#A7F3D0` | `#065F46` | `.badge-ontime` | Tepat Waktu, Paid, Selesai, Active |
| **Warning / Late** | `#FEF3C7` | `#FDE68A` | `#92400E` | `.badge-late` | Terlambat, Pending Approval, Draft |
| **Error / Absent** | `#FEE2E2` | `#FECACA` | `#991B1B` | `.badge-absent` | Alpa, Rejected, Overdue Kasbon |
| **Info / Progress** | `#EFF6FF` | `#BFDBFE` | `#1E40AF` | `.badge-info` | GPS Valid, Dikerjakan, In Review |

---

## 5. Layout & Container Architecture

### Container Strategy: Eliminating Card Fatigue
- **Rule 1: Contiguous Metric Strips.** Top-level statistics are grouped into single contiguous surfaces with internal hairline dividers (`divide-y md:divide-y-0 md:divide-x divide-hairline bg-card border border-hairline rounded-xl`) instead of 4 floating boxes.
- **Rule 2: Flat Action Stream.** Urgent items ("Attention Needed") sit in a single cohesive card with a subtle status strip on the left, making pending items instantly scannable without multi-card visual noise.
- **Rule 3: Clean Single-Level Containers.** Avoid nesting `<Card>` inside `<Card>`. If a section lives inside a container, internal divisions must use subtle borders (`border-t border-hairline-soft`) or gentle surface shifts (`bg-surface-soft`) rather than redundant border boxes.

### Spacing System
- Standard page padding: `p-4 sm:p-6 lg:p-8`
- Grid spacing: `gap-4 sm:gap-5`
- Card interior padding: `p-4 sm:p-5`
- Element vertical rhythm: `space-y-4` or `space-y-5`

---

## 6. Controls & Form Standardization

- **Unified Control Height:** All desktop search inputs, dropdown filters, date pickers, and primary buttons must be exactly **40px (`h-10`)**.
- **Border Radius Hierarchy:**
  - Controls, inputs, and buttons: `rounded-xl` (12px)
  - Cards and metric banners: `rounded-xl` (12px) or `rounded-2xl` (16px)
  - Modals and large dialogs: `rounded-2xl` (16px)
  - Status badges and tag chips: `rounded-full` (pill 9999px)
- **Focus Rings:** Unified 2px primary ring with subtle offset: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary`.

---

## 7. Mobile & Touch Ergonomics

- **Minimum Touch Envelope:** Every interactive button, toggle icon, and table action must satisfy the **44px minimum touch target** (`min-h-[44px] min-w-[44px]` or `p-2.5` wrapper).
- **Table Responsive Behavior:** Data tables on mobile viewports must maintain horizontal scrollability with sticky left columns for employee/cat identity and clear overflow cues, or cleanly switch to responsive card-list mode.
- **Sidebar & Drawers:** Mobile sidebar operates via a full-height slide-over drawer with 44px tap targets and clean backdrop blur.

---

## 8. Motion & Performance Discipline

- **Restrained Motion:** Continuous animations (`animate-pulse`, `animate-bounce`) are strictly removed. Motion is reserved for:
  - User-initiated hover transitions (`transition-all duration-150 ease-out`),
  - Dialog / modal enter transitions (fade & scale),
  - Asynchronous loading spinners (`animate-spin` on `Loader2` during active mutations).
- **Reduced Motion Support:** Fully honored via `@media (prefers-reduced-motion: reduce)` in `index.css`.

---

## 9. Anti-Patterns Explicitly Forbidden

1. **NO Raw Hex Codes in Component Files:** All colors must reference Tailwind utilities or CSS custom variables.
2. **NO 9-Card Floating Clutter:** Do not create separate rounded bordered boxes for every statistic; use contiguous hairline strips.
3. **NO Decorative Emojis in Data Tables:** Emojis are banned from table headers, status badges, and administrative titles.
4. **NO Sub-44px Mobile Tap Targets:** Do not render bare `w-6 h-6` or `p-1` buttons in touch interfaces.
5. **NO Unstyled Print Slips:** Thermal print receipts and payslips must use `@media print` rules with pure `#000000` text and no clipped boundaries.
