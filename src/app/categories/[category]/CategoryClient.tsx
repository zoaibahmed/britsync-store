'use client';

import React from 'react';
import Link from 'next/link';

export interface AtelierStudioItem {
  id: string;
  businessName: string;
  founderName: string;
  country: string;
  city?: string;
  verificationStatus: string;
  yearsInBusiness: number;
  registeredWorksCount: number;
  specialty?: string;
  shortIntro: string;
  heroImage: string;
  logo: string;
}

interface CategoryClientProps {
  disciplineTitle: string;
  tagline: string;
  description: string;
  studios: AtelierStudioItem[];
}

const DISCIPLINES = [
  { slug: 'Metal Craft', label: 'Metal Craft' },
  { slug: 'Ceramics', label: 'Ceramics' },
  { slug: 'Jewelry', label: 'Jewellery' },
  { slug: 'Textiles', label: 'Textiles' },
  { slug: 'Leather', label: 'Leather' },
  { slug: 'Home Decor', label: 'Living Spaces' },
];

export default function CategoryClient({
  disciplineTitle,
  tagline,
  description,
  studios,
}: CategoryClientProps) {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'ELITE':
        return {
          label: 'Atelier Elite Master',
          bg: 'var(--surface-muted)',
          color: 'var(--accent)',
          border: '1px solid var(--accent)',
        };
      case 'GI':
        return {
          label: 'Protected Appellation (GI)',
          bg: 'var(--surface-muted)',
          color: 'var(--accent)',
          border: '1px solid var(--accent)',
        };
      default:
        return {
          label: 'Certified Heritage Studio',
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
      }}
    >
      {/* ── SINGLE CLEAN DISCIPLINE BAR (NO DOUBLE BARS, NO CLUTTER) ── */}
      <nav
        aria-label="Craft Disciplines"
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--glass-border)',
          position: 'sticky',
          top: '72px',
          zIndex: 40,
          padding: '0.6rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
            {DISCIPLINES.map((disc) => {
              const isActive =
                disc.slug.toLowerCase() === disciplineTitle.toLowerCase() ||
                (disc.slug === 'Home Decor' && disciplineTitle === 'Living Spaces') ||
                (disc.slug === 'Jewelry' && disciplineTitle === 'Jewellery');

              return (
                <Link
                  key={disc.slug}
                  href={`/categories/${encodeURIComponent(disc.slug)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.72rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'var(--secondary)' : 'var(--text)',
                    border: isActive
                      ? '1px solid var(--primary)'
                      : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {disc.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/collections"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 600,
              flexShrink: 0,
              padding: '0.45rem 1rem',
              border: '1px solid var(--glass-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>3D Studio Flythrough</span>
            <span>→</span>
          </Link>
        </div>
      </nav>

      {/* ── SPACIOUS LUXURY EDITORIAL HERO ── */}
      <section
        style={{
          padding: '5.5rem 2rem 4.5rem',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          {/* Subtle Provenance Breadcrumb */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.72rem',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              opacity: 0.6,
              marginBottom: '1.8rem',
            }}
          >
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/collections" style={{ color: 'inherit', textDecoration: 'none' }}>
              Ateliers
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {disciplineTitle}
            </span>
          </div>

          {/* Mastercraft Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(2.8rem, 6vw, 4.6rem)',
              fontWeight: 300,
              lineHeight: 1.08,
              margin: '0 0 1.2rem 0',
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            Certified <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{disciplineTitle}</em> Ateliers
          </h1>

          {/* Subtitle / Tagline */}
          <p
            style={{
              fontSize: '1.18rem',
              color: 'var(--text)',
              lineHeight: 1.6,
              margin: '0 auto 1.4rem',
              fontWeight: 400,
              maxWidth: '750px',
              opacity: 0.9,
            }}
          >
            {tagline}
          </p>

          {/* Quiet Narrative */}
          <p
            style={{
              fontSize: '0.96rem',
              lineHeight: 1.85,
              opacity: 0.72,
              margin: '0 auto',
              maxWidth: '700px',
              fontWeight: 300,
            }}
          >
            {description}
          </p>
        </div>
      </section>

      {/* ── ATELIERS & STUDIOS DIRECTORY GRID ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem 0' }}>
        {/* Count Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '1.2rem',
            marginBottom: '3rem',
          }}
        >
          <div
            style={{
              fontSize: '0.74rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 600,
              opacity: 0.7,
            }}
          >
            Showing {studios.length} Certified Master Studios
          </div>

          <div
            style={{
              fontSize: '0.7rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            Provenance Audited • Direct Artisan Escrow
          </div>
        </div>

        {/* Studio Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {studios.map((studio) => {
            const badge = getBadgeStyle(studio.verificationStatus);
            return (
              <article
                key={studio.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.25s ease, transform 0.25s ease',
                }}
              >
                {/* Studio Hero Image Container */}
                <div
                  style={{
                    position: 'relative',
                    height: '270px',
                    backgroundColor: 'var(--background)',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={studio.heroImage}
                    alt={studio.businessName}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />

                  {/* Verification Status Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.2rem',
                      left: '1.2rem',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: badge.border,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '1.8px',
                      padding: '0.4rem 0.85rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {badge.label}
                  </div>

                  {/* Location Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '1.2rem',
                      left: '1.2rem',
                      backgroundColor: 'var(--primary)',
                      color: 'var(--secondary)',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      letterSpacing: '1.2px',
                      padding: '0.35rem 0.8rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    📍 {studio.city ? `${studio.city}, ${studio.country}` : studio.country}
                  </div>
                </div>

                {/* Studio Details Content */}
                <div
                  style={{
                    padding: '2.2rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header with Logo and Studio Name */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.2rem',
                      }}
                    >
                      {studio.logo && (
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            border: '1px solid var(--accent)',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={studio.logo}
                            alt={studio.founderName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div>
                        <h2
                          style={{
                            fontFamily: 'var(--font-playfair), Georgia, serif',
                            fontSize: '1.5rem',
                            fontWeight: 400,
                            margin: 0,
                            lineHeight: 1.2,
                            color: 'var(--text)',
                          }}
                        >
                          {studio.businessName}
                        </h2>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            color: 'var(--accent)',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            display: 'block',
                            marginTop: '0.2rem',
                          }}
                        >
                          Master Custodian: {studio.founderName}
                        </span>
                      </div>
                    </div>

                    {/* Specialty Line */}
                    {studio.specialty && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          opacity: 0.6,
                          fontWeight: 600,
                          marginBottom: '0.9rem',
                        }}
                      >
                        Specialty: {studio.specialty}
                      </div>
                    )}

                    {/* Studio Story */}
                    <p
                      style={{
                        fontSize: '0.9rem',
                        lineHeight: 1.75,
                        opacity: 0.8,
                        margin: '0 0 1.8rem 0',
                        fontWeight: 300,
                      }}
                    >
                      {studio.shortIntro}
                    </p>
                  </div>

                  {/* Footer Line: Stats & Explore Button */}
                  <div
                    style={{
                      borderTop: '1px solid var(--glass-border)',
                      paddingTop: '1.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.9rem',
                        fontSize: '0.74rem',
                        opacity: 0.7,
                        fontWeight: 500,
                      }}
                    >
                      <span>{studio.registeredWorksCount} Registered Works</span>
                      <span>•</span>
                      <span>{studio.yearsInBusiness} Yrs Lineage</span>
                    </div>

                    <Link
                      href={`/makers/${studio.id}`}
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--secondary)',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.7rem',
                        letterSpacing: '1.8px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      Enter Atelier →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
