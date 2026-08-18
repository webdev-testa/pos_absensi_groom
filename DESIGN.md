---
version: 1.0.0
name: DrMeow-Cal-Intercom-Blend
description: "A tailored blend of Cal.com's high-speed scheduling scannability and strict semantic status discipline with Intercom's warm daylight cream canvas (#FAF8F5 / #F5F1EC), crisp charcoal typography (#1D262C), and approachable pet-clinic personality. Built for veterinary clinic operations: lightning-fast mobile GPS clock-in/out, clear shift and kasbon tracking, and high-density admin tables for real-time attendance and payroll."

colors:
  primary: "#0C1D2A"
  primary-hover: "#152E42"
  primary-active: "#08141D"
  on-primary: "#FFFFFF"
  
  brand-accent: "#F5A940"
  brand-accent-hover: "#E0932C"
  brand-orange: "#FF5600"
  brand-cyan: "#4DC8F5"
  
  ink: "#1D262C"
  ink-muted: "#5C6B73"
  ink-subtle: "#8A9BA8"
  ink-faint: "#B8C5CE"
  
  canvas: "#FAF8F5"
  canvas-alt: "#F5F1EC"
  surface-card: "#FFFFFF"
  surface-soft: "#F3EFE9"
  surface-muted: "#EBE6DE"
  surface-dark: "#0C1D2A"
  surface-dark-elevated: "#152431"
  
  hairline: "#E2DDD5"
  hairline-soft: "#EBE7E1"
  hairline-strong: "#C8C2B8"
  
  semantic-success: "#10B981"
  semantic-success-bg: "#E6F7F0"
  semantic-success-border: "#A7F3D0"
  semantic-success-text: "#065F46"
  
  semantic-warning: "#F59E0B"
  semantic-warning-bg: "#FEF3C7"
  semantic-warning-border: "#FDE68A"
  semantic-warning-text: "#92400E"
  
  semantic-error: "#EF4444"
  semantic-error-deep: "#C84B2F"
  semantic-error-bg: "#FEE2E2"
  semantic-error-border: "#FECACA"
  semantic-error-text: "#991B1B"
  
  semantic-info: "#3B82F6"
  semantic-info-bg: "#EFF6FF"
  semantic-info-border: "#BFDBFE"
  semantic-info-text: "#1E40AF"
  
  semantic-payroll: "#8B5CF6"
  semantic-payroll-bg: "#F5F3FF"
  semantic-payroll-border: "#DDD6FE"
  semantic-payroll-text: "#5B21B6"

typography:
  headline-xl:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.5px
  headline-lg:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.3px
  headline-md:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.2px
  headline-sm:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  body-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.2px
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.2px

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px

shadows:
  card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)"
  card-hover: "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  dropdown: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)"
  modal: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)"

components:
  clock-in-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    fontFamily: "{typography.headline-md.fontFamily}"
    fontSize: "18px"
    fontWeight: "700"
    rounded: "{rounded.pill}"
    height: "56px"
    minTouchTarget: "44px"
    activeScale: "scale(0.98)"

  card:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.hairline}"
    borderWidth: "1px"
    rounded: "{rounded.lg}"
    shadow: "{shadows.card}"
    padding: "20px"

  badge-ontime:
    backgroundColor: "{colors.semantic-success-bg}"
    borderColor: "{colors.semantic-success-border}"
    textColor: "{colors.semantic-success-text}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    fontSize: "12px"
    fontWeight: "600"

  badge-late:
    backgroundColor: "{colors.semantic-warning-bg}"
    borderColor: "{colors.semantic-warning-border}"
    textColor: "{colors.semantic-warning-text}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    fontSize: "12px"
    fontWeight: "600"

  badge-absent:
    backgroundColor: "{colors.semantic-error-bg}"
    borderColor: "{colors.semantic-error-border}"
    textColor: "{colors.semantic-error-text}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    fontSize: "12px"
    fontWeight: "600"

  badge-radius-valid:
    backgroundColor: "{colors.semantic-info-bg}"
    borderColor: "{colors.semantic-info-border}"
    textColor: "{colors.semantic-info-text}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    fontSize: "12px"
    fontWeight: "600"

  table-header:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink-muted}"
    fontFamily: "{typography.caption.fontFamily}"
    fontSize: "12px"
    fontWeight: "600"
    textTransform: "uppercase"
    letterSpacing: "0.5px"
    borderColor: "{colors.hairline}"

  table-row:
    borderColor: "{colors.hairline-soft}"
    hoverBackground: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    fontSize: "13.5px"

principles:
  1. "Warm Daylight Canvas: Avoid harsh sterile cold whites or pitch-black darkness. Use warm cream daylight ground (#FAF8F5) with crisp white (#FFFFFF) elevated tiles."
  2. "Rapid Operational Scannability: Cal.com-grade time and status clarity. Statuses (On-time, Late, Absent, Pending, Approved) must be instantly recognizable via semantic badges."
  3. "Mobile Clock-in Ergonomics: Minimum 44px touch targets, full-pill primary CTAs, GPS radius status indicator, and instant visual validation under 3 seconds."
  4. "Admin Density & Financial Rigor: Monospace formatting for timestamps, coordinates, and Indonesian Rupiah (IDR) currency amounts. Clear table structures for kasbon and payroll export."
  5. "Approachable Veterinary Warmth: Friendly, humane, and modern without sacrificing operational authority or financial accuracy."
