'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface MakerItem {
  id: string;
  businessName: string;
  founderName: string;
  country: string;
  verificationStatus: string;
  yearsInBusiness: number;
  productCount: number;
  shortIntro: string;
  heroImage: string;
  logo: string;
}

interface CategoryClientProps {
  categoryName: string;
  initialSearch: string;
  initialMakers: MakerItem[];
}

const CATEGORY_DISCIPLINES = [
  { slug: 'Ceramics', label: 'Ceramics', icon: '🏺' },
  { slug: 'Textiles', label: 'Textiles', icon: '🧵' },
  { slug: 'Jewelry', label: 'Jewellery', icon: '💎' },
  { slug: 'Leather', label: 'Leather', icon: '👜' },
  { slug: 'Metal Craft', label: 'Metal Craft', icon: '🗡️' },
  { slug: 'Home Decor', label: 'Living Spaces', icon: '🏛️' },
];

export default function CategoryClient({
  categoryName,
  initialSearch,
  initialMakers,
}: CategoryClientProps) {
  const [filterInput, setFilterInput] = useState(initialSearch);
  const [activeTier, setActiveTier] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'ateliers' | 'works'>('ateliers');
  const [activeDiscipline, setActiveDiscipline] = useState<string>(categoryName);

  // Update URL search query in browser history
  useEffect(() => {
    const url = new URL(window.location.href);
    if (filterInput.trim()) {
      url.searchParams.set('search', filterInput.trim());
    } else {
      url.searchParams.delete('search');
      url.searchParams.delete('maker');
    }
    window.history.replaceState(null, '', url.pathname + url.search);
  }, [filterInput]);

  // Live filtering
  const filteredMakers = useMemo(() => {
    return initialMakers.filter((m) => {
      // Tier filter
      if (activeTier !== 'ALL' && m.verificationStatus !== activeTier) return false;

      // Text search query
      const q = filterInput.trim().toLowerCase();
      if (!q) return true;

      const bizName = (m.businessName || '').toLowerCase();
      const founderName = (m.founderName || '').toLowerCase();
      const country = (m.country || '').toLowerCase();
      const intro = (m.shortIntro || '').toLowerCase();
      return (
        bizName.includes(q) ||
        founderName.includes(q) ||
        country.includes(q) ||
        intro.includes(q)
      );
    });
  }, [initialMakers, filterInput, activeTier]);

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'ELITE':
        return {
          text: '⭐ ATELIER ELITE MASTER',
          bg: 'rgba(212, 175, 55, 0.15)',
          color: 'var(--accent)',
          border: '1px solid var(--accent)',
        };
      case 'GI':
        return {
          text: '🏛️ PROTECTED APPELLATION',
          bg: 'rgba(15, 36, 32, 0.12)',
          color: 'var(--accent)',
          border: '1px solid var(--accent)',
        };
      default:
        return {
          text: '✓ SIGNATURE MAKER',
          bg: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--glass-border)',
        };
    }
  };

  return (
    <main
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--text)',
        minHeight: '100vh',
        paddingBottom: '8rem',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}
    >
      {/* High-Fashion Editorial Hero */}
      <section
        style={{
          padding: '9.5rem 2rem 5rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--glass-border)',
          position: 'relative',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Breadcrumb Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '0.75rem',
              opacity: 0.7,
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 500,
            }}
          >
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              HOME
            </Link>
            <span>/</span>
            <Link href="/collections" style={{ color: 'inherit', textDecoration: 'none' }}>
              COLLECTIONS
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {activeDiscipline.toUpperCase()}
            </span>
          </div>

          {/* Discipline Selector Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.8rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
            }}
          >
            {CATEGORY_DISCIPLINES.map((disc) => {
              const isActive = activeDiscipline.toLowerCase() === disc.slug.toLowerCase();
              return (
                <Link
                  key={disc.slug}
                  href={`/categories/${encodeURIComponent(disc.slug)}`}
                  onClick={() => setActiveDiscipline(disc.slug)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1.2rem',
                    backgroundColor: isActive ? 'var(--accent)' : 'var(--background)',
                    color: isActive ? '#0A0A0C' : 'var(--text)',
                    border: isActive ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    fontSize: '0.72rem',
                    letterSpacing: '1.5px',
                    fontWeight: isActive ? 800 : 500,
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span>{disc.icon}</span>
                  <span>{disc.label}</span>
                </Link>
              );
            })}
          </div>

          <span
            style={{
              fontSize: '0.7rem',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontWeight: 700,
              display: 'block',
              marginBottom: '0.8rem',
            }}
          >
            GLOBAL HERITAGE GUILD REGISTRY
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
              fontWeight: 300,
              color: 'var(--text)',
              marginBottom: '1.4rem',
              letterSpacing: '-0.01em',
              lineHeight: 1.05,
            }}
          >
            Masterwork <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{activeDiscipline}</em> Ateliers
          </h1>

          <p
            style={{
              fontSize: '1.08rem',
              lineHeight: 1.85,
              opacity: 0.85,
              maxWidth: '740px',
              margin: '0 auto 3rem',
              fontWeight: 300,
            }}
          >
            Verified generational craftsmen and historical ateliers specializing in{' '}
            <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>{activeDiscipline}</strong>. Every workshop is GPS-audited on-site with 95% direct patron escrow payouts.
          </p>

          {/* Floating Key Metrics Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              maxWidth: '850px',
              margin: '0 auto 3rem',
              padding: '1.5rem',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700, display: 'block' }}>
                Active Ateliers
              </span>
              <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.8rem', color: 'var(--accent)', fontWeight: 400 }}>
                {filteredMakers.length} Guilds
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700, display: 'block' }}>
                Direct Escrow Payout
              </span>
              <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.8rem', color: 'var(--text)', fontWeight: 400 }}>
                95% to Artisan
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700, display: 'block' }}>
                Provenance Security
              </span>
              <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.8rem', color: 'var(--accent)', fontWeight: 400 }}>
                GPS & Passport
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              display: 'flex',
              gap: '0.8rem',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--glass-border)',
                padding: '0.5rem 0.5rem 0.5rem 1.2rem',
              }}
            >
              <span style={{ marginRight: '0.6rem', opacity: 0.5 }}>🔍</span>
              <input
                type="text"
                placeholder={`Search ${activeDiscipline} ateliers, artisan names, or countries...`}
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  flex: 1,
                  outline: 'none',
                }}
              />
              {filterInput && (
                <button
                  onClick={() => setFilterInput('')}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '0.8rem',
                    opacity: 0.6,
                    cursor: 'pointer',
                    paddingRight: '0.8rem',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '1350px', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Filter Controls Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {/* Verification Tier Tabs */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Tiers' },
              { id: 'ELITE', label: '⭐ Atelier Elite' },
              { id: 'GI', label: '🏛️ Protected GI' },
              { id: 'GENERAL', label: '✓ Signature Guild' },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => setActiveTier(tier.id)}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.7rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: activeTier === tier.id ? 700 : 500,
                  border: '1px solid var(--glass-border)',
                  backgroundColor: activeTier === tier.id ? 'var(--accent)' : 'transparent',
                  color: activeTier === tier.id ? '#0A0A0C' : 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tier.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.78rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 600 }}>
              SHOWING {filteredMakers.length} ATELIERS
            </span>
          </div>
        </div>

        {/* Atelier Cards Grid */}
        {filteredMakers.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {filteredMakers.map((maker) => {
              const badge = getVerificationBadge(maker.verificationStatus);
              return (
                <motion.div
                  key={maker.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -6 }}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {/* Hero Cover Image */}
                  <div style={{ position: 'relative', height: '240px', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
                    <img
                      src={maker.heroImage}
                      alt={maker.businessName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease',
                      }}
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} />

                    {/* Verification Status Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: badge.border,
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        letterSpacing: '1.5px',
                        padding: '0.4rem 0.8rem',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {badge.text}
                    </div>

                    {/* Country Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '1rem',
                        backgroundColor: 'rgba(10,10,12,0.85)',
                        color: '#D4AF37',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        padding: '0.35rem 0.75rem',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      📍 {maker.country}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                        {maker.logo && (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--accent)', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={maker.logo} alt={maker.founderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div>
                          <h2
                            style={{
                              fontFamily: 'var(--font-playfair), Georgia, serif',
                              fontSize: '1.5rem',
                              fontWeight: 400,
                              color: 'var(--text)',
                              margin: 0,
                              lineHeight: 1.2,
                            }}
                          >
                            {maker.businessName}
                          </h2>
                          {maker.founderName && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, margin: 0 }}>
                              Custodian: {maker.founderName}
                            </p>
                          )}
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: '0.88rem',
                          lineHeight: 1.75,
                          opacity: 0.8,
                          marginBottom: '1.5rem',
                          fontWeight: 300,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {maker.shortIntro || `Generational master atelier located in ${maker.country}, specializing in authentic ${activeDiscipline} heritage craft.`}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.75rem', opacity: 0.7 }}>
                        <span>{maker.productCount || 12} Works</span>
                        <span>•</span>
                        <span>{maker.yearsInBusiness || 15} Yrs Heritage</span>
                      </div>

                      <Link
                        href={`/makers/${maker.id}`}
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: '#0A0A0C',
                          padding: '0.65rem 1.3rem',
                          fontSize: '0.7rem',
                          letterSpacing: '1.5px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Explore Atelier →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              padding: '5rem 2rem',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.8rem', marginBottom: '1rem' }}>
              No Ateliers Match Your Filter
            </h3>
            <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.9rem' }}>
              We could not find any verified master makers matching your selected criteria in {activeDiscipline}.
            </p>
            <button
              onClick={() => { setFilterInput(''); setActiveTier('ALL'); }}
              style={{
                backgroundColor: 'var(--accent)',
                color: '#0A0A0C',
                border: 'none',
                padding: '0.75rem 1.8rem',
                fontSize: '0.75rem',
                letterSpacing: '2px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
