"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  getHeroCacheMap,
  preloader,
  startGlobalFramePreload,
  getHeroFrameUrl,
  getFrameWithFallback,
} from "@/lib/globalFramePreloader";

/* ─────────────────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────────────── */
const ASIA_COUNT = 480;
const AFRICA_COUNT = 480;  // 480 africa_*.webp files in /public/storyboard-frames/
const TOTAL_FRAMES       = ASIA_COUNT + AFRICA_COUNT; // 960
const DELTA_PER_FRAME    = 12;     // px of scroll needed to advance one frame
const CONTENT_THRESHOLD  = 720;    // frame index at which content starts appearing (scaled for 960 total)

/* Deterministic particles */
const PARTICLES = [
  { id:0,  x:7,   y:22, s:2.1, o:0.22, d:11.2, dl:0.4,  dr:28  },
  { id:1,  x:18,  y:67, s:1.3, o:0.16, d:14.5, dl:3.1,  dr:-42 },
  { id:2,  x:29,  y:38, s:2.4, o:0.20, d:9.8,  dl:1.7,  dr:18  },
  { id:3,  x:38,  y:55, s:1.6, o:0.25, d:13.1, dl:5.3,  dr:-25 },
  { id:4,  x:45,  y:14, s:1.1, o:0.14, d:10.7, dl:2.0,  dr:35  },
  { id:5,  x:52,  y:77, s:2.8, o:0.18, d:16.2, dl:7.6,  dr:-18 },
  { id:6,  x:61,  y:31, s:1.5, o:0.22, d:12.4, dl:0.9,  dr:22  },
  { id:7,  x:70,  y:60, s:1.9, o:0.19, d:8.9,  dl:4.2,  dr:-30 },
  { id:8,  x:78,  y:20, s:2.3, o:0.13, d:15.0, dl:1.1,  dr:14  },
  { id:9,  x:85,  y:82, s:1.2, o:0.24, d:11.8, dl:6.5,  dr:-22 },
  { id:10, x:91,  y:44, s:2.0, o:0.17, d:9.3,  dl:3.8,  dr:38  },
  { id:11, x:4,   y:90, s:1.7, o:0.21, d:14.1, dl:8.2,  dr:-16 },
  { id:12, x:14,  y:48, s:1.4, o:0.15, d:10.2, dl:2.5,  dr:27  },
  { id:13, x:23,  y:73, s:2.6, o:0.20, d:13.7, dl:5.0,  dr:-34 },
  { id:14, x:33,  y:8,  s:1.8, o:0.23, d:12.0, dl:1.3,  dr:20  },
  { id:15, x:42,  y:84, s:1.1, o:0.18, d:9.5,  dl:4.7,  dr:-26 },
  { id:16, x:56,  y:27, s:2.2, o:0.16, d:15.8, dl:0.6,  dr:32  },
  { id:17, x:64,  y:51, s:1.6, o:0.25, d:11.4, dl:6.9,  dr:-20 },
  { id:18, x:73,  y:16, s:2.5, o:0.12, d:8.6,  dl:3.2,  dr:24  },
  { id:19, x:82,  y:68, s:1.3, o:0.19, d:14.9, dl:7.1,  dr:-38 },
  { id:20, x:88,  y:37, s:2.0, o:0.22, d:10.4, dl:1.8,  dr:16  },
  { id:21, x:96,  y:80, s:1.5, o:0.17, d:13.3, dl:5.6,  dr:-28 },
];

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function LuxuryHero() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const canvasDimensions = useRef({ w: 0, h: 0 });
  const frameRef     = useRef(0);         // current frame (no re-render)
  const heroActiveRef = useRef(true);     // true = we intercept scroll
  const touchStartY  = useRef(0);
  const mouseRef     = useRef({ x: 0.5, y: 0.5 });
  const smoothRef    = useRef({ x: 0.5, y: 0.5 });
  const rafRef       = useRef<number>(0);

  const wheelAccum   = useRef(0);           // accumulated wheel delta

  /* UI state — only what needs re-renders */
  const [frameIdx, setFrameIdx]           = useState(0);   // drives content opacity
  const [heroComplete, setHeroComplete]   = useState(false);
  const [loadPct, setLoadPct]             = useState(0);
  const [firstReady, setFirstReady]       = useState(false);
  const [searchQ, setSearchQ]             = useState("");

  /* Search & Category Pop-up Modal State */
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingMakerQuery, setPendingMakerQuery] = useState("");
  const [modalCategory, setModalCategory]         = useState("Textiles");

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQ.trim();
    if (!query) {
      window.location.href = "/categories/Textiles";
      return;
    }
    setPendingMakerQuery(query);
    setShowCategoryModal(true);
  };

  const executeMakerCategorySearch = (cat: string) => {
    setShowCategoryModal(false);
    const targetCategory = cat || "Textiles";
    window.location.href = `/categories/${encodeURIComponent(targetCategory)}?search=${encodeURIComponent(pendingMakerQuery)}`;
  };

  const lastStateFrameRef = useRef(0);
  const targetFrameRef = useRef(0);

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

  /* ── draw one frame at high quality ─────────────────────────────────── */
  const drawFrame = useCallback((frameVal: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameVal)));
    const hCache = getHeroCacheMap();
    const img = getFrameWithFallback(hCache, frameIdx, getHeroFrameUrl, "/hero-artisan.jpg");
    if (!img) return;

    let cw = canvasDimensions.current.w;
    let ch = canvasDimensions.current.h;
    if (cw === 0 || ch === 0) {
      cw = canvas.offsetWidth || window.innerWidth;
      ch = canvas.offsetHeight || window.innerHeight;
      canvasDimensions.current = { w: cw, h: ch };
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw  = Math.round(cw * dpr);
    const ph  = Math.round(ch * dpr);

    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width  = pw;
      canvas.height = ph;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.fillStyle = "#0C0B07";
    ctx.fillRect(0, 0, pw, ph);

    const iw = img.naturalWidth  || 1920;
    const ih = img.naturalHeight || 1080;

    const scale = Math.max(pw / iw, ph / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (pw - dw) / 2;
    const dy = Math.max((ph - dh) / 2, -0.035 * dh);

    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  /* ── advance / rewind frames ─────────────────────────────────────────── */
  const moveFrames = useCallback((delta: number) => {
    // Clamp delta to prevent huge scroll ticks
    const clampedDelta = Math.sign(delta) * Math.min(2, Math.abs(delta));
    const next = Math.max(0, Math.min(TOTAL_FRAMES - 1, targetFrameRef.current + clampedDelta));
    if (next === targetFrameRef.current) return;
    targetFrameRef.current = next;
  }, []);

  // RAF loop for smooth frame transition in LuxuryHero
  useEffect(() => {
    let animId: number;
    const tick = () => {
      const diff = targetFrameRef.current - frameRef.current;
      const absDiff = Math.abs(diff);
      
      if (absDiff > 0.001) {
        // Majestic lerp at 0.08 speed and cap max frame step per tick to 2 frames
        const step = diff * 0.08;
        const clampedStep = Math.sign(step) * Math.min(2, Math.abs(step));
        frameRef.current += clampedStep;
        drawFrame(frameRef.current);
        
        const nextInt = Math.round(frameRef.current);
        if (Math.abs(nextInt - lastStateFrameRef.current) >= 2 || nextInt >= CONTENT_THRESHOLD || nextInt === 0 || nextInt === TOTAL_FRAMES - 1) {
          lastStateFrameRef.current = nextInt;
          setFrameIdx(nextInt);
        }
        
        if (frameRef.current >= TOTAL_FRAMES - 1 - 0.05) {
          heroActiveRef.current = false;
          setHeroComplete(true);
          document.body.style.overflow = "";
          document.body.style.touchAction = "";
          document.documentElement.classList.remove("hero-active");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("heroStateChange"));
          }
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [drawFrame]);

  /* ── preload all frames via global ParallelPreloader ──────────────────── */
  useEffect(() => {
    startGlobalFramePreload();

    const handleProgress = (pct: number) => {
      setLoadPct(pct);
      if (pct >= 100) {
        setFirstReady(true);
        drawFrame(0);
      }
    };

    preloader.registerProgressListener(handleProgress);

    const backupTimeout = setTimeout(() => {
      setFirstReady(true);
      setLoadPct(100);
      drawFrame(0);
    }, 4000);

    return () => {
      preloader.unregisterProgressListener(handleProgress);
      clearTimeout(backupTimeout);
    };
  }, [drawFrame]);

  /* ── LOCK PAGE SCROLL while hero is active ───────────────────────────── */
  useEffect(() => {
    if (!firstReady) return;
    if (heroComplete) return;

    // Lock body scroll + hide navbar during frame scrub
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.classList.add("hero-active");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("heroStateChange"));
    }

    /* ── WHEEL ── */
    const onWheel = (e: WheelEvent) => {
      if (!heroActiveRef.current) return;
      e.preventDefault();

      // Accumulate delta — only advance a frame every DELTA_PER_FRAME px
      wheelAccum.current += e.deltaY;
      const frames = Math.trunc(wheelAccum.current / DELTA_PER_FRAME);
      if (frames !== 0) {
        wheelAccum.current -= frames * DELTA_PER_FRAME;
        moveFrames(frames);
      }
    };

    /* ── TOUCH ── */
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      wheelAccum.current = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!heroActiveRef.current) return;
      e.preventDefault();
      const dy = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;
      wheelAccum.current += dy;
      const frames = Math.trunc(wheelAccum.current / (DELTA_PER_FRAME * 0.5));
      if (frames !== 0) {
        wheelAccum.current -= frames * (DELTA_PER_FRAME * 0.5);
        moveFrames(frames);
      }
    };

    /* ── KEYBOARD ── */
    const onKey = (e: KeyboardEvent) => {
      if (!heroActiveRef.current) return;
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        moveFrames(4);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        moveFrames(-4);
      }
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });
    window.addEventListener("keydown",    onKey);

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("keydown",    onKey);
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    };
  }, [firstReady, heroComplete, moveFrames]);

  /* ── RESIZE canvas ───────────────────────────────────────────────────── */
  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) { canvasRef.current.width = 0; }
      drawFrame(frameRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawFrame]);

  /* ── MOUSE lerp loop ─────────────────────────────────────────────────── */
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let alive = true;
    const loop = () => {
      if (!alive) return;
      smoothRef.current.x = lerp(smoothRef.current.x, mouseRef.current.x, 0.04);
      smoothRef.current.y = lerp(smoothRef.current.y, mouseRef.current.y, 0.04);
      rafRef.current = requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { alive = false; window.removeEventListener("mousemove", onMouse); cancelAnimationFrame(rafRef.current); };
  }, []);

  /* ── DERIVED ─────────────────────────────────────────────────────────── */
  const progress        = frameIdx / (TOTAL_FRAMES - 1);         // 0…1
  const contentAlpha    = Math.max(0, Math.min(1, (frameIdx - CONTENT_THRESHOLD) / (TOTAL_FRAMES - 1 - CONTENT_THRESHOLD)));
  const contentY        = (1 - contentAlpha) * 36;
  const hintOpacity     = Math.max(0, 1 - progress * 4);

  const mx = smoothRef.current.x - 0.5;
  const my = smoothRef.current.y - 0.5;
  const lightX = 50 + mx * 10;
  const lightY = 40 + my * 8;

  const showContent = frameIdx >= CONTENT_THRESHOLD;

  // Show universe title card between index 0 and 131 (up to earth_asia_0132.webp)
  const universeTextAlpha = (() => {
    if (frameIdx < 0 || frameIdx > 131) return 0;
    if (frameIdx >= 0 && frameIdx <= 20) {
      return frameIdx / 20; // Fade in over first 20 frames
    }
    if (frameIdx >= 120 && frameIdx <= 131) {
      return (131 - frameIdx) / 11; // Fade out over last 11 frames (before earth_asia_0132)
    }
    return 1; // Fully visible
  })();

  // Show artisan title card between index 202 and 251 (from earth_asia_0203.webp to earth_asia_0252.webp)
  const artisanTextAlpha = (() => {
    if (frameIdx < 202 || frameIdx > 251) return 0;
    if (frameIdx >= 202 && frameIdx <= 212) {
      return (frameIdx - 202) / 10; // Fade in over 10 frames
    }
    if (frameIdx >= 241 && frameIdx <= 251) {
      return (251 - frameIdx) / 10; // Fade out over 10 frames
    }
    return 1; // Fully visible
  })();

  return (
    <>
      {/* ══════════════════════════ STYLES ══════════════════════════════ */}
      <style>{`
        @keyframes lh-float    { 0%,100%{transform:translateY(0) translateZ(0)} 50%{transform:translateY(-12px) translateZ(0)} }
        @keyframes lh-shimmer  { 0%{opacity:.08;transform:translateX(-55px) rotate(-22deg) scaleY(1.4)} 50%{opacity:.25;transform:translateX(55px) rotate(-22deg) scaleY(1.4)} 100%{opacity:.08;transform:translateX(-55px) rotate(-22deg) scaleY(1.4)} }
        @keyframes lh-dust     { 0%{transform:translateY(0) translateX(0);opacity:0} 12%{opacity:var(--op)} 88%{opacity:var(--op)} 100%{transform:translateY(-95px) translateX(var(--dr,0px));opacity:0} }
        @keyframes lh-orb      { 0%,100%{opacity:.15;transform:scale(1) translateZ(0)} 50%{opacity:.27;transform:scale(1.07) translateZ(0)} }
        @keyframes lh-glow     { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0)} 50%{box-shadow:0 0 0 6px rgba(201,168,76,.14)} }
        @keyframes lh-badge    { 0%,100%{box-shadow:0 0 8px rgba(201,168,76,.1)} 50%{box-shadow:0 0 24px rgba(201,168,76,.4)} }
        @keyframes lh-dot      { 0%,100%{box-shadow:0 0 5px rgba(201,168,76,.6)} 50%{box-shadow:0 0 14px rgba(201,168,76,1)} }
        @keyframes lh-bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }

        .lh-shimmer-bar {
          position:absolute; top:0; bottom:0; width:58px; pointer-events:none; z-index:4;
          background-color:rgba(255,255,255,.18);
          animation:lh-shimmer var(--dur,5.5s) var(--delay,0s) ease-in-out infinite;
        }
        .lh-particle {
          position:absolute; border-radius:50%; pointer-events:none; z-index:5; will-change:transform,opacity;
          background:rgba(201,168,76,.7);
          animation:lh-dust var(--dur) var(--delay) linear infinite;
        }
        .lh-ambient {
          position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; will-change:transform,opacity;
          animation:lh-orb var(--adur,8s) var(--adl,0s) ease-in-out infinite;
        }
        .lh-search {
          background:rgba(8,7,4,.78);
          border:1px solid rgba(201,168,76,.45);
          border-radius:12px; color:#F5F0E8; font-size:.88rem; letter-spacing:.3px;
          outline:none; padding:.95rem 3.8rem .95rem 1.4rem; width:100%;
          font-family:var(--font-inter,system-ui,sans-serif);
          transition:border-color .3s,box-shadow .3s,background .3s;
          backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px);
          box-shadow:0 18px 45px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.08);
          -webkit-appearance:none;
        }
        .lh-search::placeholder{ color:rgba(201,168,76,.42); font-size:.82rem; }
        .lh-search:focus{ background:rgba(8,7,4,.92); border-color:rgba(201,168,76,.8); box-shadow:0 0 0 3px rgba(201,168,76,.15), 0 20px 50px rgba(0,0,0,.7); }

        .lh-btn-gold{
          display:inline-flex; align-items:center; gap:.45rem;
          padding:.9rem 2.2rem; border-radius:50px; border:none; cursor:pointer;
          background-color:#C9A84C; color:#1A1408;
          font-size:.7rem; font-weight:700; letter-spacing:2.5px; text-transform:uppercase;
          text-decoration:none; font-family:var(--font-inter,system-ui,sans-serif);
          transition:transform .25s cubic-bezier(.16,1,.3,1),box-shadow .25s;
          animation:lh-glow 3.5s ease-in-out infinite;
        }
        .lh-btn-gold:hover{ transform:translateY(-3px) scale(1.02); box-shadow:0 18px 50px rgba(201,168,76,.38); }
        .lh-btn-ghost{
          display:inline-flex; align-items:center; gap:.45rem;
          padding:.9rem 2.2rem; border-radius:50px;
          border:1px solid rgba(255,255,255,.18); cursor:pointer;
          background:rgba(255,255,255,.04); color:#F5F0E8;
          font-size:.7rem; font-weight:500; letter-spacing:2.5px; text-transform:uppercase;
          text-decoration:none; font-family:var(--font-inter,system-ui,sans-serif);
          backdrop-filter:blur(12px);
          transition:border-color .25s,background .25s,transform .25s;
        }
        .lh-btn-ghost:hover{ border-color:rgba(201,168,76,.5); background:rgba(201,168,76,.07); transform:translateY(-3px); }
        .lh-widget{
          background:rgba(12,10,6,.84); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          border:1px solid rgba(201,168,76,.2); border-radius:14px;
          padding:1.1rem 1.5rem; color:#F5F0E8;
          box-shadow:0 24px 60px rgba(0,0,0,.48);
        }
        .lh-widget-label{ font-size:.55rem; color:#C9A84C; letter-spacing:2.5px; text-transform:uppercase; font-weight:700; font-family:var(--font-inter,system-ui); display:flex; align-items:center; gap:.4rem; margin-bottom:.45rem; }
        .lh-widget-text{ font-size:.75rem; margin:0; line-height:1.55; opacity:.65; font-family:monospace; }
        @media(max-width:768px){
          .lh-widgets{ display:none !important; }
          .lh-content{ padding:0 1.4rem !important; }
          .lh-headline{ font-size:clamp(2.4rem,9vw,3.8rem) !important; }
        }
      `}</style>

      {/* ══════════════════════ HERO (full-viewport) ═════════════════════ */}
      <section style={{
        position: "relative",
        width:    "100%",
        height:   "100vh",
        minHeight:"600px",
        overflow: "hidden",
        background:"#0C0B07",
        transform: "translateZ(0)",
      }}>

        {/* ─── CANVAS LAYER ────────────────────────────────────────────── */}
        <div style={{
          position:"absolute",
          inset:"-5%",                     // oversize prevents edge peep on mouse parallax
          transform:`translate3d(${mx * 14}px, ${my * 10}px, 0)`,
        }}>
          <canvas
            ref={canvasRef}
            style={{ width:"100%", height:"100%", display:"block" }}
          />
        </div>

        {/* ─── AMBIENT WARM LIGHT (mouse-reactive) ─────────────────────── */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:2,
          mixBlendMode:"screen", opacity:.55, transition:"background .18s ease",
          backgroundColor:"rgba(255,228,160,.06)",
        }} />

        {/* ─── UNIFIED SMOOTH OVERLAY ────────────────────────────────── */}
        <div style={{ position:"absolute",inset:0,pointerEvents:"none",zIndex:3,
          backgroundColor:"rgba(12,11,7,.45)" }} />

        {/* ─── GLASS SHIMMERS (appear when bottle is visible) ───────────── */}
        {showContent && (
          <>
            <div className="lh-shimmer-bar" style={{ left:"33%", "--dur":"5.8s","--delay":"0s" } as React.CSSProperties} />
            <div className="lh-shimmer-bar" style={{ left:"47%", "--dur":"8.2s","--delay":"2.6s", opacity:.4 } as React.CSSProperties} />
            <div className="lh-shimmer-bar" style={{ left:"56%", "--dur":"6.6s","--delay":"5s",  opacity:.24 } as React.CSSProperties} />
          </>
        )}

        {/* ─── DUST PARTICLES ───────────────────────────────────────────── */}
        {showContent && PARTICLES.map(p => (
          <div key={p.id} className="lh-particle" style={{
            left:`${p.x}%`, bottom:`${p.y * .55}%`,
            width:`${p.s}px`, height:`${p.s}px`,
            "--dur":`${p.d}s`, "--delay":`${p.dl}s`,
            "--dr":`${p.dr}px`, "--op":p.o,
          } as React.CSSProperties} />
        ))}

        {/* ─── AMBIENT ORBS ─────────────────────────────────────────────── */}
        <div className="lh-ambient" style={{
          width:"480px", height:"480px", background:"rgba(201,140,30,.12)",
          top:"6%", right:"3%", zIndex:2,
          "--adur":"8.5s","--adl":"0s",
          transform:`translate3d(${-mx*20}px,${-my*14}px,0)`,
        } as React.CSSProperties} />
        <div className="lh-ambient" style={{
          width:"260px", height:"260px", background:"rgba(255,205,100,.07)",
          bottom:"20%", left:"3%", zIndex:2,
          "--adur":"12s","--adl":"4s",
          transform:`translate3d(${mx*12}px,${my*8}px,0)`,
        } as React.CSSProperties} />

        {/* ─── LOADING OVERLAY ──────────────────────────────────────────── */}
        {!firstReady && (
          <div style={{
            position:"absolute",inset:0,background:"#0C0B07",zIndex:50,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1.5rem",
          }}>
            <div style={{ fontFamily:"var(--font-cormorant,Georgia,serif)",fontSize:"1.5rem",letterSpacing:"7px",color:"#C9A84C",textTransform:"uppercase",fontWeight:300 }}>
              Britsync
            </div>
            <div style={{ width:"140px",height:"1px",backgroundColor:"rgba(201,168,76,.12)",borderRadius:"4px",overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${loadPct}%`,backgroundColor:"#C9A84C",transition:"width .3s ease" }} />
            </div>
            <div style={{ fontSize:".52rem",letterSpacing:"4px",color:"rgba(201,168,76,.38)",textTransform:"uppercase",fontFamily:"var(--font-inter,system-ui)" }}>
              {loadPct}%
            </div>
          </div>
        )}

        {/* progress bar removed per design */}

        {/* Cinematic Universe Text Overlay (Only visible in starting frames: 0 to 131) */}
        {universeTextAlpha > 0 && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "10%",
            transform: "translateY(-50%)",
            maxWidth: "460px",
            zIndex: 10,
            opacity: universeTextAlpha,
            pointerEvents: "none",
            transition: "opacity 0.15s ease-out",
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}>
              {/* Journal Tagline */}
              <div style={{
                fontFamily: "var(--font-inter, system-ui)",
                fontSize: "0.58rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#C9A84C",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}>
                <span style={{ width: "16px", height: "1px", backgroundColor: "rgba(201, 168, 76, 0.5)" }} />
                The Archive of Provenance
              </div>

              {/* Main Editorial Headline */}
              <h2 style={{
                fontFamily: "var(--font-cormorant, Georgia, serif)",
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                fontWeight: 300,
                color: "#F5F0E8",
                lineHeight: 1.15,
                margin: 0,
              }}>
                A Chronicle of<br />
                <span style={{ fontStyle: "italic", color: "#C9A84C" }}>Transcontinental</span> Artistry
              </h2>

              {/* Journalistic Body */}
              <p style={{
                fontFamily: "var(--font-inter, system-ui)",
                fontSize: "0.85rem",
                lineHeight: 1.7,
                color: "rgba(245, 240, 232, 0.7)",
                margin: 0,
              }}>
                Preserving the legacy of rare heritage guilds. An archival testament to generational craft, cryptographic truth, and timeless design.
              </p>
            </div>
          </div>
        )}

        {/* Cinematic Artisan Text Overlay (Only visible in frames: 202 to 251) */}
        {artisanTextAlpha > 0 && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "10%",
            transform: "translateY(-50%)",
            maxWidth: "460px",
            zIndex: 10,
            opacity: artisanTextAlpha,
            pointerEvents: "none",
            transition: "opacity 0.15s ease-out",
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}>
              {/* Journal Tagline */}
              <div style={{
                fontFamily: "var(--font-inter, system-ui)",
                fontSize: "0.58rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#C9A84C",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}>
                <span style={{ width: "16px", height: "1px", backgroundColor: "rgba(201, 168, 76, 0.5)" }} />
                Generational Legacies
              </div>

              {/* Main Editorial Headline */}
              <h2 style={{
                fontFamily: "var(--font-cormorant, Georgia, serif)",
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                fontWeight: 300,
                color: "#F5F0E8",
                lineHeight: 1.15,
                margin: 0,
              }}>
                The Custodians<br />
                of <span style={{ fontStyle: "italic", color: "#C9A84C" }}>Ancient Heritage</span>
              </h2>

              {/* Journalistic Body */}
              <p style={{
                fontFamily: "var(--font-inter, system-ui)",
                fontSize: "0.85rem",
                lineHeight: 1.7,
                color: "rgba(245, 240, 232, 0.7)",
                margin: 0,
              }}>
                Honoring the master artisans who preserve rare, time-honored techniques passed down through centuries of dedication and silent mastery.
              </p>
            </div>
          </div>
        )}

        {/* ─── HERO CONTENT ─────────────────────────────────────────────── */}
        <div
          className="lh-content"
          style={{
            position:"absolute", inset:0, zIndex:15,
            display:"flex", flexDirection:"column", justifyContent:"center",
            padding:"6.5rem 5vw 2rem", maxWidth:"520px",
            opacity: contentAlpha,
            transform:`translate3d(0, calc(${contentY}px + 45px), 0)`,
            pointerEvents: showContent ? "auto" : "none",
            willChange:"opacity,transform",
          }}
        >
          {/* Headline */}
          <h1 className="lh-headline" style={{
            fontFamily:"var(--font-cormorant,Georgia,serif)",
            fontSize:"clamp(2.5rem,3.8vw,4.2rem)", fontWeight:300,
            lineHeight:1.08, letterSpacing:"-.015em", color:"#F5F0E8",
            margin:"0 0 1rem",
          }}>
            The World&apos;s<br/>
            <em style={{ fontStyle:"italic",color:"#C9A84C" }}>Rarest Crafts,</em><br/>
            Authenticated.
          </h1>

          {/* Sub-copy — concise one-liner */}
          <p style={{
            fontFamily:"var(--font-inter,system-ui,sans-serif)",
            fontSize:"clamp(.78rem,1vw,.9rem)", lineHeight:1.65,
            color:"rgba(245,240,232,.55)", margin:"0 0 1.4rem", maxWidth:"380px",
          }}>
            Heritage masterpieces. Cryptographic provenance. Direct to artisan.
          </p>

          {/* Search Field with Category Pop-up trigger */}
          <form onSubmit={handleSearchSubmit} style={{ position:"relative", maxWidth:"380px", marginBottom:"1.4rem" }}>
            <input
              className="lh-search"
              placeholder="Search master artisans &amp; makers…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              style={{
                position:"absolute",right:"6px",top:"50%",transform:"translateY(-50%)",
                width:"34px",height:"34px",borderRadius:"50%",border:"none",cursor:"pointer",
                backgroundColor:"#C9A84C",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#1A1408",fontSize:".9rem",
              }}
            >→</button>
          </form>

          {/* CTAs */}
          <div style={{ display:"flex", gap:".7rem", flexWrap:"wrap", marginBottom:"1.8rem" }}>
            <Link href="/search?tier=elite" className="lh-btn-gold" style={{ padding: ".75rem 1.8rem", fontSize: ".65rem" }}>Explore Elite ↗</Link>
            <Link href="/makers"            className="lh-btn-ghost" style={{ padding: ".75rem 1.8rem", fontSize: ".65rem" }}>Meet Artisans</Link>
          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:"2rem" }}>
            {[
              { n:"40+",  l:"Countries"        },
              { n:"500+", l:"Masterworks"       },
              { n:"95%",  l:"Direct to Artisan" },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily:"var(--font-cormorant,Georgia,serif)",fontSize:"1.35rem",fontWeight:300,color:"#C9A84C",lineHeight:1 }}>{s.n}</div>
                <div style={{ fontFamily:"var(--font-inter,system-ui)",fontSize:".52rem",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(245,240,232,.38)",marginTop:".2rem" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FLOATING WIDGETS (desktop only) ─────────────────────────── */}
        {showContent && (
          <div className="lh-widgets" style={{ position:"absolute",inset:0,zIndex:16,pointerEvents:"none",opacity:contentAlpha }}>
            <div className="lh-widget" style={{
              position:"absolute", right:"3rem", top:"28%", maxWidth:"250px",
              transform:`translate3d(${-mx*8}px,${-my*5}px,0)`,
            }}>
              <div className="lh-widget-label"><span>🛡️</span> Passport Sealed</div>
              <p className="lh-widget-text">Block #49281 · Cryptographic Hash Active</p>
            </div>

            <div style={{
              position:"absolute", right:"3rem", bottom:"22%",
              background:"rgba(12,10,6,.8)", backdropFilter:"blur(18px)",
              border:"1px solid rgba(201,168,76,.2)", borderRadius:"50px",
              padding:".65rem 1.3rem", color:"#C9A84C",
              display:"flex", alignItems:"center", gap:".5rem",
              fontFamily:"var(--font-inter,system-ui)", fontSize:".62rem",
              letterSpacing:"2px", fontWeight:600, textTransform:"uppercase",
              transform:`translate3d(${-mx*6}px,${my*4}px,0)`,
            }}>
              <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#4ADE80",boxShadow:"0 0 8px rgba(74,222,128,.65)",flexShrink:0 }} />
              Grade A+ · Audit Live
            </div>
          </div>
        )}

        {/* ─── SCROLL HINT ──────────────────────────────────────────────── */}
        {firstReady && (
          <div style={{
            position:"absolute", bottom:"2.2rem", left:"50%", transform:"translateX(-50%)",
            display:"flex", flexDirection:"column", alignItems:"center", gap:".4rem",
            zIndex:20, pointerEvents:"none",
            opacity: hintOpacity, transition:"opacity .4s",
          }}>
            <div style={{
              fontFamily:"var(--font-inter,system-ui)", fontSize:".49rem",
              letterSpacing:"4px", textTransform:"uppercase",
              color:"rgba(201,168,76,.5)",
            }}>Scroll to reveal</div>
            <div style={{ width:"22px",height:"34px",border:"1.5px solid rgba(201,168,76,.4)",borderRadius:"11px",display:"flex",justifyContent:"center",paddingTop:"5px" }}>
              <div style={{ width:"3px",height:"8px",borderRadius:"2px",background:"#C9A84C",opacity:.6,animation:"lh-float 1.6s ease-in-out infinite" }} />
            </div>
          </div>
        )}

      </section>

      {/* ─── CATEGORY SELECTION POP-UP MODAL ───────────────────────────── */}
      {showCategoryModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(6, 5, 3, 0.84)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1.5rem",
        }}>
          <div style={{
            backgroundColor: "rgba(18, 16, 12, 0.98)",
            border: "1px solid rgba(201, 168, 76, 0.4)",
            borderRadius: "20px",
            padding: "2.4rem 2.2rem",
            maxWidth: "520px",
            width: "100%",
            boxShadow: "0 35px 90px rgba(0, 0, 0, 0.9), 0 0 50px rgba(201, 168, 76, 0.18)",
            color: "#F5F0E8",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                <span style={{ fontSize: "1.2rem" }}>🔍</span>
                <h3 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: "1.65rem", fontWeight: 300, color: "#C9A84C", margin: 0 }}>
                  Select Craft Category
                </h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                style={{ background: "none", border: "none", color: "rgba(245, 240, 232, 0.5)", fontSize: "1.3rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: ".85rem", color: "rgba(245, 240, 232, 0.72)", lineHeight: 1.6, marginBottom: "1.6rem" }}>
              Searching master artisan <strong style={{ color: "#E8C97A" }}>&ldquo;{pendingMakerQuery}&rdquo;</strong>. Choose the category to filter search:
            </p>

            {/* Category Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: "2rem" }}>
              {[
                { name: "Textiles", label: "🧵 Textiles & Rugs" },
                { name: "Ceramics", label: "🏺 Ceramics & Pottery" },
                { name: "Jewelry", label: "💎 Jewelry & Metalwork" },
                { name: "Woodwork", label: "🪵 Woodwork & Carvings" },
                { name: "Glass", label: "🔮 Glass & Crystal" },
                { name: "Leather", label: "📜 Leather Crafts" },
                { name: "Fashion", label: "👗 Heritage Fashion" },
                { name: "Art", label: "🎨 Fine Heritage Art" },
              ].map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setModalCategory(cat.name)}
                  style={{
                    padding: ".75rem 1rem",
                    borderRadius: "10px",
                    border: modalCategory === cat.name ? "1px solid #C9A84C" : "1px solid rgba(255, 255, 255, 0.08)",
                    background: modalCategory === cat.name ? "rgba(201, 168, 76, 0.22)" : "rgba(255, 255, 255, 0.03)",
                    color: modalCategory === cat.name ? "#E8C97A" : "#F5F0E8",
                    fontSize: ".78rem",
                    fontWeight: modalCategory === cat.name ? 600 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .2s ease",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="lh-btn-ghost"
                style={{ padding: ".8rem 1.6rem", fontSize: ".65rem" }}
              >
                Cancel
              </button>
              <button
                onClick={() => executeMakerCategorySearch(modalCategory)}
                className="lh-btn-gold"
                style={{ padding: ".8rem 1.8rem", fontSize: ".65rem" }}
              >
                Search Category →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
