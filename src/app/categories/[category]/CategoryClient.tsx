'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

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

export default function CategoryClient({
  categoryName,
  initialSearch,
  initialMakers,
}: CategoryClientProps) {
  const [filterInput, setFilterInput] = useState(initialSearch);

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
    const q = filterInput.trim().toLowerCase();
    if (!q) return initialMakers;
    return initialMakers.filter((m) => {
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
  }, [initialMakers, filterInput]);

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
      {/* Luxury Editorial Hero */}
      <section
        style={{
          padding: '10rem 2rem 5rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--glass-border)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Breadcrumb Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '0.78rem',
              opacity: 0.7,
              marginBottom: '1.8rem',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 500
            }}
          >
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              HOME
            </Link>
            <span>/</span>
            <Link
              href="/collections"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              COLLECTIONS
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {categoryName.toUpperCase()}
            </span>
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
            HERITAGE GUILD REGISTRY
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              fontWeight: 400,
              color: 'var(--text)',
              marginBottom: '1.2rem',
              letterSpacing: '1px',
              lineHeight: 1.1,
            }}
          >
            {categoryName} Ateliers & Master Makers
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              opacity: 0.8,
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
              fontWeight: 300,
            }}
          >
            Authentic, verified master craftsmen and historical ateliers specializing in{' '}
            <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>{categoryName}</strong>. Every workshop is GPS-audited with cryptographic provenance passports.
          </p>

          {/* Search & Filter Input */}
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              display: 'flex',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              padding: '0.4rem 0.4rem 0.4rem 1.2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <input
              type="text"
              placeholder={`Search ${categoryName} ateliers, artisan names, or countries...`}
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
                  paddingRight: '1rem',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Atelier Cards Grid */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '1.2rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 600 }}>
            SHOWING {filteredMakers.length} VERIFIED ATELIERS
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase' }}>
            95% DIRECT TO ARTISAN ESCROW
          </span>
        </div>

        {filteredMakers.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {filteredMakers.map((maker) => {
              const badge = getVerificationBadge(maker.verificationStatus);
              return (
                <div
                  key={maker.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {/* Hero Cover Image */}
                  <div style={{ position: 'relative', height: '230px', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
                    <img
                      src={maker.heroImage}
                      alt={maker.businessName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)' }} />

                    {/* Verification Status Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: badge.border,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        padding: '0.4rem 0.8rem',
                        textTransform: 'uppercase',
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
                      }}
                    >
                      📍 {maker.country}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h2
                        style={{
                          fontFamily: 'var(--font-playfair), Georgia, serif',
                          fontSize: '1.5rem',
                          fontWeight: 400,
                          color: 'var(--text)',
                          marginBottom: '0.4rem',
                        }}
                      >
                        {maker.businessName}
                      </h2>

                      {maker.founderName && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>
                          Master Artisan: {maker.founderName}
                        </p>
                      )}

                      <p
                        style={{
                          fontSize: '0.88rem',
                          lineHeight: 1.7,
                          opacity: 0.8,
                          marginBottom: '1.5rem',
                          fontWeight: 300,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {maker.shortIntro || `Generational master atelier located in ${maker.country}, specializing in authentic ${categoryName} heritage craft.`}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.75rem', opacity: 0.7 }}>
                        <span>{maker.productCount || 12} Masterworks</span>
                        <span>•</span>
                        <span>{maker.yearsInBusiness || 15} Yrs Heritage</span>
                      </div>

                      <Link
                        href={`/makers/${maker.id}`}
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: '#0A0A0C',
                          padding: '0.6rem 1.2rem',
                          fontSize: '0.7rem',
                          letterSpacing: '1.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        View Atelier
                      </Link>
                    </div>
                  </div>
                </div>
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
              No Ateliers Match "{filterInput}"
            </h3>
            <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.9rem' }}>
              We could not find any verified master makers matching your search query in {categoryName}.
            </p>
            <button
              onClick={() => setFilterInput('')}
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
              Reset Search Filter
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
