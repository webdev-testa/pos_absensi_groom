# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Supabase (`@supabase/supabase-js`), React Router v7, TanStack Query, Radix UI, Vite PWA (`vite-plugin-pwa`), Lucide Icons.

## Users

Primary users are Dr. Meow pet clinic and veterinary staff (veterinarians, pet groomers, assistants, and administrative staff) needing fast mobile attendance verification, shift tracking, salary advance requests (kasbon), and admin personnel overseeing clinic operations and payroll.

## Product Purpose

Absen Dr. Meow is a modern mobile-first Progressive Web App (PWA) and admin dashboard for clinic attendance and HR operations. It eliminates manual time-sheet errors, prevents attendance fraud via geolocation verification, streamlines employee kasbon (salary advance) requests, and automates payroll compilation for pet clinic staff.

## Positioning

A tailored, high-reliability clinic attendance & HR management system built specifically for veterinary clinic workflows — combining GPS-verified quick clock-in/out on mobile with rich admin oversight for attendance, kasbon approval, and payroll generation.

## Operating Context

- **Staff (Mobile PWA):** Daily clock-in/out on arrival at clinic locations using GPS location verification, viewing work shift schedules, requesting kasbon (salary advance), and checking monthly attendance history.
- **Admin (Desktop/Tablet Dashboard):** Overseeing real-time staff attendance, verifying GPS logs, reviewing & approving kasbon applications, managing employee records, and calculating/exporting monthly payroll reports.

## Capabilities and Constraints

- **GPS Geolocation Verification:** Check-in and check-out logic verified against clinic coordinate radii.
- **Kasbon Management:** Employee salary advance request workflow with admin review and status tracking.
- **Payroll Automation:** Calculation of monthly work hours, attendance deductions/bonuses, kasbon deductions, and export functionality (Excel/XLSX).
- **PWA & Offline Readiness:** Service worker caching for fast loading on mobile clinic devices.
- **Supabase Backend:** Database, authentication, and storage provided via Supabase integration.

## Brand Commitments

- **Name:** Absen Dr. Meow
- **Identity & Aesthetics:** Clean, warm, approachable yet professional veterinary clinic vibe, incorporating Figma-inspired editorial typography, structured color-block accents, pill-shaped CTAs, and clear contrast.

## Evidence on Hand

- Runnable Vite + React 19 + TypeScript codebase in `src/` (`pages/admin/`, `pages/login/`, `components/`, `router.tsx`).
- Supabase integration configured (`@supabase/supabase-js`, `supabase/`).
- Design specification file fetched from global library: [`DESIGN.md`](file:///C:/Users/LGSM123/Documents/Absen_Dr.Meow/DESIGN.md).

## Product Principles

1. **Frictionless Mobile Clock-in:** Clock-in should take under 3 seconds with immediate feedback on location accuracy and shift timing.
2. **Transparent Financial Workflows:** Clear visibility for employees on attendance history, approved kasbon, and expected payroll payout.
3. **Robust Admin Oversight:** Comprehensive grid views and filterable data tables for managing staff, verifying geolocation logs, approving requests, and exporting clean payroll sheets.
4. **Resilient PWA Experience:** Reliable performance on mobile browser viewports with responsive scaling across smartphones, tablets, and desktop displays.

## Accessibility & Inclusion

- High contrast text on all interactive surfaces.
- Touch-friendly tap targets (minimum 44px) for mobile clock-in buttons and form inputs.
- Clear semantic HTML structure with ARIA labels on modal dialogs and control buttons.
