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
              Scroll: smoke → tree fixed → messages → tech blocks → hireU → continue.
            </p>
          </div>
        </section>

        <section className="story" id="story" ref={storyRef}>
          <div className="messages">
            <div className="msg">
              <div className="card">
                <h2>Message 1</h2>
                <p>Tree is fixed at the bottom; messages scroll on top of it.</p>
              </div>
            </div>

            <div className="msg" id="msg2" ref={msg2Ref}>
              <div className="card">
                <h2>Message 2</h2>
                <p>When this reaches mid-view, the tree brightens.</p>
              </div>
            </div>

            <div className="msg">
              <div className="card">
                <h2>Message 3</h2>
                <p>The tree remains fixed and fully visible.</p>
              </div>
            </div>

            <div className="msg">
              <div className="card">
                <h2>Message 4</h2>
                <p>More messages...</p>
              </div>
            </div>
            <div className="msg">
              <div className="card">
                <h2>Message 5</h2>
                <p>More messages...</p>
              </div>
            </div>
            <div className="msg">
              <div className="card">
                <h2>Message 6</h2>
                <p>More messages...</p>
              </div>
            </div>

            <Domains />

            <div className="msg" id="exitTrigger" ref={exitTriggerRef}>
              <div className="card">
                <h2>End of Messages</h2>
                <p>When this appears, the tree moves up and disappears.</p>
              </div>
            </div>

            <div className="exit-sentinel" />
          </div>
        </section>

        <section className="after">
          <div className="card">
            <h2>Continuation Page</h2>
            <p>Tree is gone. Content continues normally after this section.</p>
          </div>
        </section>

        <HireU />
      </main>
    </>
  );
}
