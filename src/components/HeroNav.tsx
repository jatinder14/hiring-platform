"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";

const navLinks = [
  { href: "#story", label: "Success Stories" },
  { href: "#story", label: "Blogs" },
  { href: "#story", label: "Pricing" },
  { href: "#story", label: "Contact" },
];

export function HeroNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogin = async (role: "recruiter" | "candidate") => {
    // Set cookie to remember role (valid for 1 hour for login process)
    document.cookie = `login_role=${role}; path=/; max-age=3600`;

    // Force sign out to ensure fresh session with new role
    await signOut({ redirect: false });

    // Redirect to custom sign-in page with callback URL
    // signIn() with no provider argument redirects to the configured sign-in page
    signIn(undefined, {
      callbackUrl: role === "recruiter" ? "/dashboard/company" : "/dashboard/jobs",
    });
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
          <button onClick={() => handleLogin("recruiter")} className="hn-btn ghost">
            Hire a Talent
          </button>
          <button onClick={() => handleLogin("candidate")} className="hn-btn">
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
          <button
            onClick={() => {
              handleLogin("recruiter");
              setDrawerOpen(false);
            }}
            className="hn-btn ghost"
          >
            Hire a Talent
          </button>
          <button
            onClick={() => {
              handleLogin("candidate");
              setDrawerOpen(false);
            }}
            className="hn-btn"
          >
            Find a Job
          </button>
        </div>
      </div>
    </header>
  );
}
