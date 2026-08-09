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
//
// Slot assignments:
//   0 = Outer Left  (far depth, smallest)
//   1 = Inner Left  (mid depth, medium)
//   2 = CENTER HERO (foreground, largest)
//   3 = Inner Right (mid depth, medium)
//   4 = Outer Right (far depth, smallest)
// ─────────────────────────────────────────────────────────────────────────────
const SLOTS = [
  { leftVw: 27, bottomVh: 22, discW: 120, isHero: false, opacity: 0.88, z: 10, blur: '0.6px', delay: 0.06 }, // Outer Left
  { leftVw: 38, bottomVh: 14, discW: 175, isHero: false, opacity: 0.95, z: 15, blur: '0.2px', delay: 0.03 }, // Inner Left
  { leftVw: 50, bottomVh:  2, discW: 265, isHero: true,  opacity: 1.00, z: 20, blur: '0px',   delay: 0.00 }, // CENTER HERO
  { leftVw: 62, bottomVh: 14, discW: 175, isHero: false, opacity: 0.95, z: 15, blur: '0.2px', delay: 0.03 }, // Inner Right
  { leftVw: 73, bottomVh: 22, discW: 120, isHero: false, opacity: 0.88, z: 10, blur: '0.6px', delay: 0.06 }, // Outer Right
] as const;

// Per-slot product image max heights
const IMG_MAX_HEIGHT: Record<number, string> = {
  0: '12vh',   // outer left
  1: '22vh',   // inner left
  2: '42vh',   // center hero
  3: '30vh',   // inner right
  4: '15vh',   // outer right
};

const textVariants = {
  enter: (d: number) => ({ opacity: 0, y: d > 0 ? 16 : -16 }),
  center: { opacity: 1, y: 0 },
  exit:   (d: number) => ({ opacity: 0, y: d > 0 ? -16 : 16 }),
};

export default function CollectionExperience({ categories }: Props) {
  const [idx,  setIdx]  = useState(0);
  const [dir,  setDir]  = useState<1 | -1>(1);
  const [done, setDone] = useState(false);
  const busy  = useRef(false);
  const total = categories.length;
  const cat   = categories[idx];

  // Map 5 products for current category
  const products = [
    cat.supporting[0] ?? cat.hero,
    cat.supporting[1] ?? cat.hero,
    cat.hero,
    cat.supporting[2] ?? cat.hero,
    cat.supporting[3] ?? cat.hero,
  ];

  // Slot assignment state for the 5 products: product i is currently at slot itemSlots[i]
  const [itemSlots, setItemSlots] = useState<number[]>([0, 1, 2, 3, 4]);

  // Reset item slots to default 0..4 when category changes
  useEffect(() => {
    setItemSlots([0, 1, 2, 3, 4]);
  }, [idx]);

  // Handle product click -> smooth train/carousel rotation into center hero position
  const handleProductClick = (itemIdx: number) => {
    const currentSlot = itemSlots[itemIdx];
    if (currentSlot === 2) return; // Already in Center Hero position!
    const shift = currentSlot - 2;
    setItemSlots(prev => prev.map(slot => (slot - shift + 5) % 5));
  };

  // Subtle parallax tilt on mouse move
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setTilt({ x, y });
  };

  const navigate = useCallback((d: 1 | -1) => {
    if (busy.current) return;
    const next = idx + d;
    if (next < 0) return;
    if (next >= total) { setDone(true); return; }
    busy.current = true;
    setDir(d);
    setIdx(next);
    setDone(false);
    setTimeout(() => { busy.current = false; }, 850);
  }, [idx, total]);

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
      if (e.key === 'ArrowDown'  || e.key === 'PageDown') navigate(1);
      if (e.key === 'ArrowUp'    || e.key === 'PageUp')   navigate(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [navigate]);

  const jumpTo = (i: number) => {
    if (i === idx || busy.current) return;
    busy.current = true;
    setDir(i > idx ? 1 : -1);
    setIdx(i);
    setDone(false);
    setTimeout(() => { busy.current = false; }, 850);
  };

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

      {/* ── 3D SHOWCASE CAROUSEL (Products + Pedestals) ──────────────────────── */}
      <AnimatePresence initial={false} custom={dir} mode="wait">
        <motion.div
          key={`cat-${idx}`}
          initial={{ opacity: 0, y: dir > 0 ? 12 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: dir > 0 ? -12 : 12 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        >
          {products.map((product, pIdx) => {
            const slotIdx = itemSlots[pIdx];
            const s = SLOTS[slotIdx];

            // Parallax tilt calculation
            const ry = tilt.x * (s.isHero ? 2.2 : 1.1);
            const rx = -tilt.y * (s.isHero ? 2.2 : 1.1);

            // Stand dimensions & exact top surface line calculation
            const discH = Math.round(s.discW * (320 / 854));
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
                transition={{
                  duration: 0.65,
                  ease:     [0.16, 1, 0.3, 1],
                }}
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
                    transform:  `rotateX(${rx}deg) rotateY(${ry}deg)`,
                    transition: 'transform 0.30s ease-out',
                    position:   'relative',
                    width:      `${s.discW}px`,
                    display:    'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* 1. MARBLE PEDESTAL STAND (Positioned at bottom, zIndex 1) */}
                  <div
                    style={{
                      width:         `${s.discW}px`,
                      height:        `${discH}px`,
                      pointerEvents: 'none',
                      position:      'relative',
                      zIndex:        1,
                      transition:    'width 0.65s cubic-bezier(0.16, 1, 0.3, 1), height 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <img
                      src="/collections/marble_stand.png"
                      alt=""
                      style={{
                        width:   '100%',
                        height:  '100%',
                        display: 'block',
                        filter:  'drop-shadow(0 10px 22px rgba(5,4,2,0.18))',
                      }}
                    />
                  </div>

                  {/* 2. CERAMIC PRODUCT (Positioned ON TOP of marble surface disc, zIndex 2) */}
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
                      transition:    'bottom 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      whileHover={{ y: s.isHero ? -8 : -5, scale: 1.03 }}
                      transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
                      style={{
                        maxHeight:      IMG_MAX_HEIGHT[slotIdx],
                        maxWidth:       `${s.discW - 4}px`,
                        width:          'auto',
                        height:         'auto',
                        objectFit:      'contain',
                        objectPosition: 'bottom center',
                        filter:         `drop-shadow(0 12px 24px rgba(0,0,0,0.18)) blur(${s.blur})`,
                        cursor:         'pointer',
                        userSelect:     'none',
                        WebkitUserSelect: 'none',
                        display:        'block',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
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
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={`txt-${idx}`}
            custom={dir}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.40, ease: [0.16, 1, 0.3, 1] }}
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

      {/* ── BOTTOM BAR ─────────────────────────────────────────────────────── */}
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
              <span>EXPLORE NEXT CATEGORY</span>
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

      {/* ── DOT NAVIGATION ─────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', right: '1.8vw', top: '50%', transform: 'translateY(-50%)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {categories.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => jumpTo(i)}
            animate={{ width: i === idx ? 5 : 4, height: i === idx ? 20 : 4, backgroundColor: i === idx ? '#C5A059' : '#D4C4A0' }}
            transition={{ duration: 0.25 }}
            style={{ borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
