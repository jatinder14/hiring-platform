"use client";

import { useEffect, useRef, useState } from "react";

type Step = {
  title: string;
  image: string;
};

const STEPS: Step[] = [
  { title: "Create your free account", image: "/how-it-works/step-1.png" },
  { title: "Define your skills", image: "/how-it-works/step-2.png" },
  { title: "Get response from company within 48 hrs", image: "/how-it-works/step-3.png" },
  { title: "Get hired", image: "/how-it-works/step-4.png" },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const markerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const refs = markerRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!refs.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number((entry.target as HTMLDivElement).dataset.step);
          if (!Number.isNaN(idx)) setActive(idx);
        });
      },
      { root: null, threshold: 0, rootMargin: "-40% 0px -40% 0px" }
    );

    refs.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setImageFailed(false);
  }, [active]);

  const current = STEPS[active] ?? STEPS[0];

  return (
    <section ref={sectionRef} className="hiw-section" id="how-it-works">
      <div className="hiw-grid">
        <aside className="hiw-left">
          <h2>How it works</h2>
          <ol className="hiw-list" aria-label="How it works steps">
            {STEPS.map((step, idx) => (
              <li key={step.title} className={`hiw-item ${active === idx ? "active" : ""} ${idx === 2 ? "long" : ""}`}>
                <span className="hiw-no">{String(idx + 1).padStart(2, "0")}.</span>
                <span className="hiw-text">{step.title}</span>
              </li>
            ))}
          </ol>
        </aside>

        <div className="hiw-right">
          <div
            className="hiw-preview"
            style={{
              border: "1px solid rgba(165, 186, 214, 0.34)",
              background: "rgba(6, 10, 16, 0.82)",
              minHeight: "min(58vh, 560px)",
            }}
          >
            {!imageFailed && (
              <img
                key={current.image}
                src={current.image}
                alt={current.title}
                loading="eager"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={() => setImageFailed(true)}
              />
            )}
            {imageFailed && (
              <div className="hiw-fallback">
                <span>{current.title}</span>
                <small>Add image at {current.image}</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hiw-markers" aria-hidden="true">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className="hiw-marker"
            data-step={idx}
            ref={(el) => {
              markerRefs.current[idx] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}
