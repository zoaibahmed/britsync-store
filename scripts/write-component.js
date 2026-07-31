const fs = require('fs');

const fileContent = `"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import Link from "next/link";

const TOTAL_FRAMES = 360;

// Helper to format frame path
function getCoreFrameUrl(index: number): string {
  const safeIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
  const num = String(safeIdx + 1).padStart(4, "0");
  return "/provenance-core/core_" + num + ".webp";
}

// 5 Verification Stages with exact frame boundaries
const STAGES = [
  {
    id: "01",
    stageNum: 1,
    title: "Artisan Application & Lineage Audit",
    shortTitle: "Artisan Application",
    tag: "STAGE 01 — HERITAGE AUDIT",
    desc: "Generational lineage records, workshop photo archives, and family guild history are submitted to our Curation Board for historical authentication.",
    icon: "📜",
    minFrame: 0,
    maxFrame: 70,
    targetFrame: 35,
    status: "Generational Lineage Verified",
    badge: "Indus & Atlas Lineage",
    phaseLabel: "Dormant Core & Heritage Archives",
  },
  {
    id: "02",
    stageNum: 2,
    title: "Advisory Curation Board Audit",
    shortTitle: "Advisory Curation",
    tag: "STAGE 02 — MATERIAL AUDIT",
    desc: "Independent craft council inspects raw material samples, verifying 80%+ quartz silica ceramics, pure mountain sheep wool, and zero synthetic pigments.",
    icon: "🔍",
    minFrame: 71,
    maxFrame: 140,
    targetFrame: 105,
    status: "100% Organic & Hand-Woven",
    badge: "Quartz & Indigo Certified",
    phaseLabel: "Architectural Outer Ring Assembly",
  },
  {
    id: "03",
    stageNum: 3,
    title: "GPS Geofenced Location Audit",
    shortTitle: "GPS Location Audit",
    tag: "STAGE 03 — PHYSICAL GEOFENCING",
    desc: "Regional field inspectors physically audit the atelier, establishing cryptographic GPS geofencing coordinates mapped to the exact workshop bounds.",
    icon: "📍",
    minFrame: 141,
    maxFrame: 210,
    targetFrame: 175,
    status: "Geofenced Coordinates Locked",
    badge: "GPS Attested Workshop",
    phaseLabel: "Authentication Ring Alignment",
  },
  {
    id: "04",
    stageNum: 4,
    title: "Cryptographic Passport Issuance",
    shortTitle: "Passport Issuance",
    tag: "STAGE 04 — LEDGER IMMUTABILITY",
    desc: "Every completed masterwork is laser-etched with a unique cryptographic serial hash paired with an encrypted NFC heritage passport registered on Britsync.",
    icon: "⚡",
    minFrame: 211,
    maxFrame: 280,
    targetFrame: 245,
    status: "Ledger Hash Engraved",
    badge: "NFC Encrypted Passport",
    phaseLabel: "Verification Nodes Illumination",
  },
  {
    id: "05",
    stageNum: 5,
    title: "Protected Escrow & Patron Release",
    shortTitle: "Protected Escrow",
    tag: "STAGE 05 — DIRECT PAYOUT",
    desc: "Patron funds remain secured in smart contract escrow until physical delivery is confirmed, instantly releasing 95% directly to the master artisan.",
    icon: "💎",
    minFrame: 281,
    maxFrame: 359,
    targetFrame: 355,
    status: "Smart Escrow Active & Verified",
    badge: "95% Direct Artisan Payout",
    phaseLabel: "Final Lock & Golden Verification Pulse",
  },
];

// Particle interface for ambient living backdrop
interface DustParticle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  pulseSpeed: number;
}

export default function SafeguardsOriginExperience() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredStageIdx, setHoveredStageIdx] = useState<number | null>(null);

  // Frame Cache & Interpolation refs
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const isScrollDrivenRef = useRef(true);
  const microPulseRef = useRef(0);
  const particlesRef = useRef<DustParticle[]>([]);

  // Parallax scroll effects via Framer Motion
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  // Single Frame Preloader
  const loadFrame = useCallback((index: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const existing = imageCacheRef.current.get(index);
      if (existing && existing.complete) {
        resolve(existing);
        return;
      }
      const img = new Image();
      img.src = getCoreFrameUrl(index);
      img.onload = () => {
        imageCacheRef.current.set(index, img);
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error("Failed to load core frame " + index));
      };
    });
  }, []);

  // Preload priority frames + progressive background preloader
  useEffect(() => {
    let isCancelled = false;

    async function preloadFrames() {
      try {
        const essential: number[] = [];
        // First 40 frames + stage checkpoints for instant render
        for (let i = 0; i < 40; i++) essential.push(i);
        STAGES.forEach((s) => {
          for (let k = -5; k <= 5; k++) {
            const idx = s.targetFrame + k;
            if (idx >= 0 && idx < TOTAL_FRAMES) essential.push(idx);
          }
        });

        await Promise.all(essential.map((idx) => loadFrame(idx)));
        if (!isCancelled) {
          setIsLoaded(true);
        }

        // Load remaining frames progressively
        const remaining: number[] = [];
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (!essential.includes(i)) remaining.push(i);
        }

        const CHUNK_SIZE = 20;
        for (let i = 0; i < remaining.length; i += CHUNK_SIZE) {
          if (isCancelled) break;
          const chunk = remaining.slice(i, i + CHUNK_SIZE);
          await Promise.all(chunk.map((idx) => loadFrame(idx).catch(() => {})));
          await new Promise((r) => setTimeout(r, 16));
        }
      } catch (err) {
        console.error("Provenance Core preloader notice:", err);
      }
    }

    preloadFrames();
    return () => {
      isCancelled = true;
    };
  }, [loadFrame]);

  // Ambient dust particle initialization
  useEffect(() => {
    const particles: DustParticle[] = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * 1000,
        y: Math.random() * 800,
        radius: Math.random() * 1.8 + 0.6,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.4 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Helper to retrieve nearest cached frame safely
  const getLoadedImage = useCallback((frameIdx: number): HTMLImageElement | null => {
    let img = imageCacheRef.current.get(frameIdx);
    if (img && img.complete) return img;

    for (let delta = 1; delta <= 30; delta++) {
      const prev = imageCacheRef.current.get(frameIdx - delta);
      if (prev && prev.complete) return prev;
      const next = imageCacheRef.current.get(frameIdx + delta);
      if (next && next.complete) return next;
    }
    return null;
  }, []);

  // Render main 3D Core canvas (Borderless floating 3D object)
  const renderMainCanvas = useCallback(
    (frameIdx: number, floatOffset: number) => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = getLoadedImage(frameIdx);
      if (!img) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const displayWidth = Math.floor(rect.width * dpr);
      const displayHeight = Math.floor(rect.height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imgWidth = img.naturalWidth || 1280;
      const imgHeight = img.naturalHeight || 720;
      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.save();
      ctx.translate(0, floatOffset * dpr * 0.8);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    },
    [getLoadedImage]
  );

  // Render full-bleed living background canvas
  const renderBgCanvas = useCallback(
    (frameIdx: number, time: number) => {
      const canvas = bgCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);

      // 1. Soft blurred full-width background frame
      const img = getLoadedImage(frameIdx);
      if (img) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.filter = "blur(22px)";
        const imgRatio = (img.naturalWidth || 1280) / (img.naturalHeight || 720);
        let drawW = w;
        let drawH = w / imgRatio;
        if (drawH < h) {
          drawH = h;
          drawW = h * imgRatio;
        }
        ctx.drawImage(img, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
        ctx.restore();
      }

      // 2. Sweeping golden radial glow
      const progress = currentFrameRef.current / (TOTAL_FRAMES - 1);
      const lightX = w * (0.65 + Math.sin(time / 2200) * 0.08);
      const lightY = h * (0.45 + Math.cos(time / 2600) * 0.08);

      const radGlow = ctx.createRadialGradient(
        lightX,
        lightY,
        20 * dpr,
        lightX,
        lightY,
        Math.max(w, h) * 0.65
      );
      radGlow.addColorStop(0, "rgba(212, 175, 55, " + (0.14 + progress * 0.08) + ")");
      radGlow.addColorStop(0.5, "rgba(212, 175, 55, 0.03)");
      radGlow.addColorStop(1, "rgba(250, 249, 246, 0)");

      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, w, h);

      // 3. Floating dust particles
      const particles = particlesRef.current;
      ctx.fillStyle = "#D4AF37";

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(time * p.pulseSpeed) * 0.005;

        if (p.y < -20) p.y = h / dpr + 20;
        if (p.x < -20) p.x = w / dpr + 20;
        if (p.x > w / dpr + 20) p.x = -20;

        const pX = (p.x / 1000) * w;
        const pY = (p.y / 800) * h;
        const alpha = Math.max(0.05, Math.min(0.45, p.alpha));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pX, pY, p.radius * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    },
    [getLoadedImage]
  );

  // Sync scroll position to target frame
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (isScrollDrivenRef.current) {
        // Map 0..1 scroll progress to 0..359 frames
        const rawTarget = latest * (TOTAL_FRAMES - 1);
        targetFrameRef.current = Math.max(0, Math.min(TOTAL_FRAMES - 1, rawTarget));
      }
    });
  }, [scrollYProgress]);

  // Main RAF Lerp Loop for continuous 60 FPS interpolation
  useEffect(() => {
    let animId: number;

    const tick = (time: number) => {
      const floatOffset = Math.sin(time / 1100) * 10;
      microPulseRef.current = Math.sin(time / 1400) * 1.5;

      const baseTarget = targetFrameRef.current;
      const effectiveTarget = Math.max(
        0,
        Math.min(TOTAL_FRAMES - 1, baseTarget + microPulseRef.current)
      );

      const diff = effectiveTarget - currentFrameRef.current;

      // Lerp interpolation (0.10 factor for ultra-smooth 60fps continuous feel)
      if (Math.abs(diff) > 0.02) {
        currentFrameRef.current += diff * 0.10;
      } else {
        currentFrameRef.current = effectiveTarget;
      }

      const currentFrameVal = Math.round(currentFrameRef.current);

      // Determine active stage based on frame ranges
      let matchedIdx = 0;
      for (let i = 0; i < STAGES.length; i++) {
        if (
          currentFrameVal >= STAGES[i].minFrame &&
          currentFrameVal <= STAGES[i].maxFrame
        ) {
          matchedIdx = i;
          break;
        }
      }
      if (matchedIdx !== activeStageIdx) {
        setActiveStageIdx(matchedIdx);
      }

      renderMainCanvas(currentFrameVal, floatOffset);
      renderBgCanvas(currentFrameVal, time);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [activeStageIdx, renderMainCanvas, renderBgCanvas]);

  // Stage click navigation override
  const handleStageClick = (idx: number) => {
    isScrollDrivenRef.current = false;
    setActiveStageIdx(idx);
    targetFrameRef.current = STAGES[idx].targetFrame;

    // Re-enable scroll-driven tracking after smooth transition
    setTimeout(() => {
      isScrollDrivenRef.current = true;
    }, 800);
  };

  const activeStage = STAGES[activeStageIdx];

  return (
    <div
      ref={runwayRef}
      style={{
        position: "relative",
        height: "350vh", // Tall scroll runway to pin section for Apple-style scrub
        backgroundColor: "#FAF9F6",
      }}
    >
      {/* ── STICKY PINNED CONTAINER (100vh) ── */}
      <div
        ref={stickyRef}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          backgroundColor: "#FAF9F6",
          color: "#1C1C1E",
        }}
      >
        {/* ── FULL-WIDTH LIVING BACKGROUND ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <canvas
            ref={bgCanvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        </div>

        {/* Golden Radial Pulse on Final Verified Stage */}
        <AnimatePresence>
          {activeStageIdx === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.18 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: "35%",
                right: "18%",
                width: "750px",
                height: "750px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(212, 175, 55, 0.24) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 75%)",
                filter: "blur(45px)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          )}
        </AnimatePresence>

        {/* Main Content Container */}
        <div
          style={{
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            padding: "0 2rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Section Header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                color: "#B8860B",
                fontSize: "0.72rem",
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
              }}
            >
              SCROLL-DRIVEN VERIFICATION STORY & PROVENANCE CORE
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                marginTop: "0.6rem",
                fontWeight: 300,
                color: "#1C1C1E",
                letterSpacing: "-0.01em",
              }}
            >
              How BritSync Safeguards Origin
            </motion.h2>
          </div>

          {/* 2-Column Desktop Grid Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            {/* ── LEFT COLUMN: Dynamically Synchronized Stage Text (45%) ── */}
            <div style={{ minHeight: "380px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.id}
                  initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.88)",
                    border: "1.5px solid #D4AF37",
                    borderRadius: "24px",
                    padding: "2.4rem",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 25px 55px rgba(212, 175, 55, 0.16), 0 4px 16px rgba(0,0,0,0.03)",
                    position: "relative",
                  }}
                >
                  {/* Stage Number & Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.2rem",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        backgroundColor: "#D4AF37",
                        color: "#FFFFFF",
                        padding: "0.4rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        fontFamily: "monospace",
                        boxShadow: "0 0 16px rgba(212, 175, 55, 0.5)",
                      }}
                    >
                      STAGE {activeStage.id} / 05
                    </div>

                    <span style={{ fontSize: "1.6rem" }}>{activeStage.icon}</span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "#B8860B",
                      letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {activeStage.tag}
                  </div>

                  <h3
                    style={{
                      fontSize: "1.6rem",
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontWeight: 400,
                      color: "#1C1C1E",
                      marginBottom: "1rem",
                      lineHeight: 1.25,
                    }}
                  >
                    {activeStage.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.92rem",
                      lineHeight: 1.72,
                      color: "#5A5A5E",
                      marginBottom: "1.6rem",
                    }}
                  >
                    {activeStage.desc}
                  </p>

                  {/* Assembly Phase Label & Status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.8rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        color: "#B8860B",
                        backgroundColor: "rgba(212, 175, 55, 0.09)",
                        padding: "0.38rem 0.9rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: "#D4AF37",
                          boxShadow: "0 0 8px #D4AF37",
                        }}
                      />
                      {activeStage.status}
                    </div>

                    <Link
                      href="/docs/DASHBOARD_TESTING_GUIDE.md"
                      style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        fontWeight: 700,
                        color: "#1C1C1E",
                        textDecoration: "none",
                      }}
                    >
                      Inspect Protocol &rarr;
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Stage Progress Bullets Navigator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.8rem",
                  marginTop: "2rem",
                }}
              >
                {STAGES.map((s, idx) => {
                  const isActive = activeStageIdx === idx;
                  const isHovered = hoveredStageIdx === idx;

                  return (
                    <button
                      key={s.id}
                      onClick={() => handleStageClick(idx)}
                      onMouseEnter={() => setHoveredStageIdx(idx)}
                      onMouseLeave={() => setHoveredStageIdx(null)}
                      title={"Jump to Stage " + s.id + ": " + s.shortTitle}
                      style={{
                        height: "8px",
                        width: isActive ? "36px" : isHovered ? "20px" : "10px",
                        borderRadius: "4px",
                        backgroundColor: isActive ? "#D4AF37" : "rgba(212, 175, 55, 0.3)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        boxShadow: isActive ? "0 0 10px rgba(212, 175, 55, 0.6)" : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Borderless 3D Floating Core Canvas (55%) ── */}
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "520px",
              }}
            >
              {/* Natural 3D Floating Canvas (NO border, NO rectangle box!) */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "540px",
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Soft Radial Ambient Halo */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "10%",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.04) 55%, transparent 75%)",
                    filter: "blur(28px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Preloader Spinner */}
                {!isLoaded && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1rem",
                      zIndex: 5,
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        border: "2px solid rgba(212,175,55,0.2)",
                        borderTopColor: "#D4AF37",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.68rem",
                        letterSpacing: "2.5px",
                        textTransform: "uppercase",
                        color: "#B8860B",
                        fontWeight: 600,
                      }}
                    >
                      LOADING 360 PROVENANCE CORE...
                    </span>
                  </div>
                )}

                {/* Main Canvas rendering 3D Provenance Core */}
                <canvas
                  ref={mainCanvasRef}
                  style={{
                    width: "94%",
                    height: "94%",
                    objectFit: "contain",
                    position: "relative",
                    zIndex: 3,
                    filter: "drop-shadow(0 28px 45px rgba(0,0,0,0.16))",
                  }}
                />

                {/* Floating Stage Badge Overlay on Object */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStageIdx}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      position: "absolute",
                      bottom: "0.2rem",
                      padding: "0.75rem 1.4rem",
                      borderRadius: "18px",
                      backgroundColor: "rgba(255, 255, 255, 0.92)",
                      border: "1px solid rgba(212, 175, 55, 0.35)",
                      backdropFilter: "blur(14px)",
                      boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      zIndex: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#B8860B",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      {activeStage.phaseLabel}
                    </span>
                    <div
                      style={{
                        width: "1px",
                        height: "16px",
                        backgroundColor: "rgba(212, 175, 55, 0.3)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontFamily: "monospace",
                        color: "#1C1C1E",
                      }}
                    >
                      FRAME {Math.round(currentFrameRef.current)}/360
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dynamic Soft Ambient Shadow */}
              <div
                aria-hidden="true"
                style={{
                  width: "270px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(212, 175, 55, 0.08) 40%, transparent 70%)",
                  marginTop: "0.4rem",
                  filter: "blur(5px)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('d:/store/src/components/SafeguardsOriginExperience.tsx', fileContent, 'utf8');
console.log('Successfully wrote SafeguardsOriginExperience.tsx with 360 frames & scroll pin!');
