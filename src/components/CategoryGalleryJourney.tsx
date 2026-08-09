"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  categoryCache,
  startGlobalFramePreload,
  getCategoryFrameUrl,
  getFrameWithFallback,
} from "@/lib/globalFramePreloader";

const TOTAL_FRAMES = 2400;

// Timeline steps for categories
const STEPS = [
  {
    range: [0.02, 0.18],
    stepNum: "01",
    tag: "CERAMICS & POTTERY",
    title: "Masterwork Ceramics",
    subtitle: "Generational terracotta pottery and hand-glazed Iznik stoneware.",
    badge: "18 Masterpieces",
    ctaText: "Explore Ceramics",
    ctaHref: "/categories/Ceramics",
  },
  {
    range: [0.22, 0.38],
    stepNum: "02",
    tag: "HERITAGE JEWELRY",
    title: "Heritage Jewelry",
    subtitle: "Exquisite hand-hammered gold filigree and museum-grade heritage gems.",
    badge: "15 Masterpieces",
    ctaText: "Explore Jewelry",
    ctaHref: "/categories/Jewelry",
  },
  {
    range: [0.42, 0.58],
    stepNum: "03",
    tag: "LEATHER MASTERPIECES",
    title: "Generational Leather",
    subtitle: "Organic vegetable-tanned hides crafted by master leatherworkers.",
    badge: "12 Masterpieces",
    ctaText: "Explore Leather",
    ctaHref: "/categories/Leather",
  },
  {
    range: [0.62, 0.78],
    stepNum: "04",
    tag: "METALWORK & ORNAMENTS",
    title: "Fine Metalwork",
    subtitle: "Hand-poured brass, silver, and copper pieces preserving ancient techniques.",
    badge: "14 Masterpieces",
    ctaText: "Explore Metalwork",
    ctaHref: "/categories/Home%20Decor",
  },
  {
    range: [0.82, 0.98],
    stepNum: "05",
    tag: "OTHER DISCIPLINES",
    title: "Explore Other Categories",
    subtitle: "Discover rare textiles, woodwork, miniatures, and historical masterworks.",
    badge: "50+ Masterpieces",
    ctaText: "Explore All",
    ctaHref: "/collections",
  },
];

export default function CategoryGalleryJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasDimensions = useRef({ w: 0, h: 0 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Initialize cached dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvasDimensions.current = {
        w: canvas.offsetWidth,
        h: canvas.offsetHeight,
      };
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Global preloader mount
  useEffect(() => {
    startGlobalFramePreload();
    setIsLoaded(true);
  }, []);

  // Render a frame onto canvas with aspect-fit / cover
  const renderFrameOnCanvas = useCallback((frameVal: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameVal)));
    const img = getFrameWithFallback(categoryCache, frameIdx, getCategoryFrameUrl, "/bg1.jpg");
    if (!img) return;

    // Use cached width/height
    let cw = canvasDimensions.current.w;
    let ch = canvasDimensions.current.h;
    if (cw === 0 || ch === 0) {
      cw = canvas.offsetWidth || window.innerWidth;
      ch = canvas.offsetHeight || window.innerHeight;
      canvasDimensions.current = { w: cw, h: ch };
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = Math.floor(cw * dpr);
    const displayHeight = Math.floor(ch * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgWidth = img.naturalWidth || 960;
    const imgHeight = img.naturalHeight || 540;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // RAF loop for responsive 60fps frame scrubbing
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      const absDiff = Math.abs(diff);
      
      if (absDiff > 0.001) {
        // Majestic lerp at 0.08 speed and cap max frame step per tick to 2 frames
        const step = diff * 0.08;
        const clampedStep = Math.sign(step) * Math.min(2, Math.abs(step));
        currentFrameRef.current += clampedStep;
        renderFrameOnCanvas(currentFrameRef.current);
      } else if (currentFrameRef.current !== targetFrameRef.current) {
        currentFrameRef.current = targetFrameRef.current;
        renderFrameOnCanvas(currentFrameRef.current);
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    rafIdRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [renderFrameOnCanvas]);

  // Window scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = container.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const rawProgress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      setScrollProgress(rawProgress);

      const targetIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(rawProgress * (TOTAL_FRAMES - 1)))
      );
      targetFrameRef.current = targetIndex;

      // Update active step overlay without overlapping boundary flicker
      const currentStepIdx = STEPS.findIndex(
        (s, idx) =>
          rawProgress >= s.range[0] &&
          (idx === STEPS.length - 1 ? rawProgress <= s.range[1] : rawProgress < s.range[1])
      );
      if (currentStepIdx !== -1 && currentStepIdx !== activeStepIdx) {
        setActiveStepIdx(currentStepIdx);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeStepIdx]);

  // Find active step and compute fade-in / fade-out opacity based on range progress
  const getActiveStepDetails = (prog: number) => {
    // 10 frames out of 2400 total frames is exactly 10 / 2400 = 0.0042 scroll progress
    const ACTIVE_WINDOW = 0.0042; 

    for (let i = 0; i < STEPS.length; i++) {
      const [start, end] = STEPS[i].range;
      if (prog >= start && prog <= end) {
        // Show category name only at the very beginning of the room entry
        if (prog <= start + ACTIVE_WINDOW) {
          const progressInStep = (prog - start) / ACTIVE_WINDOW; // [0, 1]
          
          let opacity = 0;
          if (progressInStep < 0.2) {
            opacity = progressInStep / 0.2; // Fade in over first 2 frames
          } else if (progressInStep > 0.7) {
            opacity = (1 - progressInStep) / 0.3; // Fade out over last 3 frames
          } else {
            opacity = 1; // Fully visible in the middle
          }
          return { step: STEPS[i], opacity };
        }
        // Vanish after 10 frames of scroll
        return { step: null, opacity: 0 };
      }
    }
    return { step: null, opacity: 0 };
  };

  const { step: currentActiveStep, opacity: cardOpacity } = getActiveStepDetails(scrollProgress);

  return (
    <section
      ref={containerRef}
      style={{
        position: "relative",
        height: "2400vh",
        backgroundColor: "var(--background)",
        color: "var(--text)",
        transition: "background-color 0.4s ease, color 0.4s ease",
      }}
    >
      {/* Sticky viewport frame */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--background)",
        }}
      >
        {/* Fullscreen Canvas Rendering Target */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            filter: "brightness(0.92) contrast(1.05)",
          }}
        />

        {/* Ambient overlay adapted to theme */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            backgroundColor: "rgba(10, 10, 12, 0.25)",
          }}
        />

        {/* Section Header Tag Overlay on top of canvas */}
        <div
          style={{
            position: "absolute",
            top: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 6,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 1.4rem",
              borderRadius: "30px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <span style={{ width: "18px", height: "1px", backgroundColor: "var(--accent)" }} />
            <span
              style={{
                fontSize: "0.68rem",
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontWeight: 700,
                fontFamily: "var(--font-playfair), Georgia, serif",
              }}
            >
              EXPLORE CRAFT DISCIPLINES
            </span>
            <span style={{ width: "18px", height: "1px", backgroundColor: "var(--accent)" }} />
          </div>
        </div>

        {/* Preloader overlay placeholder */}
        {!isLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              backgroundColor: "var(--background)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              color: "var(--text)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2px solid var(--glass-border)",
                borderTopColor: "var(--accent)",
                animation: "spin 1s linear infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              INITIALIZING CRAFT GALLERY...
            </span>
          </div>
        )}

        {/* ─── INTRO COVER SCREEN CARD (Shown at entry scroll progress < 0.02) ─── */}
        {scrollProgress < 0.02 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 8,
              textAlign: "center",
              width: "90%",
              maxWidth: "680px",
              padding: "3.5rem 3rem",
              borderRadius: "24px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--glass-border)",
              borderTop: "4px solid var(--accent)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.3)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              color: "var(--text)",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 1.2rem",
                borderRadius: "20px",
                backgroundColor: "rgba(212,175,55,0.12)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "var(--accent)",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginBottom: "1.2rem",
              }}
            >
              ✦ THE GUILD COLLECTION REGISTRY
            </div>
            <h2
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                color: "var(--text)",
                margin: "0 0 1rem",
                lineHeight: 1.15,
              }}
            >
              Masterwork Craft Disciplines
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                opacity: 0.82,
                lineHeight: 1.75,
                marginBottom: "2rem",
                color: "var(--text-muted)",
              }}
            >
              Scrub through 2,400 authenticated frames documenting generational ceramics, hand-hammered filigree jewelry, organic leather, and fine metalwork.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.8rem",
                justifyContent: "center",
                flexWrap: "wrap",
                fontSize: "0.72rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              {["Ceramics", "Jewelry", "Leather", "Metalwork", "Textiles"].map((cat) => (
                <span
                  key={cat}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: "15px",
                    border: "1px solid var(--glass-border)",
                    backgroundColor: "var(--background)",
                    color: "var(--text)",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── LUXURY GLASSMORPHIC CATEGORY OVERLAY CARD (Shown during scrubbing) ─── */}
        {currentActiveStep && (
          <Link
            href={currentActiveStep.ctaHref}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 8,
              opacity: cardOpacity,
              transition: "opacity 0.2s ease-out, transform 0.3s ease",
              pointerEvents: cardOpacity > 0.1 ? "auto" : "none",
              textAlign: "center",
              textDecoration: "none",
              width: "90%",
              maxWidth: "620px",
              padding: "3.5rem 3rem",
              borderRadius: "24px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--glass-border)",
              borderTop: "4px solid var(--accent)",
              boxShadow: isHovered 
                ? "0 35px 80px rgba(212,175,55,0.25)" 
                : "0 25px 60px rgba(0,0,0,0.3)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              color: "var(--text)",
            }}
          >
            {/* Step Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.4rem 1.2rem",
                borderRadius: "20px",
                backgroundColor: "rgba(212,175,55,0.12)",
                border: "1px solid rgba(212,175,55,0.35)",
                color: "var(--accent)",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginBottom: "1.2rem",
              }}
            >
              DISCIPLINE {currentActiveStep.stepNum} &bull; {currentActiveStep.tag}
            </div>

            {/* Category Title */}
            <h2
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                color: isHovered ? "var(--accent)" : "var(--text)",
                letterSpacing: "1px",
                margin: "0 0 0.8rem",
                lineHeight: 1.15,
                transition: "color 0.3s ease",
              }}
            >
              {currentActiveStep.title}
            </h2>

            {/* Category Subtitle */}
            <p
              style={{
                fontSize: "0.95rem",
                opacity: 0.85,
                lineHeight: 1.7,
                margin: "0 auto 1.8rem",
                maxWidth: "480px",
                color: "var(--text-muted)",
              }}
            >
              {currentActiveStep.subtitle}
            </p>

            {/* Badge & Action Button */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "20px",
                  border: "1px solid var(--glass-border)",
                  backgroundColor: "var(--background)",
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                ✓ {currentActiveStep.badge}
              </span>
              <span
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  padding: "0.7rem 1.8rem",
                  borderRadius: "8px",
                  backgroundColor: "var(--accent)",
                  color: "#000000",
                  fontWeight: 700,
                  boxShadow: "0 8px 20px rgba(212,175,55,0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {currentActiveStep.ctaText} &rarr;
              </span>
            </div>
          </Link>
        )}

        {/* Scroll Cue Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            fontSize: "0.58rem",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "var(--accent)",
            pointerEvents: "none",
            opacity: scrollProgress > 0.95 ? 0 : 1,
            transition: "opacity 0.5s ease",
            fontWeight: 600,
          }}
        >
          SCROLL TO SCRUB THROUGH DISCIPLINE GALLERY ↓
        </div>
      </div>
    </section>
  );
}
