"use client";

import { useEffect } from "react";

type Refs = {
  heroRef: React.RefObject<HTMLDivElement | null>;
  storyRef: React.RefObject<HTMLDivElement | null>;
  msg2Ref: React.RefObject<HTMLDivElement | null>;
  exitTriggerRef: React.RefObject<HTMLDivElement | null>;
};

export function FlowController({ heroRef, storyRef, msg2Ref, exitTriggerRef }: Refs) {
  useEffect(() => {
    const hero = heroRef?.current;
    const story = storyRef.current;
    const msg2 = msg2Ref.current;
    const exitTrigger = exitTriggerRef.current;

    if (!hero || !story) return;

    const unsubHero = new IntersectionObserver(
      (entries) => {
        document.body.classList.toggle("hero-out", !entries[0].isIntersecting);
      },
      { threshold: 0.15 }
    );
    unsubHero.observe(hero);

    const unsubStory = new IntersectionObserver(
      (entries) => {
        const inStory = entries[0].isIntersecting;
        document.body.classList.toggle("tree-on", inStory);
        if (!inStory) document.body.classList.remove("tree-exit", "tree-bright");
      },
      { threshold: 0.01 }
    );
    unsubStory.observe(story);

    let unsubMsg2: IntersectionObserver | null = null;
    if (msg2) {
      unsubMsg2 = new IntersectionObserver(
        (entries) => document.body.classList.toggle("tree-bright", entries[0].isIntersecting),
        { threshold: 0.55 }
      );
      unsubMsg2.observe(msg2);
    }

    let unsubExit: IntersectionObserver | null = null;
    if (exitTrigger) {
      unsubExit = new IntersectionObserver(
        (entries) => document.body.classList.toggle("tree-exit", entries[0].isIntersecting),
        { threshold: 0.55 }
      );
      unsubExit.observe(exitTrigger);
    }

    return () => {
      unsubHero.disconnect();
      unsubStory.disconnect();
      unsubMsg2?.disconnect();
      unsubExit?.disconnect();
    };
  }, []);

  return null;
}
