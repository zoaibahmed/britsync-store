"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  provenanceCache,
  startGlobalFramePreload,
  preloader,
  getProvenanceFrameUrl,
  getFrameWithFallback,
} from "@/lib/globalFramePreloader";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const TOTAL_FRAMES = 360;
const SCROLL_HEIGHT_VH = 380; // Responsive scroll runway for smooth cinematic scrubbing

// First 8% of the runway is the "entry zone" — frame stays at 0,
// a cinematic intro screen is shown. Frames only start after this.
const ENTRY_ZONE = 0.08;

/* ─────────────────────────────────────────────
   STAGE DEFINITIONS
───────────────────────────────────────────── */
const STAGES = [
  {
    id: "01",
    minFrame: 0,
    maxFrame: 70,
    number: "01",
    label: "HERITAGE AUDIT",
    title: "Artisan Application",
    subtitle: "& Lineage Audit",
    body: "Generational lineage records, workshop photo archives, and family guild history submitted to the Curation Board for historical authentication.",
    status: "Generational Lineage Verified",
  },
  {
    id: "02",
    minFrame: 71,
    maxFrame: 140,
    number: "02",
    label: "MATERIAL AUDIT",
    title: "Advisory Curation",
    subtitle: "Board Audit",
    body: "Independent craft council inspects raw material samples. 80%+ quartz silica ceramics, pure mountain sheep wool, zero synthetic pigments.",
    status: "100% Organic & Hand-Woven",
  },
  {
    id: "03",
    minFrame: 141,
    maxFrame: 210,
    number: "03",
    label: "PHYSICAL GEOFENCING",
    title: "GPS Geofenced",
    subtitle: "Location Audit",
    body: "Regional field inspectors physically audit the atelier, establishing cryptographic GPS geofencing coordinates mapped to the exact workshop bounds.",
    status: "Geofenced Coordinates Locked",
  },
  {
    id: "04",
    minFrame: 211,
    maxFrame: 280,
    number: "04",
    label: "LEDGER IMMUTABILITY",
    title: "Cryptographic",
    subtitle: "Passport Issuance",
    body: "Every masterwork is laser-etched with a unique cryptographic serial hash paired with an encrypted NFC heritage passport on the Britsync ledger.",
    status: "Ledger Hash Engraved",
  },
  {
    id: "05",
    minFrame: 281,
    maxFrame: 359,
    number: "05",
    label: "DIRECT PAYOUT",
    title: "Protected Escrow",
    subtitle: "& Patron Release",
    body: "Patron funds remain secured in smart contract escrow until physical delivery is confirmed. 95% released directly to the master artisan.",
    status: "Smart Escrow Active & Verified",
  },
] as const;

type Stage = (typeof STAGES)[number];

function getNearestFrame(frameIdx: number): HTMLImageElement | null {
  const rounded = Math.round(frameIdx);
  const img = provenanceCache.get(rounded);
  if (img && img.complete && img.naturalWidth > 0) return img;

  for (let delta = 1; delta < TOTAL_FRAMES; delta++) {
    const prevIdx = rounded - delta;
    if (prevIdx >= 0) {
      const prevImg = provenanceCache.get(prevIdx);
      if (prevImg && prevImg.complete && prevImg.naturalWidth > 0) return prevImg;
    }
    const nextIdx = rounded + delta;
    if (nextIdx < TOTAL_FRAMES) {
      const nextImg = provenanceCache.get(nextIdx);
      if (nextImg && nextImg.complete && nextImg.naturalWidth > 0) return nextImg;
    }
  }
  return null;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function SafeguardsOriginExperience() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rawScrollRef = useRef(0); // raw 0-1 scroll within section
  const activeStageRef = useRef(0);
  const inEntryZoneRef = useRef(true); // true = entry screen, no frames drawn

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  // showEntryScreen: true while user has not scrolled into the section yet
  const [showEntryScreen, setShowEntryScreen] = useState(true);

  /* ── Trigger global preload + local fallback ── */
  useEffect(() => {
    // Ensure global preload is running (no-op if already started)
    startGlobalFramePreload();

    // Also kick off a local fallback in case global cache is cold
    let cancelled = false;
    async function localFallback() {
      // Wait briefly for global preload to get the first 30 frames
      await new Promise((r) => setTimeout(r, 200));
      if (!cancelled && provenanceCache.size < 20) {
        // Global preload hasn't run yet — do it ourselves
        const essential: number[] = [];
        for (let i = 0; i < 30; i++) essential.push(i);
        STAGES.forEach((s) => essential.push(Math.floor((s.minFrame + s.maxFrame) / 2)));
        await Promise.allSettled(
          essential.map((idx) =>
            preloader.addToQueue(getProvenanceFrameUrl(idx), provenanceCache, idx, true)
          )
        );
      }
      if (!cancelled) setIsLoaded(true);
    }

    // If global already has frames, mark loaded immediately
    if (provenanceCache.size >= 20) {
      setIsLoaded(true);
    } else {
      localFallback();
    }

    return () => { cancelled = true; };
  }, []);

  /* ── Native scroll listener ─────────────────
     No framer-motion useScroll to avoid the
     inertia feedback loop that caused hang.
  ─────────────────────────────────────────── */
  useEffect(() => {
    function onScroll() {
      const runway = runwayRef.current;
      if (!runway) return;
      const rect = runway.getBoundingClientRect();
      const totalScrollable = runway.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;
      const raw = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      rawScrollRef.current = raw;

      // Entry zone: first 8% of scroll = intro screen, frames at 0
      if (raw <= ENTRY_ZONE) {
        targetFrameRef.current = 0;
        if (!showEntryScreen) setShowEntryScreen(true);
      } else {
        // Map the 8%-100% range to frames 0-359
        const mapped = (raw - ENTRY_ZONE) / (1 - ENTRY_ZONE);
        targetFrameRef.current = mapped * (TOTAL_FRAMES - 1);
        if (showEntryScreen) setShowEntryScreen(false);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handle entry screen dismiss separately ──
     Use a ref to avoid stale closure inside scroll handler
  ─────────────────────────────────────────── */
  const showEntryRef = useRef(true);
  useEffect(() => {
    showEntryRef.current = showEntryScreen;
  }, [showEntryScreen]);

  // Rewrite scroll handler using ref to avoid stale state closure
  useEffect(() => {
    function onScroll() {
      const runway = runwayRef.current;
      if (!runway) return;
      const rect = runway.getBoundingClientRect();
      const totalScrollable = runway.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;
      const raw = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      rawScrollRef.current = raw;

      if (raw <= ENTRY_ZONE) {
        targetFrameRef.current = 0;
        inEntryZoneRef.current = true;
        if (!showEntryRef.current) setShowEntryScreen(true);
      } else {
        const mapped = (raw - ENTRY_ZONE) / (1 - ENTRY_ZONE);
        targetFrameRef.current = mapped * (TOTAL_FRAMES - 1);
        inEntryZoneRef.current = false;
        if (showEntryRef.current) setShowEntryScreen(false);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Draw canvas frame ─────────────────── */
  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const img = getFrameWithFallback(provenanceCache, frameIdx, getProvenanceFrameUrl, "/bg2.jpg");
    if (!img) return;
    const W = canvas.width;
    const H = canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = W / H;
    let drawW = W, drawH = H, ox = 0, oy = 0;
    if (canvasRatio > imgRatio) {
      drawH = W / imgRatio;
      oy = (H - drawH) / 2;
    } else {
      drawW = H * imgRatio;
      ox = (W - drawW) / 2;
    }
    ctx.drawImage(img, ox, oy, drawW, drawH);
  }, []);

  /* ── RAF lerp loop ────────────────────────
     lerp = 0.08  →  slow, deliberate, cinematic
     step cap = 2  →  no jarring frame skips
  ─────────────────────────────────────────── */
  useEffect(() => {
    let animId: number;
    const tick = () => {
      const target = targetFrameRef.current;
      const curr = currentFrameRef.current;
      const diff = target - curr;
      const absDiff = Math.abs(diff);

      if (absDiff > 0.05) {
        // Majestic lerp at 0.08 speed and cap max frame step per tick to 2 frames
        const step = diff * 0.08;
        const clampedStep = Math.sign(step) * Math.min(2, Math.abs(step));
        currentFrameRef.current = curr + clampedStep;
      } else {
        currentFrameRef.current = target;
      }
      const frameIdx = Math.round(currentFrameRef.current);

      // Update active stage
      let newStage = 0;
      for (let i = 0; i < STAGES.length; i++) {
        if (frameIdx >= STAGES[i].minFrame && frameIdx <= STAGES[i].maxFrame) {
          newStage = i;
          break;
        }
      }
      if (newStage !== activeStageRef.current) {
        activeStageRef.current = newStage;
        setActiveStageIdx(newStage);
      }

      if (isLoaded && !inEntryZoneRef.current) {
        drawFrame(frameIdx);
      } else if (inEntryZoneRef.current) {
        // Keep canvas pure black during entry screen
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d", { alpha: false });
          if (ctx) ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isLoaded, drawFrame]);

  /* ── Resize canvas to full viewport ─────── */
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const activeStage: Stage = STAGES[activeStageIdx];

  return (
    <div
      ref={runwayRef}
      style={{
        position: "relative",
        height: SCROLL_HEIGHT_VH + "vh",
        backgroundColor: "var(--background)",
        color: "var(--text)",
        transition: "background-color 0.4s ease, color 0.4s ease",
      }}
    >
      {/* ═══════════════════════════════════════
          STICKY CINEMATIC VIEWPORT
      ═══════════════════════════════════════ */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          backgroundColor: "var(--background)",
        }}
      >
        {/* Full-bleed animation canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            zIndex: 0,
          }}
        />

        {/* Cinematic ambient vignette overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(10, 10, 12, 0.35)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* ═════════════════════════════════════
            ENTRY SCREEN
            Shown while user is in the entry zone.
            Cinematic reveal invite.
        ═════════════════════════════════════ */}
        <AnimatePresence>
          {showEntryScreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
                textAlign: "center",
                padding: "0 2rem",
              }}
            >
              {/* Glassmorphic Entry Screen Card */}
              <div
                style={{
                  maxWidth: "720px",
                  padding: "4rem 3.5rem",
                  borderRadius: "24px",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "4px solid var(--accent)",
                  boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  color: "var(--text)",
                }}
              >
                {/* Section eyebrow */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.9rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "1px",
                      backgroundColor: "var(--accent)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.68rem",
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    PROVENANCE VERIFICATION PROTOCOL
                  </span>
                  <div
                    style={{
                      width: "28px",
                      height: "1px",
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </motion.div>

                {/* Main heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.85, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontWeight: 300,
                    color: "var(--text)",
                    lineHeight: 1.15,
                    marginBottom: "1.2rem",
                  }}
                >
                  How Britsync
                  <br />
                  <span
                    style={{
                      color: "var(--accent)",
                    }}
                  >
                    Safeguards Origin
                  </span>
                </motion.h2>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.38 }}
                  style={{
                    fontSize: "0.98rem",
                    lineHeight: 1.75,
                    color: "var(--text-muted)",
                    maxWidth: "500px",
                    margin: "0 auto 2.5rem",
                    fontWeight: 300,
                  }}
                >
                  Five cryptographic verification stages.
                  <br />
                  Each one protecting the artisan and the patron.
                </motion.p>
              </div>

              {/* Scroll invite */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.58rem",
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.28)",
                    fontWeight: 600,
                  }}
                >
                  Scroll to witness
                </span>
                {/* Animated scroll line */}
                <div
                  style={{
                    width: "1px",
                    height: "48px",
                    backgroundColor: "#D4AF37",
                    animation: "scrollLine 1.8s ease-in-out infinite",
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═════════════════════════════════════
            EDITORIAL STAGE TEXT
            Shown after entry zone, one stage at a time
        ═════════════════════════════════════ */}
        <AnimatePresence>
          {!showEntryScreen && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 32, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "clamp(320px, 44%, 580px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "0 3.5rem 0 5rem",
                  zIndex: 3,
                }}
              >
                {/* Ghost stage number */}
                <div
                  style={{
                    fontSize: "clamp(6rem, 12vw, 11rem)",
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontWeight: 100,
                    color: "rgba(212,175,55,0.15)",
                    lineHeight: 1,
                    marginBottom: "-1.5rem",
                    letterSpacing: "-0.05em",
                    userSelect: "none",
                  }}
                >
                  {activeStage.number}
                </div>

                {/* Stage label with rule */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.7rem",
                    marginBottom: "1.1rem",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "1px",
                      backgroundColor: "#D4AF37",
                      opacity: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.58rem",
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      color: "#D4AF37",
                      fontWeight: 700,
                    }}
                  >
                    {activeStage.label}
                  </span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: "clamp(2rem, 3.5vw, 3rem)",
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontWeight: 300,
                    color: "#FFFFFF",
                    lineHeight: 1.15,
                    marginBottom: "1.5rem",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {activeStage.title}
                  <br />
                  <span style={{ opacity: 0.72 }}>{activeStage.subtitle}</span>
                </h2>

                {/* Body */}
                <p
                  style={{
                    fontSize: "0.88rem",
                    lineHeight: 1.85,
                    color: "rgba(255,255,255,0.56)",
                    marginBottom: "2.5rem",
                    maxWidth: "360px",
                    fontWeight: 300,
                  }}
                >
                  {activeStage.body}
                </p>

                {/* Status dot */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#D4AF37",
                      boxShadow: "0 0 12px rgba(212,175,55,0.8)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "rgba(212,175,55,0.85)",
                      fontWeight: 600,
                    }}
                  >
                    {activeStage.status}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </AnimatePresence>

        {/* Section label — top (always visible) */}
        <div
          style={{
            position: "absolute",
            top: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            zIndex: 6,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.5)",
              fontWeight: 700,
            }}
          >
            BritSync — Provenance Core
          </span>
        </div>

        {/* Progress pills — bottom center (only during stage view) */}
        <AnimatePresence>
          {!showEntryScreen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: "absolute",
                bottom: "2.8rem",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "0.45rem",
                alignItems: "center",
                zIndex: 4,
              }}
            >
              {STAGES.map((s, i) => {
                const isActive = i === activeStageIdx;
                const isPast = i < activeStageIdx;
                return (
                  <div
                    key={s.id}
                    style={{
                      width: isActive ? "28px" : "7px",
                      height: "2.5px",
                      borderRadius: "2px",
                      backgroundColor: isActive
                        ? "#D4AF37"
                        : isPast
                        ? "rgba(212,175,55,0.5)"
                        : "rgba(255,255,255,0.15)",
                      transition: "all 0.55s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final stage golden glow */}
        <AnimatePresence>
          {!showEntryScreen && activeStageIdx === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4 }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(212,175,55,0.05)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50%  { opacity: 1; transform: scaleY(1); transform-origin: top; }
          100% { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
