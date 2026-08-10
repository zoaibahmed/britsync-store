"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  getGlobeCacheMap,
  startGlobalFramePreload,
  getGlobeFrameUrl,
  getFrameWithFallback,
} from "@/lib/globalFramePreloader";

const TOTAL_FRAMES = 130;

// Timeline steps for overlays
const STEPS = [
  {
    range: [0, 0.22],
    stepNum: "01",
    tag: "SOUTH ASIA REGIONAL GUILD",
    title: "Indus Valley & Saharanpur Ateliers",
    subtitle: "Tracking geographically attested masterwork ateliers across the Indus basin & North Indian hardwood forests.",
    badge: "🇵🇰 🇮🇳 South Asia Region",
    artisan: "Aisha Studio & Rajesh Atelier",
    region: "Sindh Valley & Saharanpur",
    ctaText: "Explore Asian Masterworks",
    ctaHref: "/categories/Textiles",
  },
  {
    range: [0.22, 0.44],
    stepNum: "02",
    tag: "HERITAGE CRAFT AUDIT",
    title: "Jaali Teak & Natural Indigo Ajrak",
    subtitle: "5,000-year resist-dyeing pressed into handspun cotton & hand-carved teak Jaali screens.",
    badge: "🌿 100% Organic & Hand-Carved",
    artisan: "Master Craftsmen Guild",
    region: "Uttar Pradesh & Sindh",
    ctaText: "Inspect Textile Masterworks",
    ctaHref: "/categories/Textiles",
  },
  {
    range: [0.44, 0.54],
    stepNum: "TRANSIT",
    tag: "TRANSCONTINENTAL CORRIDOR",
    title: "Intercontinental Flight Corridor",
    subtitle: "Crossing maritime airspace from South Asia into North Africa's High Atlas mountain ranges...",
    badge: "☁️ Trans-Continental Transit",
    artisan: "Aerial Corridor",
    region: "Intercontinental Flight",
    ctaText: "View Atelier Passport",
    ctaHref: "/search",
  },
  {
    range: [0.54, 0.76],
    stepNum: "03",
    tag: "NORTH AFRICA REGIONAL GUILD",
    title: "High Atlas Mountain Looms",
    subtitle: "Generational hand-woven Berber & Kilim rugs dyed with saffron, pomegranate & Atlas cedar.",
    badge: "🇲🇦 Morocco Atlas Region",
    artisan: "Fatima Loom Co-op",
    region: "Aït Bouguemez Valley",
    ctaText: "Explore Moroccan Weaves",
    ctaHref: "/categories/Textiles",
  },
  {
    range: [0.76, 1.0],
    stepNum: "04",
    tag: "PROTECTED APPELLATIONS",
    title: "Geographically Attested Regional Guilds",
    subtitle: "Zero synthetic fibers permitted. Cryptographic GPS geofencing & provenance passport verified across active regional guilds.",
    badge: "🟢 2 Active Regional Guilds",
    artisan: "Global Artisan Collective",
    region: "Indus & High Atlas Guilds",
    ctaText: "Explore All Appellations",
    ctaHref: "/collections",
  },
];

export default function ArtisanGlobeJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasDimensions = useRef({ w: 0, h: 0 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
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

  // Render a frame onto canvas with aspect-fit / cover
  const renderFrameOnCanvas = useCallback((frameVal: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameVal)));
    const img = getFrameWithFallback(getGlobeCacheMap(), frameIdx, getGlobeFrameUrl, "/hero-artisan.jpg");
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

    // Cover scale calculation
    const imgWidth = img.naturalWidth || 1280;
    const imgHeight = img.naturalHeight || 720;
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
      if (absDiff > 0.05) {
        // Majestic lerp at 0.08 speed and cap max frame step per tick to 2 frames
        const step = diff * 0.08;
        const clampedStep = Math.sign(step) * Math.min(2, Math.abs(step));
        currentFrameRef.current += clampedStep;
        renderFrameOnCanvas(currentFrameRef.current);
      } else if (Math.round(currentFrameRef.current) !== Math.round(targetFrameRef.current)) {
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

  const activeStep = STEPS[activeStepIdx] || STEPS[0];

  return (
    <section
      ref={containerRef}
      style={{
        position: "relative",
        height: "650vh",
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

        {/* Ambient Overlay */}
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
                border: "2px solid rgba(212,175,55,0.2)",
                borderTopColor: "#D4AF37",
                animation: "spin 1s linear infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "rgba(212,175,55,0.7)",
                fontWeight: 600,
              }}
            >
              INITIALIZING REGIONAL FLIGHT...
            </span>
          </div>
        )}

        {/* Top Header Glass Tag */}
        <div
          style={{
            position: "absolute",
            top: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            textAlign: "center",
            width: "90%",
            maxWidth: "600px",
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
              backgroundColor: "rgba(10, 12, 18, 0.75)",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              backdropFilter: "blur(16px)",
              fontSize: "0.68rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#D4AF37",
              fontWeight: 700,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#D4AF37",
                boxShadow: "0 0 8px #D4AF37",
              }}
            />
            GLOBAL ARTISAN REGISTRY &bull; 2 REGIONAL GUILDS
          </div>
        </div>

        {/* Bottom Museum Glass Plaque Card */}
        <div
          style={{
            position: "absolute",
            bottom: "3rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            width: "92%",
            maxWidth: "920px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepIdx}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "2.2rem 2.8rem",
                borderRadius: "24px",
                backgroundColor: "rgba(6, 9, 16, 0.85)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                backdropFilter: "blur(24px)",
                boxShadow:
                  "0 30px 60px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.12)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.8rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "3rem",
                  width: "60px",
                  height: "3px",
                  backgroundColor: "#D4AF37",
                }}
              />
              <div style={{ flex: "1 1 320px" }}>
                {/* Step Overline */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.62rem",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#D4AF37",
                      fontWeight: 700,
                    }}
                  >
                    {activeStep.tag}
                  </span>
                  <div
                    style={{
                      height: "1px",
                      width: "30px",
                      backgroundColor: "rgba(212,175,55,0.4)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontFamily: "monospace",
                      color: "rgba(250,249,246,0.5)",
                    }}
                  >
                    STEP {activeStep.stepNum}
                  </span>
                </div>

                {/* Main Heading */}
                <h3
                  style={{
                    fontSize: "clamp(1.4rem, 2.5vw, 2.1rem)",
                    fontFamily: "var(--font-playfair, Georgia), serif",
                    fontWeight: 300,
                    color: "#FAF9F6",
                    margin: 0,
                    lineHeight: 1.15,
                  }}
                >
                  {activeStep.title}
                </h3>

                {/* Subtitle */}
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(250, 249, 246, 0.72)",
                    margin: "0.5rem 0 0 0",
                    lineHeight: 1.6,
                    maxWidth: "520px",
                  }}
                >
                  {activeStep.subtitle}
                </p>
              </div>

              {/* Action & Metadata Badge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.8rem",
                }}
              >
                <div
                  style={{
                    padding: "0.45rem 1rem",
                    borderRadius: "16px",
                    backgroundColor: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#D4AF37",
                    letterSpacing: "1px",
                  }}
                >
                  {activeStep.badge}
                </div>

                <Link
                  href={activeStep.ctaHref}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem 1.6rem",
                    borderRadius: "10px",
                    backgroundColor: "#D4AF37",
                    color: "#020408",
                    fontSize: "0.72rem",
                    letterSpacing: "1.8px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
                  }}
                >
                  {activeStep.ctaText} &rarr;
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Scroll Scrub Progress Line */}
          <div
            style={{
              marginTop: "1rem",
              width: "100%",
              height: "2px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${scrollProgress * 100}%`,
                backgroundColor: "#D4AF37",
                transition: "width 0.1s linear",
                boxShadow: "0 0 10px #D4AF37",
              }}
            />
          </div>
        </div>

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
            color: "rgba(212, 175, 55, 0.5)",
            pointerEvents: "none",
            opacity: scrollProgress > 0.95 ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        >
          SCROLL DOWN TO FLIGHT PATTERN ↓
        </div>
      </div>
    </section>
  );
}
