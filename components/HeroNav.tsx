"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "#companies", label: "For Companies" },
  { href: "#talents", label: "For Talents" },
  { href: "#success-stories", label: "Success Stories" },
  { href: "#blogs", label: "Blogs" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function HeroNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollToStory = () => {
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="hero-nav" id="heroNav" role="banner">
      <div className="hero-nav-inner">
        <a className="hn-brand" href="#hero" aria-label="Home">
          <span className="hn-logo" />
        </a>

        <nav className="hn-links">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hn-actions">
          <Link href="/recruiter/register" className="hn-btn ghost" role="button" aria-label="Hire a Talent">
            Hire a Talent
          </Link>
          <Link href="/job-seeker/register" className="hn-btn" role="button" aria-label="Find a Job">
            Find a Job
          </Link>
        </div>

        <button
          className="hn-burger"
          id="hnBurger"
          aria-label="Menu"
          aria-expanded={drawerOpen}
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`hn-drawer ${drawerOpen ? "open" : ""}`} id="hnDrawer">
        {navLinks.map((link) => (
          <a key={link.label} href={link.href} onClick={() => setDrawerOpen(false)}>
            {link.label}
          </a>
        ))}
        <div className="hn-drawer-actions">
          <Link
            href="/recruiter/register"
            className="hn-btn ghost"
            role="button"
            aria-label="Hire a Talent"
            onClick={() => setDrawerOpen(false)}
          >
            Hire a Talent
          </Link>
          <Link
            href="/job-seeker/register"
            className="hn-btn"
            role="button"
            aria-label="Find a Job"
            onClick={() => setDrawerOpen(false)}
          >
            Find a Job
          </Link>
        </div>
      </div>
    </header>
  );
}
