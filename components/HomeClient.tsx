"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AuroraCanvas } from "@/components/AuroraCanvas";
import { TreeLayer } from "@/components/TreeLayer";
import { FlowController } from "@/components/FlowController";
import { HeroNav } from "@/components/HeroNav";
import { HowItWorks } from "@/components/HowItWorks";
import { FileUser, PhoneCall, Flag } from "lucide-react";

const HireU = dynamic(() => import("@/components/HireU").then((m) => ({ default: m.HireU })), { ssr: true });

const ICON = (slug: string) => `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;

const COMPANIES = [
  { name: "Google", icon: ICON("google") },
  { name: "Microsoft", icon: ICON("microsoft") },
  { name: "Amazon", icon: ICON("amazon") },
  { name: "Apple", icon: ICON("apple") },
  { name: "Meta", icon: ICON("meta") },
  { name: "NVIDIA", icon: ICON("nvidia") },
  { name: "Adobe", icon: ICON("adobe") },
  { name: "Salesforce", icon: ICON("salesforce") },
  { name: "Spotify", icon: ICON("spotify") },
  { name: "Uber", icon: ICON("uber") },
];

export function HomeClient() {
  const heroRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const msg2Ref = useRef<HTMLElement | null>(null);
  const exitTriggerRef = useRef<HTMLElement | null>(null);
  const statsRef = useRef<HTMLElement | null>(null);
  const companyMarkerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [statsOn, setStatsOn] = useState(false);
  const [companyMsgIdx, setCompanyMsgIdx] = useState(0);

  const COMPANY_MESSAGES = [
    "The complete human data engine for the world's most ambitious AI.",
    "We combine AI precision with human insight to shortlist top talent faster.",
    "Trusted by growing teams to turn hiring into a clear competitive edge.",
  ];

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setStatsOn(true);
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const refs = companyMarkerRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!refs.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number((entry.target as HTMLDivElement).dataset.msg);
          if (!Number.isNaN(idx)) setCompanyMsgIdx(idx);
        });
      },
      { root: null, threshold: 0.15, rootMargin: "-47% 0px -47% 0px" }
    );
    refs.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <FlowController heroRef={heroRef} storyRef={storyRef} msg2Ref={msg2Ref} exitTriggerRef={exitTriggerRef} />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AuroraCanvas />
      <TreeLayer />

      <main id="main-content" role="main">
        <HeroNav />

        <section className="hero" id="hero" ref={heroRef}>
          <div className="hero-smoke" />
          <div className="hero-content">
            <div className="hero-3d-visual" aria-label="3D style winner holding trophy">
              <img
                className="hero-3d-image"
                src="/hired-hero-illustration.svg"
                alt="Professional business meeting collaboration illustration"
                loading="eager"
              />
            </div>
            <a className="hero-hire-btn" href="/job-seeker/register">
              Get a job
            </a>
          </div>
        </section>

        <section className="story" id="story" ref={storyRef}>
          <div className="messages">
            <section
              className={`platform-stats-wrap ${statsOn ? "is-hot" : ""}`}
              aria-label="Platform stats"
              ref={(node) => {
                statsRef.current = node;
                msg2Ref.current = node;
              }}
            >
              <div className="platform-stats-grid">
                <article className="platform-stat-card">
                  <span className="platform-stat-icon" aria-hidden="true">
                    <FileUser size={42} strokeWidth={1.6} />
                  </span>
                  <span className="platform-stat-value">4Cr+</span>
                  <small className="platform-stat-label">Qualified Applicants</small>
                </article>
                <article className="platform-stat-card">
                  <span className="platform-stat-icon" aria-hidden="true">
                    <PhoneCall size={42} strokeWidth={1.6} />
                  </span>
                  <span className="platform-stat-value">38L+</span>
                  <small className="platform-stat-label">Interviews per month</small>
                </article>
                <article className="platform-stat-card">
                  <span className="platform-stat-icon" aria-hidden="true">
                    <Flag size={42} strokeWidth={1.6} />
                  </span>
                  <span className="platform-stat-value">750+</span>
                  <small className="platform-stat-label">Companies</small>
                </article>
              </div>
            </section>

            <div className="company-marquee-wrap" aria-label="Company partners">
              <div className="company-marquee-glow" aria-hidden="true" />
              <div className="company-sparkles" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="company-marquee">
                <div className="company-track">
                  {COMPANIES.map((c) => (
                    <span className="company-pill" key={c.name}>
                      <img src={c.icon} alt={c.name} className="logo-mark" />
                      {c.name}
                    </span>
                  ))}
                </div>
                <div className="company-track" aria-hidden="true">
                  {COMPANIES.map((c) => (
                    <span className="company-pill" key={`${c.name}-dup`}>
                      <img src={c.icon} alt="" className="logo-mark" />
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="msg"
              id="exitTrigger"
              ref={(node) => {
                exitTriggerRef.current = node;
              }}
            >
              <div className="end-reviews-card" aria-label="Global intelligence and client reviews">
                <div className="end-reviews-visual" aria-hidden="true">
                  <svg className="network-curves" viewBox="0 0 1000 520" preserveAspectRatio="none">
                    <path className="network-curve c1" d="M500 34 C 472 112, 380 248, 138 430" />
                    <path className="network-curve c2" d="M500 34 C 488 116, 422 252, 300 394" />
                    <path className="network-curve c3" d="M500 34 C 500 134, 500 276, 500 462" />
                    <path className="network-curve c4" d="M500 34 C 512 116, 578 252, 690 386" />
                    <path className="network-curve c5" d="M500 34 C 528 112, 620 248, 862 422" />
                    <path className="network-curve c6" d="M500 34 C 468 120, 388 238, 188 334" />
                    <path className="network-curve c7" d="M500 34 C 532 120, 612 238, 812 326" />
                  </svg>

                  <div className="network-node node-1" />
                  <div className="network-node node-2" />
                  <div className="network-node node-3" />
                  <div className="network-node node-4" />
                  <div className="network-node node-5" />
                  <div className="network-node node-6" />
                  <div className="network-node node-7" />
                </div>

                <div className="end-reviews-copy">
                  <h2>Human Intelligence, Global Reach</h2>
                  <p>Teams trust us to surface top talent fast, with signal-rich review-driven matching.</p>
                  <div className="review-stage" aria-live="polite">
                    <div className="review-track">
                      <article className="review-card">
                        <div className="review-card-copy">
                          <p>"We reduced time-to-hire by 58% with better shortlist quality."</p>
                          <span>Talent Director, FinTech</span>
                        </div>
                        <img
                          className="review-avatar"
                          src="https://cdn.prod.website-files.com/668430f87bc1145910dc56de/675ae6641cfe553ef659cc0e_FEATURE%20Beautiful%20Brown%20Hair%2C%20Green%20Eye%2C%20Stunning%20Female%20M-min.jpeg"
                          alt="Reviewer profile"
                          loading="lazy"
                        />
                      </article>
                      <article className="review-card">
                        <div className="review-card-copy">
                          <p>"The workflow feels premium and gives us confidence in every hire."</p>
                          <span>People Ops Lead, HealthTech</span>
                        </div>
                        <img
                          className="review-avatar"
                          src="https://img.freepik.com/premium-photo/ai-human-avatar-characters-male-model_1166271-38.jpg"
                          alt="Reviewer profile"
                          loading="lazy"
                        />
                      </article>
                      <article className="review-card">
                        <div className="review-card-copy">
                          <p>"Cross-region recruiting became predictable after switching to HIREU."</p>
                          <span>Head of Hiring, SaaS</span>
                        </div>
                        <img
                          className="review-avatar"
                          src="https://static.vecteezy.com/system/resources/thumbnails/047/462/750/small/positive-man-on-clean-background-photo.jpg"
                          alt="Reviewer profile"
                          loading="lazy"
                        />
                      </article>
                      <article className="review-card">
                        <div className="review-card-copy">
                          <p>"Clear insights, faster interviews, and stronger role fit from day one."</p>
                          <span>Recruitment Manager, Enterprise</span>
                        </div>
                        <img
                          className="review-avatar"
                          src="https://img.freepik.com/premium-photo/ai-human-avatar-characters-male-model_1166271-38.jpg"
                          alt="Reviewer profile"
                          loading="lazy"
                        />
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="exit-sentinel" />
          </div>
        </section>

        <HowItWorks />

        <section className="company-story" aria-label="About our company">
          <div className="company-story-sticky">
            <div className={`company-message-shell msg-step-${companyMsgIdx}`}>
              <div className="company-message-text" aria-live="polite">
                <p key={companyMsgIdx} className="company-message-line">
                  {COMPANY_MESSAGES[companyMsgIdx]}
                </p>
              </div>
              <div className="company-message-bottom-line" aria-hidden="true" />
            </div>
          </div>
          <div className="company-story-markers" aria-hidden="true">
            {COMPANY_MESSAGES.map((_, idx) => (
              <div
                key={idx}
                className="company-story-marker"
                data-msg={idx}
                ref={(el) => {
                  companyMarkerRefs.current[idx] = el;
                }}
              />
            ))}
          </div>
        </section>

        <section className="wave-section" aria-label="3D wireframe wave">
          <img src="/waves/wireframe-wave.jpg" alt="Futuristic wireframe landscape" />
        </section>

        <HireU />
      </main>
    </>
  );
}
