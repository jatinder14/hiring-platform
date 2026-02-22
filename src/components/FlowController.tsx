"use client";

import { useEffect } from "react";

type Refs = {
  heroRef: React.RefObject<HTMLElement | null>;
  storyRef: React.RefObject<HTMLElement | null>;
  msg2Ref: React.RefObject<HTMLElement | null>;
  exitTriggerRef: React.RefObject<HTMLElement | null>;
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

    let inStory = false;
    let brightTree = false;
    let suppressTree = false;

    const syncTreeClasses = () => {
      document.body.classList.toggle("tree-on", inStory && !suppressTree);
      document.body.classList.toggle("tree-bright", inStory && brightTree && !suppressTree);
      document.body.classList.toggle("tree-exit", suppressTree);
    };

    const unsubStory = new IntersectionObserver(
      (entries) => {
        inStory = entries[0].isIntersecting;
        syncTreeClasses();
      },
      { threshold: 0.01 }
    );
    unsubStory.observe(story);

    let unsubMsg2: IntersectionObserver | null = null;
    if (msg2) {
      unsubMsg2 = new IntersectionObserver(
        (entries) => {
          brightTree = entries[0].isIntersecting;
          syncTreeClasses();
        },
        { threshold: 0.55 }
      );
      unsubMsg2.observe(msg2);
    }

    let unsubExit: IntersectionObserver | null = null;
    if (exitTrigger) {
      unsubExit = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          const thresholdY = window.innerHeight * 0.55;
          // Once user reaches the exit trigger area, suppress tree-on/tree-bright states.
          suppressTree = e.isIntersecting || e.boundingClientRect.top <= thresholdY;
          syncTreeClasses();
        },
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
