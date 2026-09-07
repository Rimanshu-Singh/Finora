# Hero touch refinement

The hand is an absolute decorative layer inside the isolated hero composition (z-index 0). Headline, eyebrow, supporting copy, and CTAs remain at z-index 2. Fixed responsive top spacing preserves the text layout independently of the image. Desktop artwork is 440px wide, tablet 390px, and mobile 300px; transparent margins make the visible hand much smaller than this canvas.

`components/landing/hero-brand-visual.tsx` loads `public/images/landing/finora-touch.webp` through Next Image. The 900px alpha WebP is 81,928 bytes. The mark uses the exact three paths from `app/icon.svg`, overlaid on the blank tile, rather than asking a generative model to reproduce the logo.

`app/landing-cinematic.css` contains the hero layer rules. The alpha mask fades from full opacity at the tile to 32% through the upper hand, then zero before the wrist. A separate background-colored vignette darkens the palm in dark mode and blends it into pearl in light mode. Mobile uses a shorter fade. The artwork adds no animation, events, or client-side JavaScript and cannot intercept clicks.

Asset generated with the built-in imagegen tool. Original retained as `public/images/landing/finora-touch-source.png`. Previous holding-pose assets are no longer referenced by the page.

Generation prompt:

Use case: product-mockup. Create a single transparent-background photographic asset for a premium app hero. Square image with genuine alpha, no background rectangle. A realistic neutral adult hand viewed from back, index finger extended straight upward gently touching the bottom edge of a single blank glowing app tile, other fingers naturally curled below, like activating a touch interface. NOT holding or pinching the tile. Tile front-facing upright, softly rounded square, centered at x50% y23%, width30% height30% of canvas, blank dark translucent midnight-blue optical glass face, luminous thin icy cyan-white edge, subtle violet edge on right, clean center with NO mark/text/logo (exact brand mark will be added in code). Fingertip meets tile bottom center at x50% y38%. Hand descends diagonally slightly right, occupies middle 40% width; only fingertip and upper knuckles softly revealed by cool blue bounce light. Hand mostly in deep shadow with low exposure, restrained natural skin detail, no jewelry, no nail styling. Wrist fades softly into actual transparency at bottom. Strong but controlled blue/icy glow focused around tile and fingertip, not whole hand. Premium cinematic photographic softness, realistic correct anatomy, elegant touch gesture. No warm hues, no orange/red/green, no extra icons, no text, no sci-fi clutter. Keep tile centered and unrotated, hand quiet and dark.

Validation: production build passes, changed component lint passes, browser image decoding and console checks pass. No horizontal overflow at 320, 390, 768, and 1440px. Desktop and mobile screenshots visually reviewed. Latest captures live in `test-results/touch-refinement/`.
