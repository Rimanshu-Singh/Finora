import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import {
  Navbar,
  StartLink,
  RevealObserver,
} from "@/components/landing/navigation";
import { Flow } from "@/components/landing/brand";
import { HeroProductPreview } from "@/components/landing/hero-product-preview";
import {
  FeatureStories,
  HabitsSection,
  CapabilitySection,
  SecuritySection,
  FinalCta,
  Footer,
} from "@/components/landing/sections";
import { AmbientGlow } from "@/components/landing/effects/ambient-glow";
import { GrainOverlay } from "@/components/landing/effects/grain-overlay";
import { HeroBrandVisual } from "@/components/landing/hero-brand-visual";
import "./landing.css";
import "./landing-cinematic.css";
const title = "Finora — Personal finance, thoughtfully.";
const description =
  "Understand your spending, manage budgets and build everyday money awareness with Finora. A calm, considered space for your financial life.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? {
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
        alternates: { canonical: "/" },
      }
    : {}),
  openGraph: { title, description, type: "website", siteName: "Finora" },
  twitter: { card: "summary_large_image", title, description },
};
export default function Page() {
  return (
    <div className="landing">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="landing-main">
        <section className="landing-hero">
          <div className="hero-atmosphere" aria-hidden="true" />
          <AmbientGlow variant="mixed" className="hero-light-field" />
          <GrainOverlay />
          <div className="hero-dust" aria-hidden="true" />
          <Flow />
          <div className="hero-copy">
            <HeroBrandVisual />
            <span className="hero-eyebrow">
              <span />
              PERSONAL FINANCE, THOUGHTFULLY.
            </span>
            <h1>
              Your money.
              <br />
              <span>Finally clear.</span>
            </h1>
            <p>
              See where it goes. Know what’s next.
              <br />
              One calm space for your spending, budgets, and everyday life.
            </p>
            <div className="landing-cta-row">
              <StartLink />
              <a href="#product" className="landing-button landing-secondary">
                See how it works <ArrowDown size={15} />
              </a>
            </div>
            <span className="hero-note">
              A little awareness changes everything.
            </span>
          </div>
          <div className="hero-product-wrap" id="product">
            <div className="product-caption">
              <span>
                <span className="status-dot" /> A CLEARER VIEW OF YOUR EVERYDAY
              </span>
              <span>
                MEET YOUR PERSONAL FINORA <ArrowUpRight size={13} />
              </span>
            </div>
            <HeroProductPreview />
          </div>
        </section>
        <section className="landing-intro landing-container landing-reveal">
          <span className="landing-kicker">
            LESS SCATTERED. MORE CONNECTED.
          </span>
          <h2>
            Everything about your money.
            <br />
            <span>Finally in the same place.</span>
          </h2>
          <p>
            The coffee. The bills. The plans you’re making.
            <br />
            Finora brings the details together, so you can see the whole
            picture.
          </p>
          <div className="intro-index">
            <span>01 / Capture effortlessly</span>
            <span>02 / Understand your rhythm</span>
            <span>03 / Make room for better</span>
          </div>
        </section>
        <FeatureStories />
        <HabitsSection />
        <CapabilitySection />
        <SecuritySection />
        <FinalCta />
      </main>
      <Footer />
      <RevealObserver />
    </div>
  );
}
