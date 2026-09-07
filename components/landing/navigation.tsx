"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/app-shell";
import { Brand } from "./brand";
import { navigation } from "@/lib/landing/content";
export function StartLink({
  children = "Start with Finora",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { isSignedIn } = useUser();
  return (
    <Link
      className={`landing-button landing-primary ${className}`}
      href={isSignedIn ? "/dashboard" : "/sign-up"}
    >
      {isSignedIn ? "Open Finora" : children}
      <ArrowRight size={16} />
    </Link>
  );
}
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { isSignedIn } = useUser();
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 24);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className={`landing-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="landing-nav-inner">
        <Brand />
        <nav className="landing-desktop-links" aria-label="Main navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="landing-nav-actions">
          <ThemeToggle />
          {!isSignedIn && (
            <Link className="landing-signin" href="/sign-in">
              Sign in
            </Link>
          )}
          <StartLink>Get started</StartLink>
          <button
            ref={menuButton}
            className="landing-menu-button icon-button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <nav
        id="landing-mobile-menu"
        className="landing-mobile-links"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {navigation.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
            <ArrowRight size={16} />
          </a>
        ))}
        <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
          {isSignedIn ? "Open Finora" : "Sign in"}
        </Link>
      </nav>
    </header>
  );
}
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".landing-reveal").forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("will-reveal");
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, []);
  return null;
}
