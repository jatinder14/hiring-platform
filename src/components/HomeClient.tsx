"use client";

import { useRef } from "react";
import { AuroraCanvas } from "@/components/AuroraCanvas";
import { TreeLayer } from "@/components/TreeLayer";
import { FlowController } from "@/components/FlowController";
import { HeroNav } from "@/components/HeroNav";
import { Domains } from "@/components/Domains";
import { HireU } from "@/components/HireU";

export function HomeClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const msg2Ref = useRef<HTMLDivElement>(null);
  const exitTriggerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <FlowController
        heroRef={heroRef}
        storyRef={storyRef}
        msg2Ref={msg2Ref}
        exitTriggerRef={exitTriggerRef}
      />
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
            <h1>AI Intelligence Platform</h1>
            <p>
              Connecting top talent with the companies that need them most.
            </p>
          </div>
        </section>

        <section className="story" id="story" ref={storyRef}>
          <div className="messages">
            <div className="msg">
              <div className="card">
                <h2>Find the Right Fit</h2>
                <p>Our AI matches candidates to roles based on skills, experience, and culture fit — not just keywords.</p>
              </div>
            </div>

            <div className="msg" id="msg2" ref={msg2Ref}>
              <div className="card">
                <h2>Smarter Hiring</h2>
                <p>Reduce time-to-hire by up to 60% with intelligent screening and automated candidate ranking.</p>
              </div>
            </div>

            <div className="msg">
              <div className="card">
                <h2>Built for Scale</h2>
                <p>Whether you&apos;re hiring one person or a hundred, HireU adapts to your workflow seamlessly.</p>
              </div>
            </div>

            <div className="msg">
              <div className="card">
                <h2>Candidate-First Experience</h2>
                <p>Give candidates a transparent, respectful hiring journey that reflects your company values.</p>
              </div>
            </div>
            <div className="msg">
              <div className="card">
                <h2>Data-Driven Decisions</h2>
                <p>Access real-time analytics on your pipeline, conversion rates, and team performance.</p>
              </div>
            </div>
            <div className="msg">
              <div className="card">
                <h2>Collaborate Effortlessly</h2>
                <p>Share candidate profiles, leave feedback, and align your team — all in one place.</p>
              </div>
            </div>

            <Domains />

            <div className="msg" id="exitTrigger" ref={exitTriggerRef}>
              <div className="card">
                <h2>Ready to Transform Hiring?</h2>
                <p>Join thousands of companies using HireU to build exceptional teams.</p>
              </div>
            </div>

            <div className="exit-sentinel" />
          </div>
        </section>

        <section className="after">
          <div className="card">
            <h2>The Future of Talent Acquisition</h2>
            <p>HireU combines AI-powered matching with a human-centered approach to help you hire faster and smarter.</p>
          </div>
        </section>

        <HireU />
      </main>
    </>
  );
}
