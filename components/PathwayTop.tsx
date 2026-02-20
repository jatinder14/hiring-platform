"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { UserPlus2, Send, Trophy } from "lucide-react";

type Step = {
  title: string;
  desc: string;
  Icon: typeof UserPlus2;
};

const STEPS: Step[] = [
  {
    title: "Register",
    desc: "Create your profile and complete your details in minutes.",
    Icon: UserPlus2,
  },
  {
    title: "Apply",
    desc: "Apply to matching opportunities with one focused workflow.",
    Icon: Send,
  },
  {
    title: "Get Your Dream Job",
    desc: "Get shortlisted faster and move to interviews with confidence.",
    Icon: Trophy,
  },
];

export function PathwayTop() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setIsVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        setIsVisible(true);
        io.disconnect();
      },
      { threshold: 0.08 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`pw-section ${isVisible ? "is-visible" : ""}`} id="pathway-top">
      <div className="pw-wrap">
        <div className="pw-track" aria-label="Hiring pathway">
          {STEPS.map((step, idx) => {
            const style = { ["--idx" as string]: idx } as CSSProperties;
            return (
              <article key={step.title} className="pw-card" style={style}>
                <span className="pw-icon" aria-hidden="true">
                  <step.Icon size={26} strokeWidth={2.15} />
                </span>
                <div className="pw-copy">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
                {idx < STEPS.length - 1 ? <span className="pw-connector" aria-hidden="true" /> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

