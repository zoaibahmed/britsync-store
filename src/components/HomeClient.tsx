"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, useInView, animate } from 'framer-motion';
import { calculateSellingPrice } from '@/lib/pricing';
import ProductCard from './ProductCard';
import { Icons } from './Icons';
import LuxuryHero from './LuxuryHero';
import CategoryGalleryJourney from './CategoryGalleryJourney';
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
            backgroundColor: `rgba(212,175,55,${glare.opacity * 0.4})`,
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

      {/* 1B. EXPLORE CRAFT DISCIPLINES (RICH CATEGORY SHOWCASE VIA SCROLL-SCRUBBED VIDEOS) */}
      <CategoryGalleryJourney />

      {/* 2. TRUSTED BY — Safeguarded in Collaboration With */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
        style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'var(--surface)' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ width: '24px', height: '1px', backgroundColor: 'var(--accent)' }} />
            <span style={{ fontSize: '0.68rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
              OFFICIAL HERITAGE & VERIFICATION ALLIANCES
            </span>
            <span style={{ width: '24px', height: '1px', backgroundColor: 'var(--accent)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 300, color: 'var(--text)', marginBottom: '2.5rem' }}>
            Safeguarded in Collaboration With
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.8rem' }}>
            {[
              { title: "ROYAL HERITAGE COMMISSION", icon: "🏛️", desc: "Crown-mandated cultural preservation board" },
              { title: "GLOBAL CRAFT ADVOCACY", icon: "🌐", desc: "International artisan rights & fair compensation" },
              { title: "WORLD APPELLATIONS LEAGUE", icon: "⚖️", desc: "Geographic Indication (GI) legal enforcement" },
              { title: "ATELIER AUDITING ALLIANCE", icon: "📜", desc: "Independent physical workshop verification" }
            ].map((partner) => (
              <motion.div
                key={partner.title}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '1.8rem 1.5rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--glass-border)',
                  borderTop: '3px solid var(--accent)',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>{partner.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '0.95rem',
                  letterSpacing: '2px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  {partner.title}
                </h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.75, margin: 0, lineHeight: 1.5, color: 'var(--text-muted)' }}>
                  {partner.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 3. GUARDIANS OF THE LEGACY */}
      <GuardiansOfLegacy />

      {/* 4. INTERACTIVE PASSPORT DEMO WITH HOLOGRAPHIC SCORE GAUGE */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
        style={{ 
          padding: '10rem 3rem', 
          backgroundColor: '#0A0A0C',
          color: '#FAF9F6',
          borderTop: '1px solid rgba(212,175,55,0.3)', 
          borderBottom: '1px solid rgba(212,175,55,0.3)', 
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            backgroundImage: 'url("https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1600")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
            pointerEvents: 'none'
          }} 
        />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '5.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1.2rem', borderRadius: '20px', backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
              <span className="glow-dot" /> CRYPTOGRAPHIC HERITAGE PASSPORT
            </div>
            <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-playfair), Georgia, serif', marginTop: '0.5rem', fontWeight: 300, color: '#FAF9F6' }}>Provenance Passport Viewer</h2>
            <p style={{ opacity: 0.8, maxWidth: '640px', margin: '1.2rem auto 0', fontSize: '0.98rem', lineHeight: 1.8 }}>
              Every masterpiece on Britsync is issued an unalterable digital passport detailing its GPS geofenced studio, material purity test, and cryptographic ledger block.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '4.5rem', alignItems: 'center' }}>
            {/* Tabs Controller */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              {[
                { id: 'origin', icon: Icons.MapPin, title: 'Atelier Geographic Origin', desc: 'Inspect GPS geofenced coordinates confirming the exact building where weaving, firing, or carving took place.' },
                { id: 'audit', icon: Icons.Verified, title: 'Audit Logs & Signatures', desc: 'Review the manual inspection check-ins, local materials audit, and regional craft association verification stamps.' },
                { id: 'ledger', icon: Icons.Lock, title: 'Cryptographic Ledger', desc: 'Verify hashes indicating an unalterable timestamp validation on the decentralised provenance registry.' },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isSelected = passportTab === tab.id;
                return (
                  <motion.div 
                    key={tab.id}
                    onClick={() => setPassportTab(tab.id as any)}
                    whileHover={{ x: 6, scale: 1.01 }}
                    style={{ 
                      padding: '2.2rem 2.4rem', 
                      borderRadius: '20px',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid rgba(212, 175, 55, 0.18)', 
                      backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(10, 11, 15, 0.75)', 
                      color: '#FAF9F6',
                      backdropFilter: 'blur(20px)',
                      cursor: 'pointer', 
                      transition: 'all 0.35 ease',
                      boxShadow: isSelected ? '0 15px 35px rgba(212,175,55,0.18)' : '0 8px 25px rgba(0,0,0,0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: 'var(--accent)' }} />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <h3 style={{ fontSize: '1.05rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: isSelected ? 'var(--accent)' : '#FAF9F6', margin: 0, fontWeight: 500 }}>
                        <IconComp size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle', color: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.6)' }} /> {tab.title}
                      </h3>
                      {isSelected && (
                        <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--accent)', color: '#0A0A0C', padding: '0.2rem 0.6rem', borderRadius: '10px', fontWeight: 700, letterSpacing: '1px' }}>ACTIVE</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.88rem', opacity: 0.78, lineHeight: 1.65, margin: 0, paddingLeft: '28px' }}>{tab.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Passport Screen Card with 3D Tilt */}
            <Tilt3D>
              <div 
                style={{ 
                  border: '1px solid rgba(212, 175, 55, 0.4)', 
                  backgroundColor: '#0A0B0F', 
                  padding: '3.8rem 3.2rem', 
                  borderRadius: '24px',
                  position: 'relative', 
                  minHeight: '460px', 
                  boxShadow: '0 30px 70px rgba(0,0,0,0.7)',
                  color: '#FAF9F6'
                }}
              >
                {/* Gold metallic header band */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', backgroundColor: '#D4AF37', borderRadius: '24px 24px 0 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.4rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} /> AUTHENTICITY GUARANTEED
                    </span>
                    <div style={{ fontSize: '0.85rem', opacity: 0.85, fontFamily: 'monospace', marginTop: '0.3rem', color: 'rgba(250,249,246,0.7)' }}>ATELIER PASSPORT #BR-2026-94829</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'rgba(212,175,55,0.12)', padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.4)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>★</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '1px' }}>PROVENANCE SCORE: 98/100</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {passportTab === 'origin' && (
                    <motion.div
                      key="origin"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.9rem', fontWeight: 300, color: '#FAF9F6', margin: 0 }}>High Atlas Loom Workshop</h4>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--accent)', backgroundColor: 'rgba(212,175,55,0.08)', padding: '0.3rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.2)' }}>MAR-ATL-802</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.88rem' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.025)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ opacity: 0.5, display: 'block', marginBottom: '0.4rem', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>COUNTRY & NATION</span>
                          <strong style={{ color: '#FAF9F6', fontSize: '1.05rem', fontWeight: 400 }}>Morocco 🇲🇦</strong>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.025)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ opacity: 0.5, display: 'block', marginBottom: '0.4rem', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>VALLEY REGION</span>
                          <strong style={{ color: '#FAF9F6', fontSize: '1.05rem', fontWeight: 400 }}>Aït Bouguemez Valley</strong>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.025)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ opacity: 0.5, display: 'block', marginBottom: '0.4rem', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>GPS STAMP</span>
                          <strong style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.95rem' }}>31.7917° N, 7.0926° W</strong>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.025)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ opacity: 0.5, display: 'block', marginBottom: '0.4rem', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>ALTITUDE GAUGE</span>
                          <strong style={{ color: '#FAF9F6', fontSize: '1.05rem', fontWeight: 400 }}>1,850m Above Sea Level</strong>
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
                      transition={{ duration: 0.35 }}
                    >
                      <h4 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.9rem', fontWeight: 300, marginBottom: '2rem', color: '#FAF9F6' }}>Inspection & Sourcing Chain</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.06)', padding: '1rem 1.4rem', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                          <span style={{ color: 'var(--accent)' }}><Icons.Verified size={20} /></span>
                          <span>Material Sourcing: 100% locally sheared organic sheep wool. Zero synthetic blend.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.06)', padding: '1rem 1.4rem', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                          <span style={{ color: 'var(--accent)' }}><Icons.Verified size={20} /></span>
                          <span>Craft Heritage: Certified hand-loom technique by Moroccan Crafts Guild.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.06)', padding: '1rem 1.4rem', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                          <span style={{ color: 'var(--accent)' }}><Icons.Verified size={20} /></span>
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
                      transition={{ duration: 0.35 }}
                    >
                      <h4 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.9rem', fontWeight: 300, marginBottom: '2rem', color: '#FAF9F6' }}>Immutable Origin Hashes</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontFamily: 'monospace', fontSize: '0.85rem', opacity: 0.95 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem 1.2rem', borderRadius: '8px' }}>
                          <span style={{ opacity: 0.6 }}>GENESIS BLOCK #48928</span>
                          <span style={{ color: 'var(--accent)' }}>0x7D3A...99E1</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem 1.2rem', borderRadius: '8px' }}>
                          <span style={{ opacity: 0.6 }}>GPS GEOFENCE STAMP</span>
                          <span style={{ color: 'var(--accent)' }}>0x5B8C...10C4</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem 1.2rem', borderRadius: '8px' }}>
                          <span style={{ opacity: 0.6 }}>MATERIAL AUDIT STAMP</span>
                          <span style={{ color: 'var(--accent)' }}>0xF2A1...C8E7</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem 1.2rem', borderRadius: '8px' }}>
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

      {/* 5. HOW BRITSYNC SAFEGUARDS ORIGIN (INTERACTIVE PROVENANCE STORYTELLING) */}
      <SafeguardsOriginExperience />

      {/* 6. MAKER STORIES (JOURNAL — Artisan Chronicles & Biographies) */}
      <section style={{ padding: '9rem 3rem', backgroundColor: 'var(--background)', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
              HERITAGE JOURNAL & FIELD BIOGRAPHIES
            </span>
            <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: 'var(--text)' }}>
              Artisan Chronicles & Biographies
            </h2>
            <p style={{ maxWidth: '620px', margin: '1rem auto 0', fontSize: '0.95rem', opacity: 0.75, lineHeight: 1.8, color: 'var(--text-muted)' }}>
              Documenting the lives, organic raw materials, and oral traditions of master artisans across protected mountain valleys and historic guilds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
            <Tilt3D>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', padding: '3rem 2.6rem', borderRadius: '20px', borderLeft: '4px solid var(--accent)', boxShadow: 'var(--shadow-md)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Volume I &mdash; High Atlas, Morocco</span>
                  <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: '1rem 0 1.2rem', color: 'var(--text)' }}>Fatima: Rescuing High Atlas Kilims</h3>
                  <p style={{ fontSize: '0.92rem', opacity: 0.82, lineHeight: 1.8, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Fatima expanded her mountaintop weaving loom cooperative to safeguard 200-year-old geometric Berber lineage patterns, directly empowering 24 local women weavers.
                  </p>
                </div>
                <Link href="/stories/fatima-atlas-kilims" style={{ textDecoration: 'none', color: 'var(--accent)', fontSize: '0.78rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  Read Full Biography &rarr;
                </Link>
              </div>
            </Tilt3D>

            <Tilt3D>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', padding: '3rem 2.6rem', borderRadius: '20px', borderLeft: '4px solid var(--accent)', boxShadow: 'var(--shadow-md)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Volume II &mdash; Sindh Valley, Pakistan</span>
                  <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: '1rem 0 1.2rem', color: 'var(--text)' }}>Aisha: The 21 Steps of Organic Dyeing</h3>
                  <p style={{ fontSize: '0.92rem', opacity: 0.82, lineHeight: 1.8, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Detailing the ancient chemistry of river clay, fermented indigo pits, mustard oil, and pomegranate skins required to produce authentic Indus Ajrak blockprints.
                  </p>
                </div>
                <Link href="/stories/aisha-sindh-ajrak" style={{ textDecoration: 'none', color: 'var(--accent)', fontSize: '0.78rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  Read Full Biography &rarr;
                </Link>
              </div>
            </Tilt3D>

            <Tilt3D>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', padding: '3rem 2.6rem', borderRadius: '20px', borderLeft: '4px solid var(--accent)', boxShadow: 'var(--shadow-md)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Volume III &mdash; Anatolia, Turkey</span>
                  <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: '1rem 0 1.2rem', color: 'var(--text)' }}>Zeynep: Quartz Frit & Pine Kiln Fires</h3>
                  <p style={{ fontSize: '0.92rem', opacity: 0.82, lineHeight: 1.8, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Recreating 16th-century Ottoman Iznik ceramic formulas containing 85%+ quartz silica, fired in traditional pine wood kilns to achieve crystal-clear radiance.
                  </p>
                </div>
                <Link href="/stories/zeynep-iznik-ceramics" style={{ textDecoration: 'none', color: 'var(--accent)', fontSize: '0.78rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  Read Full Biography &rarr;
                </Link>
              </div>
            </Tilt3D>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER TESTIMONIALS (Letters of Patronage) */}
      <section style={{ padding: '9rem 3rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
              VOICES OF DISTINGUISHED CUSTODIANS
            </span>
            <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: 'var(--text)' }}>
              Letters of Patronage
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {[
              { text: "The Ajrak Shawl is an absolute masterpiece. Having the exact GPS coordinates of Aisha's studio and viewing the inspector's signatures on the cryptographic passport makes me feel like a true custodian of Sindh history.", author: "Lady Eleanor P. from London", rating: "★★★★★" },
              { text: "The Iznik Ceramic Vessel is breathtaking. The quartz glaze radiance is museum-grade. The digital passport gives me complete trust that I am holding a genuine, legally protected piece of Ottoman history.", author: "Hans M. from Munich", rating: "★★★★★" },
              { text: "Acquiring the hand-spun alpaca throw has redefined our estate. Knowing the exact weaver cooperative in Peru and reading Fatima's biography created a deep, lasting connection to the work.", author: "Camille & Jean L. from Paris", rating: "★★★★★" }
            ].map((t, idx) => (
              <Tilt3D key={idx}>
                <div style={{ padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '18px', borderTop: '4px solid var(--accent)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--background)', boxShadow: 'var(--shadow-md)', height: '100%' }}>
                  <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontStyle: 'italic', fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.75, marginBottom: '2rem', color: 'var(--text)' }}>&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <div style={{ color: 'var(--accent)', marginBottom: '0.6rem', fontSize: '0.9rem', letterSpacing: '2px' }}>{t.rating}</div>
                    <strong style={{ fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text)', fontFamily: 'var(--font-playfair), serif', fontWeight: 600 }}>{t.author}</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--accent)', marginTop: '0.35rem', fontWeight: 600 }}>
                      ✓ Verified Patron & Cryptographic Passport Holder
                    </span>
                  </div>
                </div>
              </Tilt3D>
            ))}
          </div>
        </div>
      </section>



      {/* 10. MARKETPLACE STATISTICS (SHIFTED TO 3RD LAST POSITION!) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
        style={{ 
          padding: '8rem 3rem', 
          backgroundColor: '#0A0A0C',
          color: '#FAF9F6', 
          position: 'relative', 
          overflow: 'hidden',
          borderTop: '1px solid rgba(212,175,55,0.3)',
          borderBottom: '1px solid rgba(212,175,55,0.3)'
        }}
      >
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            backgroundImage: 'url("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            pointerEvents: 'none'
          }} 
        />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.72rem', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              GLOBAL NETWORK METRICS
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '2.5rem', fontWeight: 300, color: '#FAF9F6' }}>
              Authenticated Heritage Impact
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
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
                    backgroundColor: 'rgba(10,10,12,0.85)', 
                    padding: '2.4rem 2rem', 
                    borderRadius: '16px', 
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    height: '100%',
                  }}
                >
                  <h3 style={{ fontSize: '3.2rem', fontWeight: 300, color: 'var(--accent)', marginBottom: '0.4rem', margin: 0 }}>
                    <PremiumCounter value={stat.val} suffix={stat.suffix} />
                  </h3>
                  <span style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 600, color: '#FAF9F6' }}>
                    {stat.label}
                  </span>
                </div>
              </Tilt3D>
            ))}
          </div>
        </div>
      </motion.section>



      {/* 12. CALL TO ACTION (Registry Curation — Custodian of Generational Craft?) */}
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
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, pointerEvents: 'none' }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,10,12,0.88)', pointerEvents: 'none' }} />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '1.5rem' }}>
            REGISTRY CURATION & GUILD ONBOARDING
          </span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontFamily: 'var(--font-playfair), Georgia, serif', color: 'var(--accent)', marginBottom: '2rem', fontWeight: 300, lineHeight: 1.2 }}>
            Custodian of Generational Craft?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.88, marginBottom: '4rem', lineHeight: 1.85, color: 'rgba(250,249,246,0.88)' }}>
            We invite master artisans and historic guilds to apply for registry curation. Protect your regional appellation while accessing international patrons with automated escrow payouts and global logistics support.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/become-a-maker" className="btn-accent" style={{ textDecoration: 'none', padding: '1.25rem 3.2rem', borderRadius: '8px', fontSize: '0.82rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, backgroundColor: 'var(--accent)', color: '#000000', boxShadow: '0 10px 30px rgba(212,175,55,0.3)' }}>
              Apply for Curation &rarr;
            </Link>
            <Link href="/how-we-earn" style={{ textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.3)', color: '#FAF9F6', padding: '1.25rem 3.2rem', borderRadius: '8px', fontSize: '0.82rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600 }}>
              Inspection Standards Guide
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
