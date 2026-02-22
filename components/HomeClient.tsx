"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { AuroraCanvas } from "@/components/AuroraCanvas";
import { TreeLayer } from "@/components/TreeLayer";
import { FlowController } from "@/components/FlowController";
import { HeroNav } from "@/components/HeroNav";
import { HowItWorks } from "@/components/HowItWorks";
import { PathwayTop } from "@/components/PathwayTop";
import {
  FileUser,
  PhoneCall,
  Flag,
  Cpu,
  Settings2,
  Brain,
  Handshake,
  MessageCircle,
  UserCheck,
  Sparkles,
  ClipboardCheck,
  Link2,
  CircleDollarSign,
} from "lucide-react";

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

const TEAM_MEMBERS = [
  {
    name: "Michael Kim",
    role: "Lead AI Engineer",
    bio: "Architect of the HireU platform. Expert in machine learning with scalable systems.",
    avatar: "https://i.pravatar.cc/180?img=12",
    icon: Cpu,
    tilt: "tilt-left-2",
    featured: false,
  },
  {
    name: "David Chen",
    role: "CTO",
    bio: "Architect of the HireU platform. Expert in machine learning and scalable systems.",
    avatar: "https://i.pravatar.cc/180?img=15",
    icon: Settings2,
    tilt: "tilt-left-1",
    featured: false,
  },
  {
    name: "sudheer",
    role: "CEO & Founder",
    bio: "Visionary leader passionate about connecting global talent with AI innovation.",
    avatar: "https://i.pravatar.cc/180?img=20",
    icon: Brain,
    tilt: "tilt-center",
    featured: true,
  },
  {
    name: "Maria Rodriguez",
    role: "Head of Talent",
    bio: "Dedicated to building a world-class community of experts and ensuring their success.",
    avatar: "https://i.pravatar.cc/180?img=47",
    icon: Handshake,
    tilt: "tilt-right-1",
    featured: false,
  },
  {
    name: "Sarah Lee",
    role: "Community Manager",
    bio: "Connecting global talent with AI-class opportunities and collaborative growth.",
    avatar: "https://i.pravatar.cc/180?img=5",
    icon: MessageCircle,
    tilt: "tilt-right-2",
    featured: false,
  },
] as const;

export function HomeClient() {
  const heroRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const msg2Ref = useRef<HTMLElement | null>(null);
  const exitTriggerRef = useRef<HTMLElement | null>(null);
  const statsRef = useRef<HTMLElement | null>(null);
  const companyMarkerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const teamRef = useRef<HTMLElement | null>(null);
  const [statsOn, setStatsOn] = useState(false);
  const [companyMsgIdx, setCompanyMsgIdx] = useState(0);
  const [teamInView, setTeamInView] = useState(false);
  const [storyPage, setStoryPage] = useState(0);

  const COMPANY_MESSAGES = [
    "The complete human data engine for the world's most ambitious AI.",
    "We combine AI precision with human insight to shortlist top talent faster.",
    "Trusted by growing teams to turn hiring into a clear competitive edge.",
  ];

  const STORY_CARDS = [
    {
      name: "Jane D.",
      role: "NLP Specialist",
      quote: "HireU helped me double my freelance income. The projects are consistently high-quality.",
      avatar: "https://i.pravatar.cc/120?img=32",
    },
    {
      name: "Alex K.",
      role: "Computer Vision",
      quote: "The platform is intuitive and the support is excellent. Highly recommend for AI experts.",
      avatar: "https://i.pravatar.cc/120?img=61",
    },
    {
      name: "Priya S.",
      role: "ML Engineer",
      quote: "Matched with clients who knew exactly what they wanted. Smooth and professional.",
      avatar: "https://i.pravatar.cc/120?img=48",
    },
    {
      name: "Diego R.",
      role: "Data Scientist",
      quote: "Fast payments and clear milestones. It feels like a premium marketplace.",
      avatar: "https://i.pravatar.cc/120?img=68",
    },
    {
      name: "Mei L.",
      role: "AI Researcher",
      quote: "Excellent project variety and great communication tools built in.",
      avatar: "https://i.pravatar.cc/120?img=24",
    },
    {
      name: "Sam T.",
      role: "MLOps",
      quote: "I love the quality bar. Every project is serious and well-scoped.",
      avatar: "https://i.pravatar.cc/120?img=12",
    },
    {
      name: "Fatima N.",
      role: "Prompt Engineer",
      quote: "I found consistent work and long-term clients within weeks.",
      avatar: "https://i.pravatar.cc/120?img=46",
    },
    {
      name: "Luca M.",
      role: "AI Product",
      quote: "The vetting process builds real trust between clients and experts.",
      avatar: "https://i.pravatar.cc/120?img=53",
    },
    {
      name: "Grace W.",
      role: "Deep Learning",
      quote: "Clear briefs, great support, and meaningful work. Highly recommended.",
      avatar: "https://i.pravatar.cc/120?img=7",
    },
  ];

  const STORIES_PER_PAGE = 2;
  const totalStoryPages = Math.ceil(STORY_CARDS.length / STORIES_PER_PAGE);
  const storyStart = storyPage * STORIES_PER_PAGE;
  const visibleStories = STORY_CARDS.slice(storyStart, storyStart + STORIES_PER_PAGE);
  const goPrevStory = () => setStoryPage((prev) => (prev - 1 + totalStoryPages) % totalStoryPages);
  const goNextStory = () => setStoryPage((prev) => (prev + 1) % totalStoryPages);

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
      { root: null, threshold: 0.01, rootMargin: "-47% 0px -47% 0px" }
    );
    refs.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = teamRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        setTeamInView(entries[0].isIntersecting);
      },
      { threshold: 0.36 }
    );
    io.observe(el);
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

        <section id="hero" ref={heroRef}>
          <PathwayTop />
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

        <section className="four-modules" aria-label="Platform modules">
          <div className="four-modules-grid">
            <article className="four-module-card key-features">
              <h2>KEY FEATURES</h2>
              <div className="feature-grid feature-grid-compact">
                <div className="feature-card feature-card-compact">
                  <span className="feature-icon feature-icon-compact feature-icon-image" aria-hidden="true">
                    <img
                      src="https://www.dartschool.be/wp-content/uploads/brein_darts.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                  <h3>AI-Powered Matching</h3>
                  <p>Find the perfect projects faster with our smart algorithm.</p>
                </div>
                <div className="feature-card feature-card-compact">
                  <span className="feature-icon feature-icon-compact feature-icon-brain-ring" aria-hidden="true">
                    <Handshake size={30} strokeWidth={1.5} />
                  </span>
                  <h3>Verified Experts</h3>
                  <p>Work with a vetted community of top-tier AI professionals.</p>
                </div>
                <div className="feature-card feature-card-compact">
                  <span className="feature-icon feature-icon-compact feature-icon-brain-ring" aria-hidden="true">
                    <CircleDollarSign size={30} strokeWidth={1.8} />
                  </span>
                  <h3>Secure Payments</h3>
                  <p>Guaranteed, timely payouts for all completed milestones.</p>
                </div>
              </div>
            </article>

            <article id="success-stories" className="four-module-card success-stories" aria-label="Success stories">
              <h2>SUCCESS STORIES</h2>
              <div className="stories-shell">
                <button className="story-nav" aria-label="Previous story" type="button" onClick={goPrevStory}>
                  <span aria-hidden="true">‹</span>
                </button>
                <div className="stories-grid">
                  {visibleStories.map((story) => (
                    <article className="story-card" key={`${story.name}-${story.role}`}>
                      <img src={story.avatar} alt={story.name} className="story-avatar" />
                      <div>
                        <h3>
                          {story.name} - {story.role}
                        </h3>
                        <p>{story.quote}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <button className="story-nav" aria-label="Next story" type="button" onClick={goNextStory}>
                  <span aria-hidden="true">›</span>
                </button>
              </div>
              <div className="story-dots" aria-hidden="true">
                {Array.from({ length: totalStoryPages }).map((_, idx) => (
                  <span key={idx} className={`dot ${idx === storyPage ? "active" : ""}`} />
                ))}
              </div>
            </article>

            <article className="four-module-card how-it-mini">
              <h2>HOW IT WORKS</h2>
              <div className="mini-steps">
                <div className="mini-step">
                  <span className="mini-icon" aria-hidden="true">
                    <UserCheck size={26} strokeWidth={1.5} />
                  </span>
                  <p>1. Create Profile</p>
                </div>
                <div className="mini-step">
                  <span className="mini-icon" aria-hidden="true">
                    <ClipboardCheck size={26} strokeWidth={1.5} />
                  </span>
                  <p>2. Pass Assessment</p>
                </div>
                <div className="mini-step">
                  <span className="mini-icon" aria-hidden="true">
                    <Link2 size={26} strokeWidth={1.5} />
                  </span>
                  <p>3. Get Matched</p>
                </div>
                <div className="mini-step">
                  <span className="mini-icon" aria-hidden="true">
                    <Sparkles size={26} strokeWidth={1.5} />
                  </span>
                  <p>4. Start Earning</p>
                </div>
              </div>
            </article>

            <article className="four-module-card ready-start">
              <h2>READY TO GET STARTED?</h2>
              <div className="ready-shell">
                <h3>Join the Future of AI Work Today</h3>
                <p>Sign up now to access exclusive projects and elevate your career.</p>
                <div className="ready-actions">
                  <button className="ready-btn" type="button">
                    Hire a Talent
                  </button>
                  <button className="ready-btn" type="button">
                    Get a Job
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <HowItWorks />

        <section
          className={`team-showcase ${teamInView ? "is-active" : ""}`}
          id="team"
          aria-label="Meet the team behind HireU"
          ref={teamRef}
        >
          <h2 className="team-showcase-title">MEET THE TEAM BEHIND HIREU</h2>
          <div className="team-fan" role="list">
            {TEAM_MEMBERS.map((member) => {
              const Icon = member.icon;
              return (
                <article
                  key={member.name}
                  className={`team-member-card ${member.tilt} ${member.featured ? "is-featured" : ""}`}
                  role="listitem"
                >
                  <div className="team-member-avatar-wrap">
                    <img src={member.avatar} alt={member.name} className="team-member-avatar" loading="lazy" />
                  </div>
                  <h3>{member.name}</h3>
                  <span className="team-member-role">{member.role}</span>
                  <p>{member.bio}</p>
                  <span className="team-member-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={2.1} />
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="company-story" aria-label="About our company">
          <div className="company-story-sticky">
            <div className={`company-message-shell msg-step-${companyMsgIdx}`}>
              <div className="company-message-text" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={companyMsgIdx}
                    className="company-message-line"
                    initial={{ opacity: 0, y: 14, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -14, filter: "blur(1.6px)" }}
                    transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {COMPANY_MESSAGES[companyMsgIdx]}
                  </motion.p>
                </AnimatePresence>
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
