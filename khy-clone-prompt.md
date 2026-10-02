# Detailed Prompt: Build a Clone of KHY.com

## Project Overview

Build a pixel-perfect, fully functional clone of **khy.com**, a direct-to-consumer fashion e-commerce website by Kylie Jenner. The site must mirror the design, UX, conversion mechanics, and technical architecture of the original. The goal is to create a website that is indistinguishable from khy.com in terms of visual design, user experience, and conversion performance.

## Tech Stack & Infrastructure

| Component | Specification |
|-----------|---------------|
| **Platform** | Shopify Plus (preferred) with a heavily customized Dawn theme. Alternatively, a headless setup with Next.js (React) + Shopify Storefront API. |
| **Base Theme** | Shopify Dawn (customized extensively) |
| **CDN** | Cloudflare |
| **Hosting** | Shopify Plus hosting (if Shopify) or Vercel/Netlify (if headless) |
| **Version Control** | Git |
| **Analytics** | Google Analytics 4, Shopify Analytics, Google Ads conversion tracking |
| **Marketing** | Google Ads, Meta Ads, Klaviyo (email/SMS), social media integration |

## Design System

### Aesthetic
- **Editorial, minimal, cinematic** — inspired by high-fashion print magazines.
- Treat the website as a **digital editorial magazine**, not just a storefront.
- **Intentional text placement**: asymmetric, staggered offsets, varied font sizes.
- **Editorial white space**: clean, generous negative space to elevate product photography.
- **Magazine-like scroll**: browsing experience paced editorially, not transactionally.
- **Cinematic product presentation**: immersive imagery, deliberate aspect ratios, smooth transitions.

### Typography
- Use a clean, modern sans-serif with editorial variations.
- Asymmetric text placement, staggered offsets, varied font sizes.
- **Extract exact fonts from khy.com using browser dev tools** (Inspect → Computed → Font-family).

### Color Palette
- Neutral, clean white base.
- Let product photography dominate.
- **Extract exact colors from khy.com using browser dev tools** (Inspect → Computed → Color).

### Imagery
- High-fashion campaign photography featuring the founder and models.
- Cinematic aspect ratios, immersive full-bleed images.
- Aspirational yet attainable settings.

### Motion
- Smooth, connected interactions.
- Scroll-triggered animations for product reveals and information shifts.
- Parallax effects.
- Clean transitions.

### Layout
- Magazine-style scroll.
- Generous white space.
- Asymmetric compositions.
- **Mosaic sections** with independently controlled image scale, positioning, text size, and spacing.

## Component Specifications

### 1. Sticky Add-to-Cart Bar
- Visible on PDP at all scroll positions.
- Allows size and color changes without scrolling back.
- Perfectly designed to reduce friction at the moment of highest intent.

### 2. Animated Sizing Guide
- Clean animations that shift information based on product category (e.g., tops, bottoms, swimwear).
- Addresses a key drop-off point in the purchase journey.

### 3. Unified Product Hierarchy
- Product name, fabric, color, and size consolidated in a single framework.
- Reduces cognitive load and decision fatigue.

### 4. PLP Editorial Pacing
- Collections presented as curated spreads, not dense grids.
- Minimal sticky menu for view mode selection (grid, list, editorial).
- Custom filtering and navigation logic.

### 5. Mosaic Section Builder (Custom)
- Proprietary custom Shopify section.
- Settings for image scale, positioning, text size, and spacing — all independently controlled.
- Allows the brand team to art direct without touching code.
- Creates completely different page feels from the same backend.

## Page-by-Page Specifications

### Homepage
- Full-bleed campaign hero with cinematic imagery.
- Editorial sections with asymmetric text and generous white space.
- Mosaic sections showcasing collections and products.
- Featured product carousels.
- Newsletter signup with early access incentive.
- Footer with navigation, social links, payment icons.

### Product Listing Pages (PLPs)
- Editorial pacing, not dense grids.
- Custom filtering (category, size, color, price).
- Sticky menu for view mode selection.
- Product cards with hover effects (quick add, quick view).
- Pagination or infinite scroll.

### Product Detail Pages (PDPs)
- Unified product hierarchy (name, fabric, color, size in one framework).
- High-resolution image gallery with zoom.
- Sticky add-to-cart bar with variant selection.
- Animated sizing guide.
- Product description, fabric details, care instructions.
- "Complete the look" recommendations.
- Customer reviews.
- Back-in-stock notification.
- Share buttons.

### About/Brand Page
- Founder story (Kylie Jenner as Creative Director).
- Brand mission and values.
- Editorial imagery.
- Timeline of collections.

### Cart & Checkout
- Shopify's native cart and checkout (customized to match brand).
- Express checkout options (Shop Pay, Apple Pay, Google Pay, PayPal).
- Abandoned cart recovery.
- Order tracking.

### Account
- Order history.
- Wishlist.
- Address book.
- Loyalty program (if applicable).

### Blog/Editorial
- Collection narratives.
- Campaign behind-the-scenes.
- Style guides.

### Search
- Predictive search.
- Filters and sorting.

## UX & Conversion Mechanics

### Scarcity & Urgency
- **Limited inventory** per drop — sell-outs are common and celebrated.
- **Early access** restricted to community members before public launch.
- **Drop model** — collections announced via brief social media campaigns.
- **"Sell before launch"** — demand generated before product is available.

### Community-Driven Conversion
- **Direct-to-Community** model — founder speaks directly to followers.
- **Social-first announcements** via Kylie's personal channels.
- **Feedback-driven iteration** — website changes based on consumer feedback.
- **Community identity** — empowering customers to embrace every side of their style.

### Conversion Funnel Optimisation
- **Seamless journey** from discovery to checkout.
- **Google Ads & PPC** — conversion tracking, ROAS optimization.
- **Sticky add-to-cart** — reduces friction at highest intent.
- **Simplified sizing** — clean animations for relevant information.
- **Unified product information** — reduces cognitive load.

### Pricing & Positioning
- **Price Range:** $70–$470 USD (swimwear $36–$78, apparel $70–$470).
- **Size Range:** XXS to 4X — inclusive sizing is a core brand value.
- **Positioning:** "Attainable, desirable fashion" — blending luxury with everyday style.
- **Value Proposition:** Investment pieces at affordable prices.

### Retention & Lifetime Value
- **Wardrobe-first strategy** — foundational pieces designed with intention, made to last.
- **Curated assortment** — pieces you come back to over and over again.
- **Seasonal fluidity** — products designed to transition across seasons.

## Content & Campaign Strategy

### Collection Narrative
Each collection tells a distinct story:
- **Born in LA Collection** — jersey layered maxi dress, embellished T-shirts, denim, fleeces.
- **Dear Summer, Love Khy** — summer essentials and new designs.
- **Vacation Shop / Swimwear** — bikinis, one-piece swimsuits, and cover-ups.

### Campaign Integration
- Corresponding campaign imagery starring Kylie Jenner.
- Refreshed social media presence aligned with creative direction.
- Website editorial content treating homepage as campaign landing page.

### Founder-Led Storytelling
- Kylie Jenner as Creative Director and face of campaigns.
- Personal involvement is inseparable from brand appeal.

## Marketing & Analytics

| Channel | Implementation |
|---------|----------------|
| **Google Ads** | Managed PPC campaigns with conversion tracking. |
| **SEO** | Keyword research, on-page optimization, blog content. |
| **Social Media** | Instagram, TikTok, YouTube integration. |
| **Email/SMS** | Klaviyo for flows and campaigns. |
| **Analytics** | GA4, Shopify Analytics, heatmaps (Hotjar). |

## Performance & Responsiveness

- **Mobile-first design** — refined across both desktop and mobile.
- **Fast load times** — Core Web Vitals optimization.
- **Lazy loading images**.
- **CDN via Cloudflare**.
- **Responsive across all devices** — performance integrity and brand alignment under scale.

## Deliverables

- Fully functional Shopify Plus store (or headless equivalent).
- Custom theme with all specified components.
- Integrated marketing and analytics.
- Content population for launch collections.
- Documentation for maintenance.

## Acceptance Criteria

- **Visual design** matches khy.com within 95% accuracy (pixel-perfect).
- **All UX and conversion mechanics** function as described.
- **Site is fully responsive** and performant.
- **Checkout flow** is seamless and matches Shopify best practices.
- **Marketing and analytics** are properly configured.

## References

- **Live site:** https://www.khy.com/
- **Design agency:** Vaan (Shopify Platinum Agency)
- **Launch infrastructure:** Presidio
- **Brand positioning:** Chandelier
- **PPC management:** Capconvert

## Instructions for the Developer/AI

1. **Analyze khy.com** using browser dev tools to extract exact design tokens (colors, fonts, spacing, breakpoints).
2. **Replicate the exact design** — do not approximate. Use the same fonts, colors, and spacing.
3. **Implement all components** as specified above.
4. **Ensure the site is fully responsive** and matches the mobile experience of khy.com.
5. **Integrate Shopify Plus** with the custom theme, or build a headless solution with Next.js + Shopify Storefront API.
6. **Configure marketing and analytics** — Google Ads, GA4, Klaviyo.
7. **Test the checkout flow** thoroughly.
8. **Optimize for performance** — Core Web Vitals.
9. **Populate content** for launch collections (Born in LA, Dear Summer Love Khy, Vacation Shop).
10. **Deliver a fully functional website** that is indistinguishable from khy.com.

*This prompt is based on publicly available information about khy.com and its design, business model, and conversion strategies as of October 2026.*
