import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { ProductVisualPlaceholder } from "./product-visual";
import { RhythmPreview } from "./hero-product-preview";
import { capabilities } from "@/lib/landing/content";
import { Brand, Flow } from "./brand";
import { StartLink } from "./navigation";
import Link from "next/link";
import { QuickEntryDemo } from "./quick-entry-demo";
import { AmbientGlow } from "./effects/ambient-glow";
import { GrainOverlay } from "./effects/grain-overlay";
import { LightBeam } from "./effects/light-beam";
export function FeatureStories() {
  return (
    <div className="landing-container" id="features">
      <section
        className="landing-story story-quick landing-reveal"
        id="how-it-works"
      >
        <ProductVisualPlaceholder
          title="QUICK ENTRY"
          description="Example of an everyday sentence organized into expense details"
          variant="illuminated"
        >
          <QuickEntryDemo />
        </ProductVisualPlaceholder>
        <div className="story-copy">
          <span className="landing-kicker">01 / A SMALLER TASK</span>
          <h2>
            Just say
            <br />
            what you spent.
          </h2>
          <p>
            Coffee, groceries, the ride home. Add an expense the way you’d tell
            a friend. Finora fills in the details, ready for your review.
          </p>
          <span className="story-footnote">
            A little intelligence. A lot less effort.
          </span>
          <Link href="/sign-up" className="landing-text-link">
            Try Quick Entry <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="landing-story landing-story-reverse story-rhythm landing-reveal">
        <div className="story-copy">
          <span className="landing-kicker">02 / THE BIGGER PICTURE</span>
          <h2>
            See the pattern.
            <br />
            Not just the payment.
          </h2>
          <p>
            The little things add up. See your spending rhythm, compare your
            days, and understand where your money actually goes.
          </p>
          <span className="story-footnote">
            From a list of expenses to a moment of clarity.
          </span>
        </div>
        <ProductVisualPlaceholder
          title="SPENDING RHYTHM"
          description="Real Finora spending rhythm chart with illustrative expenses"
        >
          <div className="story-chart">
            <RhythmPreview />
            <div className="demo-insight">
              <span>↗</span>
              <p>
                A week in perspective.
                <small>Your daily average puts each expense in context.</small>
              </p>
            </div>
          </div>
        </ProductVisualPlaceholder>
      </section>
      <section className="landing-story story-safe landing-reveal">
        <AmbientGlow variant="ice" />
        <GrainOverlay />
        <ProductVisualPlaceholder
          title="DAILY CLARITY"
          description="Upcoming safe-to-spend concept; not currently available"
          variant="illuminated"
        >
          <Flow className="safe-flow" />
          <div className="safe-demo">
            <span className="landing-kicker">A LITTLE ROOM TO BREATHE</span>
            <p>SAFE TODAY</p>
            <strong>
              ₹620<span>today</span>
            </strong>
            <div className="safe-line">
              <span />
            </div>
            <div className="safe-row">
              <span>Monthly budget</span>
              <span>61% used</span>
            </div>
            <div className="safe-row">
              <span>Bills covered</span>
              <Check size={16} />
            </div>
            <small>Concept preview · Coming to Finora</small>
          </div>
        </ProductVisualPlaceholder>
        <div className="story-copy">
          <span className="landing-kicker">
            03 / A CLEARER NEXT STEP{" "}
            <span className="coming-label">COMING NEXT</span>
          </span>
          <h2>
            Less second-guessing.
            <br />
            More breathing room.
          </h2>
          <p>
            Today, keep your monthly budget in view. Next, a simpler answer to
            an everyday question: what can I comfortably spend?
          </p>
          <span className="story-footnote">
            Daily guidance, designed around real life.
          </span>
        </div>
      </section>
    </div>
  );
}
export function HabitsSection() {
  return (
    <section className="landing-habits landing-reveal">
      <AmbientGlow variant="violet" />
      <GrainOverlay />
      <div className="landing-container habits-inner">
        <div className="story-copy">
          <span className="landing-kicker">
            04 / SMALL STEPS, LASTING CHANGE{" "}
            <span className="coming-label">COMING NEXT</span>
          </span>
          <h2>
            Better with
            <br />
            every day.
          </h2>
          <p>
            Progress doesn’t have to be dramatic. We’re working on thoughtful
            ways to help you build a little more awareness, one day at a time.
          </p>
        </div>
        <ProductVisualPlaceholder
          title="MONEY HABITS"
          description="Upcoming money score and mindful spending habit concept"
          aspectRatio="6 / 4"
        >
          <div className="habit-demo">
            <div className="score-ring">
              <svg viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r="88" />
                <circle cx="100" cy="100" r="88" />
              </svg>
              <div>
                <span>MONEY SCORE</span>
                <strong>84</strong>
                <small>+7 this week</small>
              </div>
            </div>
            <div className="habit-caption">
              <strong>Small steps. A steady rhythm.</strong>
              <div className="habit-days">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <span key={i} className={i < 6 ? "complete" : ""}>
                    {i < 6 ? <Check size={12} /> : day}
                    <small>{day}</small>
                  </span>
                ))}
              </div>
              <p>6-day mindful spending streak</p>
              <small>Illustrative concept · Not yet available</small>
            </div>
          </div>
        </ProductVisualPlaceholder>
      </div>
    </section>
  );
}
export function CapabilitySection() {
  return (
    <section className="landing-container landing-capabilities landing-reveal">
      <div className="capabilities-heading">
        <span className="landing-kicker">CONSIDERED IN EVERY DETAIL</span>
        <h2>
          Everything you need.
          <br />
          <span>Nothing in your way.</span>
        </h2>
      </div>
      <div className="capabilities-list">
        {capabilities.map(([number, title, description]) => (
          <article key={number}>
            <span>{number}</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <ArrowUpRightIcon />
          </article>
        ))}
      </div>
    </section>
  );
}
function ArrowUpRightIcon() {
  return (
    <ArrowRight className="capability-arrow" size={18} aria-hidden="true" />
  );
}
export function SecuritySection() {
  return (
    <section
      id="security"
      className="landing-security landing-container landing-reveal"
    >
      <LightBeam />
      <div className="security-symbol">
        <LockKeyhole size={30} strokeWidth={1} />
      </div>
      <span className="landing-kicker">PERSONAL MEANS PERSONAL</span>
      <h2>
        Your money.
        <br />
        Your space.
      </h2>
      <p>
        Your financial life deserves care. Finora uses Clerk for authentication
        and associates saved expenses and budgets with your account.
      </p>
      <div className="security-points">
        <span>
          <Check size={14} />
          Secure sign-in
        </span>
        <span>
          <Check size={14} />
          Account-scoped records
        </span>
        <span>
          <Check size={14} />
          Review before saving
        </span>
      </div>
    </section>
  );
}
export function FinalCta() {
  return (
    <section className="landing-final">
      <AmbientGlow variant="mixed" />
      <GrainOverlay />
      <Flow />
      <div className="landing-final-content">
        <span className="landing-kicker">
          LESS GUESSWORK. MORE PEACE OF MIND.
        </span>
        <h2>
          Make money
          <br />
          feel simpler.
        </h2>
        <p>A calmer relationship with your everyday money.</p>
        <div className="landing-cta-row">
          <StartLink />
          <Link href="/sign-in" className="landing-text-link">
            Sign in <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="landing-footer landing-container">
      <div className="footer-top">
        <div>
          <Brand />
          <p>Personal finance, thoughtfully.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#product">Product</a>
          <a href="#security">Security & privacy</a>
          <a href="#how-it-works">How it works</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Finora</span>
        <span>Your everyday, understood.</span>
      </div>
    </footer>
  );
}
