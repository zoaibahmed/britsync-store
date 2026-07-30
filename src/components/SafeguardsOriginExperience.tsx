"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const TOTAL_FRAMES = 240;

// Helper to format frame path
function getCoreFrameUrl(index: number): string {
  const safeIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
  const num = String(safeIdx + 1).padStart(4, "0");
  return `/provenance-core/core_${num}.webp`;
}

// 5 Verification Stages
const STAGES = [
  {
    id: "01",
    stageNum: 1,
    title: "Artisan Application & Lineage Check",
    shortTitle: "Artisan Application",
    tag: "STAGE 01 — HERITAGE AUDIT",
    desc: "Artisans submit family lineage records, generational craft archives, and workshop photo/video proof to our Curation Board for historical verification.",
    icon: "📜",
    targetFrame: 30, // Unboxing / initial core floating
    frameRange: [0, 45],
    status: "Generational Lineage Verified",
    badge: "Indus & Atlas Lineage",
  },
  {
    id: "02",
    stageNum: 2,
    title: "Advisory Curation Board Audit",
    shortTitle: "Advisory Curation",
    tag: "STAGE 02 — MATERIAL AUDIT",
    desc: "Our independent craft council inspects raw material samples, verifying 80%+ quartz silica ceramics, pure mountain sheep wool, and zero synthetic pigments or automated machinery.",
    icon: "🔍",
    targetFrame: 80, // Inner assembly rings forming
    frameRange: [46, 95],
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
    targetFrame: 130, // Verification ring appears & rotates
    frameRange: [96, 143],
    status: "Geofenced Coordinates Locked",
    badge: "GPS Attested Workshop",
  },
  {
    id: "04",
    stageNum: 4,
    title: "Cryptographic Passport Issuance",
    shortTitle: "Passport Issuance",
    tag: "STAGE 04 — LEDGER IMMUTABILITY",
    desc: "Every completed masterwork is laser-etched with a unique cryptographic hash and paired with an encrypted NFC heritage passport registered on Britsync's ledger.",
    icon: "⚡",
    targetFrame: 180, // Authentication ring locks into place
    frameRange: [144, 191],
    status: "Ledger Hash Engraved",
    badge: "NFC Encrypted Passport",
  },
  {
    id: "05",
    stageNum: 5,
    title: "Protected Escrow & Patron Release",
    shortTitle: "Protected Escrow",
    tag: "STAGE 05 — DIRECT PAYOUT",
    desc: "Patron funds remain secured in smart contract escrow until physical delivery is confirmed, instantly releasing 95% directly to the master artisan's guild.",
    icon: "💎",
    targetFrame: 235, // Final escrow ring locks & golden verification pulse
    frameRange: [192, 239],
    status: "Smart Escrow Active",
    badge: "95% Direct Artisan Payout",
  },
];

export default function SafeguardsOriginExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredStageIdx, setHoveredStageIdx] = useState<number | null>(null);

  // In-memory cache for frame images
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(STAGES[0].targetFrame);
  const microPulseRef = useRef(0);

  // Load single frame
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
        reject(new Error(`Failed to load core frame ${index}`));
      };
    });
  }, []);

  // Preload essential frames + progressive background load
  useEffect(() => {
    let isCancelled = false;

    async function preloadFrames() {
      try {
        // Priority 1: First 25 frames + anchor frames of each stage
        const essential: number[] = [];
        for (let i = 0; i < 25; i++) essential.push(i);
        STAGES.forEach((s) => {
          essential.push(s.targetFrame);
          essential.push(Math.max(0, s.targetFrame - 5));
          essential.push(Math.min(TOTAL_FRAMES - 1, s.targetFrame + 5));
        });

        await Promise.all(essential.map((idx) => loadFrame(idx)));
        if (!isCancelled) {
          setIsLoaded(true);
        }

        // Priority 2: Progressive background load remaining frames
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

  // Render canvas frame
  const renderFrameOnCanvas = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let img = imageCacheRef.current.get(frameIdx);

    if (!img || !img.complete) {
      // Fallback search to nearest loaded frame
      for (let delta = 1; delta <= 25; delta++) {
        const prevImg = imageCacheRef.current.get(frameIdx - delta);
        if (prevImg && prevImg.complete) {
          img = prevImg;
          break;
        }
        const nextImg = imageCacheRef.current.get(frameIdx + delta);
        if (nextImg && nextImg.complete) {
          img = nextImg;
          break;
        }
      }
    }

    if (!img) return;

    // High DPI Canvas sizing
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const displayWidth = Math.floor(rect.width * dpr);
    const displayHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aspect-contain scaling for 3D object presentation
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

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // Sync target frame when active stage changes
  useEffect(() => {
    const stage = STAGES[activeStageIdx];
    if (stage) {
      targetFrameRef.current = stage.targetFrame;
    }
  }, [activeStageIdx]);

  // RAF Lerp loop for smooth 60fps frame scrubbing & subtle 3D floating pulse
  useEffect(() => {
    let animId: number;

    const tick = (time: number) => {
      // Micro ambient floating oscillation (±2 frames subtle rotation) so object feels ALIVE in 3D
      microPulseRef.current = Math.sin(time / 1200) * 1.8;

      const baseTarget = targetFrameRef.current;
      const effectiveTarget = Math.max(
        0,
        Math.min(TOTAL_FRAMES - 1, baseTarget + microPulseRef.current)
      );

      const diff = effectiveTarget - currentFrameRef.current;

      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current += diff * 0.14; // Smooth luxury lerp factor
        renderFrameOnCanvas(Math.round(currentFrameRef.current));
      } else if (Math.round(currentFrameRef.current) !== Math.round(effectiveTarget)) {
        currentFrameRef.current = effectiveTarget;
        renderFrameOnCanvas(Math.round(currentFrameRef.current));
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [renderFrameOnCanvas]);

  // Scroll observer: update stage as user scrolls through the section
  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Check if section is within middle of viewport
      if (rect.top <= windowH * 0.6 && rect.bottom >= windowH * 0.4) {
        const total = rect.height - windowH * 0.5;
        const scrolled = Math.max(0, windowH * 0.5 - rect.top);
        const progress = Math.min(1, scrolled / total);

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
        padding: "8rem 2rem 9rem",
        backgroundColor: "#FAF9F6", // Ivory Cream background per brand guidelines
        color: "#1C1C1E",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Soft Glow Accents */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(212, 175, 55, 0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

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
            Explore the 5-stage verification protocol while watching the 3D Provenance Core progressively assemble to lock authenticated origin.
          </motion.p>
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
          {/* ── LEFT COLUMN: 5-Stage Interactive Vertical Timeline (45%) ── */}
          <div style={{ position: "relative" }}>
            {/* Connecting Vertical Progress Line */}
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
                  height: `${(activeStageIdx / (STAGES.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: "100%",
                  backgroundColor: "#D4AF37",
                  boxShadow: "0 0 8px rgba(212, 175, 55, 0.6)",
                }}
              />
            </div>

            {/* Vertical Timeline Items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                position: "relative",
                zIndex: 2,
              }}
            >
              {STAGES.map((s, idx) => {
                const isActive = activeStageIdx === idx;
                const isHovered = hoveredStageIdx === idx;

                return (
                  <motion.div
                    key={s.id}
                    onClick={() => setActiveStageIdx(idx)}
                    onMouseEnter={() => setHoveredStageIdx(idx)}
                    onMouseLeave={() => setHoveredStageIdx(null)}
                    whileHover={{ x: 6 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      backgroundColor: isActive
                        ? "#FFFFFF"
                        : isHovered
                        ? "rgba(255, 255, 255, 0.85)"
                        : "rgba(255, 255, 255, 0.45)",
                      border: isActive
                        ? "1.5px solid #D4AF37"
                        : isHovered
                        ? "1px solid rgba(212, 175, 55, 0.4)"
                        : "1px solid rgba(212, 175, 55, 0.15)",
                      borderRadius: "20px",
                      padding: isActive ? "1.8rem 1.8rem 1.8rem 4.5rem" : "1.2rem 1.4rem 1.2rem 4.5rem",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isActive
                        ? "0 20px 45px rgba(212, 175, 55, 0.14), 0 4px 12px rgba(0,0,0,0.03)"
                        : isHovered
                        ? "0 10px 25px rgba(212, 175, 55, 0.08)"
                        : "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* Stage Number Bullet */}
                    <div
                      style={{
                        position: "absolute",
                        left: "0.85rem",
                        top: isActive ? "1.8rem" : "1.2rem",
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
                          ? "0 0 14px rgba(212, 175, 55, 0.5)"
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
                          fontSize: isActive ? "1.05rem" : "0.92rem",
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
                          fontSize: "1.1rem",
                          opacity: isActive ? 1 : 0.4,
                          transition: "opacity 0.3s ease",
                        }}
                      >
                        {s.icon}
                      </span>
                    </div>

                    {/* Expanded Detail Panel (Active Only) */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
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
                              marginBottom: "0.4rem",
                            }}
                          >
                            {s.tag}
                          </div>
                          <p
                            style={{
                              fontSize: "0.86rem",
                              lineHeight: 1.65,
                              color: "#5A5A5E",
                              margin: "0 0 1.2rem 0",
                            }}
                          >
                            {s.desc}
                          </p>

                          {/* Status Badge & CTA */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "0.8rem",
                              paddingTop: "0.8rem",
                              borderTop: "1px solid rgba(212, 175, 55, 0.15)",
                            }}
                          >
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: "#B8860B",
                                backgroundColor: "rgba(212, 175, 55, 0.08)",
                                padding: "0.3rem 0.8rem",
                                borderRadius: "12px",
                                border: "1px solid rgba(212, 175, 55, 0.25)",
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: "#D4AF37",
                                  boxShadow: "0 0 6px #D4AF37",
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
                              Inspect Audit Log &rarr;
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Floating 3D Provenance Core Animation (55%) ── */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "540px",
            }}
          >
            {/* Soft Ambient Floating Container */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
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
              {/* Radial Glow Halo behind core */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: "10%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.03) 55%, transparent 75%)",
                  filter: "blur(20px)",
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
                    LOADING PROVENANCE CORE 3D...
                  </span>
                </div>
              )}

              {/* Canvas Rendering 3D Provenance Core */}
              <canvas
                ref={canvasRef}
                style={{
                  width: "90%",
                  height: "90%",
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 3,
                  filter: "drop-shadow(0 30px 45px rgba(0,0,0,0.18))",
                }}
              />

              {/* Floating Stage Status Card on Object */}
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
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
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
                    CORE FRAME {Math.round(currentFrameRef.current)}/240
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Ambient Base Shadow under floating 3D Core */}
            <div
              aria-hidden="true"
              style={{
                width: "240px",
                height: "18px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 70%)",
                marginTop: "0.5rem",
                filter: "blur(4px)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
