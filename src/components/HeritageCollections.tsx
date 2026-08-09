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

interface CollectionMetadata {
  craftedSince: string;
  origin: string;
  material: string;
  technique: string;
  subLabel: string;
  detailedDescription: string;
}

const COLLECTION_DETAILS: Record<string, CollectionMetadata> = {
  Ceramics: {
    craftedSince: '10th Century',
    origin: 'Morocco & Turkey',
    material: 'Natural Clay & Glaze',
    technique: 'Zellige Tilework',
    subLabel: 'Zellige Tilework & Fine Pottery',
    detailedDescription: 'Hand-chiselled terra-cotta tilework set in geometric plaster, alongside hand-thrown stone clay glazed vessels utilizing historical mineral pigments.',
  },
  Textiles: {
    craftedSince: '12th Century',
    origin: 'Kashmir & Silk Road',
    material: 'Silk & Pashmina Wool',
    technique: 'Handwoven Loom',
    subLabel: 'Pashmina & Royal Weaves',
    detailedDescription: 'Crafted by generations of artisans using traditional weaving techniques that preserve centuries of Silk Road heritage.',
  },
  Jewelry: {
    craftedSince: 'Ancient Era',
    origin: 'Jaipur & Multan',
    material: 'Gold, Silver & Gems',
    technique: 'Filigree & Kundan',
    subLabel: 'Filigree & Royal Silverware',
    detailedDescription: 'Exquisite jewelry pieces handmade using silver and gold threads, beaten wire-work, and traditional stone settings from royal court workshops.',
  },
  Woodwork: {
    craftedSince: '14th Century',
    origin: 'Cordoba & Chiniot',
    material: 'Cedarwood & Brass',
    technique: 'Hand-Carved Inlay',
    subLabel: 'Andalusian Carvings & Marquetry',
    detailedDescription: 'Aromatic cedar wood meticulously hand-carved with intricate geometric motifs and inlaid with precious brass wire and mother-of-pearl.',
  },
  Leather: {
    craftedSince: '11th Century',
    origin: 'Fez, Morocco',
    material: 'Organic Lambskin',
    technique: 'Traditional Tanning',
    subLabel: 'Fez Organic Tanned Goods',
    detailedDescription: 'Natural hides cured in medieval stone vessels using plant-based solutions, hand-dyed with poppy and saffron extract.',
  },
  'Metal Craft': {
    craftedSince: '8th Century',
    origin: 'Damascus & Lahore',
    material: 'Steel & Copper',
    technique: 'Hammer-Beaten',
    subLabel: 'Hand-Hammered Copper & Damascus Steel',
    detailedDescription: 'Forged high-carbon steel blades with organic water-wave patterns, and vessels hammered by hand from sheet copper and silver-plated.',
  },
  Glass: {
    craftedSince: '13th Century',
    origin: 'Murano & Hebron',
    material: 'Silica & Soda Ash',
    technique: 'Hand-Blown Crystal',
    subLabel: 'Blown Stained Glass & Crystal',
    detailedDescription: 'Luminous glass objects mouth-blown at intense kiln temperatures, hand-stretched and stained using traditional metal oxides.',
  },
  'Home Decor': {
    craftedSince: '15th Century',
    origin: 'Cairo & Marrakesh',
    material: 'Solid Brass & Glass',
    technique: 'Hand-Pierced Filigree',
    subLabel: 'Brass Lanterns & Ornaments',
    detailedDescription: 'Detailed brass lamps hand-punched with complex arabesque patterns, casting geometric shadowscapes across modern interior spaces.',
  }
};

const COLLECTION_QUOTES: Record<string, string> = {
  Ceramics: "Formed from clay, refined by fire, and guarded by ancient secrets. Zellige tilework is a mosaic of human history.",
  Textiles: "Woven by hand, knot by knot, preserving the warmth and character of ancient Silk Road valleys.",
  Jewelry: "Every hammer strike attests to filigree craftsmanship, capturing the beauty of royal courts in silver and gold.",
  Woodwork: "Carving whispers of Andalusian arches and Moghul design into scent-filled masterwork cedarwood.",
  Leather: "Sun-cured hides tanned by ancient masters, gaining character and depth with every passing generation.",
  'Metal Craft': "Forged in the fires of Damascus, hammer-beaten into reflections of Lahore's metalwork heritage.",
  Glass: "Breathed from fire, blown into translucent crystal vessels that capture Moroccan and Murano light.",
  'Home Decor': "Hand-pierced brass lanterns casting geometric light and shadows of Cairo's night markets."
};

// ─── Noise Texture Background Overlay ───────────────────────────────────────
function NoiseOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.025,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ─── Reusable Glassmorphic Metadata Info Card ───────────────────────────────
function MetaCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255, 255, 255, 0.45)',
        border: `1px solid ${hovered ? '#B38A34' : '#E8DDCB'}`,
        borderRadius: '16px',
        padding: '0.9rem 1.1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        transform: hovered ? 'translate3d(0, -3px, 0)' : 'translate3d(0, 0, 0)',
        boxShadow: hovered ? '0 10px 24px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        flex: '1',
        minWidth: '140px',
      }}
    >
      <span style={{ fontSize: '1.15rem', color: '#B38A34' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <span style={{ fontSize: '0.62rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#6D6D6D', fontWeight: 600 }}>
          {label}
        </span>
        <span style={{ fontSize: '0.88rem', color: '#1E1E1E', fontFamily: 'var(--font-playfair, Georgia), serif', fontWeight: 500 }}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Individual card with 3D tilt, parallax layers ───────────────────────────
function CollectionCard({
  col,
  index,
  isTouch,
  opacity,
  translateY,
  scale,
  pointerEvents,
}: {
  col: Collection;
  index: number;
  isTouch: boolean;
  opacity: number;
  translateY: number;
  scale: number;
  pointerEvents: 'auto' | 'none';
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef({ rotX: 0, rotY: 0, liftY: 0, imgX: 0, imgY: 0, glow: 0 });
  const targetRef = useRef({ rotX: 0, rotY: 0, liftY: 0, imgX: 0, imgY: 0, glow: 0 });
  const isHovered = useRef(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

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
      const reflection = card.querySelector<HTMLElement>('.cc-reflection');

      // Layer state liftY with scroll transition props
      card.style.transform =
        `translate3d(0, ${translateY + s.liftY}px, 0) ` +
        `rotateX(${s.rotX}deg) rotateY(${s.rotY}deg) scale(${scale * (isHovered.current ? 1.01 : 1)})`;

      card.style.boxShadow = isHovered.current
        ? `0 ${28 + s.liftY * -0.5}px 60px rgba(0,0,0,0.12), 0 0 45px rgba(179,138,52,${0.18 * s.glow}), 0 2px 0 rgba(255,255,255,0.4) inset`
        : `0 16px 48px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.3) inset`;

      if (img) {
        img.style.transform = `translate3d(${s.imgX * 0.5}px, ${s.imgY * 0.5}px, 0) scale(${isHovered.current ? 1.08 : 1}) rotate(${isHovered.current ? '0.5deg' : '0deg'})`;
      }
      if (reflection) {
        reflection.style.transform = `translate3d(${s.imgX * 0.8}px, ${s.imgY * 0.3}px, 0)`;
        reflection.style.opacity = String(isHovered.current ? 0.15 : 0.06);
      }
    }

    const still = Math.abs(s.rotX - t.rotX) < 0.005 &&
      Math.abs(s.rotY - t.rotY) < 0.005 &&
      Math.abs(s.liftY - t.liftY) < 0.005;

    frameRef.current = still && !isHovered.current ? 0 : requestAnimationFrame(tick);
  }, [translateY, scale]);

  const startRAF = useCallback(() => {
    if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    startRAF();
  }, [translateY, scale, startRAF]);

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    targetRef.current.rotY = cx * 12;
    targetRef.current.rotX = -cy * 8;
    targetRef.current.imgX = cx * 16;
    targetRef.current.imgY = cy * 12;
    startRAF();
  };

  const onMouseEnter = () => {
    if (isTouch) return;
    isHovered.current = true;
    setIsCardHovered(true);
    targetRef.current.liftY = -8; // lifts card up slightly
    targetRef.current.glow = 1;
    startRAF();
  };

  const onMouseLeave = () => {
    isHovered.current = false;
    setIsCardHovered(false);
    targetRef.current = { rotX: 0, rotY: 0, liftY: 0, imgX: 0, imgY: 0, glow: 0 };
    startRAF();
  };

  return (
    <div
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
        width: '100%',
        height: '100%',
      }}
    >
      <Link
        href={`/categories/${encodeURIComponent(col.name)}`}
        style={{ textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}
        tabIndex={0}
      >
        <div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{
            borderRadius: '26px', // Rounded luxury card frame
            position: 'relative',
            overflow: 'hidden',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${isCardHovered ? '#B38A34' : '#E8DDCB'}`,
            backgroundColor: '#FFFFFF',
            transformStyle: 'preserve-3d',
            willChange: 'transform, box-shadow, border-color',
            cursor: 'pointer',
            opacity,
            pointerEvents,
            transition: 'opacity 0.4s ease-out, border-color 0.4s ease',
            padding: '1.2rem',
          }}
        >
          {/* Inner image frame container with thin gold border */}
          <div
            style={{
              width: '100%',
              height: '360px',
              borderRadius: '18px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid #E8DDCB',
              transition: 'border-color 0.4s ease',
            }}
          >
            <img
              className="cc-img"
              src={col.image}
              alt={col.name}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                willChange: 'transform',
                transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            />
          </div>

          {/* Card description below the image */}
          <div
            style={{
              paddingTop: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <h3
              style={{
                color: '#1E1E1E',
                fontSize: '1.35rem',
                margin: 0,
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                fontWeight: 400,
                letterSpacing: '0.5px',
              }}
            >
              {col.name}
            </h3>
            <p
              style={{
                fontSize: '0.82rem',
                fontFamily: 'var(--font-playfair, Georgia), serif',
                fontStyle: 'italic',
                color: '#B38A34',
                margin: 0,
                lineHeight: '1.45',
              }}
            >
              "{COLLECTION_QUOTES[col.name]}"
            </p>
          </div>

          {/* Glass reflection overlay */}
          <div
            className="cc-reflection"
            style={{
              position: 'absolute',
              top: 0,
              left: '-30%',
              width: '60%',
              height: '100%',
              borderRight: '1px solid rgba(255, 255, 255, 0.15)',
              zIndex: 4,
              pointerEvents: 'none',
              opacity: 0.06,
              willChange: 'transform, opacity',
            }}
          />
        </div>
      </Link>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
export default function HeritageCollections({ collections = [] }: HeritageCollectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isTouch, setIsTouch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const safeCollections = collections && collections.length > 0 ? collections : [];
  const totalSlides = safeCollections.length + 1; // 9 slides (1 intro + 8 categories)

  // Handle responsive layout shifts cleanly
  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track mouse coordinates for subtle parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouch || isMobile) return;
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) / 30; // normalized offsets
    const y = (clientY - window.innerHeight / 2) / 30;
    setMousePos({ x, y });
  };

  // Event based slide transitions: scroll-jacks page ONLY until slides are traversed
  useEffect(() => {
    if (isMobile) return;

    // Initially lock scroll if we mount at the top
    if (window.scrollY === 0) {
      document.body.style.overflow = 'hidden';
    }

    let lastScrollTime = Date.now();

    const handleWheel = (e: WheelEvent) => {
      const isLocked = document.body.style.overflow === 'hidden';

      if (!isLocked) {
        // Re-lock scroll if user scrolls to the absolute top and scrolls up
        if (window.scrollY === 0 && e.deltaY < 0) {
          document.body.style.overflow = 'hidden';
          setActiveIdx(totalSlides - 1); // Start from last slide
        }
        return;
      }

      // If scroll is locked, intercept events
      if (Math.abs(e.deltaY) < 15) return;

      const now = Date.now();
      if (now - lastScrollTime < 1000) return; // 1s cooldown between transitions

      if (e.deltaY > 0) {
        // scroll down
        if (activeIdx < totalSlides - 1) {
          setActiveIdx((prev) => prev + 1);
          lastScrollTime = now;
        } else {
          // Scrolled past the last slide, unlock scroll to let them scroll to footer
          document.body.style.overflow = 'unset';
        }
      } else {
        // scroll up
        if (activeIdx > 0) {
          setActiveIdx((prev) => prev - 1);
          lastScrollTime = now;
        } else {
          // Scrolled past the first slide upwards, unlock scroll to allow scroll up
          document.body.style.overflow = 'unset';
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const isLocked = document.body.style.overflow === 'hidden';

      if (!isLocked) {
        if (window.scrollY === 0 && touchStartY < e.changedTouches[0].clientY) {
          // Swiped down at top -> re-lock and jump to last slide
          document.body.style.overflow = 'hidden';
          setActiveIdx(totalSlides - 1);
        }
        return;
      }

      const now = Date.now();
      if (now - lastScrollTime < 1000) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          // swipe up -> next slide
          if (activeIdx < totalSlides - 1) {
            setActiveIdx((prev) => prev + 1);
            lastScrollTime = now;
          } else {
            document.body.style.overflow = 'unset';
          }
        } else {
          // swipe down -> prev slide
          if (activeIdx > 0) {
            setActiveIdx((prev) => prev - 1);
            lastScrollTime = now;
          } else {
            document.body.style.overflow = 'unset';
          }
        }
      }
    };

    // Global scroll listener to re-lock if user scrolls back to absolute top
    const handlePageScroll = () => {
      if (window.scrollY === 0) {
        document.body.style.overflow = 'hidden';
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handlePageScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handlePageScroll);
      document.body.style.overflow = 'unset'; // Clean up scroll lock on unmount
    };
  }, [isMobile, totalSlides, activeIdx]);

  // Calculate card styling based on active index
  const getCardStyle = (index: number) => {
    const slideIndex = index + 1;
    const isActive = activeIdx === slideIndex;
    const isPast = activeIdx > slideIndex;

    return {
      opacity: isActive ? 1 : 0,
      translateY: isActive ? 0 : (isPast ? -40 : 40),
      scale: isActive ? 1 : 0.96,
      pointerEvents: isActive ? ('auto' as const) : ('none' as const),
    };
  };

  // Inject general styles to prevent hydration mismatches and handle luxury hover/keyframe animations
  useEffect(() => {
    const id = 'heritage-collections-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
      .hc-explore-btn:hover {
        background-color: #C5A059 !important;
        box-shadow: 0 6px 22px rgba(179, 138, 52, 0.35) !important;
        transform: translateY(-2px);
      }
      .hc-explore-btn:hover .btn-arrow {
        transform: translateX(6px);
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translate3d(0, 30px, 0);
          filter: blur(8px);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          filter: blur(0px);
        }
      }
      .hc-fade-in-content {
        animation: fadeInUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @media (max-width: 820px) {
        .hc-split-layout {
          flex-direction: column !important;
          justify-content: center !important;
          gap: 2rem !important;
        }
        .hc-text-col {
          max-width: 100% !important;
          align-items: center !important;
          text-align: center !important;
          height: auto !important;
          padding-left: 0 !important;
        }
        .hc-card-col {
          width: 100% !important;
          max-width: 380px !important;
          height: 480px !important;
        }
        .hc-meta-grid {
          grid-template-columns: 1fr 1fr !important;
        }
        .hc-explore-btn {
          width: 100% !important;
          justify-content: center !important;
        }
      }
    `;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const activeCol = activeIdx > 0 ? safeCollections[activeIdx - 1] : safeCollections[0];

  // Safely resolve metadata details
  const activeDetails = activeCol
    ? (COLLECTION_DETAILS[activeCol.name] || {
        craftedSince: 'N/A',
        origin: 'Global',
        material: 'Authentic',
        technique: 'Handcrafted',
        subLabel: activeCol.label || '',
        detailedDescription: activeCol.label || '',
      })
    : {
        craftedSince: 'N/A',
        origin: 'Global',
        material: 'Authentic',
        technique: 'Handcrafted',
        subLabel: '',
        detailedDescription: '',
      };

  // ─── Responsive Mobile/Tablet Layout ────────────────────────────────────────
  if (isMobile) {
    return (
      <main
        style={{
          backgroundColor: '#F8F6F2',
          color: '#1E1E1E',
          minHeight: '100vh',
          padding: '6rem 1.5rem 4rem',
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        <NoiseOverlay />

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
            <div style={{ height: '1px', width: '25px', backgroundColor: '#B38A34' }} />
            <span style={{ fontSize: '0.68rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#B38A34', fontWeight: 600 }}>
              Britsync Registry
            </span>
            <div style={{ height: '1px', width: '25px', backgroundColor: '#B38A34' }} />
          </div>
          <h1 style={{ fontSize: '2.6rem', fontFamily: 'var(--font-playfair, Georgia), serif', fontWeight: 300, margin: 0, color: '#1E1E1E' }}>
            Heritage Collections
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#6D6D6D', fontStyle: 'italic', fontFamily: 'var(--font-playfair, Georgia), serif', marginTop: '0.8rem', maxWidth: '480px', margin: '0.8rem auto 0', lineHeight: 1.5 }}>
            "A living archive of geographically attested artisan disciplines and historical masterworks, verified by cryptographic provenance passports."
          </p>
        </div>

        {/* Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem', maxWidth: '640px', margin: '0 auto' }}>
          {safeCollections.map((col, index) => {
            const details = COLLECTION_DETAILS[col.name] || {
              craftedSince: 'N/A',
              origin: col.provenance || 'Global',
              material: 'Authentic',
              technique: 'Handcrafted',
              subLabel: col.label || '',
              detailedDescription: col.label || '',
            };
            return (
              <div
                key={col.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  borderBottom: index < safeCollections.length - 1 ? '1px solid #E8DDCB' : 'none',
                  paddingBottom: index < safeCollections.length - 1 ? '4.5rem' : '0',
                }}
              >
                {/* Visual Card */}
                <div
                  style={{
                    borderRadius: '24px',
                    border: '1px solid #E8DDCB',
                    backgroundColor: '#FFFFFF',
                    padding: '1.1rem',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ width: '100%', height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E8DDCB' }}>
                    <img src={col.image} alt={col.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <h3 style={{ color: '#1E1E1E', fontSize: '1.3rem', fontFamily: 'var(--font-playfair, Georgia, serif)', margin: 0, fontWeight: 400 }}>
                      {col.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#B38A34', margin: 0, fontFamily: 'var(--font-playfair, Georgia), serif' }}>
                      "{COLLECTION_QUOTES[col.name]}"
                    </p>
                  </div>
                </div>

                {/* Details Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '2rem', fontFamily: 'var(--font-playfair, Georgia), serif', color: '#B38A34', fontWeight: 300 }}>
                      0{index + 1}
                    </span>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#B38A34', border: '1px solid rgba(179,138,52,0.3)', padding: '0.3rem 0.9rem', borderRadius: '20px', backgroundColor: 'rgba(179,138,52,0.04)', fontWeight: 600 }}>
                      📍 {col.provenance}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: '#6D6D6D', margin: 0 }}>
                    {details.detailedDescription}
                  </p>

                  {/* Metadata Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid #E8DDCB', borderRadius: '12px', padding: '0.6rem 0.8rem' }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#6D6D6D', display: 'block', fontWeight: 600 }}>Since</span>
                      <span style={{ fontSize: '0.82rem', color: '#1E1E1E', fontWeight: 600, fontFamily: 'var(--font-playfair, Georgia), serif' }}>{details.craftedSince}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid #E8DDCB', borderRadius: '12px', padding: '0.6rem 0.8rem' }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#6D6D6D', display: 'block', fontWeight: 600 }}>Origin</span>
                      <span style={{ fontSize: '0.82rem', color: '#1E1E1E', fontWeight: 600, fontFamily: 'var(--font-playfair, Georgia), serif' }}>{details.origin}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid #E8DDCB', borderRadius: '12px', padding: '0.6rem 0.8rem' }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#6D6D6D', display: 'block', fontWeight: 600 }}>Material</span>
                      <span style={{ fontSize: '0.82rem', color: '#1E1E1E', fontWeight: 600, fontFamily: 'var(--font-playfair, Georgia), serif' }}>{details.material}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid #E8DDCB', borderRadius: '12px', padding: '0.6rem 0.8rem' }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#6D6D6D', display: 'block', fontWeight: 600 }}>Technique</span>
                      <span style={{ fontSize: '0.82rem', color: '#1E1E1E', fontWeight: 600, fontFamily: 'var(--font-playfair, Georgia), serif' }}>{details.technique}</span>
                    </div>
                  </div>

                  <Link
                    href={`/categories/${encodeURIComponent(col.name)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.8rem',
                      padding: '0.9rem',
                      borderRadius: '50px',
                      backgroundColor: '#B38A34',
                      color: '#F8F6F2',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      letterSpacing: '2px',
                      boxShadow: '0 4px 15px rgba(179, 138, 52, 0.25)',
                      marginTop: '1rem',
                      textAlign: 'center',
                    }}
                  >
                    <span>Explore Collection</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  // ─── Desktop Viewport-Locking Slide Layout ──────────────────────────────────
  return (
    <>
      <main
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
          backgroundColor: '#F8F6F2', // Warm Ivory Background
          color: '#1E1E1E',           // Primary Text
          height: '100vh',            // Locked viewport height
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle noise texture */}
        <NoiseOverlay />

        {/* Fullscreen content container */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Solid low-opacity background border decoration */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '88vw',
              height: '86vh',
              borderRadius: '32px',
              border: '1px solid #E8DDCB',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Oversized Parallax Background Slide Number */}
          {activeIdx > 0 && (
            <div
              key={`bg-num-${activeIdx}`}
              style={{
                position: 'absolute',
                right: '8%',
                top: '20%',
                fontSize: '25rem',
                fontFamily: 'var(--font-playfair, Georgia), serif',
                fontWeight: 950,
                color: '#B38A34',
                opacity: 0.03,
                pointerEvents: 'none',
                zIndex: 0,
                userSelect: 'none',
                transform: `translate3d(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px, 0)`,
                transition: 'transform 0.25s ease-out',
                animation: 'fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              0{activeIdx}
            </div>
          )}

          {/* Main Content Area */}
          <div
            style={{
              width: '90%',
              maxWidth: '1200px',
              position: 'relative',
              zIndex: 1,
              height: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 1. INTRO SLIDE (Centered) */}
            {activeIdx === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  maxWidth: '720px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.2rem',
                  transform: `translate3d(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px, 0)`,
                  transition: 'transform 0.25s ease-out',
                }}
                className="hc-fade-in-content"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ height: '1px', width: '30px', backgroundColor: '#B38A34' }} />
                  <span style={{ fontSize: '0.75rem', letterSpacing: '6px', textTransform: 'uppercase', color: '#B38A34', fontWeight: 600 }}>
                    Britsync Registry
                  </span>
                  <div style={{ height: '1px', width: '30px', backgroundColor: '#B38A34' }} />
                </div>

                <h1 style={{ fontSize: '4.2rem', fontFamily: 'var(--font-playfair, Georgia), serif', fontWeight: 300, margin: '0.5rem 0', color: '#1E1E1E', lineHeight: 1.1 }}>
                  Heritage Collections
                </h1>

                <p style={{ fontSize: '1.08rem', lineHeight: '1.8', color: '#6D6D6D', margin: '0.2rem 0 1rem', fontFamily: 'var(--font-playfair, Georgia), serif', fontStyle: 'italic', maxWidth: '640px' }}>
                  "A living archive of geographically attested artisan disciplines and historical masterworks, verified by cryptographic provenance passports."
                </p>

                {/* Direct Category Quick-Navigation Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', marginTop: '0.8rem' }}>
                  <span style={{ fontSize: '0.62rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#B38A34', fontWeight: 600, opacity: 0.8 }}>
                    Explore verified disciplines
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem 1rem', maxWidth: '680px', margin: '0.2rem auto 1rem' }}>
                    {safeCollections.map((col, index) => (
                      <button
                        key={col.name}
                        onClick={() => {
                          setActiveIdx(index + 1);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6D6D6D',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-playfair, Georgia), serif',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          padding: '0.3rem 0.6rem',
                          borderBottom: '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#B38A34';
                          e.currentTarget.style.borderBottomColor = 'rgba(179, 138, 52, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#6D6D6D';
                          e.currentTarget.style.borderBottomColor = 'transparent';
                        }}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                  
                  <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B38A34', fontWeight: 600 }}>
                    or scroll/swipe down to browse
                  </span>
                  <div style={{ width: '1px', height: '35px', backgroundColor: '#B38A34', marginTop: '0.2rem' }} />
                </div>
              </div>
            )}

            {/* 2. CATEGORY SLIDES (Split Layout) */}
            {activeIdx > 0 && (
              <div
                className="hc-split-layout"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                {/* Left Column: Collection card deck - Fixed 45% Width */}
                <div
                  className="hc-card-col"
                  style={{
                    width: '45%',
                    height: '540px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Subtle ambient radial gold glow behind active card */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '320px',
                      height: '320px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(216, 190, 121, 0.14)',
                      filter: 'blur(90px)',
                      pointerEvents: 'none',
                      zIndex: 0,
                    }}
                  />

                  {safeCollections.map((col, i) => {
                    const { opacity, translateY, scale, pointerEvents } = getCardStyle(i);
                    return (
                      <div
                        key={col.name}
                        style={{
                          position: 'absolute',
                          width: '100%',
                          maxWidth: '440px',
                          opacity,
                          zIndex: i + 10,
                          pointerEvents,
                          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <CollectionCard
                          col={col}
                          index={i}
                          isTouch={isTouch}
                          opacity={opacity}
                          translateY={0}
                          scale={1}
                          pointerEvents={pointerEvents}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Fixed 50% Width */}
                <div
                  className="hc-text-col"
                  style={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%',
                    position: 'relative',
                    paddingLeft: '3rem',
                  }}
                >
                  {/* Page header (Static) */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                      <div style={{ height: '1px', width: '30px', backgroundColor: '#B38A34' }} />
                      <span style={{ fontSize: '0.68rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#B38A34', fontWeight: 600 }}>
                        Heritage Registry
                      </span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-playfair, Georgia), serif', fontWeight: 300, margin: 0, color: '#1E1E1E' }}>
                      Collections
                    </h1>
                  </div>

                  {/* Dynamic Description Box with Switch Animations */}
                  <div 
                    key={activeIdx}
                    style={{ 
                      transform: `translate3d(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px, 0)`,
                      transition: 'transform 0.25s ease-out',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      minHeight: '380px'
                    }}
                    className="hc-fade-in-content"
                  >
                    {/* Progress Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#B38A34', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 600 }}>
                      <button 
                        onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
                        style={{ background: 'none', border: 'none', color: '#B38A34', cursor: 'pointer', padding: 0 }}
                      >
                        ←
                      </button>
                      <span>0{activeIdx}</span>
                      <div style={{ position: 'relative', width: '80px', height: '2px', backgroundColor: '#E8DDCB', borderRadius: '1px', overflow: 'hidden' }}>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${(activeIdx / (totalSlides - 1)) * 100}%`,
                            backgroundColor: '#B38A34',
                            transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      </div>
                      <span style={{ color: '#6D6D6D' }}>0{totalSlides - 1}</span>
                      <button 
                        onClick={() => setActiveIdx((prev) => Math.min(totalSlides - 1, prev + 1))}
                        style={{ background: 'none', border: 'none', color: '#B38A34', cursor: 'pointer', padding: 0 }}
                      >
                        →
                      </button>
                    </div>

                    <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-playfair, Georgia), serif', fontWeight: 400, margin: 0, color: '#1E1E1E' }}>
                      {activeCol.name}
                    </h2>

                    <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: '#6D6D6D', margin: 0, maxWidth: '440px' }}>
                      {activeDetails.detailedDescription}
                    </p>

                    {/* Metadata Info Cards Grid */}
                    <div
                      className="hc-meta-grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.8rem',
                        margin: '0.8rem 0',
                        maxWidth: '440px',
                      }}
                    >
                      <MetaCard label="Crafted Since" value={activeDetails.craftedSince} icon="⏳" />
                      <MetaCard label="Origin" value={activeDetails.origin} icon="📍" />
                      <MetaCard label="Material" value={activeDetails.material} icon="💎" />
                      <MetaCard label="Technique" value={activeDetails.technique} icon="⚙️" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <span style={{ color: '#B38A34', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {activeCol.count} Masterworks Verified
                      </span>
                      <Link
                        href={`/categories/${encodeURIComponent(activeCol.name)}`}
                        className="hc-explore-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.8rem',
                          padding: '0.85rem 2rem',
                          borderRadius: '50px',
                          backgroundColor: '#B38A34',
                          color: '#F8F6F2',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          letterSpacing: '2px',
                          transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                          boxShadow: '0 4px 15px rgba(179, 138, 52, 0.25)',
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <span>Explore Collection</span>
                        <span className="btn-arrow" style={{ display: 'inline-block', transition: 'transform 0.3s ease' }}>&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Cue Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.62rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(179, 138, 52, 0.5)',
            pointerEvents: 'none',
          }}
        >
          SCROLL OR SWIPE TO BROWSE COLLECTIONS ↓
        </div>
      </main>
    </>
  );
}
