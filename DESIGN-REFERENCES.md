# Design References & Strategic Direction — Dr. Meow

Date: 2026-09-15  
Source Library: `C:\Users\LOQ\.design-md\design-md`  
Status: Phase 2 Grounded & Finalized (Awaiting Approval)  
Purpose: Grounded design specifications derived from concrete industry references in `C:\Users\LOQ\.design-md\design-md` solving the weaknesses identified in `DESIGN-AUDIT.md`.

---

## 1. Reference Selection Overview

We reviewed the reference library at `C:\Users\LOQ\.design-md\design-md` and selected four precise design systems that directly address Dr. Meow's audit findings:
1. **Cal.com (`cal/DESIGN.md`)**: Operational scheduling, monolithic metric bars, and strict semantic status discipline.
2. **Intercom (`intercom/DESIGN.md`)**: Warm daylight cream canvas (`#FAF8F5`), charcoal type, and single confident energetic orange CTA (`#FF5600`).
3. **Linear (`linear.app/DESIGN.md`)**: Triage hierarchy ("Attention Stream") and ergonomic touch/interaction density.
4. **Stripe (`stripe/DESIGN.md`)**: Tabular financial rigor, tabular-numbers (`tnum`), and master-detail responsive behavior.

---

## 2. Grounded Reference Analyses

### Reference 1: Cal.com
**Path:** `C:\Users\LOQ\.design-md\design-md\cal\DESIGN.md`  
**System Profile:** Clean calendar & scheduling software with generous whitespace, hairline-separated sections, strict status badges, and 12px card radii.

- **Problems It Solves in Dr. Meow:**
  - **Card Fatigue:** Currently, Dr. Meow uses 4 separate floating boxes for metrics. Cal.com consolidates these into a single contiguous surface divided by hairlines (`border-hairline`).
  - **Status Inconsistency:** Replaces random Tailwind background/text classes with Cal.com's strict semantic badge discipline (`success`, `warning`, `error`, `info`) with consistent 12px/600-weight typography and 4px 10px pill geometry.
  - **Filter Control Drift:** Standardizes all search inputs, dropdown triggers, and buttons to a unified 40px height.
- **What We Borrow:**
  - Contiguous metric strip with internal dividers (`divide-x divide-hairline`).
  - Status badge token discipline: `badge-ontime`, `badge-late`, `badge-absent`, `badge-pending`.
  - Standardized control scale: `h-10` (40px) desktop controls with clean `border-hairline`.
- **What We Explicitly Reject:**
  - Stark monochromatic black & white ground (we preserve Dr. Meow's warm daylight cream canvas).
  - Heavy developer-oriented minimalism that lacks warmth for pet owners and clinic staff.

---

### Reference 2: Intercom
**Path:** `C:\Users\LOQ\.design-md\design-md\intercom\DESIGN.md`  
**System Profile:** Warm daylight editorial canvas built around soft cream-white ground (`#f5f1ec` / `#FAF8F5`), charcoal typography (`#111111` / `#1D262C`), and a single confident Fin Orange (`#ff5600`) reserved strictly for brand action.

- **Problems It Solves in Dr. Meow:**
  - **Sterile Feeling vs Emoji Clutter:** Solves the tension between clinical authority and pet friendliness. Intercom achieves warmth through humane microcopy, soft warm ground, and thin hairline borders rather than childish emojis in every table header.
  - **Accent Saturation:** Currently, orange and amber are sprayed across cards, banners, and borders. Intercom demonstrates how reserving `#FF5600` for primary interactive actions and key status badges increases visual power.
- **What We Borrow:**
  - Daylight warm ground (`--canvas: #FAF8F5`), elevated white tiles (`--surface-card: #FFFFFF`), and warm hairlines (`--hairline: #E2DDD5`).
  - Confident, singular brand orange CTA (`--brand-orange: #FF5600`) for primary operational actions (e.g. "Check-In Kucing Baru", "Clock In", "Bayar").
  - Respectful, empathetic microcopy for customer touchpoints (Grooming Live Tracker, WhatsApp messages).
- **What We Explicitly Reject:**
  - Consumer chat widgets and floating bubble launchers.
  - Multi-tiered marketing cards and illustrative gradients.

---

### Reference 3: Linear
**Path:** `C:\Users\LOQ\.design-md\design-md\linear.app\DESIGN.md`  
**System Profile:** Software-craft operational interface with focused attention triage, unified focus rings, and strict information hierarchy.

- **Problems It Solves in Dr. Meow:**
  - **Flat Dashboard Hierarchy:** In Dr. Meow's main dashboard, 9 cards compete equally for attention. Linear's "Triage" pattern organizes items by urgency: separating "Action Needed Today" (unreported cats, pending kasbon, absent staff) from static monitoring metrics.
  - **Mobile Touch Inefficiencies:** Table action icons in Dr. Meow were frequently rendered at `w-7 h-7` (sub-44px). Linear demonstrates compact visual rendering backed by full touch hit envelopes.
- **What We Borrow:**
  - "Attention Stream" pattern on Admin and POS Dashboards: high-contrast rows that clearly signal pending actions.
  - Generous interactive hit targets (`min-h-[44px]` touch targets) while maintaining compact visual iconography.
  - Cohesive keyboard and focus indicators (`outline-ring/50`, `focus-visible:ring-2`).
- **What We Explicitly Reject:**
  - Deep dark-mode-first neon aesthetic (`#010102` ground and `#5e6ad2` lavender-blue).
  - High-abstraction nested views that require multiple keyboard chords.

---

### Reference 4: Stripe Dashboard
**Path:** `C:\Users\LOQ\.design-md\design-md\stripe\DESIGN.md`  
**System Profile:** Financial-infrastructure interface with strict tabular data discipline, right-aligned monetary values, tabular figures (`fontFeature: tnum`), and clean master-detail inspection.

- **Problems It Solves in Dr. Meow:**
  - **Tabular Inconsistency in Payroll & Kasbon:** Stripe's tabular layout provides exact alignment rules: text left-aligned, status chips centered, currency and timestamps strictly right-aligned with `tabular-nums` and `font-mono`.
  - **Awkward Payroll Side Panel:** In `managePayroll.tsx`, a static right panel crowds the screen on tablet/laptop viewports. Stripe solves this with responsive drawer/dialog inspection panels.
- **What We Borrow:**
  - Column alignment discipline across all tables (Attendance, Payroll, Kasbon, POS).
  - Monospace tabular figures for currency (IDR) and time tracking (`font-mono tabular-nums`).
  - Refined table headers: 11px uppercase typography with tracking (`tracking-wider text-ink-muted`) and clean hairline borders.
- **What We Explicitly Reject:**
  - Complex enterprise billing multi-level navigation.
  - Dense 11px body text that strains visibility on tablet screens in clinic lighting.

---

## 3. Synthesis Matrix

| Design Dimension | Cal.com (`cal/`) | Intercom (`intercom/`) | Linear (`linear.app/`) | Stripe (`stripe/`) | Dr. Meow Application |
|---|---|---|---|---|---|
| **Canvas & Ground** | White | **Warm Cream (`#FAF8F5`)** | Deep Dark (`#010102`) | Soft Gray-White | **Warm Cream Canvas (`#FAF8F5`) with crisp white tiles** |
| **Accent Voltage** | Blue `#3b82f6` | **Fin Orange (`#ff5600`)** | Lavender `#5e6ad2` | Indigo `#533afd` | **Brand Orange (`#FF5600`) reserved for key CTAs** |
| **Metrics Layout** | **Unified Strip** | Floating Tiles | Compact Grids | Stat Blocks | **Unified Metric Strip with hairline dividers** |
| **Hierarchy** | Chronological | Editorial | **Triage / Attention** | Summary First | **Linear Triage Stream for urgent clinic actions** |
| **Data Tables** | Calendar rows | Minimal | List views | **Tabular Alignment** | **Stripe-grade tabular numbers & right-aligned currency** |
| **Controls** | **40px standard** | Standard inputs | Micro-inputs | Dense inputs | **Standardized 40px desktop / 44px mobile touch controls** |
