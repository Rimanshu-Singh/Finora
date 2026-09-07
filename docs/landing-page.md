# Landing page handoff

The public page is `/`; the unchanged Overview component now lives at `/dashboard`. Application navigation and existing route tests point to `/dashboard`. Clerk protects the dashboard as before. The landing navigation and primary CTAs use Clerk's existing user state to choose `/sign-up` or `/dashboard`; sign-in links use `/sign-in`.

## Structure

`app/page.tsx`: hero, sample dashboard reveal, introduction, feature stories, habits, capabilities, security, final CTA, footer. `app/landing.css` contains styles scoped to `.landing`; no dashboard styles or global design tokens were changed.

`components/landing/`: brand.tsx (existing wordmark and flow motif), navigation.tsx (responsive navigation, auth CTA, reveal observer), hero-product-preview.tsx (sample dashboard, real SpendingRhythmChart and BudgetProgress), product-visual.tsx (replaceable media frame), sections.tsx (editorial sections).

`lib/landing/content.ts`: navigation and capability copy. Major story copy is in `sections.tsx`.

## Replace product visuals

Four `ProductVisualPlaceholder` instances in `components/landing/sections.tsx`: QUICK ENTRY, SPENDING RHYTHM, DAILY CLARITY, MONEY HABITS. They currently render illustrative component previews. Set `image={{src: '/images/quick-entry-light.webp', darkSrc: '/images/quick-entry-dark.webp', alt: 'Descriptive screenshot text'}}` on a frame to replace its preview; images take precedence over children. Add files to `public/images/`. `video='/videos/demo.mp4'` supports a controlled video with no autoplay; `children` supports custom components. `aspectRatio`, `title`, `description`, and `variant` control the frame. Images use Next Image with responsive sizes and default lazy loading.

## Design and behavior

Existing monochrome tokens, Arial, brand mark, and ThemeToggle are reused. Silver-gray atmospheric lighting and a fine SVG flow line adapt to the existing theme. Mobile recomposes the dashboard by removing its sidebar, stacking spending and budget, and retaining the real chart. Editorial stories put copy first on mobile; tablet has narrower spacing. Scroll reveals use IntersectionObserver, 650ms opacity/translation, and respect reduced motion. Without JavaScript, content remains visible.

All dashboard figures are explicitly sample data. Safe-to-spend and money-score sections are marked upcoming concepts, since these capabilities do not exist yet. No customer counts, endorsements, or certifications are invented.

## Before deployment

Set `NEXT_PUBLIC_SITE_URL` to the actual canonical production origin; metadata uses it for the canonical URL. No domain is invented. Supply approved Privacy, Terms, and Contact content/destinations; until then the footer links to the factual security/privacy section. Add final product screenshots when ready. The existing shared root provider still loads the ledger and Clerk; this implementation does not restructure that architecture. No performance scores or Core Web Vitals are claimed without deployment measurement.
