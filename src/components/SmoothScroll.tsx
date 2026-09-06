"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    // Single global instance of Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Pause lenis when hero section is active so it never conflicts with canvas frames
    const handleHeroState = () => {
      if (document.documentElement.classList.contains("hero-active")) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    window.addEventListener("heroStateChange", handleHeroState);
    handleHeroState();

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("heroStateChange", handleHeroState);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
