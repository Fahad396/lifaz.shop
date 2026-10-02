---
name: modern-web-guidance
description: Best practices for modern web development in Next.js 15, React 19, Framer Motion, and Tailwind CSS v4 for the LIFAZ luxury atelier store.
---

# Modern Web Guidance for LIFAZ

## 1. UI & Animations
- Use `framer-motion` for all drawer slide-ins, modal overlays, and lookbook transitions.
- Use static transforms (`x`, `y`, `scale`, `opacity`) with custom cubic-bezier `[0.22, 1, 0.36, 1]`.
- Always wrap drawers in `createPortal(..., document.body)` so `backdrop-blur` from `<header>` does not clip full-screen drawers.

## 2. High-Fashion Editorial Aesthetics
- Clean typography hierarchy (monumental uppercase titles, tracking `[0.2em]`, italic serif sub-captions).
- High contrast dark/light themes.
- Responsive design from mobile (single column) to large desktop (split-panel lookbook).
