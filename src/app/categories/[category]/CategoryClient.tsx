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
        paddingBottom: '9rem',
      }}
    >
      {/* ── SPACIOUS LUXURY EDITORIAL HERO ── */}
      <section
        style={{
          padding: '7rem 2rem 5rem',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--glass-border)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {/* Subtle Provenance Breadcrumb */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.68rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              opacity: 0.5,
              marginBottom: '2rem',
              fontWeight: 600,
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
              fontSize: 'clamp(2.8rem, 5.5vw, 4.6rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              margin: '0 0 1.4rem 0',
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            {disciplineTitle} <em style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 300 }}>Ateliers</em>
          </h1>

          {/* Subtle Gold Accent Divider */}
          <div
            style={{
              width: '48px',
              height: '1px',
              backgroundColor: 'var(--accent)',
              margin: '0 auto 1.8rem',
              opacity: 0.8,
            }}
          />

          {/* Tagline */}
          <p
            style={{
              fontSize: '1.14rem',
              color: 'var(--text)',
              lineHeight: 1.65,
              margin: '0 auto 1.2rem',
              fontWeight: 400,
              maxWidth: '720px',
              opacity: 0.9,
            }}
          >
            {tagline}
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: '0.94rem',
              lineHeight: 1.8,
              opacity: 0.65,
              margin: '0 auto',
              maxWidth: '660px',
              fontWeight: 300,
            }}
          >
            {description}
          </p>
        </div>
      </section>

      {/* ── ATELIERS & STUDIOS DIRECTORY ── */}
      <section style={{ maxWidth: '1360px', margin: '0 auto', padding: '4.5rem 2rem 0' }}>
        {/* Subtle Registry Header Line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '1.2rem',
            marginBottom: '3.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 600,
              opacity: 0.6,
            }}
          >
            {studios.length} Certified Master Ateliers
          </span>

          <span
            style={{
              fontSize: '0.68rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            GPS Audited • 95% Direct Patron Escrow
          </span>
        </div>

        {/* Studio Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '3rem',
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
                  transition: 'border-color 0.25s ease',
                }}
              >
                {/* Studio Hero Image Container */}
                <div
                  style={{
                    position: 'relative',
                    height: '280px',
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
                      display: 'block',
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
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '1.8px',
                      padding: '0.4rem 0.8rem',
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
                      fontSize: '0.64rem',
                      fontWeight: 600,
                      letterSpacing: '1.2px',
                      padding: '0.35rem 0.75rem',
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
                        marginBottom: '1rem',
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
                            fontSize: '1.45rem',
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
                            fontSize: '0.74rem',
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
                          fontSize: '0.7rem',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          opacity: 0.6,
                          fontWeight: 600,
                          marginBottom: '0.8rem',
                        }}
                      >
                        Specialty: {studio.specialty}
                      </div>
                    )}

                    {/* Studio Story */}
                    <p
                      style={{
                        fontSize: '0.88rem',
                        lineHeight: 1.75,
                        opacity: 0.75,
                        margin: '0 0 1.6rem 0',
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
                        gap: '0.8rem',
                        fontSize: '0.72rem',
                        opacity: 0.65,
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
                        fontSize: '0.68rem',
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
