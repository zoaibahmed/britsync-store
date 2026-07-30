'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Collection {
  name: string;
  label: string;
  image: string;
  count: number;
  provenance: string;
}

interface HeritageCollectionsProps {
  collections: Collection[];
}

// ─── Masonry variant → card height ─────────────────────────────────────────
type CardVariant = 'large' | 'small' | 'wide';

// Editorial layout pattern repeating every 8 cards:
// Row 1 (3 cols): large | small | small
// Row 2 (3 cols): large | wide(2col) |
// Row 3 (3 cols): small | large | wide(2col)
const VARIANT_MAP: CardVariant[] = [
  'large', 'small', 'small',
  'large', 'wide',
  'small', 'large', 'wide',
];

const CARD_HEIGHTS: Record<CardVariant, number> = {
  large: 520,
  small: 340,
  wide:  420,
};

// ─── Individual card with 3D tilt, parallax layers, idle float ───────────────
function CollectionCard({
  col,
  index,
  isTouch,
  variant,
}: {
  col: Collection;
  index: number;
  isTouch: boolean;
  variant: CardVariant;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef({ rotX: 0, rotY: 0, liftY: 0, imgX: 0, imgY: 0, glow: 0 });
  const targetRef = useRef({ rotX: 0, rotY: 0, liftY: 0, imgX: 0, imgY: 0, glow: 0 });
  const isHovered = useRef(false);
  const [inView, setInView] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  // ── Idle float offset unique per card ────────────────────────────────────
  const floatOffset = index * 1.4; // seconds stagger
  const floatDuration = 8 + (index % 3) * 1.5; // 8–11 s

  // ── IntersectionObserver for staggered entrance ─────────────────────────
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Random shimmer sweep every 8-12 s ────────────────────────────────────
  useEffect(() => {
    const delay = 4000 + index * 1800 + Math.random() * 3000;
    const interval = 8000 + Math.random() * 4000;
    const t1 = setTimeout(() => {
      setShimmer(true);
      const t2 = setTimeout(() => setShimmer(false), 1200);
      const recurring = setInterval(() => {
        setShimmer(true);
        setTimeout(() => setShimmer(false), 1200);
      }, interval);
      return () => { clearTimeout(t2); clearInterval(recurring); };
    }, delay);
    return () => clearTimeout(t1);
  }, [index]);

  // ── RAF lerp loop ─────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    const t = targetRef.current;
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
    const speed = isHovered.current ? 0.12 : 0.06;

    s.rotX = lerp(s.rotX, t.rotX, speed);
    s.rotY = lerp(s.rotY, t.rotY, speed);
    s.liftY = lerp(s.liftY, t.liftY, speed);
    s.imgX = lerp(s.imgX, t.imgX, speed * 0.6);
    s.imgY = lerp(s.imgY, t.imgY, speed * 0.6);
    s.glow = lerp(s.glow, t.glow, speed);

    const card = cardRef.current;
    if (card) {
      const img = card.querySelector<HTMLElement>('.cc-img');
      const overlay = card.querySelector<HTMLElement>('.cc-overlay');
      const reflection = card.querySelector<HTMLElement>('.cc-reflection');
      const content = card.querySelector<HTMLElement>('.cc-content');

      card.style.transform =
        `translate3d(0, ${s.liftY}px, 0) ` +
        `rotateX(${s.rotX}deg) rotateY(${s.rotY}deg) scale(${isHovered.current ? 1.02 : 1})`;
      card.style.boxShadow = isHovered.current
        ? `0 ${28 + s.liftY * -0.5}px 60px rgba(0,0,0,0.25), 0 0 ${40 * s.glow}px rgba(212,175,55,${0.15 * s.glow}), 0 2px 0 rgba(255,255,255,0.08) inset`
        : `0 16px 48px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.06) inset`;

      if (img) {
        img.style.transform = `translate3d(${s.imgX * 0.5}px, ${s.imgY * 0.5}px, 0) scale(${isHovered.current ? 1.025 : 1})`;
      }
      if (reflection) {
        reflection.style.transform = `translate3d(${s.imgX * 0.8}px, ${s.imgY * 0.3}px, 0)`;
        reflection.style.opacity = String(isHovered.current ? 0.12 : 0.06);
      }
      if (content) {
        content.style.transform = `translate3d(${s.imgX * 0.15}px, ${isHovered.current ? -3 : 0}px, 0)`;
      }
    }

    const still = Math.abs(s.rotX - t.rotX) < 0.005 &&
      Math.abs(s.rotY - t.rotY) < 0.005 &&
      Math.abs(s.liftY - t.liftY) < 0.005;

    frameRef.current = still && !isHovered.current ? 0 : requestAnimationFrame(tick);
  }, []);

  const startRAF = useCallback(() => {
    if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    targetRef.current.rotY = cx * 10;
    targetRef.current.rotX = -cy * 6;
    targetRef.current.imgX = cx * 14;
    targetRef.current.imgY = cy * 10;
    startRAF();
  };

  const onMouseEnter = () => {
    if (isTouch) return;
    isHovered.current = true;
    targetRef.current.liftY = -10;
    targetRef.current.glow = 1;
    startRAF();
  };

  const onMouseLeave = () => {
    isHovered.current = false;
    targetRef.current = { rotX: 0, rotY: 0, liftY: 0, imgX: 0, imgY: 0, glow: 0 };
    startRAF();
  };

  const entranceDelay = `${0.08 * index}s`;

  return (
    <div
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      <Link
        href={`/categories/${encodeURIComponent(col.name)}`}
        style={{ textDecoration: 'none', display: 'block' }}
        tabIndex={0}
      >
        <div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{
            borderRadius: '22px',
            position: 'relative',
            overflow: 'hidden',
            height: `${CARD_HEIGHTS[variant]}px`,
            display: 'flex',
            alignItems: 'flex-end',
            border: '1px solid rgba(212,175,55,0.30)',
            backgroundColor: '#f8f5f0',
            boxShadow: '0 16px 48px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.06) inset',
            transformStyle: 'preserve-3d',
            willChange: 'transform, box-shadow',
            cursor: 'pointer',
            // Entrance animation
            opacity: inView ? 1 : 0,
            transform: inView
              ? 'translate3d(0,0,0) scale(1)'
              : 'translate3d(0,30px,0) scale(0.97)',
            transition: inView
              ? `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${entranceDelay}, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${entranceDelay}`
              : 'none',
            // Idle float — CSS animation layered over JS tilt
            animation: inView
              ? `heritageFloat ${floatDuration}s ${floatOffset}s ease-in-out infinite`
              : 'none',
          }}
        >
          {/* Glass-like top-edge highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.45), transparent)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />

          {/* Background image (slow layer) */}
          <img
            className="cc-img"
            src={col.image}
            alt={col.name}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: '-4%',
              width: '108%',
              height: '108%',
              objectFit: 'cover',
              willChange: 'transform',
              transition: 'transform 0.6s ease',
            }}
          />

          {/* Gradient overlay (stable layer) */}
          <div
            className="cc-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(10,8,4,0.94) 0%, rgba(10,8,4,0.55) 50%, rgba(10,8,4,0.15) 100%)',
              zIndex: 1,
            }}
          />

          {/* Glass reflection layer */}
          <div
            className="cc-reflection"
            style={{
              position: 'absolute',
              top: 0,
              left: '-30%',
              width: '60%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
              zIndex: 4,
              pointerEvents: 'none',
              opacity: 0.06,
              willChange: 'transform, opacity',
            }}
          />

          {/* Shimmer sweep */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.08) 50%, transparent 65%)',
              backgroundSize: '250% 100%',
              backgroundPosition: shimmer ? '100% 0' : '-50% 0',
              transition: shimmer ? 'background-position 1.1s ease' : 'none',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />

          {/* Content (text layer — moves slightly on hover) */}
          <div
            className="cc-content"
            style={{
              position: 'relative',
              zIndex: 6,
              padding: '2.2rem 2rem',
              width: '100%',
              color: '#FAF9F6',
              willChange: 'transform',
            }}
          >
            {/* Provenance tag */}
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.5)',
                padding: '0.3rem 0.9rem',
                borderRadius: '30px',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#D4AF37',
                marginBottom: '0.75rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              📍 {col.provenance}
            </div>

            {/* Title */}
            <h2
              className="cc-title"
              style={{
                color: '#FAF9F6',
                fontSize: '2.1rem',
                marginBottom: '0.3rem',
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                fontWeight: 400,
                lineHeight: 1.15,
                transition: 'transform 0.4s ease',
              }}
            >
              {col.name}
            </h2>

            {/* Sub-label */}
            <p
              style={{
                color: 'rgba(226,232,240,0.85)',
                fontSize: '0.88rem',
                marginBottom: '1rem',
                lineHeight: 1.5,
              }}
            >
              {col.label}
            </p>

            {/* Footer row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(212,175,55,0.2)',
                paddingTop: '0.9rem',
              }}
            >
              {/* Gold accent line + count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div
                  className="cc-goldline"
                  style={{
                    height: '2px',
                    width: '24px',
                    background: 'linear-gradient(to right, #C9A84C, #E8C97A)',
                    borderRadius: '2px',
                    transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
                <span
                  style={{
                    color: '#D4AF37',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                  }}
                >
                  {col.count} Masterworks
                </span>
              </div>

              {/* Arrow */}
              <span
                className="cc-arrow"
                style={{
                  color: '#D4AF37',
                  fontSize: '1.3rem',
                  display: 'inline-block',
                  transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                →
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Hover CSS rules injected inline per card */}
      <style>{`
        .cc-hover-${index}:hover .cc-title { transform: translateY(-3px); }
        .cc-hover-${index}:hover .cc-goldline { width: 44px !important; }
        .cc-hover-${index}:hover .cc-arrow { transform: translateX(5px); }
      `}</style>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
export default function HeritageCollections({ collections }: HeritageCollectionsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTitleVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Inject all CSS client-side only — prevents SSR hydration mismatch
  useEffect(() => {
    const id = 'heritage-collections-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
      @keyframes heritageFloat {
        0%, 100% { margin-top: 0px; }
        50% { margin-top: -3px; }
      }
      @keyframes heritageDustFloat {
        0%   { transform: translate(0,0) scale(1); opacity: 0; }
        20%  { opacity: 0.5; }
        100% { transform: translate(var(--dx), var(--dy)) scale(0.4); opacity: 0; }
      }
      .heritage-card-wrap:hover .cc-title { transform: translateY(-3px); }
      .heritage-card-wrap:hover .cc-goldline { width: 44px !important; }
      .heritage-card-wrap:hover .cc-arrow { transform: translateX(5px) !important; }
      @media (min-width: 900px) {
        .heritage-masonry {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 170px;
          gap: 2rem;
        }
        .hc-0 { grid-column: 1; grid-row: span 3; }
        .hc-1 { grid-column: 2; grid-row: span 2; }
        .hc-2 { grid-column: 3; grid-row: span 2; }
        .hc-3 { grid-column: 2 / 4; grid-row: span 2; }
        .hc-4 { grid-column: 1; grid-row: span 3; }
        .hc-5 { grid-column: 2; grid-row: span 2; }
        .hc-6 { grid-column: 3; grid-row: span 2; }
        .hc-7 { grid-column: 2 / 4; grid-row: span 2; }
      }
      @media (max-width: 899px) {
        .heritage-masonry {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-auto-rows: 300px;
          gap: 1.6rem;
        }
        .hc-0,.hc-1,.hc-2,.hc-3,.hc-4,.hc-5,.hc-6,.hc-7 { grid-column: auto; grid-row: auto; }
        .hc-0,.hc-4 { grid-row: span 2; }
      }
      @media (max-width: 560px) {
        .heritage-masonry {
          grid-template-columns: 1fr;
          grid-auto-rows: 340px;
          gap: 1.4rem;
        }
        .hc-0,.hc-1,.hc-2,.hc-3,.hc-4,.hc-5,.hc-6,.hc-7 { grid-column: auto !important; grid-row: auto !important; }
      }
      .heritage-masonry .heritage-card-wrap { height: 100%; }
      .heritage-masonry .heritage-card-wrap > div,
      .heritage-masonry .heritage-card-wrap > div > a,
      .heritage-masonry .heritage-card-wrap > div > a > div { height: 100% !important; }
    `;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return (
    <>

      <main
        style={{
          backgroundColor: 'var(--background, #FAF9F6)',
          minHeight: '100vh',
          paddingBottom: '8rem',
          position: 'relative',
        }}
      >
        {/* ── Subtle background particles ──────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                borderRadius: '50%',
                backgroundColor: `rgba(212,175,55,${0.06 + (i % 4) * 0.02})`,
                left: `${(i * 37 + 11) % 97}%`,
                top: `${(i * 53 + 7) % 90}%`,
                // @ts-ignore
                '--dx': `${((i % 5) - 2) * 30}px`,
                '--dy': `${-(20 + (i % 4) * 15)}px`,
                animation: `heritageDustFloat ${12 + (i % 7) * 2}s ${i * 0.9}s ease-in infinite`,
              }}
            />
          ))}
        </div>

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <section
          style={{
            padding: '9rem 2rem 5rem',
            color: '#0F2420',
            textAlign: 'center',
            borderBottom: '1px solid rgba(212,175,55,0.18)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Warm radial glow behind title */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '600px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>

            {/* Overline — no box, just elegant spaced letters */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.2rem',
                marginBottom: '2.2rem',
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'none' : 'translateY(10px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}
            >
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.6))' }} />
              <span
                style={{
                  color: '#B48811',
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  fontWeight: 600,
                }}
              >
                Curated Heritage Registry
              </span>
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.6))' }} />
            </div>

            {/* Title */}
            <h1
              ref={titleRef}
              style={{
                fontSize: 'clamp(3.4rem, 7vw, 5.8rem)',
                fontFamily: 'var(--font-playfair, Georgia), serif',
                marginBottom: '0',
                fontWeight: 300,
                color: '#0F2420',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'none' : 'translateY(22px)',
                transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s',
              }}
            >
              Heritage Collections
            </h1>

            {/* Decorative gold ornament line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                margin: '1.8rem auto',
                opacity: titleVisible ? 1 : 0,
                transition: 'opacity 1s ease 0.3s',
              }}
            >
              <div style={{ height: '1px', flex: 1, maxWidth: '80px', background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="#D4AF37" opacity="0.8" />
              </svg>
              <div style={{ height: '1px', flex: 1, maxWidth: '80px', background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
            </div>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              style={{
                fontSize: '1.08rem',
                color: '#5A6A7A',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.9,
                fontWeight: 400,
                letterSpacing: '0.01em',
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'none' : 'translateY(14px)',
                transition: 'opacity 0.85s cubic-bezier(0.16,1,0.3,1) 0.35s, transform 0.85s cubic-bezier(0.16,1,0.3,1) 0.35s',
              }}
            >
              Generational masterpieces verified by our global provenance network.
              Each piece certified authentic from master artisan ateliers worldwide.
            </p>
          </div>
        </section>

        {/* ── Editorial Masonry Grid ──────────────────────────────────────── */}
        <section
          ref={sectionRef}
          style={{
            padding: '5rem 2.5rem 0',
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/*
            3-column CSS Grid with explicit placements:
            Pattern (8 cards):
            [0] large  col 1, rows 1-2   [1] small  col 2, row 1   [2] small  col 3, row 1
            [3] large  col 1, rows 3-4   [4] wide   col 2-3, row 2 (below 1+2)
            [5] small  col 2, row 3      [6] large  col 3, rows 3-4 [7] wide   col 1-2, row 4 (fills below 3)
          */}
          <div className="heritage-masonry">
            {collections.map((col, i) => {
              const variant = VARIANT_MAP[i % VARIANT_MAP.length];
              const posClass = `hc-${i % 8}`;
              return (
                <div key={col.name} className={`heritage-card-wrap ${posClass}`}>
                  <CollectionCard
                    col={col}
                    index={i}
                    isTouch={isTouch}
                    variant={variant}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
