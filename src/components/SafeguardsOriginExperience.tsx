"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 360;
const SCROLL_HEIGHT_VH = 350;

function getFrameUrl(index: number): string {
  const n = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(index) + 1));
  return "/provenance-core/core_" + String(n).padStart(4, "0") + ".webp";
}

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

const globalCache = new Map<number, HTMLImageElement>();

function loadImage(index: number): Promise<HTMLImageElement> {
  const cached = globalCache.get(index);
  if (cached?.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = getFrameUrl(index);
    img.onload = () => {
      globalCache.set(index, img);
      resolve(img);
    };
    img.onerror = reject;
  });
}

function getNearestCached(frameIdx: number): HTMLImageElement | null {
  for (let d = 0; d <= 25; d++) {
    const a = globalCache.get(frameIdx - d);
    if (a?.complete && a.naturalWidth > 0) return a;
    const b = globalCache.get(frameIdx + d);
    if (b?.complete && b.naturalWidth > 0) return b;
  }
  return null;
}

export default function SafeguardsOriginExperience() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const activeStageRef = useRef(0);

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function preload() {
      const essential: number[] = [];
      for (let i = 0; i < 25; i++) essential.push(i);
      STAGES.forEach((s) =>
        essential.push(Math.floor((s.minFrame + s.maxFrame) / 2))
      );
      await Promise.allSettled(essential.map(loadImage));
      if (!cancelled) {
        setIsLoaded(true);
        setReady(true);
      }
      const allIdx = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);
      const rest = allIdx.filter((i) => !essential.includes(i));
      for (let i = 0; i < rest.length; i += 12) {
        if (cancelled) break;
        await Promise.allSettled(rest.slice(i, i + 12).map(loadImage));
        await new Promise((r) => setTimeout(r, 35));
      }
    }
    preload();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      const runway = runwayRef.current;
      if (!runway) return;
      const rect = runway.getBoundingClientRect();
      const totalScrollable = runway.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;
      const scrolled = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      targetFrameRef.current = scrolled * (TOTAL_FRAMES - 1);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const img = getNearestCached(frameIdx);
    if (!img) return;
    const W = canvas.width;
    const H = canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = W / H;
    let drawW = W;
    let drawH = H;
    let ox = 0;
    let oy = 0;
    if (canvasRatio > imgRatio) {
      drawH = W / imgRatio;
      oy = (H - drawH) / 2;
    } else {
      drawW = H * imgRatio;
      ox = (W - drawW) / 2;
    }
    ctx.drawImage(img, ox, oy, drawW, drawH);
  }, []);

  useEffect(() => {
    let animId: number;
    const tick = () => {
      const target = targetFrameRef.current;
      const curr = currentFrameRef.current;
      const diff = target - curr;
      const step = diff * 0.2;
      const clampedStep = Math.max(-10, Math.min(10, step));
      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current = curr + clampedStep;
      } else {
        currentFrameRef.current = target;
      }
      const frameIdx = Math.round(currentFrameRef.current);
      let newStage = 0;
      for (let i = 0; i < STAGES.length; i++) {
        if (
          frameIdx >= STAGES[i].minFrame &&
          frameIdx <= STAGES[i].maxFrame
        ) {
          newStage = i;
          break;
        }
      }
      if (newStage !== activeStageRef.current) {
        activeStageRef.current = newStage;
        setActiveStageIdx(newStage);
      }
      if (isLoaded) drawFrame(frameIdx);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isLoaded, drawFrame]);

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
        backgroundColor: "#000",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          backgroundColor: "#000",
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

        {/* Cinematic vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 68% 100% at 2% 50%, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.52) 38%, transparent 70%), linear-gradient(to right, rgba(0,0,0,0.62) 0%, transparent 50%), linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, transparent 16%, transparent 80%, rgba(0,0,0,0.7) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Loading overlay */}
        <AnimatePresence>
          {!ready && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000",
                zIndex: 10,
                gap: "1.2rem",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(212,175,55,0.2)",
                  borderTopColor: "#D4AF37",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "rgba(212,175,55,0.7)",
                  fontWeight: 600,
                }}
              >
                Assembling Provenance Core
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section label — top */}
        <div
          style={{
            position: "absolute",
            top: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            zIndex: 4,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.6)",
              fontWeight: 700,
            }}
          >
            How BritSync Safeguards Origin
          </span>
        </div>

        {/* Editorial cinematic text — NO white cards, directly in scene */}
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

            {/* Body text */}
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

        {/* Progress pills bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "2.8rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.9rem",
            zIndex: 4,
          }}
        >
          <div style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
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
          </div>

          {activeStageIdx === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.56rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  fontWeight: 600,
                }}
              >
                Scroll to verify
              </span>
              <motion.span
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ color: "rgba(212,175,55,0.45)", fontSize: "0.65rem" }}
              >
                ↓
              </motion.span>
            </motion.div>
          )}
        </div>

        {/* Final stage golden glow */}
        <AnimatePresence>
          {activeStageIdx === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4 }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 60% 65% at 68% 42%, rgba(212,175,55,0.14) 0%, transparent 70%)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
