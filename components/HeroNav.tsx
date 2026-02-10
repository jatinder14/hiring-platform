"use client";

import { useState } from "react";

const navLinks = [
  { href: "#story", label: "For Companies" },
  { href: "#story", label: "For Talents" },
  { href: "#story", label: "Success Stories" },
  { href: "#story", label: "Blogs" },
  { href: "#story", label: "Pricing" },
  { href: "#story", label: "Contact" },
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
          <button className="hn-btn ghost" type="button">
            Hire a Talent
          </button>
          <button className="hn-btn" type="button" onClick={scrollToStory}>
            Find a Job
          </button>
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
          <button className="hn-btn ghost" type="button">
            Hire a Talent
          </button>
          <button className="hn-btn" type="button" onClick={() => { scrollToStory(); setDrawerOpen(false); }}>
            Find a Job
          </button>
        </div>
      </div>
    </header>
  );
}
