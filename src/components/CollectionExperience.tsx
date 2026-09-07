'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface CategoryProduct {
  name: string;
  image: string;
}

interface CategoryData {
  id: number;
  slug: string;
  badge: string;
  title: string;
  description: string;
  hero: CategoryProduct;
  supporting: CategoryProduct[];
}

interface Props {
  categories: CategoryData[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D MUSEUM DEPTH LAYOUT
//   Slot 0 = Outer Left  (far depth, smallest)
//   Slot 1 = Inner Left  (mid depth)
//   Slot 2 = CENTER HERO (foreground, largest)
//   Slot 3 = Inner Right (mid depth)
//   Slot 4 = Outer Right (far depth, smallest)
// ─────────────────────────────────────────────────────────────────────────────
const SLOTS = [
  { leftVw: 27, bottomVh: 22, discW: 120, isHero: false, opacity: 0.88, z: 10, blur: '0.6px', delay: 0.06 },
  { leftVw: 38, bottomVh: 14, discW: 175, isHero: false, opacity: 0.95, z: 15, blur: '0.2px', delay: 0.03 },
  { leftVw: 50, bottomVh:  2, discW: 265, isHero: true,  opacity: 1.00, z: 20, blur: '0px',   delay: 0.00 },
  { leftVw: 62, bottomVh: 14, discW: 175, isHero: false, opacity: 0.95, z: 15, blur: '0.2px', delay: 0.03 },
  { leftVw: 73, bottomVh: 22, discW: 120, isHero: false, opacity: 0.88, z: 10, blur: '0.6px', delay: 0.06 },
] as const;

const IMG_MAX_HEIGHT: Record<number, string> = {
  0: '12vh',
  1: '22vh',
  2: '42vh',
  3: '30vh',
  4: '15vh',
};

export default function CollectionExperience({ categories }: Props) {
  const [idx,       setIdx]       = useState(0);
  const [dir,       setDir]       = useState<1 | -1>(1);
  const [done,      setDone]      = useState(false);
  // blurPhase: 'idle' | 'blurring' | 'unblurring'
  const [blurPhase, setBlurPhase] = useState<'idle' | 'blurring' | 'unblurring'>('idle');
  const [pendingIdx,setPendingIdx]= useState<number | null>(null);

  const busy  = useRef(false);
  const total = categories.length;
  const cat   = categories[idx];

  const products = [
    cat.supporting[0] ?? cat.hero,
    cat.supporting[1] ?? cat.hero,
    cat.hero,
    cat.supporting[2] ?? cat.hero,
    cat.supporting[3] ?? cat.hero,
  ];

  const [itemSlots, setItemSlots] = useState<number[]>([0, 1, 2, 3, 4]);

  useEffect(() => {
    setItemSlots([0, 1, 2, 3, 4]);
  }, [idx]);

  // Parallax tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMouseMove = (e: React.MouseEvent) => {
    if (blurPhase !== 'idle') return;
    const x = (e.clientX / window.innerWidth  - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setTilt({ x, y });
  };

  // Handle product click → carousel rotation
  const handleProductClick = (itemIdx: number) => {
    if (blurPhase !== 'idle') return;
    const currentSlot = itemSlots[itemIdx];
    if (currentSlot === 2) return;
    const shift = currentSlot - 2;
    setItemSlots(prev => prev.map(slot => (slot - shift + 5) % 5));
  };

  // ── BLUR CROSSFADE NAVIGATION ──────────────────────────────────────────────
  // Phase 1: blur out (300ms)
  // Phase 2: swap category, unblur (400ms)
  // Phase 3: idle
  const navigate = useCallback((d: 1 | -1) => {
    if (busy.current || blurPhase !== 'idle') return;
    const next = idx + d;
    if (next < 0) return;
    if (next >= total) { setDone(true); return; }

    busy.current = true;
    setDir(d);
    setBlurPhase('blurring');
    setPendingIdx(next);
    setDone(false);

    // After blur-out finishes → swap content → begin unblur
    setTimeout(() => {
      setIdx(next);
      setBlurPhase('unblurring');

      // After unblur finishes → idle
      setTimeout(() => {
        setBlurPhase('idle');
        busy.current = false;
      }, 450);
    }, 320);
  }, [idx, total, blurPhase]);

  const jumpTo = (i: number) => {
    if (i === idx || busy.current || blurPhase !== 'idle') return;
    navigate(i > idx ? 1 : -1);
    // Simplified: just navigate one step visually, direct jump
    setTimeout(() => {
      if (i !== idx) {
        busy.current = true;
        setBlurPhase('blurring');
        setPendingIdx(i);
        setTimeout(() => {
          setIdx(i);
          setDir(i > idx ? 1 : -1);
          setBlurPhase('unblurring');
          setTimeout(() => {
            setBlurPhase('idle');
            busy.current = false;
          }, 450);
        }, 320);
      }
    }, 0);
  };

  // Direct jump (for dot nav)
  const directJump = (i: number) => {
    if (i === idx || busy.current || blurPhase !== 'idle') return;
    busy.current = true;
    setDir(i > idx ? 1 : -1);
    setBlurPhase('blurring');
    setPendingIdx(i);
    setDone(false);
    setTimeout(() => {
      setIdx(i);
      setBlurPhase('unblurring');
      setTimeout(() => {
        setBlurPhase('idle');
        busy.current = false;
      }, 450);
    }, 320);
  };

  // Lock scroll while in showcase
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [done]);

  // Wheel navigation
  useEffect(() => {
    if (done) return;
    const h = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY >  20) navigate(1);
      if (e.deltaY < -20) navigate(-1);
    };
    window.addEventListener('wheel', h, { passive: false });
    return () => window.removeEventListener('wheel', h);
  }, [navigate, done]);

  // Touch navigation
  useEffect(() => {
    if (done) return;
    let ty = 0;
    const ts = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const te = (e: TouchEvent) => {
      const dy = ty - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 35) navigate(dy > 0 ? 1 : -1);
    };
    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchend',   te, { passive: true });
    return () => {
      window.removeEventListener('touchstart', ts);
      window.removeEventListener('touchend',   te);
    };
  }, [navigate, done]);

  // Keyboard navigation
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') navigate(1);
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   navigate(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [navigate]);

  // Blur filter value for the overlay
  const blurAmount   = blurPhase === 'blurring' ? '18px' : '0px';
  const blurOpacity  = blurPhase === 'blurring' ? 0 : 1;
  const blurDuration = blurPhase === 'blurring' ? 0.30 : 0.42;

  return (
    <div
      onMouseMove={onMouseMove}
      style={{
        position:           'relative',
        height:             '100vh',
        width:              '100vw',
        overflow:           'hidden',
        backgroundImage:    'url(/collections/studio_bg.png)',
        backgroundSize:     'cover',
        backgroundPosition: 'center center',
        backgroundRepeat:   'no-repeat',
        color:              '#1C160E',
      }}
    >
      {/* Subtle inner vignette */}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 180px rgba(0,0,0,0.04)', pointerEvents: 'none', zIndex: 1 }} />

      {/* ── BLURABLE CONTENT LAYER ──────────────────────────────────────────── */}
      {/* Everything except navbar sits in here and gets blurred on transition  */}
      <motion.div
        animate={{
          filter:  blurPhase !== 'idle' ? 'blur(18px)' : 'blur(0px)',
          opacity: blurPhase === 'blurring' ? 0.3 : 1,
        }}
        transition={{ duration: blurDuration, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'absolute', inset: 0, zIndex: 5 }}
      >
        {/* ── 3D SHOWCASE CAROUSEL ──────────────────────────────────────────── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
          {products.map((product, pIdx) => {
            const slotIdx = itemSlots[pIdx];
            const s = SLOTS[slotIdx];

            const ry = tilt.x * (s.isHero ? 2.2 : 1.1);
            const rx = -tilt.y * (s.isHero ? 2.2 : 1.1);

            const discH          = Math.round(s.discW * (320 / 854));
            const productBottomPos = discH - Math.round(s.discW * 0.041);

            return (
              <motion.div
                key={`prod-${pIdx}`}
                animate={{
                  left:    `${s.leftVw}vw`,
                  bottom:  `${s.bottomVh}vh`,
                  zIndex:  s.z,
                  opacity: s.opacity,
                }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleProductClick(pIdx)}
                style={{
                  position:  'absolute',
                  transform: 'translateX(-50%)',
                  cursor:    s.isHero ? 'default' : 'pointer',
                }}
              >
                {/* 3D Tilt Wrapper */}
                <div
                  style={{
                    transform:     `rotateX(${rx}deg) rotateY(${ry}deg)`,
                    transition:    'transform 0.30s ease-out',
                    position:      'relative',
                    width:         `${s.discW}px`,
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                  }}
                >
                  {/* Marble Pedestal Stand */}
                  <div
                    style={{
                      width:         `${s.discW}px`,
                      height:        `${discH}px`,
                      pointerEvents: 'none',
                      position:      'relative',
                      zIndex:        1,
                      transition:    'width 0.65s cubic-bezier(0.16,1,0.3,1), height 0.65s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >
                    <img
                      src="/collections/marble_stand.png"
                      alt=""
                      style={{ width: '100%', height: '100%', display: 'block', filter: 'drop-shadow(0 10px 22px rgba(5,4,2,0.18))' }}
                    />
                  </div>

                  {/* Product Image — positioned on top of marble surface */}
                  <div
                    style={{
                      position:       'absolute',
                      bottom:         `${productBottomPos}px`,
                      left:           '50%',
                      transform:      'translateX(-50%)',
                      display:        'flex',
                      justifyContent: 'center',
                      alignItems:     'flex-end',
                      pointerEvents:  'auto',
                      zIndex:         2,
                      transition:     'bottom 0.65s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      whileHover={{ y: s.isHero ? -8 : -5, scale: 1.03 }}
                      transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
                      style={{
                        maxHeight:        IMG_MAX_HEIGHT[slotIdx],
                        maxWidth:         `${s.discW - 4}px`,
                        width:            'auto',
                        height:           'auto',
                        objectFit:        'contain',
                        objectPosition:   'bottom center',
                        filter:           `drop-shadow(0 12px 24px rgba(0,0,0,0.18)) blur(${s.blur})`,
                        cursor:           'pointer',
                        userSelect:       'none',
                        WebkitUserSelect: 'none',
                        display:          'block',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
        <div
          style={{
            position:  'absolute',
            left:      '4vw',
            top:       '50%',
            transform: 'translateY(-50%)',
            zIndex:    30,
            maxWidth:  '240px',
          }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={`txt-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <span style={{ fontSize: '0.58rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#C5A059', fontWeight: 600 }}>
                {cat.badge}
              </span>
              <h1 style={{ fontFamily: 'var(--font-playfair, Georgia), serif', fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', fontWeight: 400, color: '#1C160E', margin: 0, lineHeight: 0.93, letterSpacing: '-0.01em' }}>
                {cat.title.toUpperCase()}
              </h1>
              <p style={{ fontSize: '0.78rem', color: '#655B4F', lineHeight: 1.8, margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-playfair, Georgia), serif', maxWidth: '205px' }}>
                {cat.description}
              </p>
              <Link
                href={`/categories/${encodeURIComponent(cat.slug)}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#C5A059', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', marginTop: '0.2rem' }}
              >
                <span>EXPLORE COLLECTION</span>
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}>→</motion.span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── BOTTOM BAR ──────────────────────────────────────────────────────── */}
        <div style={{ position: 'absolute', bottom: '3vh', left: '4vw', right: '4.5vw', zIndex: 30, display: 'flex', alignItems: 'center' }}>
          {/* Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <motion.span
              key={`ctr-${idx}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: 'var(--font-playfair, Georgia), serif', fontSize: '1rem', fontWeight: 400, color: '#C5A059' }}
            >
              {String(idx + 1).padStart(2, '0')}
            </motion.span>
            <div style={{ width: 24, height: 1, backgroundColor: '#D4C4A0' }} />
            <span style={{ fontSize: '0.6rem', color: '#A89878', letterSpacing: '1.5px' }}>{String(total).padStart(2, '0')}</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Scroll hint */}
          {blurPhase === 'idle' && !done && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1.5rem' }}
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
                style={{ width: 1, height: 20, backgroundColor: '#C5A059', borderRadius: 1 }}
              />
              <span style={{ fontSize: '0.52rem', color: '#A89878', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
            </motion.div>
          )}

          {/* Next / Home */}
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.button
                key="nxt"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => navigate(1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3A3022', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', padding: 0 }}
              >
                <span>EXPLORE NEXT</span>
                <span style={{ color: '#C5A059' }}>→</span>
              </motion.button>
            ) : (
              <motion.div key="home" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Link
                  href="/"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3A3022', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none' }}
                >
                  <span>RETURN TO HOME</span>
                  <span style={{ color: '#C5A059' }}>↑</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── DOT NAVIGATION ──────────────────────────────────────────────────── */}
        <div style={{ position: 'absolute', right: '1.8vw', top: '50%', transform: 'translateY(-50%)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {categories.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => directJump(i)}
              animate={{
                width:           i === idx ? 5 : 4,
                height:          i === idx ? 20 : 4,
                backgroundColor: i === idx ? '#C5A059' : '#D4C4A0',
              }}
              transition={{ duration: 0.25 }}
              style={{ borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>
      </motion.div>

      {/* ── BLUR VEIL OVERLAY ───────────────────────────────────────────────────
          A frosted glass overlay that appears during transitions.
          Stays above the content but below the navbar.                         */}
      <AnimatePresence>
        {blurPhase !== 'idle' && (
          <motion.div
            key="veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: blurPhase === 'blurring' ? 0.45 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: blurPhase === 'blurring' ? 0.30 : 0.42, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position:        'absolute',
              inset:           0,
              zIndex:          50,
              backgroundColor: '#EDE8DF',
              pointerEvents:   'none',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
