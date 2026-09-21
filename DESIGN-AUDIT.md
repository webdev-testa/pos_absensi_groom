# Design Audit — Dr. Meow (Absensi & POS)

Date: 2026-09-15  
Status: Phase 1 Completed (Awaiting Approval)  
Scope: Cross-Application Design System, Layout, Hierarchy, and UX Flows

---

## 1. Executive Summary

Absen Dr. Meow possesses a strong foundational identity—marrying **Cal.com's high-speed scheduling scannability** with **Intercom's warm daylight cream canvas (`#FAF8F5`)**, crisp charcoal typography (`#1D262C`), and operational pet-clinic friendliness. 

However, as features expanded across **HR/Payroll**, **Penitipan Kucing (POS)**, and **Salon Grooming**, UI implementation drifted into:
- **Card fatigue** (too many competing rectangular cards on single viewports),
- **Inconsistent token usage** (scattered raw hex colors rather than semantic CSS variables),
- **Visual hierarchy flattening** (critical alerts visual weight competing with routine stats),
- **Ergonomic gaps on mobile** (sub-44px table action targets), and
- **Decorative noise** (repetitive emojis and distracting continuous pulses).

This audit identifies what is working, what is weak, and what must be preserved to elevate the product to a unified, polished, high-density operational tool.

---

## 2. What Is Working Well (Keep & Preserve)

1. **Warm Daylight Palette & Tone of Voice**:
   - The cream ground (`#FAF8F5`), white elevated tiles (`#FFFFFF`), and soft hairlines (`#E2DDD5`) create a welcoming, humane clinic atmosphere while avoiding sterile enterprise gray or harsh neon SaaS cliches.
2. **Core Operational Workflows**:
   - Fast GPS attendance verification and live attendance activity feed.
   - Groomer mobile workstation with progressive step logging and public customer tracking via token.
   - Daily pet condition reporting with one-tap WhatsApp template generator.
   - Comprehensive payroll compilation with kasbon deductions and printable thermal payslips.
3. **Tabular & Financial Formatting**:
   - Monospace figures (`JetBrains Mono` / `tabular-nums`) for currency (IDR), clock times, and GPS coordinates provide immediate numerical credibility.
4. **Semantic Badging Baseline**:
   - Distinct, color-coded badges for statuses (`Ontime`, `Late`, `Absent`, `Pending`, `Approved`, `Paid`) in `index.css`.
5. **Rock-solid Technical Foundation**:
   - React 19, TypeScript, TanStack Query, Radix UI primitives, 121 passing automated unit/integration tests, zero build errors.

---

## 3. What Is Weak (Problems to Address)

### A. Visual Hierarchy & Card Fatigue (UX + Aesthetic)
- **Dashboard Competition**: The Admin Dashboard renders 9 separate bordered cards/panels (`StatCards`, `TodayAttendance`, `AttentionNeeded`, `KasbonOverview`, `PayrollStatus`, `RecentActivities`, `AlertBanner`) with almost identical visual weight, forcing the user's eyes to jump erratically without an obvious focal anchor.
- **POS Dashboard Domination**: "Belum Laporan" and "Checkout Hari Ini" use saturated tinted card backgrounds (`bg-amber-50`, `bg-rose-50`) that visually drown out the actual booking list, even when numbers are low or zero.
- **Nested Card Syndrome**: Cards wrapped inside cards with duplicate borders and padding create cramped interior whitespace and visual clutter.

### B. Inconsistent Design Token Application (Implementation Quality)
- **Scattered Raw Hex Codes**: Multiple files bypass Tailwind/CSS variables and directly use inline hex codes:
  - `#C84B2F` in `Dashboard.tsx` loader,
  - `#10B981` & `#FF5600` in `StatCards.tsx`,
  - `#FAF8F5`, `#E2DDD5`, `#1D262C` hardcoded in `GroomingReport.tsx`,
  - `bg-emerald-50` / `bg-amber-50` mixed with `.badge-ontime` / `.badge-late`.
- **Inconsistent Border Radii**: Arbitrary mixing of `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), and `rounded-3xl` (24px) without clear hierarchy rules (e.g. modals vs cards vs chips).

### C. Information Density & Controls Consistency (UX)
- **Control Heights & Padding Drift**: Search inputs and filter selects alternate between `h-9` (36px), `h-10` (40px), and `h-11` (44px) across `AttendanceFilters`, `PayrollFilters`, `KasbonTable`, and `PosDashboard`.
- **Label Inconsistency**: Section headers flip between `stat-title` (uppercase 12px with tracking), `font-mono text-[10px] tracking-wider`, and plain `text-xs font-semibold`.

### D. Mobile Ergonomics & Accessibility (UX)
- **Sub-44px Touch Targets**: Table inline actions (quick check, flag attendance, delete, approve/reject buttons) often render as `w-7 h-7` or `p-1` icons, making them prone to mis-clicks on mobile and tablet touchscreens.
- **Continuous Motion Distractions**: `animate-pulse` on multiple badges and `animate-bounce` on empty-state icons cause continuous motion that distracts from operational scanning and violates reduced-motion preferences.

### E. Decorative AI Clutter (Aesthetic)
- Emojis (`🐾`, `🐱`, `✂️`, `🎉✨`) are sprinkled into almost every title, badge, and button. While pet-friendly warmth is part of the brand, excessive emojis dilute the clinical precision and professionalism of the admin tools.

---

## 4. What Should NOT Change (Preservation Invariants)

1. **Brand Identity**: Intercom warm daylight canvas (`#FAF8F5`), navy/charcoal primary elements (`#0C1D2A` / `#1D262C`), and warm hairlines (`#E2DDD5`).
2. **Typography Families**: Plus Jakarta Sans for titles/headings, Inter for interface body/forms, JetBrains Mono for data/times/numbers.
3. **Information Architecture & URL Structure**: All existing routes (`/admin/*`, `/groomer`, `/grooming/report/:token`, `/login`) and permission levels must remain identical.
4. **All Functional Workflows**: Form validation, state machines, Supabase database schemas, WhatsApp link generators, thermal print formatting, and Excel export routines.
5. **Automated Test Integrity**: All existing 121 tests must continue to pass without regressions.

---

## 5. Distinction: Genuine UX Problems vs. Aesthetic Preferences

| Finding | Classification | Justification |
|---|---|---|
| **Dashboard card competition (9 boxes)** | **Genuine UX** | High cognitive friction; users struggle to find immediate operational priorities (unreported cats, pending kasbon, attendance flags). |
| **Sub-44px tap targets in data tables** | **Genuine UX** | Causes mis-clicks and frustrates mobile/tablet clinic staff during fast-paced shifts. |
| **Inconsistent filter/input heights** | **Genuine UX** | Breaks muscle memory and consistent form navigation across administrative modules. |
| **Continuous pulsing & bouncing** | **Genuine UX (A11y)** | Causes cognitive distraction and motion discomfort for users with vestibular sensitivities. |
| **Scattered raw hex values vs tokens** | **Code / Quality** | Maintenance liability and potential theme/dark-mode desynchronization. |
| **Excessive decorative emojis** | **Aesthetic / Tone** | Harmless functionally, but undermines clinical authority and makes the interface feel toy-like. |
| **Varying corner radius styles** | **Aesthetic / Polish** | Does not block user tasks, but reduces design coherence and perceived craft. |

---

## 6. High-Impact Opportunities

1. **Consolidated Surface Architecture (Reduced Card Fatigue)**:
   - Group related statistics into clean, unified summary banners with subtle hairline dividers instead of 4 separate floating boxes.
   - Anchor primary dashboards around a high-priority "Action Stream" (items requiring attention today) paired with contextual operational tables.
2. **Standardized Control Scale**:
   - Standardize all search inputs, selects, and filter triggers to a unified 40px height on desktop with 44px minimum tap targets on mobile.
3. **Unified Semantic Badge & Status Matrix**:
   - Consolidate all badge styles into strict design tokens in `index.css`, replacing ad-hoc Tailwind color combinations (`bg-amber-50`, `bg-emerald-50`) with semantic CSS tokens.
4. **Refined Clinic Warmth**:
   - Channel clinic warmth through subtle tactile details (warm hairlines, thoughtful typography, friendly empty states) rather than repetitive emojis in operational headings.
