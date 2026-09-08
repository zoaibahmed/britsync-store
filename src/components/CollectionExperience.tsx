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
  const [blurPhase, setBlurPhase] = useState<'idle' | 'blurring' | 'unblurring'>('idle');
  const [itemSlots, setItemSlots] = useState<number[]>([0, 1, 2, 3, 4]);
  const [tilt,      setTilt]      = useState({ x: 0, y: 0 });

  const busyRef     = useRef(false);
  const navigateRef = useRef<(d: 1 | -1) => void>(() => {});
  const total = categories.length;
  const cat   = categories[idx];

  const products = [
    cat.supporting[0] ?? cat.hero,
    cat.supporting[1] ?? cat.hero,
    cat.hero,
    cat.supporting[2] ?? cat.hero,
    cat.supporting[3] ?? cat.hero,
  ];

  useEffect(() => { setItemSlots([0, 1, 2, 3, 4]); }, [idx]);

  // ── CORE TRANSITION ──────────────────────────────────────────────────────
  const transitionTo = useCallback((nextIdx: number, direction: 1 | -1) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setDir(direction);
    setBlurPhase('blurring');
    setTimeout(() => {
      setIdx(nextIdx);
      setBlurPhase('unblurring');
      setTimeout(() => {
        setBlurPhase('idle');
        busyRef.current = false;
      }, 450);
    }, 320);
  }, []);

  // navigate is rebuilt when idx/total changes but we expose it via ref
  const navigate = useCallback((d: 1 | -1) => {
    if (busyRef.current) return;
    const next = idx + d;
    if (next < 0) return;
    if (next >= total) { setDone(true); return; }
    setDone(false);
    transitionTo(next, d);
  }, [idx, total, transitionTo]);

  // Keep ref always up-to-date so event handlers never go stale
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const directJump = useCallback((i: number) => {
    if (i === idx || busyRef.current) return;
    setDone(false);
    transitionTo(i, i > idx ? 1 : -1);
  }, [idx, transitionTo]);

  const handleProductClick = (itemIdx: number) => {
    if (blurPhase !== 'idle') return;
    const currentSlot = itemSlots[itemIdx];
    if (currentSlot === 2) return;
    const shift = currentSlot - 2;
    setItemSlots(prev => prev.map(slot => (slot - shift + 5) % 5));
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (blurPhase !== 'idle') return;
    setTilt({
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  };

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── SCROLL LOCK ──────────────────────────────────────────────────────────
  // Lock html + body on tablet & desktop only
  useEffect(() => {
    if (isMobile || done) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
      return;
    }
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [done, isMobile]);

  // ── WHEEL — stable handler, ONLY re-registers when done or isMobile changes ──────────
  useEffect(() => {
    if (isMobile || done) return;
    const handler = (e: WheelEvent) => {
      if (window.innerWidth < 768) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY >  20) navigateRef.current(1);
      if (e.deltaY < -20) navigateRef.current(-1);
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [done, isMobile]);

  // ── TOUCH — tablet & desktop only ────────────────────────────────────────
  useEffect(() => {
    if (isMobile || done) return;
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onEnd   = (e: TouchEvent) => {
      if (window.innerWidth < 768) return;
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 35) navigateRef.current(dy > 0 ? 1 : -1);
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend',   onEnd);
    };
  }, [done, isMobile]);

  // ── KEYBOARD ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') navigateRef.current(1);
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   navigateRef.current(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // Stable — reads from ref

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .collection-desktop-stage {
            display: none !important;
          }
          .collection-mobile-stage {
            display: block !important;
          }
        }
        @media (min-width: 768px) {
          .collection-desktop-stage {
            display: block !important;
          }
          .collection-mobile-stage {
            display: none !important;
          }
        }
      `}</style>

      {/* ── MOBILE VIEW: CURATED COLLECTION CARDS (< 768px) ──────────────── */}
      <div
        className="collection-mobile-stage"
        style={{
          minHeight:          '100vh',
          backgroundColor:    '#F7F5F0',
          backgroundImage:    'url(/collections/studio_bg.png)',
          backgroundSize:     'cover',
          backgroundPosition: 'top center',
          backgroundAttachment: 'fixed',
          color:              '#1C160E',
          overflowX:          'hidden',
        }}
      >
        {/* Mobile Sticky Header */}
        <header
          style={{
            position:        'sticky',
            top:             0,
            zIndex:          50,
            backgroundColor: '#FAF8F5',
            borderBottom:    '1px solid #EAE3D5',
            padding:         '0.85rem 1.25rem',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              color:          '#1C160E',
              fontSize:       '0.68rem',
              fontWeight:     600,
              letterSpacing:  '2px',
              textTransform:  'uppercase',
              textDecoration: 'none',
              display:        'flex',
              alignItems:     'center',
              gap:            '6px',
            }}
          >
            <span>←</span>
            <span>BRITSYNC</span>
          </Link>
          <div
            style={{
              fontSize:       '0.62rem',
              letterSpacing:  '2px',
              textTransform:  'uppercase',
              color:          '#C5A059',
              fontWeight:     700,
            }}
          >
            COLLECTIONS ARCHIVE
          </div>
        </header>

        {/* Mobile Masthead */}
        <div style={{ padding: '2rem 1.25rem 1.25rem' }}>
          <div
            style={{
              display:        'inline-block',
              backgroundColor:'#EDE7DC',
              color:          '#75654F',
              fontSize:       '0.58rem',
              fontWeight:     600,
              letterSpacing:  '2.5px',
              textTransform:  'uppercase',
              padding:        '4px 10px',
              borderRadius:   '20px',
              marginBottom:   '0.75rem',
            }}
          >
            6 HERITAGE DISCIPLINES
          </div>
          <h1
            style={{
              fontFamily:    'var(--font-playfair, Georgia), serif',
              fontSize:      '2.15rem',
              fontWeight:    400,
              color:         '#1C160E',
              margin:        '0 0 0.5rem 0',
              lineHeight:    1.08,
              letterSpacing: '-0.01em',
            }}
          >
            HERITAGE CRAFT COLLECTIONS
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-playfair, Georgia), serif',
              fontStyle:  'italic',
              fontSize:   '0.88rem',
              color:      '#655B4F',
              lineHeight: 1.6,
              margin:     0,
            }}
          >
            Curated masterworks preserved under rigorous provenance standards. Select any discipline to explore certified workshops and artisanal custody.
          </p>
        </div>

        {/* Mobile Cards Feed */}
        <div style={{ padding: '0.5rem 1.25rem 3.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {categories.map((item, cIndex) => (
            <div
              key={`mobile-cat-${item.id}`}
              style={{
                backgroundColor: '#FFFFFF',
                border:          '1px solid #EBE4D8',
                borderRadius:    '18px',
                overflow:        'hidden',
                boxShadow:       '0 6px 24px rgba(28, 22, 14, 0.05)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding:        '1.15rem 1.25rem 0.85rem',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    color:         '#C5A059',
                    fontSize:      '0.62rem',
                    fontWeight:    700,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                  }}
                >
                  DISCIPLINE 0{cIndex + 1}
                </div>
                <div
                  style={{
                    backgroundColor: '#F8F5EE',
                    border:          '1px solid #E6DEC8',
                    padding:         '3px 9px',
                    borderRadius:    '4px',
                    fontSize:        '0.55rem',
                    fontWeight:      600,
                    letterSpacing:   '1.5px',
                    color:           '#5A4E3E',
                    textTransform:   'uppercase',
                  }}
                >
                  ISO-17025 STANDARD
                </div>
              </div>

              {/* Hero Showcase with Pedestal */}
              <div
                style={{
                  backgroundColor: '#F5F1EA',
                  borderTop:       '1px solid #EDE8DE',
                  borderBottom:    '1px solid #EDE8DE',
                  padding:         '2rem 1rem 1.25rem',
                  position:        'relative',
                  display:         'flex',
                  flexDirection:   'column',
                  alignItems:      'center',
                  justifyContent:  'flex-end',
                }}
              >
                {/* Hero Craft Piece */}
                <div
                  style={{
                    height:         '165px',
                    display:        'flex',
                    alignItems:     'flex-end',
                    justifyContent: 'center',
                    marginBottom:   '-14px',
                    zIndex:         2,
                    position:       'relative',
                  }}
                >
                  <img
                    src={item.hero.image}
                    alt={item.hero.name}
                    style={{
                      maxHeight:  '160px',
                      maxWidth:   '82%',
                      objectFit:  'contain',
                      filter:     'drop-shadow(0 10px 20px rgba(10, 8, 4, 0.16))',
                    }}
                  />
                </div>

                {/* Pedestal Stand */}
                <div style={{ width: '175px', height: '64px', zIndex: 1, position: 'relative' }}>
                  <img
                    src="/collections/marble_stand.png"
                    alt=""
                    style={{
                      width:     '100%',
                      height:    '100%',
                      objectFit: 'contain',
                      filter:    'drop-shadow(0 6px 14px rgba(5,4,2,0.12))',
                    }}
                  />
                </div>

                {/* Caption */}
                <div
                  style={{
                    marginTop:   '0.85rem',
                    fontFamily:  'var(--font-playfair, Georgia), serif',
                    fontStyle:   'italic',
                    fontSize:    '0.75rem',
                    color:       '#655B4F',
                    textAlign:   'center',
                    maxWidth:    '90%',
                  }}
                >
                  {item.hero.name}
                </div>
              </div>

              {/* Supporting Items Preview Strip */}
              <div style={{ padding: '1.15rem 1.25rem 0.75rem' }}>
                <div
                  style={{
                    fontSize:       '0.55rem',
                    letterSpacing:  '2.5px',
                    textTransform:  'uppercase',
                    color:          '#8E8271',
                    fontWeight:     600,
                    marginBottom:   '0.65rem',
                  }}
                >
                  FEATURED DISCIPLINE MASTERWORKS
                </div>
                <div
                  style={{
                    display:       'flex',
                    gap:           '0.65rem',
                    overflowX:     'auto',
                    paddingBottom: '0.4rem',
                    scrollbarWidth:'none',
                  }}
                >
                  {item.supporting.map((piece, pKey) => (
                    <div
                      key={`sup-${pKey}`}
                      style={{
                        width:           '86px',
                        flexShrink:      0,
                        backgroundColor: '#FAF8F5',
                        border:          '1px solid #EDE7DB',
                        borderRadius:    '10px',
                        padding:         '8px 6px',
                        display:         'flex',
                        flexDirection:   'column',
                        alignItems:      'center',
                        textAlign:       'center',
                      }}
                    >
                      <div style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={piece.image}
                          alt={piece.name}
                          style={{ maxHeight: '52px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize:   '0.58rem',
                          color:      '#5A4E3E',
                          marginTop:  '6px',
                          lineHeight: 1.25,
                          height:     '2.5em',
                          overflow:   'hidden',
                          display:    '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {piece.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Body & CTA */}
              <div style={{ padding: '0.75rem 1.25rem 1.35rem' }}>
                <h2
                  style={{
                    fontFamily:    'var(--font-playfair, Georgia), serif',
                    fontSize:      '1.65rem',
                    fontWeight:    400,
                    color:         '#1C160E',
                    margin:        '0 0 0.35rem 0',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title.toUpperCase()}
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-playfair, Georgia), serif',
                    fontStyle:  'italic',
                    fontSize:   '0.84rem',
                    color:      '#655B4F',
                    lineHeight: 1.6,
                    margin:     '0 0 1.25rem 0',
                  }}
                >
                  {item.description}
                </p>

                <Link
                  href={`/categories/${encodeURIComponent(item.slug)}`}
                  style={{
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'space-between',
                    backgroundColor: '#1C160E',
                    color:           '#FAF8F5',
                    padding:         '0.85rem 1.15rem',
                    borderRadius:    '10px',
                    textDecoration:  'none',
                    fontSize:        '0.65rem',
                    fontWeight:      600,
                    letterSpacing:   '2.5px',
                    textTransform:   'uppercase',
                  }}
                >
                  <span>EXPLORE {item.title.toUpperCase()} ATELIERS</span>
                  <span style={{ color: '#C5A059', fontSize: '1rem', lineHeight: 1 }}>→</span>
                </Link>
              </div>
            </div>
          ))}

          {/* Bottom Concluding Notice on Mobile */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border:          '1px solid #EBE4D8',
              borderRadius:    '16px',
              padding:         '1.75rem 1.25rem',
              textAlign:       'center',
              display:         'flex',
              flexDirection:   'column',
              alignItems:      'center',
              gap:             '1rem',
            }}
          >
            <div
              style={{
                fontSize:      '0.58rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color:         '#C5A059',
                fontWeight:    700,
              }}
            >
              CULTURAL ARCHIVE COMPLETE
            </div>
            <p
              style={{
                fontFamily: 'var(--font-playfair, Georgia), serif',
                fontStyle:  'italic',
                fontSize:   '0.85rem',
                color:      '#655B4F',
                lineHeight: 1.6,
                margin:     0,
                maxWidth:   '320px',
              }}
            >
              Explore our master studios in every category or submit an atelier for verified guild provenance.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', marginTop: '0.5rem' }}>
              <Link
                href="/register"
                style={{
                  backgroundColor: '#C5A059',
                  color:           '#1C160E',
                  padding:         '0.8rem 1rem',
                  borderRadius:    '8px',
                  textDecoration:  'none',
                  fontSize:        '0.62rem',
                  fontWeight:      700,
                  letterSpacing:   '2.5px',
                  textTransform:   'uppercase',
                  textAlign:       'center',
                  display:         'block',
                }}
              >
                APPLY FOR GUILD REGISTRY
              </Link>
              <Link
                href="/"
                style={{
                  backgroundColor: '#FAF8F5',
                  border:          '1px solid #E0D7C6',
                  color:           '#1C160E',
                  padding:         '0.8rem 1rem',
                  borderRadius:    '8px',
                  textDecoration:  'none',
                  fontSize:        '0.62rem',
                  fontWeight:      600,
                  letterSpacing:   '2.5px',
                  textTransform:   'uppercase',
                  textAlign:       'center',
                  display:         'block',
                }}
              >
                RETURN TO HOMEPAGE
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP & TABLET VIEW: 3D INTERACTIVE CAROUSEL (>= 768px) ────── */}
      <div
        className="collection-desktop-stage"
        onMouseMove={onMouseMove}
        style={{
          position:           'fixed',   // fixed prevents ANY ancestor scroll
          inset:              0,
          overflow:           'hidden',
          backgroundImage:    'url(/collections/studio_bg.png)',
          backgroundSize:     'cover',
          backgroundPosition: 'center center',
          backgroundRepeat:   'no-repeat',
          color:              '#1C160E',
        }}
      >
        {/* Subtle vignette */}
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 180px rgba(0,0,0,0.04)', pointerEvents: 'none', zIndex: 1 }} />

        {/* ── BLURABLE CONTENT ─────────────────────────────────────────────── */}
        <motion.div
          animate={{
            filter:  blurPhase !== 'idle' ? 'blur(18px)' : 'blur(0px)',
            opacity: blurPhase === 'blurring' ? 0.3 : 1,
          }}
          transition={{ duration: blurPhase === 'blurring' ? 0.30 : 0.42, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'absolute', inset: 0, zIndex: 5 }}
        >

          {/* ── 3D PRODUCT CAROUSEL ────────────────────────────────────────── */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
            {products.map((product, pIdx) => {
              const slotIdx = itemSlots[pIdx];
              const s = SLOTS[slotIdx];
              const ry = tilt.x * (s.isHero ? 2.2 : 1.1);
              const rx = -tilt.y * (s.isHero ? 2.2 : 1.1);
              const discH            = Math.round(s.discW * (320 / 854));
              const productBottomPos = discH - Math.round(s.discW * 0.041);

              return (
                <motion.div
                  key={`prod-${pIdx}`}
                  animate={{
                    left:   `${s.leftVw}vw`,
                    bottom: `${s.bottomVh}vh`,
                    zIndex:  s.z,
                    opacity: s.opacity,
                  }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleProductClick(pIdx)}
                  style={{ position: 'absolute', transform: 'translateX(-50%)', cursor: s.isHero ? 'default' : 'pointer' }}
                >
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
                    {/* Marble Pedestal */}
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

                    {/* Product Image */}
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
                          filter:           `blur(${s.blur})`,
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

          {/* ── LEFT TEXT PANEL ──────────────────────────────────────────────── */}
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

          {/* ── BOTTOM BAR ───────────────────────────────────────────────────── */}
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
            {!done && blurPhase === 'idle' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1.5rem' }}>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
                  style={{ width: 1, height: 20, backgroundColor: '#C5A059', borderRadius: 1 }}
                />
                <span style={{ fontSize: '0.52rem', color: '#A89878', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
              </div>
            )}

            {/* Next / Return */}
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

          {/* ── DOT NAVIGATION ───────────────────────────────────────────────── */}
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

        {/* ── BLUR VEIL OVERLAY ────────────────────────────────────────────────
            Cream wash that bridges the blur-out → blur-in gap visually         */}
        <AnimatePresence>
          {blurPhase !== 'idle' && (
            <motion.div
              key="veil"
              initial={{ opacity: 0 }}
              animate={{ opacity: blurPhase === 'blurring' ? 0.5 : 0 }}
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
    </>
  );
}
