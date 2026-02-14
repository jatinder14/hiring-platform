"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserMenu } from "./UserMenu";

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
  const { data: session, status } = useSession();
  const router = useRouter();

  const scrollToStory = () => {
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFindAJob = () => {
    if (status === "loading") return;
    if (session) {
      scrollToStory();
    } else {
      router.push("/auth/login?callbackUrl=/");
    }
  };

  const handleHireTalent = () => {
    if (status === "loading") return;
    if (session) {
      scrollToStory();
    } else {
      router.push("/auth/login?callbackUrl=/");
    }
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
          <button className="hn-btn ghost" type="button" onClick={handleHireTalent}>
            Hire a Talent
          </button>
          <button className="hn-btn" type="button" onClick={handleFindAJob}>
            Find a Job
          </button>
          <UserMenu session={session} />
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
          <button className="hn-btn ghost" type="button" onClick={() => { handleHireTalent(); setDrawerOpen(false); }}>
            Hire a Talent
          </button>
          <button className="hn-btn" type="button" onClick={() => { handleFindAJob(); setDrawerOpen(false); }}>
            Find a Job
          </button>
          <div className="hn-drawer-usermenu" onClick={() => setDrawerOpen(false)}>
            <UserMenu session={session} variant="drawer" />
          </div>
        </div>
      </div>
    </header>
  );
}
