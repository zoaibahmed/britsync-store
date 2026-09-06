"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getCategoryCacheMap,
  startGlobalFramePreload,
  getCategoryFrameUrl,
  getFrameWithFallback,
} from "@/lib/globalFramePreloader";

const TOTAL_FRAMES = 2400;

const DISPLAY_WINDOW_FRAMES = 50;

// Timeline steps for categories with room opening frame markers
const STEPS = [
  {
    startFrame: 48,
    stepNum: "01",
    tag: "CERAMICS & POTTERY",
    title: "Masterwork Ceramics",
    subtitle: "Generational terracotta pottery and hand-glazed Iznik stoneware.",
    ctaText: "Explore Ceramics",
    ctaHref: "/categories/Ceramics",
  },
  {
    startFrame: 528,
    stepNum: "02",
    tag: "HERITAGE JEWELRY",
    title: "Heritage Jewelry",
    subtitle: "Exquisite hand-hammered gold filigree and museum-grade heritage gems.",
    ctaText: "Explore Jewelry",
    ctaHref: "/categories/Jewelry",
  },
  {
    startFrame: 1008,
    stepNum: "03",
    tag: "LEATHER MASTERPIECES",
    title: "Generational Leather",
    subtitle: "Organic vegetable-tanned hides crafted by master leatherworkers.",
    ctaText: "Explore Leather",
    ctaHref: "/categories/Leather",
  },
  {
    startFrame: 1488,
    stepNum: "04",
    tag: "METALWORK & ORNAMENTS",
    title: "Fine Metalwork",
    subtitle: "Hand-poured brass, silver, and copper pieces preserving ancient techniques.",
    ctaText: "Explore Metalwork",
    ctaHref: "/categories/Home%20Decor",
  },
  {
    startFrame: 1968,
    stepNum: "05",
    tag: "OTHER DISCIPLINES",
    title: "Explore Other Categories",
    subtitle: "Discover rare textiles, woodwork, miniatures, and historical masterworks.",
    ctaText: "Explore All",
    ctaHref: "/collections",
  },
];

export default function CategoryGalleryJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasDimensions = useRef({ w: 0, h: 0 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const lastDrawnImgRef = useRef<HTMLImageElement | null>(null);

  // Render a frame onto canvas with aspect-fit / cover & Bilinear Alpha Crossfade Blending
  const renderFrameOnCanvas = useCallback((frameVal: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const floorIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(frameVal)));
    const ceilIdx = Math.min(TOTAL_FRAMES - 1, floorIdx + 1);
    const alphaFrac = frameVal - floorIdx;

    const cCache = getCategoryCacheMap();
    let imgA = getFrameWithFallback(cCache, floorIdx, getCategoryFrameUrl);
    let imgB = getFrameWithFallback(cCache, ceilIdx, getCategoryFrameUrl);

    // Last-Frame Protection: Never clear canvas or show blank screen on slow VPS network
    if (imgA) {
      lastDrawnImgRef.current = imgA;
    } else if (lastDrawnImgRef.current) {
      imgA = lastDrawnImgRef.current;
    } else {
      return;
    }

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

    const imgWidth = imgA.naturalWidth || 960;
    const imgHeight = imgA.naturalHeight || 540;
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

    // Base frame render
    ctx.globalAlpha = 1.0;
    ctx.drawImage(imgA, offsetX, offsetY, drawWidth, drawHeight);

    // Cross-fade blend with next frame if available for 60 FPS smooth video feel
    if (imgB && imgB !== imgA && alphaFrac > 0.05) {
      ctx.globalAlpha = alphaFrac;
      ctx.drawImage(imgB, offsetX, offsetY, drawWidth, drawHeight);
      ctx.globalAlpha = 1.0;
    }
  }, []);

  // RAF loop for smooth 60fps frame scrubbing with gentle lerp physics
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      const absDiff = Math.abs(diff);
      
      if (absDiff > 0.001) {
        // Fluid, responsive tracking lerp with natural clamp for smooth scrub
        const step = Math.sign(diff) * Math.min(Math.abs(diff * 0.08), 2.5);
        currentFrameRef.current += step;
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
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Find active step and compute fade-in / fade-out opacity strictly for 50 frames when the room is opened
  const getActiveStepDetails = (prog: number) => {
    const currentFrame = Math.round(prog * (TOTAL_FRAMES - 1));

    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];
      const frameDiff = currentFrame - step.startFrame;

      // Strictly display for only 50 frames when that category room is opened
      if (frameDiff >= 0 && frameDiff <= DISPLAY_WINDOW_FRAMES) {
        let opacity = 0;
        if (frameDiff < 10) {
          opacity = frameDiff / 10; // Smooth 10-frame fade in
        } else if (frameDiff > 38) {
          opacity = Math.max(0, (DISPLAY_WINDOW_FRAMES - frameDiff) / 12); // Smooth 12-frame fade out
        } else {
          opacity = 1; // Fully visible
        }
        return { step, opacity };
      }
    }
    return { step: null, opacity: 0 };
  };

  const { step: currentActiveStep, opacity: cardOpacity } = getActiveStepDetails(scrollProgress);

  // Entrance text visibility: shows briefly at the start and fades out before Room 1 opens
  const currentFrame = Math.round(scrollProgress * (TOTAL_FRAMES - 1));
  let introOpacity = 0;
  if (currentFrame < 22) {
    introOpacity = 1;
  } else if (currentFrame <= 36) {
    introOpacity = Math.max(0, (36 - currentFrame) / 14);
  }

  return (
    <section
      ref={containerRef}
      style={{
        position: "relative",
        height: "1200vh",
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
              padding: "0.35rem 1.2rem",
              borderRadius: "30px",
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <span style={{ width: "16px", height: "1px", backgroundColor: "var(--accent)" }} />
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontWeight: 700,
                fontFamily: "var(--font-outfit), sans-serif",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              }}
            >
              EXPLORE CRAFT DISCIPLINES
            </span>
            <span style={{ width: "16px", height: "1px", backgroundColor: "var(--accent)" }} />
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

        {/* Global hover styling for clean editorial links */}
        <style jsx global>{`
          .category-explore-link:hover .category-arrow {
            transform: translateX(5px);
          }
          .category-explore-link:hover {
            color: #F3CD5A !important;
            border-bottom-color: #F3CD5A !important;
          }
        `}</style>

        {/* ─── INTRO ENTRANCE ON LEFT (Shown briefly at entrance, no box) ─── */}
        {introOpacity > 0.01 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "clamp(2rem, 7vw, 6.5rem)",
              transform: "translateY(-50%)",
              zIndex: 8,
              opacity: introOpacity,
              transition: "opacity 0.2s ease-out",
              pointerEvents: introOpacity > 0.1 ? "auto" : "none",
              maxWidth: "min(460px, 85vw)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.85rem",
              }}
            >
              <span style={{ width: "20px", height: "1px", backgroundColor: "#D4AF37" }} />
              <span
                style={{
                  fontFamily: "var(--font-outfit), sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.9)",
                }}
              >
                ✦ THE GUILD COLLECTION REGISTRY
              </span>
            </div>

            <h2
              style={{
                fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 400,
                color: "#FFFFFF",
                margin: "0 0 0.85rem",
                lineHeight: 1.12,
                letterSpacing: "-0.5px",
                textShadow: "0 3px 16px rgba(0, 0, 0, 0.95), 0 1px 4px rgba(0, 0, 0, 0.9)",
              }}
            >
              Masterwork Craft Disciplines
            </h2>

            <p
              style={{
                fontSize: "clamp(0.9rem, 1.1vw, 1.02rem)",
                fontFamily: "var(--font-outfit), sans-serif",
                lineHeight: 1.65,
                color: "rgba(255, 255, 255, 0.88)",
                margin: "0 0 1.2rem",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.9)",
              }}
            >
              Scrub to explore generational workshops, rare ceramics, filigree jewelry, organic leather, and fine metalwork.
            </p>
          </div>
        )}

        {/* ─── ELEGANT LEFT-ALIGNED CATEGORY TYPOGRAPHY (No Box, 50 Frames only) ─── */}
        {currentActiveStep && cardOpacity > 0.01 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "clamp(2rem, 7vw, 6.5rem)",
              transform: "translateY(-50%)",
              zIndex: 8,
              opacity: cardOpacity,
              transition: "opacity 0.2s ease-out",
              pointerEvents: cardOpacity > 0.1 ? "auto" : "none",
              maxWidth: "min(460px, 85vw)",
              textAlign: "left",
            }}
          >
            {/* Discipline Tag Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.85rem",
              }}
            >
              <span style={{ width: "20px", height: "1px", backgroundColor: "#D4AF37" }} />
              <span
                style={{
                  fontFamily: "var(--font-outfit), sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.9)",
                }}
              >
                DISCIPLINE {currentActiveStep.stepNum} &bull; {currentActiveStep.tag}
              </span>
            </div>

            {/* Category Title */}
            <h2
              style={{
                fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 400,
                color: "#FFFFFF",
                margin: "0 0 0.85rem",
                lineHeight: 1.12,
                letterSpacing: "-0.5px",
                textShadow: "0 3px 16px rgba(0, 0, 0, 0.95), 0 1px 4px rgba(0, 0, 0, 0.9)",
              }}
            >
              {currentActiveStep.title}
            </h2>

            {/* Category Subtitle */}
            <p
              style={{
                fontSize: "clamp(0.9rem, 1.1vw, 1.02rem)",
                fontFamily: "var(--font-outfit), sans-serif",
                lineHeight: 1.65,
                color: "rgba(255, 255, 255, 0.88)",
                margin: "0 0 1.5rem",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.9)",
              }}
            >
              {currentActiveStep.subtitle}
            </p>

            {/* Clean Left-Aligned Editorial CTA Link */}
            <div>
              <Link
                href={currentActiveStep.ctaHref}
                className="category-explore-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontFamily: "var(--font-outfit), sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                  textDecoration: "none",
                  paddingBottom: "4px",
                  borderBottom: "1px solid #D4AF37",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.9)",
                  transition: "all 0.25s ease",
                }}
              >
                <span>{currentActiveStep.ctaText}</span>
                <span className="category-arrow" style={{ transition: "transform 0.25s ease" }}>&rarr;</span>
              </Link>
            </div>
          </div>
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
