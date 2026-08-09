'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface CategoryItem {
  name: string;
  count: string;
  image: string;
  desc: string;
}

interface MagneticCategoryCarouselProps {
  categories: CategoryItem[];
  collapsedWidth?: number;
  hoverWidth?: number;
  collapsedHeight?: number;
  hoverHeight?: number;
  openWidth?: number;
  openHeight?: number;
  gap?: number;
  influence?: number;
  blur?: number;
}

export default function MagneticCategoryCarousel({
  categories,
  collapsedWidth = 110,
  hoverWidth = 180,
  collapsedHeight = 380,
  hoverHeight = 440,
  openWidth = 560,
  openHeight = 480,
  gap = 16,
  influence = 220,
  blur = 4,
}: MagneticCategoryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const count = categories.length;

  const [factors, setFactors] = useState<number[]>(() => categories.map(() => 0));
  const [open, setOpen] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);

  const targetRef = useRef<number[]>(categories.map(() => 0));
  const curRef = useRef<number[]>(categories.map(() => 0));
  const loopRef = useRef<number>(0);
  const closeTimer = useRef<any>(0);

  useEffect(() => {
    targetRef.current = categories.map(() => 0);
    curRef.current = categories.map(() => 0);
    setFactors(categories.map(() => 0));
  }, [count, categories]);

  useEffect(
    () => () => {
      cancelAnimationFrame(loopRef.current);
      clearTimeout(closeTimer.current);
    },
    []
  );

  const startLoop = () => {
    if (loopRef.current) return;
    const step = () => {
      const tgt = targetRef.current;
      const cur = curRef.current;
      let moving = false;
      for (let i = 0; i < cur.length; i++) {
        const d = (tgt[i] ?? 0) - cur[i];
        if (Math.abs(d) > 0.001) {
          cur[i] += d * 0.2; // lerp toward target
          moving = true;
        } else {
          cur[i] = tgt[i] ?? 0;
        }
      }
      setFactors([...cur]);
      loopRef.current = moving ? requestAnimationFrame(step) : 0;
    };
    loopRef.current = requestAnimationFrame(step);
  };

  const setTargetFromCursor = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = clientX - rect.left;
    const n = categories.length;

    const totalBase = n * collapsedWidth + (n - 1) * gap;
    const startX = (rect.width - totalBase) / 2;

    targetRef.current = categories.map((_, i) => {
      const center = startX + i * (collapsedWidth + gap) + collapsedWidth / 2;
      const dist = Math.abs(cx - center);
      const f = Math.max(0, 1 - dist / influence);
      return f * f * (3 - 2 * f); // smoothstep falloff
    });
    startLoop();
  };

  const onMove = (e: React.MouseEvent) => {
    if (open !== null) return;
    setTargetFromCursor(e.clientX);
  };

  const onLeave = () => {
    if (open !== null) return;
    targetRef.current = categories.map(() => 0);
    startLoop();
  };

  const close = () => {
    targetRef.current = categories.map(() => 0);
    curRef.current = categories.map(() => 0);
    setFactors(categories.map(() => 0));
    setClosing(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setClosing(false), 350);
    setOpen(null);
  };

  const sizeFor = (i: number) => {
    if (open !== null) {
      return i === open
        ? { width: openWidth, height: openHeight }
        : { width: collapsedWidth, height: collapsedHeight };
    }
    const f = factors[i] ?? 0;
    return {
      width: collapsedWidth + (hoverWidth - collapsedWidth) * f,
      height: collapsedHeight + (hoverHeight - collapsedHeight) * f,
    };
  };

  const openEase = `width 0.45s cubic-bezier(0.16, 1, 0.3, 1), height 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)`;
  const barTransition = open !== null || closing ? openEase : 'none';

  return (
    <div
      style={{
        width: '100%',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
        padding: '2rem 0',
      }}
    >
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap,
          position: 'relative',
          overflow: 'visible',
          flexWrap: 'wrap',
        }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* Backdrop overlay when open */}
        {open !== null && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: 'rgba(6, 5, 3, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer',
            }}
            onClick={close}
          />
        )}

        {categories.map((cat, i) => {
          const { width, height } = sizeFor(i);
          const isSelected = open === i;
          const blurred = open !== null && !isSelected;

          return (
            <div
              key={cat.name}
              onClick={(e) => {
                e.stopPropagation();
                if (isSelected) close();
                else setOpen(i);
              }}
              style={{
                flex: 'none',
                width,
                height,
                overflow: 'hidden',
                borderRadius: isSelected ? '24px' : '16px',
                cursor: 'pointer',
                transition: barTransition,
                willChange: 'width, height',
                position: 'relative',
                zIndex: isSelected ? 100 : 2,
                filter: blurred ? `blur(${blur}px)` : 'none',
                opacity: blurred ? 0.35 : 1,
                border: isSelected
                  ? '1px solid rgba(201, 168, 76, 0.65)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isSelected
                  ? '0 30px 80px rgba(0,0,0,0.85), 0 0 40px rgba(201,168,76,0.2)'
                  : '0 12px 35px rgba(0,0,0,0.4)',
              }}
            >
              {/* Background Image & Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${cat.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.6s ease',
                  transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(10,9,6,0.45)',
                  pointerEvents: 'none',
                }}
              />

              {/* COLLAPSED STATE: Only show number always, name fades in on hover */}
              {!isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '1.4rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    color: '#F5F0E8',
                  }}
                >
                  <div
                    style={{
                      fontSize: '.62rem',
                      color: '#C9A84C',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    0{i + 1}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-cormorant, Georgia, serif)',
                      fontSize: width > 140 ? '1.4rem' : '1.1rem',
                      fontWeight: 300,
                      color: '#F5F0E8',
                      margin: 0,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      writingMode: width < 150 ? 'vertical-rl' : 'horizontal-tb',
                      transform: width < 150 ? 'rotate(180deg)' : 'none',
                      whiteSpace: 'nowrap',
                      opacity: factors[i] ?? 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {cat.name}
                  </h3>
                  <div style={{ height: '0.65rem' }} />
                </div>
              )}

              {/* EXPANDED STATE (ON CLICK ONLY): Full details + Action Button */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '2.5rem 2.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: '#F5F0E8',
                    background: 'rgba(8,7,4,0.95)',
                    animation: 'fadeIn 0.3s ease',
                  }}
                >
                  {/* Top Bar with Badge and Close button */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: 'rgba(201,168,76,0.18)',
                        border: '1px solid rgba(201,168,76,0.4)',
                        color: '#E8C97A',
                        padding: '0.4rem 1.1rem',
                        borderRadius: '30px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {cat.count}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        close();
                      }}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#F5F0E8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Center/Bottom Content */}
                  <div>
                    <span
                      style={{
                        color: '#C9A84C',
                        fontSize: '0.72rem',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        display: 'block',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Guild Discipline 0{i + 1}
                    </span>

                    <h3
                      style={{
                        fontFamily: 'var(--font-cormorant, Georgia, serif)',
                        fontSize: '2.6rem',
                        fontWeight: 300,
                        color: '#F5F0E8',
                        margin: '0 0 0.8rem',
                        lineHeight: 1.1,
                      }}
                    >
                      {cat.name}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.95rem',
                        color: 'rgba(245,240,232,0.75)',
                        lineHeight: 1.7,
                        margin: '0 0 1.8rem',
                        maxWidth: '440px',
                      }}
                    >
                      {cat.desc}
                    </p>

                    {/* ACTION BUTTON (Appears ON CLICK ONLY as requested) */}
                    <Link
                      href={`/categories/${encodeURIComponent(cat.name)}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.9rem 2.2rem',
                        borderRadius: '50px',
                        background: '#C9A84C',
                        color: '#1A1408',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        boxShadow: '0 12px 35px rgba(201,168,76,0.3)',
                      }}
                    >
                      Explore {cat.name} Discipline &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
