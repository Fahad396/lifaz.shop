---
name: mobile-first-ui
description: Core standards and rules for optimizing all UI layouts, typography, line-heights, touch targets, and components for mobile and phone users on LIFAZ.
---

# Mobile-First UI & Phone Optimization Guidelines

## 1. Typography & Text Collision Prevention
- **Never use ultra-tight line heights (`leading-[0.9]`, `leading-none`) on multi-line mobile text**: On screens <= 640px, titles will wrap into multiple lines. Always use `leading-[1.1]` to `leading-[1.15]` on mobile, scaling up to `sm:leading-[0.95]` on large screens.
- **Use `text-balance` & `break-words`**: Ensure headlines and subtitles balance naturally without awkward single-word lines or overflows.
- **Responsive Font Scales**:
  - Hero Display: `text-3xl sm:text-5xl md:text-7xl lg:text-8xl` (never start at `text-5xl` on mobile).
  - Section Headlines: `text-2xl sm:text-4xl md:text-5xl`.
  - Body / Subtitles: `text-xs sm:text-sm`.

## 2. Header & Absolute Position Safety
- **No overlapping elements**: In headers with centered logos (`absolute left-1/2 -translate-x-1/2`), ensure left and right action bars have defined max-widths, truncate or use icons on narrow screens (< 390px), and avoid collisions.
- **Safe tap targets**: Minimum 44x44px touch area for interactive buttons, menu toggles, and shopping bag triggers.

## 3. Padding, Margins & Viewport Safety
- **Hero & Fullscreen Sections**: Use `min-h-[100svh]` or `min-h-[600px]`, with generous bottom padding (`pb-16 sm:pb-24`) so content is never hidden behind mobile navigation bars or overlapping controls.
- **Grid Layouts**: Default to 1-column or 2-column with small gap (`gap-3` or `gap-4`) on mobile, transitioning to `sm:grid-cols-2 lg:grid-cols-4`.
- **Horizontal Overflow**: Always verify `overflow-hidden` or `overflow-x-clip` on parent containers to prevent horizontal jitter on swipe.
