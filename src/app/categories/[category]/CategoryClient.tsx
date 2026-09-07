'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface CategoryProductItem {
  id: string;
  title: string;
  maker: string;
  makerId?: string;
  price: number;
  country: string;
  region?: string;
  materials?: string;
  craftingTimeWeeks?: number;
  isReadyToShip: boolean;
  verificationStatus: string;
  imageUrl: string;
  images: string[];
  dimensions?: string;
  weight?: string;
}

export interface CategoryMakerItem {
  id: string;
  businessName: string;
  founderName: string;
  country: string;
  city?: string;
  verificationStatus: string;
  yearsInBusiness: number;
  productCount: number;
  shortIntro: string;
  heroImage: string;
  logo: string;
}

export interface CraftHeritageData {
  ancestralEra: string;
  primaryMaterials: string[];
  techniques: { name: string; description: string }[];
  auditStandard: string;
}

interface CategoryClientProps {
  disciplineKey: string;
  disciplineTitle: string;
  tagline: string;
  description: string;
  provenanceHubs: string[];
  heritage: CraftHeritageData;
  products: CategoryProductItem[];
  makers: CategoryMakerItem[];
  initialSearch?: string;
}

const DISCIPLINES_NAV = [
  { slug: 'Metal Craft', label: 'Metal Craft', count: 6 },
  { slug: 'Ceramics', label: 'Ceramics', count: 5 },
  { slug: 'Jewelry', label: 'Jewellery', count: 4 },
  { slug: 'Textiles', label: 'Textiles', count: 5 },
  { slug: 'Leather', label: 'Leather', count: 5 },
  { slug: 'Home Decor', label: 'Living Spaces', count: 3 },
];

export default function CategoryClient({
  disciplineKey,
  disciplineTitle,
  tagline,
  description,
  provenanceHubs,
  heritage,
  products,
  makers,
  initialSearch = '',
}: CategoryClientProps) {
  const [activeTab, setActiveTab] = useState<'works' | 'ateliers' | 'heritage'>('works');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'READY' | 'BESPOKE'>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<CategoryProductItem | null>(null);

  // Debounced URL update to avoid locking the UI thread
  useEffect(() => {
    const handler = setTimeout(() => {
      const url = new URL(window.location.href);
      if (searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim());
      } else {
        url.searchParams.delete('search');
      }
      window.history.replaceState(null, '', url.pathname + url.search);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fast filtered products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.maker.toLowerCase().includes(q) ||
          (p.materials && p.materials.toLowerCase().includes(q)) ||
          p.country.toLowerCase().includes(q)
      );
    }

    // Tier
    if (tierFilter !== 'ALL') {
      result = result.filter((p) => p.verificationStatus === tierFilter);
    }

    // Availability
    if (availabilityFilter === 'READY') {
      result = result.filter((p) => p.isReadyToShip);
    } else if (availabilityFilter === 'BESPOKE') {
      result = result.filter((p) => !p.isReadyToShip);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchQuery, tierFilter, availabilityFilter, sortBy]);

  // Fast filtered makers
  const filteredMakers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return makers.filter((m) => {
      if (tierFilter !== 'ALL' && m.verificationStatus !== tierFilter) return false;
      if (!q) return true;
      return (
        m.businessName.toLowerCase().includes(q) ||
        m.founderName.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        m.shortIntro.toLowerCase().includes(q)
      );
    });
  }, [makers, searchQuery, tierFilter]);

  const getBadgeConfig = (status: string) => {
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
          label: 'Protected GI Appellation',
          bg: 'var(--surface-muted)',
          color: 'var(--accent)',
          border: '1px solid var(--accent)',
        };
      default:
        return {
          label: 'Heritage Verified',
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
      {/* ── TOP ARCHITECTURAL DISCIPLINE NAVIGATOR ── */}
      <nav
        aria-label="Disciplines Navigator"
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--glass-border)',
          position: 'sticky',
          top: '72px',
          zIndex: 40,
          padding: '0 1.5rem',
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
            paddingTop: '0.4rem',
            paddingBottom: '0.4rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
            <span
              style={{
                fontSize: '0.68rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                opacity: 0.5,
                fontWeight: 700,
                marginRight: '0.8rem',
              }}
            >
              Registry Archives:
            </span>
            {DISCIPLINES_NAV.map((disc) => {
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
                    gap: '0.4rem',
                    padding: '0.55rem 1.1rem',
                    fontSize: '0.72rem',
                    letterSpacing: '1.5px',
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
                  <span>{disc.label}</span>
                  <span style={{ opacity: 0.6, fontSize: '0.62rem' }}>({disc.count})</span>
                </Link>
              );
            })}
          </div>

          <Link
            href="/collections"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 600,
              flexShrink: 0,
              padding: '0.4rem 0.8rem',
              border: '1px solid var(--glass-border)',
            }}
          >
            3D Studio Flythrough →
          </Link>
        </div>
      </nav>

      {/* ── EDITORIAL DISCIPLINE HERO ── */}
      <section
        style={{
          padding: '4.5rem 2rem 3.5rem',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Breadcrumb Line */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.72rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              opacity: 0.6,
              marginBottom: '1.5rem',
            }}
          >
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/collections" style={{ color: 'inherit', textDecoration: 'none' }}>
              Disciplines
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {disciplineTitle}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
              gap: '4rem',
              alignItems: 'end',
            }}
          >
            {/* Title & Tagline */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.85rem',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.68rem',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  marginBottom: '1.2rem',
                }}
              >
                <span>Provenance Standard ISO-17025</span>
                <span>•</span>
                <span>Certified Mastercraft</span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
                  fontWeight: 300,
                  lineHeight: 1.05,
                  margin: '0 0 1.2rem 0',
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                }}
              >
                The Mastercraft of <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{disciplineTitle}</em>
              </h1>

              <p
                style={{
                  fontSize: '1.18rem',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                  margin: '0 0 1.5rem 0',
                  fontWeight: 400,
                  opacity: 0.9,
                }}
              >
                {tagline}
              </p>

              <p
                style={{
                  fontSize: '0.98rem',
                  lineHeight: 1.8,
                  opacity: 0.75,
                  margin: 0,
                  maxWidth: '720px',
                  fontWeight: 300,
                }}
              >
                {description}
              </p>
            </div>

            {/* Provenance Hubs & Credentials Card */}
            <div
              style={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--glass-border)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    opacity: 0.55,
                    display: 'block',
                    marginBottom: '0.6rem',
                    fontWeight: 700,
                  }}
                >
                  Recognized Heritage Centers:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {provenanceHubs.map((hub) => (
                    <span
                      key={hub}
                      style={{
                        fontSize: '0.72rem',
                        letterSpacing: '1px',
                        padding: '0.3rem 0.7rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        fontWeight: 600,
                      }}
                    >
                      📍 {hub}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--glass-border)',
                  paddingTop: '1.2rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-playfair), Georgia, serif',
                      fontSize: '1.5rem',
                      color: 'var(--accent)',
                      fontWeight: 400,
                    }}
                  >
                    100%
                  </div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
                    Hand Forged
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-playfair), Georgia, serif',
                      fontSize: '1.5rem',
                      color: 'var(--text)',
                      fontWeight: 400,
                    }}
                  >
                    95%
                  </div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
                    Artisan Escrow
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-playfair), Georgia, serif',
                      fontSize: '1.5rem',
                      color: 'var(--accent)',
                      fontWeight: 400,
                    }}
                  >
                    GPS
                  </div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
                    Passport Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem 0' }}>
        {/* ── THREE PILLAR VIEW TABS ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '1.2rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'works', label: `Authenticated Masterworks (${filteredProducts.length})` },
              { id: 'ateliers', label: `Certified Ateliers (${filteredMakers.length})` },
              { id: 'heritage', label: 'Techniques & Standards' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.74rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--secondary)' : 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search & Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--glass-border)',
                padding: '0.45rem 0.9rem',
                width: '280px',
              }}
            >
              <span style={{ opacity: 0.5, marginRight: '0.5rem', fontSize: '0.8rem' }}>🔍</span>
              <input
                type="text"
                placeholder={`Search in ${disciplineTitle}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    opacity: 0.5,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {activeTab === 'works' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.74rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="featured">Sort: Curated Masterworks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            )}
          </div>
        </div>

        {/* ── TAB 1: MASTERWORKS CATALOG ── */}
        {activeTab === 'works' && (
          <div>
            {/* Filter Pills */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  opacity: 0.5,
                  fontWeight: 700,
                }}
              >
                Availability:
              </span>
              {[
                { id: 'ALL', label: 'All Pieces' },
                { id: 'READY', label: '✓ Ready to Ship' },
                { id: 'BESPOKE', label: '🔨 Made to Order' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAvailabilityFilter(f.id as any)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.68rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontWeight: availabilityFilter === f.id ? 700 : 500,
                    border: '1px solid var(--glass-border)',
                    backgroundColor: availabilityFilter === f.id ? 'var(--accent)' : 'transparent',
                    color: availabilityFilter === f.id ? '#0A0A0C' : 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}

              <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--glass-border)', margin: '0 0.5rem' }} />

              <span
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  opacity: 0.5,
                  fontWeight: 700,
                }}
              >
                Status Tier:
              </span>
              {[
                { id: 'ALL', label: 'All Tiers' },
                { id: 'ELITE', label: '⭐ Elite Master' },
                { id: 'GI', label: '🏛️ Protected GI' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTierFilter(t.id)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.68rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontWeight: tierFilter === t.id ? 700 : 500,
                    border: '1px solid var(--glass-border)',
                    backgroundColor: tierFilter === t.id ? 'var(--primary)' : 'transparent',
                    color: tierFilter === t.id ? 'var(--secondary)' : 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '2.5rem',
                }}
              >
                {filteredProducts.map((p) => {
                  const badge = getBadgeConfig(p.verificationStatus);
                  return (
                    <article
                      key={p.id}
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'border-color 0.2s ease, transform 0.2s ease',
                      }}
                    >
                      {/* Product Image Stage */}
                      <div
                        style={{
                          position: 'relative',
                          height: '340px',
                          backgroundColor: 'var(--background)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          loading="lazy"
                          style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            transition: 'transform 0.4s ease',
                          }}
                        />

                        {/* Top Badges */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: badge.border,
                            fontSize: '0.6rem',
                            letterSpacing: '1.5px',
                            fontWeight: 700,
                            padding: '0.35rem 0.65rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          {badge.label}
                        </div>

                        <div
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text)',
                            fontSize: '0.6rem',
                            letterSpacing: '1.5px',
                            fontWeight: 600,
                            padding: '0.35rem 0.65rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          {p.isReadyToShip ? 'Ready to Ship' : `${p.craftingTimeWeeks} Wks Craft`}
                        </div>

                        {/* Bottom Region */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '1rem',
                            left: '1rem',
                            backgroundColor: 'var(--primary)',
                            color: 'var(--secondary)',
                            fontSize: '0.62rem',
                            letterSpacing: '1.5px',
                            fontWeight: 600,
                            padding: '0.3rem 0.65rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          📍 {p.region || p.country}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div
                        style={{
                          padding: '1.8rem',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '0.68rem',
                              letterSpacing: '2px',
                              textTransform: 'uppercase',
                              color: 'var(--accent)',
                              fontWeight: 700,
                              marginBottom: '0.4rem',
                            }}
                          >
                            {p.maker}
                          </div>

                          <h2
                            style={{
                              fontFamily: 'var(--font-playfair), Georgia, serif',
                              fontSize: '1.45rem',
                              fontWeight: 400,
                              margin: '0 0 0.8rem 0',
                              lineHeight: 1.25,
                              color: 'var(--text)',
                            }}
                          >
                            {p.title}
                          </h2>

                          {p.materials && (
                            <p
                              style={{
                                fontSize: '0.82rem',
                                lineHeight: 1.6,
                                opacity: 0.7,
                                margin: '0 0 1.2rem 0',
                                fontWeight: 300,
                              }}
                            >
                              {p.materials}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            borderTop: '1px solid var(--glass-border)',
                            paddingTop: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: '0.6rem',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                opacity: 0.6,
                                display: 'block',
                              }}
                            >
                              Audited Value
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-playfair), Georgia, serif',
                                fontSize: '1.6rem',
                                color: 'var(--text)',
                                fontWeight: 400,
                              }}
                            >
                              £{p.price.toLocaleString('en-GB')}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setSelectedProduct(p)}
                              style={{
                                backgroundColor: 'transparent',
                                color: 'var(--text)',
                                border: '1px solid var(--glass-border)',
                                padding: '0.6rem 0.9rem',
                                fontSize: '0.68rem',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Inspect
                            </button>

                            <Link
                              href={`/products/${p.id}`}
                              style={{
                                backgroundColor: 'var(--primary)',
                                color: 'var(--secondary)',
                                padding: '0.6rem 1.1rem',
                                fontSize: '0.68rem',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                transition: 'opacity 0.2s ease',
                              }}
                            >
                              Acquire →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
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
                <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.8rem', margin: '0 0 1rem' }}>
                  No Works Match Your Criteria
                </h3>
                <p style={{ opacity: 0.7, maxWidth: '450px', margin: '0 auto 2rem', fontSize: '0.9rem' }}>
                  Adjust your search or filter parameters to discover authenticated masterworks in {disciplineTitle}.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTierFilter('ALL');
                    setAvailabilityFilter('ALL');
                  }}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--secondary)',
                    border: 'none',
                    padding: '0.75rem 1.8rem',
                    fontSize: '0.72rem',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: CERTIFIED ATELIERS ── */}
        {activeTab === 'ateliers' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '2.5rem',
              }}
            >
              {filteredMakers.map((maker) => {
                const badge = getBadgeConfig(maker.verificationStatus);
                return (
                  <article
                    key={maker.id}
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Atelier Cover */}
                    <div
                      style={{
                        position: 'relative',
                        height: '240px',
                        backgroundColor: 'var(--background)',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={maker.heroImage}
                        alt={maker.businessName}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
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
                          padding: '0.35rem 0.75rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {badge.label}
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          left: '1rem',
                          backgroundColor: 'var(--primary)',
                          color: 'var(--secondary)',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          letterSpacing: '1px',
                          padding: '0.3rem 0.7rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        📍 {maker.city ? `${maker.city}, ${maker.country}` : maker.country}
                      </div>
                    </div>

                    {/* Atelier Content */}
                    <div
                      style={{
                        padding: '2rem',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
                          {maker.logo && (
                            <div
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                border: '1px solid var(--accent)',
                                overflow: 'hidden',
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={maker.logo}
                                alt={maker.founderName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          )}
                          <div>
                            <h2
                              style={{
                                fontFamily: 'var(--font-playfair), Georgia, serif',
                                fontSize: '1.4rem',
                                fontWeight: 400,
                                margin: 0,
                                lineHeight: 1.2,
                                color: 'var(--text)',
                              }}
                            >
                              {maker.businessName}
                            </h2>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                              Custodian: {maker.founderName}
                            </span>
                          </div>
                        </div>

                        <p
                          style={{
                            fontSize: '0.88rem',
                            lineHeight: 1.7,
                            opacity: 0.8,
                            margin: '0 0 1.5rem 0',
                            fontWeight: 300,
                          }}
                        >
                          {maker.shortIntro}
                        </p>
                      </div>

                      <div
                        style={{
                          borderTop: '1px solid var(--glass-border)',
                          paddingTop: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem', opacity: 0.7 }}>
                          <span>{maker.productCount} Registered Works</span>
                          <span>•</span>
                          <span>{maker.yearsInBusiness} Yrs Lineage</span>
                        </div>

                        <Link
                          href={`/makers/${maker.id}`}
                          style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--secondary)',
                            padding: '0.6rem 1.1rem',
                            fontSize: '0.68rem',
                            letterSpacing: '1.5px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                          }}
                        >
                          Explore Atelier →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: CRAFT HERITAGE & TECHNIQUES ── */}
        {activeTab === 'heritage' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1.7fr)',
              gap: '4rem',
            }}
          >
            {/* Left Column: Era & Materials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--glass-border)',
                  padding: '2.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '0.8rem',
                  }}
                >
                  Ancestral Era & Lineage
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: '1.6rem',
                    margin: '0 0 1rem',
                    color: 'var(--text)',
                  }}
                >
                  {heritage.ancestralEra}
                </h3>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.8, opacity: 0.8, fontWeight: 300, margin: 0 }}>
                  This craft tradition has been handed down through direct master-apprentice (Ustad-Shagird) lineages,
                  preserving metallurgical, chemical, and physical knowledge without automated machinery.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--glass-border)',
                  padding: '2.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '1rem',
                  }}
                >
                  Primary Raw Materials
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {heritage.primaryMaterials.map((mat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        fontSize: '0.88rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>0{idx + 1}.</span>
                      <span>{mat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Techniques & Verification Standard */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--glass-border)',
                  padding: '2.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '1.5rem',
                  }}
                >
                  Documented Ancestral Techniques
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                  {heritage.techniques.map((tech, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderLeft: '2px solid var(--accent)',
                        paddingLeft: '1.4rem',
                      }}
                    >
                      <h4
                        style={{
                          fontFamily: 'var(--font-playfair), Georgia, serif',
                          fontSize: '1.25rem',
                          margin: '0 0 0.5rem',
                          color: 'var(--text)',
                        }}
                      >
                        {tech.name}
                      </h4>
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.8, margin: 0, fontWeight: 300 }}>
                        {tech.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Audit Standard */}
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--glass-border)',
                  padding: '2.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '0.8rem',
                  }}
                >
                  Britsync Audit & Physical Provenance
                </span>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, opacity: 0.85, margin: '0 0 1.5rem', fontWeight: 300 }}>
                  {heritage.auditStandard}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    fontSize: '0.74rem',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    opacity: 0.7,
                  }}
                >
                  <span>✓ Physical Micro-Seal</span>
                  <span>✓ Immutable Registry Passport</span>
                  <span>✓ Fair Trade Escrow</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── INSPECT MODAL (LIGHTWEIGHT & ZERO LAG) ── */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(10, 10, 12, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              maxWidth: '850px',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-luxury)',
            }}
          >
            {/* Modal Image */}
            <div
              style={{
                backgroundColor: 'var(--background)',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
              />
            </div>

            {/* Modal Info */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
                    {selectedProduct.maker}
                  </span>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--text)',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      opacity: 0.6,
                    }}
                  >
                    ✕
                  </button>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: '1.8rem',
                    margin: '0 0 1rem',
                    color: 'var(--text)',
                    lineHeight: 1.2,
                  }}
                >
                  {selectedProduct.title}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ opacity: 0.5, display: 'block', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '1px' }}>
                      Region of Origin
                    </span>
                    <strong>{selectedProduct.region || selectedProduct.country}</strong>
                  </div>
                  <div>
                    <span style={{ opacity: 0.5, display: 'block', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '1px' }}>
                      Lead Time
                    </span>
                    <strong>{selectedProduct.isReadyToShip ? 'Ready to Ship' : `${selectedProduct.craftingTimeWeeks} Weeks`}</strong>
                  </div>
                  {selectedProduct.dimensions && (
                    <div>
                      <span style={{ opacity: 0.5, display: 'block', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '1px' }}>
                        Dimensions
                      </span>
                      <strong>{selectedProduct.dimensions}</strong>
                    </div>
                  )}
                  {selectedProduct.weight && (
                    <div>
                      <span style={{ opacity: 0.5, display: 'block', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '1px' }}>
                        Weight
                      </span>
                      <strong>{selectedProduct.weight}</strong>
                    </div>
                  )}
                </div>

                {selectedProduct.materials && (
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.8, margin: 0, fontWeight: 300 }}>
                    {selectedProduct.materials}
                  </p>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--glass-border)',
                  paddingTop: '1.5rem',
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.5, display: 'block' }}>
                    Authentic Price
                  </span>
                  <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.8rem', color: 'var(--text)' }}>
                    £{selectedProduct.price.toLocaleString('en-GB')}
                  </span>
                </div>

                <Link
                  href={`/products/${selectedProduct.id}`}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--secondary)',
                    padding: '0.75rem 1.6rem',
                    fontSize: '0.72rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Acquire Work →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
