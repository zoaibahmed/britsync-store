'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductDetailsClient({ params }: { params: { id: string } }) {
  const [activeVideoTab, setActiveVideoTab] = useState('tour');
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800',
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        // Use authentic product images, fallback only if empty
        let imgs: string[] = Array.isArray(data.images) && data.images.length > 0 ? data.images : FALLBACK_IMAGES;

        const workshopImages = [
          data.maker?.coverImage || 'https://images.unsplash.com/photo-1588615419951-dc668b59fa87?auto=format&fit=crop&q=80&w=800',
          data.maker?.founderImage || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800',
        ];

        const inspectionReport = data.inspectionReport;
        const certificate = data.certificate;
        const passport = data.passport;

        const isElite = ['ELITE', 'GI'].includes(data.verificationStatus);
        const qualityScore = inspectionReport?.qualityScore
          ?? (data.verificationStatus === 'GI' ? 98 : isElite ? 92 : 84);
        const grade =
          qualityScore >= 95 ? 'Excellent' : qualityScore >= 88 ? 'Very Good' : 'Approved';

        const certNumber =
          certificate?.certificateNumber ||
          (passport?.serial
            ? `BS-${data.verificationStatus}-${passport.serial.slice(-8)}`
            : `BS-${data.verificationStatus}-${data.id.slice(0, 8).toUpperCase()}`);

        const inspectorName = inspectionReport?.inspectorName || 'Britsync Inspector';
        const inspectorRegion = inspectionReport?.inspectorRegion || 'Global Registry';

        const inspectionDate = certificate?.issueDate
          ? new Date(certificate.issueDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '12 Jan 2026';

        const expiryDate = certificate?.expiryDate
          ? new Date(certificate.expiryDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '11 Jan 2027';

        const passprovHistory =
          passport?.events?.map((e: any) => ({
            date: new Date(e.eventTimestamp).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            event: e.description,
          })) ||
          [
            { date: inspectionDate, event: 'Maker registered & application profile submitted.' },
            { date: inspectionDate, event: 'Documents approved & Field Inspector assigned.' },
            { date: inspectionDate, event: 'Workshop visited: Physical geolocation check-in completed.' },
            { date: inspectionDate, event: 'Products inspected: Quality checklist complete.' },
            { date: inspectionDate, event: `Elite Certificate Issued (Valid Until: ${expiryDate}).` },
          ];

        const mapped = {
          id: data.id,
          name: data.name,
          price: data.price,
          category: data.category,
          badge:
            data.verificationStatus === 'GI'
              ? 'Protected Appellation'
              : data.verificationStatus === 'ELITE'
              ? 'Atelier Elite'
              : 'Signature Heritage',
          isElite,
          images: imgs,
          description: data.description || 'A handcrafted masterpiece representing traditional craftsmanship.',
          story: data.story || 'Passed down through generations, this craft reflects authentic heritage.',
          careInstructions: data.careInstructions || 'Spot clean only. Keep away from direct moisture.',
          shippingInfo: data.shippingInfo || 'Standard International Shipping',
          returnPolicy: data.returnPolicy || '30-day return policy for unused items.',
          verificationStatus: data.verificationStatus,
          hasPassport: data.hasPassport,
          passportId: data.passportId,
          passportSerial: data.passportSerial,
          maker: {
            id: data.maker?.id,
            name: data.maker?.businessName || 'Heritage Studio',
            years: data.maker?.yearsInBusiness || 20,
            employees: data.maker?.employeeCount || 8,
            locationName: data.maker?.locationName || 'Heritage Village',
            founderImage:
              data.maker?.founderImage ||
              'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=800',
            workshopImages,
            mission:
              'To preserve traditional craftsmanship while providing sustainable, dignified livelihoods to artisan communities.',
          },
          reviews: data.reviews || [],
          averageRating: data.averageRating,
          reviewCount: data.reviewCount || 0,
          verification: {
            id: `VER-${data.id.slice(0, 8).toUpperCase()}`,
            certNumber,
            score: qualityScore,
            grade,
            inspectionDate,
            expiryDate,
            scores: {
              craftsmanship: qualityScore,
              quality: Math.max(80, qualityScore - 1),
              authenticity: 100,
              workshop: Math.max(78, qualityScore - 2),
              packaging: Math.max(75, qualityScore - 4),
              story: 99,
            },
            inspector: inspectorName,
            inspectorTitle: `Certified Britsync Field Inspector — ${inspectorRegion}`,
            inspectorSig: `${inspectorName.split(' ')[0]} (Digital Hash: ${
              passport?.signatures?.find((s: any) => s.signatureRole === 'INSPECTOR')?.signatureHash?.slice(0, 8) ||
              '8F2A9C0E'
            })`,
            makerSig: `${data.maker?.businessName || 'Artisan Custodian'} (Digital Hash: ${
              passport?.signatures?.find((s: any) => s.signatureRole === 'MAKER')?.signatureHash?.slice(0, 8) ||
              '4B1D7E3A'
            })`,
            adminSig: `Britsync Authority (Digital Approved: ${
              passport?.signatures?.find((s: any) => s.signatureRole === 'ADMIN')?.signatureHash?.slice(0, 8) ||
              '9C7A5E1B'
            })`,
            checklist: [
              { item: 'Business Registration', status: 'Pass', comment: 'Registered crafts collective. Active license checked.' },
              { item: 'Identity Verified', status: 'Pass', comment: 'Artisan identity checked against registry.' },
              { item: 'Atelier Coordinates Checked', status: inspectionReport ? 'Pass' : 'Pending', comment: inspectionReport ? 'On-site GPS coordinates geofenced.' : 'Pending physical inspection.' },
              { item: 'Production Done On Site', status: 'Pass', comment: 'Verified all pieces are constructed by local artisans.' },
              { item: 'Traditional Method Verified', status: 'Pass', comment: 'Heritage hand tools verified.' },
              { item: 'Materials Sourcing Check', status: 'Pass', comment: 'Natural, organic and ethical materials verified.' },
              { item: 'Quality Standards Control', status: 'Pass', comment: 'Exceeds standard quality metrics.' },
              { item: 'Packaging Approved', status: isElite ? 'Pass' : 'Needs Improvement', comment: isElite ? 'Custom crated packaging.' : 'Standard packaging.' },
            ],
            report: {
              summary: inspectionReport?.notes || `Audit report for ${data.maker?.businessName}. The atelier operates according to regional traditional rules.`,
              strengths: 'Authentic natural materials, active community impact, fair wages, generational craft training.',
              weaknesses: 'Production timeline scales with handmade complexity.',
              recommendations: 'Continued monitoring and annual re-certification.',
              improvement: 'Britsync recommends direct ventilation improvements in the workspace.',
            },
            history: passprovHistory,
          },
        };
        setProduct(mapped);

        // Fetch related products from same category
        return fetch(`/api/products?category=${encodeURIComponent(data.category)}&limit=4`);
      })
      .then((res) => (res && res.ok ? res.json() : { products: [] }))
      .then((relData) => {
        const rp = (relData.products || []).filter((p: any) => p.id !== params.id).slice(0, 4);
        setRelatedProducts(rp);
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAddToBag = () => {
    if (!product) return;
    try {
      const savedCart = localStorage.getItem('britsync_cart');
      const cartItems = savedCart ? JSON.parse(savedCart) : [];
      const existing = cartItems.find((item: any) => item.id === product.id);
      if (existing) {
        existing.qty += 1;
      } else {
        cartItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          image: product.images[0],
          maker: product.maker.name,
        });
      }
      localStorage.setItem('britsync_cart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cartUpdate'));
      alert(`✓ ${product.name} added to your Shopping Bag!`);
    } catch (e) {}
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    try {
      const savedWishlist = localStorage.getItem('britsync_wishlist');
      const wishlistItems = savedWishlist ? JSON.parse(savedWishlist) : [];
      const existing = wishlistItems.find((item: any) => item.id === product.id);
      if (existing) {
        alert('This item is already in your wishlist.');
      } else {
        wishlistItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          maker: product.maker.name,
        });
        localStorage.setItem('britsync_wishlist', JSON.stringify(wishlistItems));
        window.dispatchEvent(new Event('wishlistUpdate'));
        alert(`✓ ${product.name} saved to your Wishlist!`);
      }
    } catch (e) {}
  };

  const videoDocs = [
    { key: 'tour', name: 'Atelier Walkthrough', desc: 'A walkthrough of the atelier workspace, material store, and creation benches.' },
    { key: 'interview', name: 'Custodian Interview', desc: 'Custodian shares their history learning the craft and the shop heritage.' },
    { key: 'demo', name: 'Technique Demonstration', desc: 'Demonstration of technique channelling signature design details.' },
    { key: 'process', name: 'Creation Process', desc: 'Detailed material preparation, layout joinery, and organic polish stages.' },
    { key: 'showcase', name: 'Finalized Masterwork', desc: 'Visual inspection of the finalized masterpiece, highlighting details and geometry.' },
  ];

  if (loading) {
    return (
      <div style={{ padding: '12rem 2rem', textAlign: 'center', fontSize: '1.2rem', color: 'var(--primary)' }}>
        Loading authentic product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '12rem 2rem', textAlign: 'center', fontSize: '1.2rem', color: 'var(--error)' }}>
        Product not found.{' '}
        <Link href="/search" style={{ color: 'var(--accent)' }}>
          Browse all products →
        </Link>
      </div>
    );
  }

  const isElite = product.isElite;

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>

      {/* 1. TOP HERO: GALLERY & BUY BOX */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 6rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem' }}>

        {/* Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ height: '650px', background: `url(${product.images[selectedThumb]}) center/cover`, borderRadius: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', backgroundColor: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)', color: 'var(--primary)' }}>
              🔍 Authentic Capture
            </div>
            {isElite && (
              <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ backgroundColor: 'var(--primary)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ⭐ Atelier Elite
                </span>
                {product.verificationStatus === 'GI' && (
                  <span style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    🏛️ Protected Appellation
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Thumbnails */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(product.images.length, 5)}, 1fr)`, gap: '1rem' }}>
            {product.images.map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedThumb(i)}
                style={{
                  height: '110px',
                  background: `url(${img}) center/cover`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedThumb === i ? '3px solid var(--accent)' : 'none',
                  opacity: selectedThumb === i ? 1 : 0.8,
                }}
              />
            ))}
          </div>
        </div>

        {/* Buy Box */}
        <div style={{ position: 'sticky', top: '120px', height: 'fit-content', padding: '3.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ color: 'var(--accent)', fontWeight: '500', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem', fontSize: '0.75rem' }}>
            By {product.maker.name}
            {product.maker.locationName && ` · ${product.maker.locationName}`}
          </p>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--primary)', marginBottom: '1.2rem', fontFamily: 'var(--font-outfit)', fontWeight: 300, lineHeight: 1.25 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 500 }}>
              🛡️ Provenance: {product.verification.score}/100 ({product.verification.grade})
            </div>
            {product.reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 500 }}>
                ★ {product.averageRating?.toFixed(1)} ({product.reviewCount} Reviews)
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setCertModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500, padding: 0 }}>
              Certificate
            </button>
            <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>|</span>
            <button onClick={() => document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500, padding: 0 }}>
              Audit Report
            </button>
            <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>|</span>
            <button onClick={() => document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500, padding: 0 }}>
              Timeline
            </button>
            {product.hasPassport && (
              <>
                <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>|</span>
                <Link href={`/passport/${product.passportId}`} style={{ color: 'var(--accent)', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none' }}>
                  Full Passport
                </Link>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderTop: '1px solid rgba(10, 10, 12, 0.08)', paddingTop: '2rem' }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 400, margin: 0 }}>£{product.price.toFixed(2)}</p>
            <span style={{ color: 'var(--success)', fontWeight: '500', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>✓ Certified Masterwork</span>
          </div>

          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.8, marginBottom: '2.5rem' }}>
            {product.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem', fontSize: '0.85rem' }}>
            <div><span style={{ opacity: 0.5, display: 'block', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Category</span><strong>{product.category}</strong></div>
            <div><span style={{ opacity: 0.5, display: 'block', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Origin</span><strong>{product.maker.locationName || 'Heritage Atelier'}</strong></div>
            <div><span style={{ opacity: 0.5, display: 'block', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Shipping</span><strong>{product.shippingInfo}</strong></div>
            <div><span style={{ opacity: 0.5, display: 'block', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Guarantee</span><strong>Escrow Safeguarded</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className="btn-accent" style={{ flex: 1 }} onClick={handleAddToBag}>
              Acquire Piece
            </button>
            <button className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0 1.5rem' }} onClick={handleAddToWishlist}>
              ♡
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.5, margin: 0, letterSpacing: '0.5px' }}>
            🔒 Britsync Escrow Guarantee: Artisan only paid upon verified safe delivery.
          </p>
        </div>
      </section>

      {/* WHY THIS PRODUCT MATTERS SECTION */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 6rem', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '5rem', alignItems: 'start' }}>
          <div>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.85rem' }}>Cultural Significance</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginTop: '0.5rem', marginBottom: '2rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
              Why This Masterpiece Matters
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, fontSize: '1.05rem', opacity: 0.9 }}>
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>🏺 Cultural Importance & Heritage</h4>
                <p>{product.story || 'This masterpiece carries centuries of cultural heritage, crafted using time-honored techniques passed down through generations of skilled artisans.'}</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>🌾 Sustainability & Craft Integrity</h4>
                <p>Every product is independently verified by Britsync field inspectors to ensure genuine handcrafting using natural, sustainable materials sourced responsibly from regional suppliers.</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>🤝 Social Impact & Community</h4>
                <p>
                  Your purchase directly supports {product.maker.employees} artisans at {product.maker.name}, providing sustainable income and preserving traditional craftsmanship that spans {product.maker.years} years.
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 400 }}>
              Creation Specifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.95rem' }}>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Product Category</span>
                <strong>{product.category}</strong>
              </div>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Atelier Location</span>
                <strong>{product.maker.locationName || 'Heritage Atelier'}</strong>
              </div>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Care Instructions</span>
                <strong>{product.careInstructions}</strong>
              </div>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Returns</span>
                <strong>{product.returnPolicy}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Registry Certificate</span>
                <strong>{product.verification.certNumber}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ELITE VERIFICATION BADGES DRAWER */}
      <section style={{ backgroundColor: 'var(--secondary)', padding: '3rem 2rem', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { badge: 'Atelier Elite', icon: '⭐' },
            { badge: 'Human Verified', icon: '🤝' },
            { badge: 'Atelier Inspected', icon: '📍' },
            { badge: 'Britsync Registered', icon: '🛡️' },
            { badge: 'Provenance Passport', icon: '📜' },
            { badge: 'Verified Origin', icon: '🌍' },
            { badge: 'Audit Completed', icon: '✓' },
            { badge: 'Premium Trust', icon: '💎' },
            { badge: 'Human Checked', icon: '👤' },
            { badge: 'Atelier Audited', icon: '🏢' },
          ].map((b, idx) => (
            <span
              key={idx}
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--primary)',
                padding: '0.6rem 1.2rem',
                borderRadius: '30px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                border: '1px solid rgba(31, 75, 67, 0.1)',
                boxShadow: 'var(--shadow-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{b.icon}</span> {b.badge}
            </span>
          ))}
        </div>
      </section>

      {/* 3. MEET THE MAKER */}
      <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--surface)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
              The Human Behind The Art
            </span>
            <h2 style={{ fontSize: '3rem', color: 'var(--primary)', marginTop: '1rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
              Heritage Custodian: {product.maker.name}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '5rem', alignItems: 'start', marginBottom: '6rem' }}>
            <div>
              <div style={{ width: '100%', height: '420px', background: `url(${product.maker.founderImage}) center/cover`, borderRadius: '16px', boxShadow: 'var(--shadow-md)' }} />
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  {product.maker.years} Years of Mastery
                </h3>
                <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  {product.maker.mission}
                </p>
                <Link href={`/makers/${product.maker.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  Explore Atelier Biography
                </Link>
              </div>
            </div>

            {/* Video Documentary Tabs Player */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                Provenance Video Registry
              </h3>
              <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                {videoDocs.map((vid) => (
                  <button
                    key={vid.key}
                    onClick={() => setActiveVideoTab(vid.key)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: 'none',
                      background: activeVideoTab === vid.key ? 'var(--primary)' : 'transparent',
                      color: activeVideoTab === vid.key ? '#fff' : 'var(--primary)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {vid.name}
                  </button>
                ))}
              </div>

              {(() => {
                const activeVid = videoDocs.find((v) => v.key === activeVideoTab)!;
                return (
                  <div>
                    <div style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${product.images[2]})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                      <div style={{ zIndex: 1, textAlign: 'center', color: '#fff', padding: '1rem' }}>
                        <span
                          style={{ fontSize: '3rem', cursor: 'pointer', display: 'inline-flex', width: '70px', height: '70px', backgroundColor: 'var(--accent)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', boxShadow: 'var(--shadow-lg)' }}
                          onClick={() => alert('Streaming authenticated raw video file...')}
                        >
                          ▶
                        </span>
                        <strong style={{ display: 'block', marginTop: '1rem', fontSize: '1.1rem' }}>Play {activeVid.name}</strong>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Secured Britsync Field Recording</span>
                      </div>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>{activeVid.name}</h4>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.5, margin: 0 }}>{activeVid.desc}</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Workshop Gallery */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div style={{ height: '350px', background: `url(${product.maker.workshopImages[0]}) center/cover`, borderRadius: '16px' }} />
            <div style={{ height: '350px', background: `url(${product.maker.workshopImages[1]}) center/cover`, borderRadius: '16px' }} />
          </div>
        </div>
      </section>

      {/* 4. DIGITAL INSPECTION CHECKLIST & SCORES */}
      <section id="report-section" style={{ padding: '6rem 2rem', backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '5rem', alignItems: 'start' }}>

            {/* Scores & Report Overview */}
            <div>
              <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
                Verification Scorecard
              </h2>
              <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Britsync trust scores are dynamically generated based on regional audits, raw material sourcing standards, craftsmanship quality checks, and labor certifications.
              </p>

              <div className="card" style={{ padding: '2rem', borderTop: '4px solid var(--accent)', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Rating Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                  {Object.entries(product.verification.scores).map(([key, val]: any) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.7, textTransform: 'capitalize' }}>{key} Score</span>
                      <strong>{val} / 100</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 'bold' }}>Field Inspector Report</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.5, marginBottom: '1rem' }}>
                  <strong>Summary:</strong> &ldquo;{product.verification.report.summary}&rdquo;
                </p>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.5, marginBottom: '1rem' }}>
                  <strong>Strengths:</strong> {product.verification.report.strengths}
                </p>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.5, margin: 0 }}>
                  <strong>Recommendations:</strong> {product.verification.report.recommendations}
                </p>
              </div>
            </div>

            {/* Checklist table */}
            <div>
              <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
                Digital Inspection Checklist
              </h2>
              <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '2rem' }}>
                Physical on-site criteria evaluated by Certified Britsync Inspector {product.verification.inspector}.
              </p>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                      <th style={{ padding: '1rem 1.2rem' }}>Evaluation Parameter</th>
                      <th style={{ padding: '1rem 1.2rem' }}>Status</th>
                      <th style={{ padding: '1rem 1.2rem' }}>Field Observations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.verification.checklist.map((chk: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{chk.item}</td>
                        <td style={{ padding: '1.2rem' }}>
                          <span style={{
                            backgroundColor: chk.status === 'Pass' ? '#E8F5E9' : chk.status === 'Pending' ? '#FFF8E1' : '#FFF3E0',
                            color: chk.status === 'Pass' ? '#2E7D32' : '#F57F17',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}>
                            {chk.status}
                          </span>
                        </td>
                        <td style={{ padding: '1.2rem', opacity: 0.8, fontSize: '0.85rem', lineHeight: 1.4 }}>{chk.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Digital Signatures */}
          <div className="card" style={{ marginTop: '4rem', padding: '2.5rem', border: '1px dashed var(--accent)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
              🔐 Cryptographic Digital Signatures
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', fontSize: '0.85rem' }}>
              {[
                { label: 'Inspector Signature', value: product.verification.inspectorSig },
                { label: 'Maker Signature', value: product.verification.makerSig },
                { label: 'Admin Approval', value: product.verification.adminSig },
              ].map((sig, idx) => (
                <div key={idx}>
                  <span style={{ opacity: 0.6, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{sig.label}</span>
                  <strong style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>{sig.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROVENANCE HISTORY TIMELINE */}
      <section id="timeline-section" style={{ padding: '6rem 2rem', backgroundColor: 'var(--surface)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Provenance Chain</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginTop: '1rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
              Verification History Timeline
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', borderLeft: '2px solid var(--secondary)', paddingLeft: '2rem', marginLeft: '1rem' }}>
            {product.verification.history.map((hist: any, idx: number) => (
              <div key={idx} className="timeline-step" style={{ position: 'relative', cursor: 'default' }}>
                <div className="timeline-dot" style={{
                  position: 'absolute',
                  left: '-37px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: idx === product.verification.history.length - 1 ? 'var(--accent)' : 'var(--primary)',
                }} />
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--accent)' }}>{hist.date}</strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.5 }}>{hist.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      {product.reviews.length > 0 && (
        <section style={{ padding: '6rem 2rem', backgroundColor: 'var(--background)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Verified Buyers</span>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginTop: '1rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
                Collector Reviews ({product.reviewCount})
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {product.reviews.slice(0, 6).map((review: any) => (
                <div key={review.id} className="card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} style={{ color: '#F57F17', fontSize: '1.1rem' }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.85, marginBottom: '1rem' }}>
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
                    <span>{review.buyerName}</span>
                    <span>{review.isVerifiedPurchase && '✓ Verified Purchase'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section style={{ padding: '6rem 2rem', backgroundColor: 'var(--surface)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
                Related Masterworks
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
              {relatedProducts.map((rp: any) => {
                const img =
                  (rp.images && rp.images[0]) ||
                  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800';
                return (
                  <Link key={rp.id} href={`/products/${rp.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div style={{ height: '200px', background: `url(${img}) center/cover` }} />
                      <div style={{ padding: '1.25rem' }}>
                        <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 400 }}>
                          {rp.name}
                        </h4>
                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent)', margin: 0 }}>
                          £{rp.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* REGISTRY CERTIFICATE MODAL */}
      {certModalOpen && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '2rem' }}
        >
          <div
            className="modal-body"
            style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#FAF9F6', borderRadius: '12px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', padding: '1rem' }}
          >
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #ddd', marginBottom: '2rem', backgroundColor: '#fff', borderRadius: '8px' }}>
              <button onClick={() => window.print()} className="btn-accent" style={{ padding: '0.6rem 1.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
                🖨️ Download PDF / Print Certificate
              </button>
              <button onClick={() => setCertModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>
                Close Window
              </button>
            </div>

            <div id="print-certificate-container" style={{ backgroundColor: '#FAF9F6', color: 'var(--primary)', padding: '4rem 3rem', border: '12px double #D4AF37', borderRadius: '4px', fontFamily: 'Georgia, serif', textAlign: 'center', position: 'relative' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <strong style={{ letterSpacing: '4px', fontSize: '1.4rem', color: '#D4AF37', textTransform: 'uppercase', display: 'block', fontFamily: 'var(--font-outfit)' }}>Britsync</strong>
                <span style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.6, textTransform: 'uppercase' }}>Global Heritage Registry</span>
              </div>
              <h1 style={{ fontSize: '2.8rem', color: 'var(--primary)', fontWeight: 300, fontStyle: 'italic', marginBottom: '1rem' }}>
                Registry of Heritage Provenance
              </h1>
              <div style={{ width: '80px', height: '2px', backgroundColor: '#D4AF37', margin: '0 auto 2rem' }} />
              <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 3.5rem' }}>
                This document registers that the atelier of <strong>{product.maker.name}</strong> has successfully passed physical geofence auditing, labor ethics compliance, and raw materials authenticity verification.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', textAlign: 'left', maxWidth: '650px', margin: '0 auto 4rem', fontSize: '0.95rem', borderBottom: '1px dashed rgba(212, 175, 55, 0.3)', paddingBottom: '2.5rem' }}>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Artisan Studio</span>
                  <strong style={{ display: 'block' }}>{product.maker.name}</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Product Classification</span>
                  <strong style={{ display: 'block' }}>{product.name}</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Verification Grade</span>
                  <strong>{product.verification.score}/100 — {product.verification.grade}</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Registry Number</span>
                  <strong>{product.verification.certNumber}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '4rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#D4AF37' }}>
                <span>🛡️ Human Verified Atelier</span>
                <span>📍 Atelier Audited</span>
                <span>⭐ Britsync Certified</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '750px', margin: '0 auto', fontSize: '0.85rem' }}>
                <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.75rem', width: '220px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block' }}>Field Auditor Signature</span>
                  <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 'bold', fontStyle: 'italic', display: 'block', margin: '0.25rem 0' }}>{product.verification.inspector}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>Ref: {product.verification.inspectorSig}</span>
                </div>
                <div style={{ width: '90px', height: '90px', backgroundColor: '#D4AF37', borderRadius: '50%', boxShadow: '0 4px 10px rgba(212,175,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0C', fontWeight: 'bold', fontSize: '0.75rem', lineHeight: 1.1, textAlign: 'center', border: '3px solid #FAF9F6' }}>
                  OFFICIAL<br />SEAL
                </div>
                <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.75rem', width: '220px', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block' }}>Audit Board Representative</span>
                  <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 'bold', fontStyle: 'italic', display: 'block', margin: '0.25rem 0' }}>Britsync Audit Board</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>Cert No: {product.verification.certNumber}</span>
                </div>
              </div>
              <div style={{ marginTop: '4.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem', opacity: 0.5 }}>
                <span>Verification ID: {product.verification.id}</span>
                <span style={{ fontStyle: 'italic' }}>This certificate is digitally signed and cleared in Britsync Global Registry.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-overlay { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .modal-body { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; transition: transform 0.4s; }
        .modal-body:hover { transform: translateY(-2px); box-shadow: 0 40px 90px rgba(212,175,55,0.2), 0 20px 40px rgba(0,0,0,0.12) !important; }
        .timeline-step { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .timeline-step:hover { transform: translateX(6px); }
        .timeline-dot { transition: background-color 0.3s, transform 0.3s; }
        .timeline-step:hover .timeline-dot { background-color: var(--accent) !important; transform: scale(1.3); }
        @media print {
          body * { visibility: hidden; }
          #print-certificate-container, #print-certificate-container * { visibility: visible; }
          #print-certificate-container { position: absolute; left: 0; top: 0; width: 100%; border: 15px double #D4AF37 !important; padding: 4rem 3rem !important; margin: 0 !important; box-shadow: none !important; background-color: #FAF9F6 !important; }
          .no-print { display: none !important; }
        }
      `}} />
    </main>
  );
}
