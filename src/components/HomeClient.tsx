"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, useInView, animate } from 'framer-motion';
import { calculateSellingPrice } from '@/lib/pricing';
import ProductCard from './ProductCard';
import { Icons } from './Icons';
import LuxuryHero from './LuxuryHero';
import MagneticCategoryCarousel from './MagneticCategoryCarousel';
import ArtisanGlobeJourney from './ArtisanGlobeJourney';
import SafeguardsOriginExperience from './SafeguardsOriginExperience';
import GuardiansOfLegacy from './GuardiansOfLegacy';


interface Product {
  id: string;
  name: string;
  maker: any;
  price: number;
  image: string;
  images?: string[];
  category?: string;
  badge: string;
  verificationStatus: string;
}

interface HomeClientProps {
  eliteProducts: Product[];
  generalProducts: Product[];
}

// 1. Premium Counter utilizing Framer Motion animation controls
function PremiumCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2.2,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [value, inView, suffix]);

  return <span ref={ref} style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>0{suffix}</span>;
}

// 2. Interactive 3D Perspective Tilt Wrapper
function Tilt3D({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setRotX(rotateX);
    setRotY(rotateY);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.12 });
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={className}
    >
      <motion.div
        animate={{ rotateX: rotX, rotateY: rotY }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {children}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(212,175,55,${glare.opacity}) 0%, transparent 65%)`,
            transition: 'opacity 0.3s ease',
          }}
        />
      </motion.div>
    </div>
  );
}

export default function HomeClient({ eliteProducts, generalProducts }: HomeClientProps) {

  // Interactive Passport State
  const [passportTab, setPassportTab] = useState<'origin' | 'audit' | 'ledger'>('origin');

  // Interactive Map Highlighted Country state
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  const [escrowAmount, setEscrowAmount] = useState<number>(500);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const categories = [
    { name: 'Textiles', count: '24 Masterpieces', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800', desc: 'Hand-woven Berber Kilims & Organic Indigo Ajraks' },
    { name: 'Ceramics', count: '18 Masterpieces', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800', desc: 'Quartz-glazed Iznik Vessels & Fired Terracotta' },
    { name: 'Jewelry', count: '15 Masterpieces', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800', desc: 'Hand-hammered Gold Filigree & Heritage Gems' },
    { name: 'Woodwork', count: '16 Masterpieces', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800', desc: 'Saharanpur Hand-Carved Teakwood & Inlays' },
    { name: 'Leather', count: '12 Masterpieces', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800', desc: 'Traditional Tanned Khussas & Saddlebags' },
    { name: 'Home Decor', count: '14 Masterpieces', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800', desc: 'Hand-poured Brass Lanterns & Ornaments' },
    { name: 'Fashion', count: '11 Masterpieces', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800', desc: 'Silk Embroidered Atelier Robes & Shawls' },
    { name: 'Art', count: '10 Masterpieces', image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800', desc: 'Heritage Miniature Paintings & Calligraphy' }
  ];

  const countries = [
    { name: 'Pakistan', coords: { x: '63%', y: '47%' }, flag: '🇵🇰', craft: 'Ajrak Blockprints & Khussa Leather', maker: 'Aisha Studio' },
    { name: 'Morocco', coords: { x: '46%', y: '50%' }, flag: '🇲🇦', craft: 'Generational Hand-Woven Kilim Rugs', maker: 'Fatima Loom Co-op' },
    { name: 'Turkey', coords: { x: '52%', y: '44%' }, flag: '🇹🇷', craft: 'Iznik Quartz-Glazed Ceramics', maker: 'Zeynep Pottery' },
    { name: 'India', coords: { x: '66%', y: '51%' }, flag: '🇮🇳', craft: 'Hand-Carved Saharanpur Teakwood', maker: 'Rajesh Atelier' },
    { name: 'Peru', coords: { x: '32%', y: '73%' }, flag: '🇵🇪', craft: 'Alpaca Wool Heritage Weaves', maker: 'Andean Guild' }
  ];

  // Motion Reveal Standard Variants
  const revealVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };



  return (
    <main style={{ backgroundColor: 'var(--background)', overflow: 'clip' }}>

      {/* ════════════════════════════════════════════════════════════
          LUXURY CINEMATIC HERO — canvas sprite reveal + parallax
          ════════════════════════════════════════════════════════════ */}
      <LuxuryHero />

      {/* 1B. EXPLORE CRAFT DISCIPLINES (RICH CATEGORY SHOWCASE) */}
      <section style={{ padding: '7rem 3rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--glass-border)', position: 'relative' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Guild Disciplines</span>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-playfair), Georgia, serif', marginTop: '0.8rem', fontWeight: 300 }}>Explore Royal Heritage Crafts</h2>
            <p style={{ opacity: 0.7, maxWidth: '600px', margin: '1rem auto 0', fontSize: '0.95rem' }}>
              Hand-curated collections across eight ancient craft disciplines, each protected by geographic appellations of origin.
            </p>
          </div>

          {/* Magnetic Carousel Section 2 */}
          <MagneticCategoryCarousel categories={categories} />
        </div>
      </section>

      {/* 2. TRUSTED BY — 3D Glass Ribbon */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
        style={{ padding: '4.5rem 2rem', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'var(--surface)' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.5, marginBottom: '2.2rem' }}>Safeguarded in Collaboration With</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem', alignItems: 'center' }}>
            {[
              "ROYAL HERITAGE COMMISSION",
              "GLOBAL CRAFT ADVOCACY",
              "WORLD APPELLATIONS LEAGUE",
              "ATELIER AUDITING ALLIANCE"
            ].map((partner) => (
              <motion.div
                key={partner}
                whileHover={{ scale: 1.06, y: -4 }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '0.9rem 1.8rem',
                  borderRadius: '30px',
                  backgroundColor: 'rgba(212,175,55,0.03)',
                  border: '1px solid var(--glass-border)',
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '0.95rem',
                  letterSpacing: '2px',
                  fontWeight: 300,
                  color: 'var(--text)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 3. MARKETPLACE STATISTICS — 3D Floating Glass Cards */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
        style={{ 
          padding: '8rem 3rem', 
          backgroundImage: 'linear-gradient(to right, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.82) 100%), url("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          color: '#FAF9F6', 
          position: 'relative', 
          overflow: 'hidden',
          borderTop: '1px solid rgba(212,175,55,0.3)',
          borderBottom: '1px solid rgba(212,175,55,0.3)'
        }}
      >
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }} />
        <div className="glow-orb" style={{ bottom: '-10%', left: '10%', width: '400px', height: '400px', opacity: 0.4 }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem', position: 'relative', zIndex: 10 }}>
          {[
            { val: 100, suffix: "%", label: "Hand-Audited Studios" },
            { val: 45, suffix: "+", label: "Protected Regions" },
            { val: 1250000, suffix: "+", label: "Direct Patron Payouts (£)" },
            { val: 15, suffix: "k", label: "Registered Masterpieces" }
          ].map((stat) => (
            <Tilt3D key={stat.label}>
              <div 
                style={{ 
                  borderLeft: '3px solid var(--accent)', 
                  backgroundColor: 'rgba(10,10,12,0.65)', 
                  padding: '2.2rem 2rem', 
                  borderRadius: '16px', 
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  height: '100%',
                }}
              >
                <h3 style={{ fontSize: '3.2rem', fontWeight: 200, color: 'var(--accent)', marginBottom: '0.4rem', margin: 0 }}>
                  <PremiumCounter value={stat.val} suffix={stat.suffix} />
                </h3>
                <span style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 500 }}>
                  {stat.label}
                </span>
              </div>
            </Tilt3D>
          ))}
        </div>
      </motion.section>

      {/* 4. GUARDIANS OF THE LEGACY */}
      <GuardiansOfLegacy />



      {/* 6. INTERACTIVE PASSPORT DEMO WITH HOLOGRAPHIC SCORE GAUGE */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
        style={{ 
          padding: '9rem 3rem', 
          backgroundImage: 'linear-gradient(to bottom, rgba(10,10,12,0.92), rgba(18,18,24,0.88)), url("https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#FAF9F6',
          borderTop: '1px solid var(--glass-border)', 
          borderBottom: '1px solid var(--glass-border)', 
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }} />
        <div className="glow-orb" style={{ top: '20%', right: '10%', width: '500px', height: '500px', opacity: 0.5 }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Cryptographic Heritage</span>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-playfair), Georgia, serif', marginTop: '0.8rem', fontWeight: 300 }}>Provenance Passport Viewer</h2>
            <p style={{ opacity: 0.7, maxWidth: '600px', margin: '1.5rem auto 0', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Every masterpiece on Britsync is issued an unalterable digital passport detailing its GPS geofenced studio, material purity test, and cryptographic ledger block.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }}>
            {/* Tabs Controller */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div 
                onClick={() => setPassportTab('origin')}
                style={{ 
                  padding: '2rem', 
                  borderRadius: '16px',
                  border: passportTab === 'origin' ? '1px solid var(--accent)' : '1px solid rgba(212, 175, 55, 0.2)', 
                  backgroundColor: passportTab === 'origin' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(13, 13, 16, 0.85)', 
                  color: '#FAF9F6',
                  backdropFilter: 'blur(16px)',
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  boxShadow: passportTab === 'origin' ? '0 10px 30px rgba(212,175,55,0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', color: passportTab === 'origin' ? 'var(--accent)' : '#FAF9F6', margin: 0 }}>
                    <Icons.MapPin size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Atelier Geographic Origin
                  </h3>
                  {passportTab === 'origin' && <span className="glow-dot" />}
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>Inspect GPS geofenced coordinates confirming the exact building where weaving, firing, or carving took place.</p>
              </div>

              <div 
                onClick={() => setPassportTab('audit')}
                style={{ 
                  padding: '2rem', 
                  borderRadius: '16px',
                  border: passportTab === 'audit' ? '1px solid var(--accent)' : '1px solid rgba(212, 175, 55, 0.2)', 
                  backgroundColor: passportTab === 'audit' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(13, 13, 16, 0.85)', 
                  color: '#FAF9F6',
                  backdropFilter: 'blur(16px)',
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  boxShadow: passportTab === 'audit' ? '0 10px 30px rgba(212,175,55,0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', color: passportTab === 'audit' ? 'var(--accent)' : '#FAF9F6', margin: 0 }}>
                    <Icons.Verified size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Audit Logs & Signatures
                  </h3>
                  {passportTab === 'audit' && <span className="glow-dot" />}
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>Review the manual inspection check-ins, local materials audit, and regional craft association verification stamps.</p>
              </div>

              <div 
                onClick={() => setPassportTab('ledger')}
                style={{ 
                  padding: '2rem', 
                  borderRadius: '16px',
                  border: passportTab === 'ledger' ? '1px solid var(--accent)' : '1px solid rgba(212, 175, 55, 0.2)', 
                  backgroundColor: passportTab === 'ledger' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(13, 13, 16, 0.85)', 
                  color: '#FAF9F6',
                  backdropFilter: 'blur(16px)',
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  boxShadow: passportTab === 'ledger' ? '0 10px 30px rgba(212,175,55,0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', color: passportTab === 'ledger' ? 'var(--accent)' : '#FAF9F6', margin: 0 }}>
                    <Icons.Lock size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Cryptographic Ledger
                  </h3>
                  {passportTab === 'ledger' && <span className="glow-dot" />}
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>Verify hashes indicating an unalterable timestamp validation on the decentralised provenance registry.</p>
              </div>
            </div>

            {/* Passport Screen Card with 3D Tilt */}
            <Tilt3D>
              <div 
                style={{ 
                  border: '1px solid rgba(212, 175, 55, 0.35)', 
                  backgroundColor: '#0D0D10', 
                  padding: '3.5rem', 
                  borderRadius: '16px',
                  position: 'relative', 
                  minHeight: '440px', 
                  boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                  color: '#FAF9F6'
                }}
              >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, var(--accent), #e2c044)', borderRadius: '16px 16px 0 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>AUTHENTICITY GUARANTEED</span>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, fontFamily: 'monospace', marginTop: '0.2rem' }}>ID: BR-2026-94829</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(212,175,55,0.15)', padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.4)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>★</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '1px' }}>PROVENANCE SCORE: 98/100</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {passportTab === 'origin' && (
                  <motion.div
                    key="origin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h4 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: '2rem', color: '#FAF9F6' }}>High Atlas Loom Workshop</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontSize: '0.85rem' }}>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ opacity: 0.5, display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem' }}>COUNTRY & NATION</span>
                        <strong style={{ color: '#FAF9F6', fontSize: '1rem' }}>Morocco 🇲🇦</strong>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ opacity: 0.5, display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem' }}>REGION / VALLEY</span>
                        <strong style={{ color: '#FAF9F6', fontSize: '1rem' }}>Ait Bouguemez Valley</strong>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ opacity: 0.5, display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem' }}>GPS COORDINATES</span>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>31.7917° N, 7.0926° W</strong>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ opacity: 0.5, display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem' }}>ALTITUDE</span>
                        <strong style={{ color: '#FAF9F6' }}>1,850m Above Sea Level</strong>
                      </div>
                    </div>
                  </motion.div>
                )}

                {passportTab === 'audit' && (
                  <motion.div
                    key="audit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h4 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: '2rem', color: '#FAF9F6' }}>Inspection & Sourcing Chain</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.05)', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                        <span style={{ color: 'var(--accent)' }}><Icons.Verified size={18} /></span>
                        <span>Material Sourcing: 100% locally sheared organic sheep wool. Zero synthetic blend.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.05)', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                        <span style={{ color: 'var(--accent)' }}><Icons.Verified size={18} /></span>
                        <span>Craft Heritage: Certified hand-loom technique by Moroccan Crafts Guild.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.05)', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                        <span style={{ color: 'var(--accent)' }}><Icons.Verified size={18} /></span>
                        <span>Physical Audit Stamp: Inspector H. Alaoui &bull; Signed July 2026.</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {passportTab === 'ledger' && (
                  <motion.div
                    key="ledger"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h4 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: '2rem', color: '#FAF9F6' }}>Immutable Origin Hashes</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.9 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '6px' }}>
                        <span style={{ opacity: 0.6 }}>GENESIS BLOCK #48928</span>
                        <span style={{ color: 'var(--accent)' }}>0x7D3A...99E1</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '6px' }}>
                        <span style={{ opacity: 0.6 }}>GPS GEOFENCE STAMP</span>
                        <span style={{ color: 'var(--accent)' }}>0x5B8C...10C4</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '6px' }}>
                        <span style={{ opacity: 0.6 }}>MATERIAL AUDIT STAMP</span>
                        <span style={{ color: 'var(--accent)' }}>0xF2A1...C8E7</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '6px' }}>
                        <span style={{ opacity: 0.6 }}>REGISTRY VERIFIED SEAL</span>
                        <span style={{ color: 'var(--accent)' }}>0x9E7A...3D9F</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </Tilt3D>
          </div>
        </div>
      </motion.section>

      {/* 7. HOW BRITSYNC SAFEGUARDS ORIGIN (INTERACTIVE 3D PROVENANCE CORE STORYTELLING) */}
      <SafeguardsOriginExperience />


      {/* 8. GLOBAL ARTISAN REGISTRY — Scroll-scrubbed 3D globe journey */}
      <ArtisanGlobeJourney />



      {/* 11. MAKER STORIES (JOURNAL) */}
      <section style={{ padding: '9rem 3rem', backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Journal</span>
            <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-playfair), Georgia, serif', marginTop: '0.8rem', fontWeight: 300 }}>Artisan Chronicles & Biographies</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <Tilt3D>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', padding: '3.5rem', borderRadius: '20px', borderLeft: '4px solid var(--accent)', boxShadow: 'var(--shadow-md)', height: '100%' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Volume I &mdash; Morocco</span>
                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: '1rem 0 1.5rem' }}>Fatima: Rescuing High Atlas Kilims</h3>
                <p style={{ fontSize: '0.92rem', opacity: 0.8, lineHeight: 1.8, marginBottom: '2rem' }}>Fatima expanded her mountaintop weaving loom cooperative to safeguard heritage geometric Berber lineage patterns, directly employing local young women weavers.</p>
                <Link href="/stories" style={{ textDecoration: 'none', color: 'var(--accent)', fontSize: '0.82rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Read Full Biography &rarr;</Link>
              </div>
            </Tilt3D>

            <Tilt3D>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', padding: '3.5rem', borderRadius: '20px', borderLeft: '4px solid var(--accent)', boxShadow: 'var(--shadow-md)', height: '100%' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Volume II &mdash; Sindh</span>
                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: '1rem 0 1.5rem' }}>Aisha: The 21 Steps of Organic Dyeing</h3>
                <p style={{ fontSize: '0.92rem', opacity: 0.8, lineHeight: 1.8, marginBottom: '2rem' }}>Detailing the rigorous chemistry of clay, mustard oil, water, and pure wood ash required to bind vegetable indigo dyes permanently into organic cotton textiles.</p>
                <Link href="/stories" style={{ textDecoration: 'none', color: 'var(--accent)', fontSize: '0.82rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Read Full Biography &rarr;</Link>
              </div>
            </Tilt3D>
          </div>
        </div>
      </section>

      {/* 12. CUSTOMER TESTIMONIALS */}
      <section style={{ padding: '9rem 3rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Patrons</span>
            <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-playfair), Georgia, serif', marginTop: '0.8rem', fontWeight: 300 }}>Letters of Patronage</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {[
              { text: "The Ajrak Shawl is an absolute masterpiece. Having the exact GPS coordinates of Aisha's studio and viewing the inspector's signatures on the cryptographic passport makes me feel like a true custodian of Sindh history.", author: "Jane B. from London", rating: "★★★★★" },
              { text: "The Iznik Ceramic Bowl is breathtaking. The colors and glaze are outstanding. The digital passport gives me complete trust that I am holding a genuine, legally protected piece of Iznik history.", author: "Hans M. from Munich", rating: "★★★★★" },
              { text: "Acquiring the hand-spun alpaca throw has redefined my space. Knowing the exact weaver cooperative in Peru and reading Fatima's story created a deep, lasting connection to the work.", author: "Camille L. from Paris", rating: "★★★★★" }
            ].map((t, idx) => (
              <Tilt3D key={idx}>
                <div style={{ padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px', borderTop: '4px solid var(--accent)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--background)', boxShadow: 'var(--shadow-md)', height: '100%' }}>
                  <p style={{ fontStyle: 'italic', opacity: 0.88, lineHeight: 1.8, fontSize: '0.94rem', marginBottom: '2rem' }}>&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <div style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.85rem', letterSpacing: '2px' }}>{t.rating}</div>
                    <strong style={{ fontSize: '0.82rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text)' }}>{t.author}</strong>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--accent)', marginTop: '0.3rem', fontWeight: 500 }}>✓ Verified Patron & Passport Holder</span>
                  </div>
                </div>
              </Tilt3D>
            ))}
          </div>
        </div>
      </section>

      {/* 13. LIVE INTERACTIVE ESCROW PAYOUT CALCULATOR SIMULATOR */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
        style={{ 
          padding: '9rem 3rem', 
          backgroundImage: 'linear-gradient(to bottom, rgba(10,10,12,0.94), rgba(10,10,12,0.88)), url("https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#FAF9F6',
          borderTop: '1px solid var(--glass-border)', 
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none' }} />
        <div className="glow-orb" style={{ top: '10%', right: '5%', width: '450px', height: '450px', opacity: 0.4 }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '1rem' }}>Escrow Guarantee</span>
            <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-playfair), Georgia, serif', marginBottom: '1.5rem', fontWeight: 300 }}>100% Direct-Payout Transparency</h2>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.8, opacity: 0.85, marginBottom: '2.5rem' }}>
              We bypass intermediate traders completely. 95% of your purchase goes directly to the verified maker's local bank/digital wallet instantly upon delivery confirmation. Britsync retains a fixed 5% escrow commission to cover cryptographic passport indexing and logistical support.
            </p>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <span style={{ fontSize: '2.6rem', color: 'var(--accent)', fontFamily: 'var(--font-playfair), serif', fontWeight: 400 }}>95%</span>
                <span style={{ display: 'block', fontSize: '0.72rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '0.2rem' }}>Direct to Artisan</span>
              </div>
              <div>
                <span style={{ fontSize: '2.6rem', color: 'var(--text)', fontFamily: 'var(--font-playfair), serif', fontWeight: 400 }}>5%</span>
                <span style={{ display: 'block', fontSize: '0.72rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '0.2rem' }}>Escrow & Registry Fee</span>
              </div>
            </div>
          </div>

          {/* Live Interactive Slider Payout Visualizer with 3D Tilt */}
          <Tilt3D>
            <div style={{ border: '1px solid rgba(212,175,55,0.4)', borderRadius: '20px', padding: '3rem', backgroundColor: '#0D0D10', color: '#FAF9F6', display: 'flex', flexDirection: 'column', gap: '1.8rem', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, color: 'var(--accent)', fontWeight: 700 }}>LIVE PAYOUT CALCULATOR</h4>
                <span className="glow-dot" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.8rem', opacity: 0.8 }}>
                  <span>Slide Acquisition Price:</span>
                  <strong style={{ color: 'var(--accent)', fontSize: '1.2rem', fontFamily: 'monospace' }}>£{escrowAmount}</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={escrowAmount}
                  onChange={(e) => setEscrowAmount(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
              </div>

              {/* Visual Bar */}
              <div style={{ height: '12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '95%', backgroundColor: 'var(--accent)' }} />
                <div style={{ width: '5%', backgroundColor: '#666' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                <span style={{ opacity: 0.8 }}>Patron Purchase Total:</span>
                <strong style={{ color: '#FAF9F6' }}>£{escrowAmount.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                <span>Artisan Direct Payment (95%):</span>
                <strong style={{ fontFamily: 'monospace' }}>£{(escrowAmount * 0.95).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', opacity: 0.7 }}>
                <span>Registry Fee (5%):</span>
                <strong style={{ fontFamily: 'monospace' }}>£{(escrowAmount * 0.05).toFixed(2)}</strong>
              </div>
            </div>
          </Tilt3D>
        </div>
      </motion.section>

      {/* 14. VERIFICATION PROCESS — 3D Soft Cards */}
      <section style={{ padding: '9rem 3rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Heritage Auditing</span>
            <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-playfair), Georgia, serif', marginTop: '0.8rem', fontWeight: 300 }}>On-Site Inspection Guidelines</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {[
              { icon: Icons.Shield, title: "Lineage Audit", body: "Artisans present family records, traditional tools, and apprentice records to document the heritage of the workshop." },
              { icon: Icons.Compass, title: "Material Audit", body: "Board inspects organic pigments, raw clays, or heritage cottons to guarantee zero synthetic chemical substitutions." },
              { icon: Icons.Lock, title: "Ledger Stamp", body: "Every approved item receives its individual serial hash, securing absolute digital representation for buyers." },
            ].map((step) => {
              const StepIcon = step.icon;
              return (
                <Tilt3D key={step.title}>
                  <div style={{ padding: '3rem', border: '1px solid var(--glass-border)', borderRadius: '18px', backgroundColor: 'var(--background)', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '1.2rem' }}><StepIcon size={32} /></div>
                    <h4 style={{ fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--text)' }}>{step.title}</h4>
                    <p style={{ fontSize: '0.88rem', opacity: 0.75, lineHeight: 1.7, margin: 0 }}>{step.body}</p>
                  </div>
                </Tilt3D>
              );
            })}
          </div>
        </div>
      </section>

      {/* 15. CALL TO ACTION (HIGH IMPACT OBSIDIAN FINALE) */}
      <section 
        style={{ 
          padding: '11rem 3rem', 
          backgroundColor: '#0A0A0C',
          color: '#FAF9F6', 
          textAlign: 'center', 
          position: 'relative', 
          overflow: 'hidden', 
          borderTop: '1px solid rgba(212,175,55,0.4)' 
        }}
      >
        <img 
          src="https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=1600" 
          alt="Artisan Kiln Background" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, pointerEvents: 'none' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,12,0.85) 0%, rgba(10,10,12,0.95) 100%)', pointerEvents: 'none' }} />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }} />
        <div className="glow-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', opacity: 0.35 }} />
        
        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '1.5rem' }}>Registry Curation</span>
          <h2 style={{ fontSize: '3.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', color: 'var(--accent)', marginBottom: '2rem', fontWeight: 300, lineHeight: 1.2 }}>Custodian of Generational Craft?</h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.85, marginBottom: '4rem', lineHeight: 1.8 }}>
            We invite master artisans to apply for registry curation. Focus entirely on your heritage craftsmanship; we will manage international secure logistics, digital cataloging, and direct escrow payouts.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/become-a-maker" className="btn-accent" style={{ textDecoration: 'none', padding: '1.2rem 3rem', borderRadius: '8px', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              Apply for Curation &rarr;
            </Link>
            <Link href="/docs/DASHBOARD_TESTING_GUIDE.md" style={{ textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#FAF9F6', padding: '1.2rem 3rem', borderRadius: '8px', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500 }}>
              Inspection Standards
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
