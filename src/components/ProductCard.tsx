'use client';
import { useState } from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    category?: string;
    images?: string[];
    image?: string;
    verificationStatus?: string;
    hasPassport?: boolean;
    badge?: string;
    maker?: {
      businessName?: string;
      name?: string;
      locationName?: string;
    } | string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800'];

  const primaryImage = rawImages[0];
  const secondaryImage = rawImages[1] || rawImages[0];

  const makerName = typeof product.maker === 'string'
    ? product.maker
    : product.maker?.businessName || product.maker?.name || 'Verified Artisan';
  
  const categoryName = typeof product.category === 'object' && product.category !== null
    ? (product.category as any).name || ''
    : typeof product.category === 'string'
    ? product.category
    : '';

  const locationText = typeof product.maker === 'object' && product.maker?.locationName
    ? ` · ${product.maker.locationName}`
    : '';

  const getBadgeText = (status?: string, fallbackBadge?: string) => {
    if (fallbackBadge) return fallbackBadge;
    switch (status) {
      case 'GI': return '🏛️ Protected Appellation';
      case 'ELITE': return '⭐ Atelier Elite';
      case 'VERIFIED': return '✓ Verified';
      default: return '• Heritage Certified';
    }
  };

  const hasMultipleImages = secondaryImage !== primaryImage;

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        className="card luxury-card-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--surface)',
          border: isHovered ? '1px solid rgba(212, 175, 55, 0.45)' : '1px solid var(--glass-border)',
          boxShadow: isHovered ? 'var(--shadow-luxury)' : 'var(--shadow-sm)',
          transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          borderRadius: '12px',
          position: 'relative',
        }}
      >
        {/* Top Image Container */}
        <div style={{ position: 'relative', height: '320px', overflow: 'hidden', backgroundColor: '#0f0f11' }}>
          {/* Primary Image (First Pic) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${primaryImage}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: isHovered && hasMultipleImages ? 0 : 1,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />

          {/* Secondary Hover Image (Next Pic) */}
          {hasMultipleImages && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${secondaryImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          )}

          {/* Subtle Solid Dark Overlay */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(10, 10, 12, 0.25)',
              pointerEvents: 'none'
            }} 
          />

          {/* Verification Badge */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: 'rgba(10, 10, 12, 0.75)',
              backdropFilter: 'blur(12px)',
              color: 'var(--accent)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '0.35rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              zIndex: 2,
            }}
          >
            {getBadgeText(product.verificationStatus, product.badge)}
          </div>

          {/* Passport Badge */}
          {product.hasPassport !== false && (
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                color: 'var(--primary)',
                padding: '0.3rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.68rem',
                fontWeight: 600,
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              📜 Passport
            </div>
          )}

          {/* Hover Image Dots Indicator */}
          {hasMultipleImages && (
            <div
              style={{
                position: 'absolute',
                bottom: '0.8rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.4rem',
                zIndex: 3,
                backgroundColor: 'rgba(10, 10, 12, 0.6)',
                backdropFilter: 'blur(8px)',
                padding: '0.3rem 0.6rem',
                borderRadius: '12px',
                transition: 'opacity 0.3s ease',
                opacity: isHovered ? 1 : 0.6,
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: !isHovered ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s ease',
                  boxShadow: !isHovered ? '0 0 6px var(--accent)' : 'none',
                }}
              />
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isHovered ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s ease',
                  boxShadow: isHovered ? '0 0 6px var(--accent)' : 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* Card Body */}
        <div style={{ padding: '1.6rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {categoryName && (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1.5px',
                marginBottom: '0.4rem',
              }}
            >
              {categoryName}
            </span>
          )}

          <h3
            style={{
              fontSize: '1.15rem',
              marginBottom: '0.6rem',
              color: 'var(--primary)',
              fontWeight: 400,
              fontFamily: 'var(--font-playfair), Georgia, serif',
              flex: 1,
              lineHeight: 1.35,
            }}
          >
            {product.name}
          </h3>

          <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', fontSize: '0.83rem', opacity: 0.85 }}>
            By <strong style={{ color: 'var(--primary)', fontWeight: 500 }}>{makerName}</strong>{locationText}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.68rem', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase', display: 'block' }}>PRICE</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--primary)', fontFamily: 'var(--font-outfit)' }}>
                £{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </p>
            </div>

            <span
              style={{
                padding: '0.5rem 1.2rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600,
                backgroundColor: isHovered ? 'var(--primary)' : 'transparent',
                color: isHovered ? 'var(--accent)' : 'var(--primary)',
                border: isHovered ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Acquire &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
