const fs = require('fs');
const path = require('path');

const code = `"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const TOTAL_FRAMES = 240;

// Helper to format frame path
function getCoreFrameUrl(index: number): string {
  const safeIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
  const num = String(safeIdx + 1).padStart(4, "0");
  return \`/provenance-core/core_\${num}.webp\`;
}

// 5 Verification Stages with precise frame targets & luxury descriptions
const STAGES = [
  {
    id: "01",
    stageNum: 1,
    title: "Artisan Application & Lineage Audit",
    shortTitle: "Artisan Application",
    tag: "STAGE 01 — HERITAGE AUDIT",
    desc: "Generational lineage records, workshop photo archives, and family guild history are submitted to our Curation Board for historical authentication.",
    icon: "📜",
    targetFrame: 30, // Unboxing / initial dormant core floating
    status: "Generational Lineage Verified",
    badge: "Indus & Atlas Lineage",
  },
  {
    id: "02",
    stageNum: 2,
    title: "Advisory Curation Board Audit",
    shortTitle: "Advisory Curation",
    tag: "STAGE 02 — MATERIAL AUDIT",
    desc: "Independent craft council inspects raw material samples, verifying 80%+ quartz silica ceramics, pure mountain sheep wool, and zero synthetic pigments.",
    icon: "🔍",
    targetFrame: 80, // Architectural inner rings assembling
    status: "100% Organic & Hand-Woven",
    badge: "Quartz & Indigo Certified",
  },
  {
    id: "03",
    stageNum: 3,
    title: "GPS Geofenced Location Audit",
    shortTitle: "GPS Location Audit",
    tag: "STAGE 03 — PHYSICAL GEOFENCING",
    desc: "Regional field inspectors physically audit the atelier, establishing cryptographic GPS geofencing coordinates mapped to the exact workshop bounds.",
    icon: "📍",
    targetFrame: 130, // Verification nodes illuminate & rotate
    status: "Geofenced Coordinates Locked",
    badge: "GPS Attested Workshop",
  },
  {
    id: "04",
    stageNum: 4,
    title: "Cryptographic Passport Issuance",
    shortTitle: "Passport Issuance",
    tag: "STAGE 04 — LEDGER IMMUTABILITY",
    desc: "Every completed masterwork is laser-etched with a unique cryptographic serial hash paired with an encrypted NFC heritage passport registered on Britsync.",
    icon: "⚡",
    targetFrame: 180, // Authentication ring locks into alignment
    status: "Ledger Hash Engraved",
    badge: "NFC Encrypted Passport",
  },
  {
    id: "05",
    stageNum: 5,
    title: "Protected Escrow & Patron Release",
    shortTitle: "Protected Escrow",
    tag: "STAGE 05 — DIRECT PAYOUT",
    desc: "Patron funds remain secured in smart contract escrow until physical delivery is confirmed, instantly releasing 95% directly to the master artisan.",
    icon: "💎",
    targetFrame: 235, // Final escrow ring locks & golden verification pulse
    status: "Smart Escrow Active & Verified",
    badge: "95% Direct Artisan Payout",
  },
];

// Particle interface for ambient living background
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredStageIdx, setHoveredStageIdx] = useState<number | null>(null);

  // In-memory cache for frame images
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(STAGES[0].targetFrame);
  const microPulseRef = useRef(0);
  const particlesRef = useRef<DustParticle[]>([]);

  // Parallax scroll effects via Framer Motion
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgParallaxY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const coreFloatParallaxY = useTransform(scrollYProgress, [0, 1], ["20px", "-20px"]);

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
        reject(new Error(\`Failed to load core frame \${index}\`));
      };
    });
  }, []);

  // Preload essential frames + progressive background load remaining frames
  useEffect(() => {
    let isCancelled = false;

    async function preloadFrames() {
      try {
        const essential: number[] = [];
        // Load first 30 frames + target frame checkpoints for instant presentation
        for (let i = 0; i < 30; i++) essential.push(i);
        STAGES.forEach((s) => {
          for (let k = -4; k <= 4; k++) {
            const idx = s.targetFrame + k;
            if (idx >= 0 && idx < TOTAL_FRAMES) essential.push(idx);
          }
        });

        await Promise.all(essential.map((idx) => loadFrame(idx)));
        if (!isCancelled) {
          setIsLoaded(true);
        }

        // Load remaining frames progressively in chunks
        const remaining: number[] = [];
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (!essential.includes(i)) remaining.push(i);
        }

        const CHUNK_SIZE = 15;
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

  // Initialize ambient dust particles for living background atmosphere
  useEffect(() => {
    const particles: DustParticle[] = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
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

  // Helper to retrieve nearest cached frame image safely
  const getLoadedImage = useCallback((frameIdx: number): HTMLImageElement | null => {
    let img = imageCacheRef.current.get(frameIdx);
    if (img && img.complete) return img;

    // Fallback search to nearest available cached frame
    for (let delta = 1; delta <= 30; delta++) {
      const prev = imageCacheRef.current.get(frameIdx - delta);
      if (prev && prev.complete) return prev;
      const next = imageCacheRef.current.get(frameIdx + delta);
      if (next && next.complete) return next;
    }
    return null;
  }, []);

  // Render main 3D Core canvas (No background container, pure floating object)
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

      // Aspect-contain math for high-fidelity 3D core rendering
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

      // Apply subtle trigonometric float offset inside canvas context for butter-smooth motion
      ctx.save();
      ctx.translate(0, floatOffset * dpr * 0.8);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    },
    [getLoadedImage]
  );

  // Render ambient living background canvas (Full-bleed soft blurred living backdrop + dust particles)
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

      // 1. Draw frame animation full-width at soft 12% opacity with ambient blur
      const img = getLoadedImage(frameIdx);
      if (img) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.filter = "blur(18px)";
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

      // 2. Draw sweeping golden radial highlights synced with stage progress
      const stageProgress = activeStageIdx / (STAGES.length - 1);
      const lightX = w * (0.65 + Math.sin(time / 2000) * 0.08);
      const lightY = h * (0.45 + Math.cos(time / 2500) * 0.08);

      const radGlow = ctx.createRadialGradient(
        lightX,
        lightY,
        20 * dpr,
        lightX,
        lightY,
        Math.max(w, h) * 0.6
      );
      radGlow.addColorStop(0, \`rgba(212, 175, 55, \${0.14 + stageProgress * 0.06})\`);
      radGlow.addColorStop(0.5, "rgba(212, 175, 55, 0.03)");
      radGlow.addColorStop(1, "rgba(250, 249, 246, 0)");

      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, w, h);

      // 3. Render floating dust particles for magical museum exhibition atmosphere
      const particles = particlesRef.current;
      ctx.fillStyle = "#D4AF37";

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(time * p.pulseSpeed) * 0.005;

        // Loop boundary reset
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
    [activeStageIdx, getLoadedImage]
  );

  // Sync target frame when active stage changes
  useEffect(() => {
    const stage = STAGES[activeStageIdx];
    if (stage) {
      targetFrameRef.current = stage.targetFrame;
    }
  }, [activeStageIdx]);

  // Main RAF Lerp Loop at 60 FPS
  useEffect(() => {
    let animId: number;

    const tick = (time: number) => {
      // Natural 3D floating sine wave offset
      const floatOffset = Math.sin(time / 1100) * 10;
      microPulseRef.current = Math.sin(time / 1400) * 1.5;

      const baseTarget = targetFrameRef.current;
      const effectiveTarget = Math.max(
        0,
        Math.min(TOTAL_FRAMES - 1, baseTarget + microPulseRef.current)
      );

      const diff = effectiveTarget - currentFrameRef.current;

      if (Math.abs(diff) > 0.04) {
        currentFrameRef.current += diff * 0.14; // Smooth luxury lerp
      } else {
        currentFrameRef.current = effectiveTarget;
      }

      const frameToDraw = Math.round(currentFrameRef.current);
      renderMainCanvas(frameToDraw, floatOffset);
      renderBgCanvas(frameToDraw, time);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [renderMainCanvas, renderBgCanvas]);

  // Scroll observer: update active stage as section passes through viewport
  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      if (rect.top <= windowH * 0.65 && rect.bottom >= windowH * 0.35) {
        const total = rect.height - windowH * 0.5;
        const scrolled = Math.max(0, windowH * 0.5 - rect.top);
        const progress = Math.min(1, Math.max(0, scrolled / total));

        const newIdx = Math.min(
          STAGES.length - 1,
          Math.floor(progress * STAGES.length)
        );
        if (newIdx !== activeStageIdx && newIdx >= 0) {
          setActiveStageIdx(newIdx);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeStageIdx]);

  const activeStage = STAGES[activeStageIdx];

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        padding: "8.5rem 2rem 9.5rem",
        backgroundColor: "#FAF9F6", // Ivory Cream background
        color: "#1C1C1E",
        overflow: "hidden",
      }}
    >
      {/* ── FULL-WIDTH ANIMATED LIVING BACKDROP ── */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y: bgParallaxY,
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
      </motion.div>

      {/* Golden Radial Pulse when Stage 05 (Verified State) is Active */}
      <AnimatePresence>
        {activeStageIdx === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "40%",
              right: "20%",
              width: "700px",
              height: "700px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 75%)",
              filter: "blur(40px)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
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
            VERIFICATION PROTOCOL & PROVENANCE CORE
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              marginTop: "0.8rem",
              fontWeight: 300,
              color: "#1C1C1E",
              letterSpacing: "-0.01em",
            }}
          >
            How BritSync Safeguards Origin
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              opacity: 0.72,
              maxWidth: "640px",
              margin: "1rem auto 0",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "#4A4A4A",
            }}
          >
            Explore the 5-point verification journey while watching the 3D Provenance Core progressively assemble to lock authenticated origin.
          </motion.p>
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "4.5rem",
            alignItems: "center",
          }}
        >
          {/* ── LEFT COLUMN: Interactive Vertical Timeline (45%) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative" }}
          >
            {/* Animated Gold Progress Line */}
            <div
              style={{
                position: "absolute",
                top: "2.5rem",
                bottom: "2.5rem",
                left: "1.75rem",
                width: "2px",
                backgroundColor: "rgba(212, 175, 55, 0.18)",
                borderRadius: "2px",
                zIndex: 1,
              }}
            >
              <motion.div
                animate={{
                  height: \`\${(activeStageIdx / (STAGES.length - 1)) * 100}%\`,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: "100%",
                  backgroundColor: "#D4AF37",
                  boxShadow: "0 0 10px rgba(212, 175, 55, 0.7)",
                }}
              />
            </div>

            {/* Vertical Timeline Items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                position: "relative",
                zIndex: 2,
              }}
            >
              {STAGES.map((s, idx) => {
                const isActive = activeStageIdx === idx;
                const isHovered = hoveredStageIdx === idx;
                const isDimmed =
                  hoveredStageIdx !== null && hoveredStageIdx !== idx && !isActive;

                return (
                  <motion.div
                    key={s.id}
                    onClick={() => setActiveStageIdx(idx)}
                    onMouseEnter={() => setHoveredStageIdx(idx)}
                    onMouseLeave={() => setHoveredStageIdx(null)}
                    whileHover={{ x: 6, y: -2 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      backgroundColor: isActive
                        ? "#FFFFFF"
                        : isHovered
                        ? "rgba(255, 255, 255, 0.88)"
                        : "rgba(255, 255, 255, 0.45)",
                      border: isActive
                        ? "1.5px solid #D4AF37"
                        : isHovered
                        ? "1px solid rgba(212, 175, 55, 0.5)"
                        : "1px solid rgba(212, 175, 55, 0.15)",
                      borderRadius: "22px",
                      padding: isActive
                        ? "1.8rem 1.8rem 1.8rem 4.5rem"
                        : "1.25rem 1.4rem 1.25rem 4.5rem",
                      cursor: "pointer",
                      position: "relative",
                      opacity: isDimmed ? 0.55 : 1,
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isActive
                        ? "0 22px 50px rgba(212, 175, 55, 0.16), 0 4px 14px rgba(0,0,0,0.03)"
                        : isHovered
                        ? "0 12px 30px rgba(212, 175, 55, 0.12)"
                        : "0 2px 10px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* Stage Number Bullet */}
                    <div
                      style={{
                        position: "absolute",
                        left: "0.85rem",
                        top: isActive ? "1.8rem" : "1.25rem",
                        width: "1.8rem",
                        height: "1.8rem",
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#D4AF37" : "#FFFFFF",
                        border: isActive
                          ? "2px solid #D4AF37"
                          : "1.5px solid rgba(212, 175, 55, 0.35)",
                        color: isActive ? "#FFFFFF" : "#B8860B",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "monospace",
                        boxShadow: isActive
                          ? "0 0 16px rgba(212, 175, 55, 0.55)"
                          : "none",
                        transition: "all 0.4s ease",
                      }}
                    >
                      {s.id}
                    </div>

                    {/* Header Row */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: isActive ? "1.08rem" : "0.94rem",
                          fontFamily: "var(--font-playfair), Georgia, serif",
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "#1C1C1E" : "#4A4A4A",
                          margin: 0,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {s.shortTitle}
                      </h4>
                      <span
                        style={{
                          fontSize: "1.15rem",
                          opacity: isActive ? 1 : 0.4,
                          transform: isActive ? "scale(1.1)" : "scale(1)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {s.icon}
                      </span>
                    </div>

                    {/* Expanded Stage Detail Panel */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: "1.1rem" }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            style={{
                              fontSize: "0.62rem",
                              color: "#B8860B",
                              letterSpacing: "2.5px",
                              textTransform: "uppercase",
                              fontWeight: 700,
                              marginBottom: "0.45rem",
                            }}
                          >
                            {s.tag}
                          </div>
                          <p
                            style={{
                              fontSize: "0.88rem",
                              lineHeight: 1.68,
                              color: "#5A5A5E",
                              margin: "0 0 1.25rem 0",
                            }}
                          >
                            {s.desc}
                          </p>

                          {/* Status Badge & CTA Link */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "0.8rem",
                              paddingTop: "0.85rem",
                              borderTop: "1px solid rgba(212, 175, 55, 0.18)",
                            }}
                          >
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.45rem",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: "#B8860B",
                                backgroundColor: "rgba(212, 175, 55, 0.09)",
                                padding: "0.32rem 0.85rem",
                                borderRadius: "12px",
                                border: "1px solid rgba(212, 175, 55, 0.28)",
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
                              {s.status}
                            </div>

                            <Link
                              href="/docs/DASHBOARD_TESTING_GUIDE.md"
                              style={{
                                fontSize: "0.68rem",
                                textTransform: "uppercase",
                                letterSpacing: "1.5px",
                                fontWeight: 700,
                                color: "#1C1C1E",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.4rem",
                              }}
                            >
                              Inspect Audit Protocol &rarr;
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN: Floating 3D Provenance Core (55%) ── */}
          {/* NO rectangular box! The 3D object floats seamlessly on the webpage background */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "560px",
              y: coreFloatParallaxY,
            }}
          >
            {/* Natural Floating 3D Canvas Object */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "560px",
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Soft Ambient Radial Halo behind 3D object */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: "12%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.04) 55%, transparent 75%)",
                  filter: "blur(25px)",
                  pointerEvents: "none",
                }}
              />

              {/* Preloader spinner */}
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
                    LOADING PROVENANCE CORE 3D...
                  </span>
                </div>
              )}

              {/* Main Canvas rendering 3D Provenance Core with zero background container */}
              <canvas
                ref={mainCanvasRef}
                style={{
                  width: "92%",
                  height: "92%",
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 3,
                  filter:
                    hoveredStageIdx !== null
                      ? "brightness(1.15) drop-shadow(0 25px 45px rgba(212, 175, 55, 0.35))"
                      : "drop-shadow(0 25px 40px rgba(0,0,0,0.16))",
                  transition: "filter 0.4s ease",
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
                    bottom: "0.5rem",
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
                    {activeStage.badge}
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
                    FRAME {Math.round(currentFrameRef.current)}/240
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dynamic Soft Ambient Shadow beneath floating 3D Core */}
            <div
              aria-hidden="true"
              style={{
                width: "260px",
                height: "20px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(212, 175, 55, 0.08) 40%, transparent 70%)",
                marginTop: "0.4rem",
                filter: "blur(5px)",
                transition: "all 0.4s ease",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync('d:/store/src/components/SafeguardsOriginExperience.tsx', code, 'utf8');
console.log('Done writing SafeguardsOriginExperience.tsx');
