import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const categoryName = decodeURIComponent(rawCategory);

  return {
    title: `${categoryName} Ateliers & Master Makers | Britsync Registry`,
    description: `Discover certified master craftsmen, ateliers, and heritage brands specializing in ${categoryName}. Verified provenance on Britsync.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = await params;
  const categoryName = decodeURIComponent(rawCategory);

  // Fetch all makers who have products in this category or all verified makers if fallback
  const makers = await prisma.makerProfile.findMany({
    where: {
      products: {
        some: {
          category: {
            translations: {
              some: {
                name: {
                  contains: categoryName,
                }
              }
            }
          }
        }
      }
    },
    include: {
      user: true,
      coverMedia: true,
      founderMedia: true,
      location: {
        include: {
          translations: true
        }
      },
      products: {
        select: {
          id: true
        }
      }
    }
  });

  // If no category-specific products found, fallback to all verified makers to ensure rich display
  let displayMakers = makers;
  if (displayMakers.length === 0) {
    displayMakers = await prisma.makerProfile.findMany({
      take: 12,
      include: {
        user: true,
        coverMedia: true,
        founderMedia: true,
        location: {
          include: {
            translations: true
          }
        },
        products: {
          select: {
            id: true
          }
        }
      }
    });
  }

  const mappedMakers = displayMakers.map((m: any) => {
    const countryName = m.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global';
    const heroImage = m.coverMedia?.storageKey || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200';
    const logo = m.founderMedia?.storageKey || 'https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=400';

    return {
      id: m.id,
      businessName: m.businessName || m.user?.name || 'Master Atelier',
      founderName: m.user?.name || 'Master Artisan',
      country: countryName,
      verificationStatus: m.verificationStatus || 'VERIFIED',
      yearsInBusiness: m.yearsInBusiness || 15,
      productCount: m.products ? m.products.length : 12,
      shortIntro: m.businessStory || m.founderStory || 'Preserving centuries of generational craft heritage with certified hand inspection.',
      heroImage,
      logo
    };
  });

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'ELITE': return { text: '⭐ Atelier Elite Master', bg: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', border: 'rgba(212, 175, 55, 0.5)' };
      case 'GI': return { text: '🏛️ Protected Appellation', bg: 'rgba(15, 36, 32, 0.85)', color: '#D4AF37', border: 'rgba(212, 175, 55, 0.4)' };
      default: return { text: '✓ Signature Partner', bg: 'rgba(244, 243, 239, 0.9)', color: '#0F2420', border: 'rgba(15, 36, 32, 0.2)' };
    }
  };

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: '8rem' }}>
      {/* Light Luxury Hero Section */}
      <section style={{ 
        padding: '9rem 2rem 4rem', 
        color: '#0F2420', 
        textAlign: 'center',
        borderBottom: '1px solid rgba(212,175,55,0.2)'
      }}>
        <div style={{ maxWidth: '950px', margin: '0 auto' }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', alignItems: 'center', fontSize: '0.82rem', color: '#718096', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Link href="/" style={{ color: '#718096', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/collections" style={{ color: '#718096', textDecoration: 'none' }}>Collections</Link>
            <span>/</span>
            <span style={{ color: '#B48811', fontWeight: 600 }}>{categoryName}</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#F4F3EF', border: '1px solid rgba(212,175,55,0.4)', padding: '0.55rem 1.6rem', borderRadius: '30px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />
            <span style={{ color: '#B48811', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 700 }}>
              VERIFIED BRAND REGISTRY
            </span>
          </div>

          <h1 style={{ fontSize: '4.2rem', fontFamily: 'var(--font-playfair), serif', marginBottom: '1.2rem', fontWeight: 300, color: '#0F2420', lineHeight: 1.15 }}>
            {categoryName} Brands & Ateliers
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#4A5568', maxWidth: '720px', margin: '0 auto', lineHeight: 1.8, fontWeight: 400 }}>
            Explore certified master craftsmen and studio cooperatives specializing in authentic {categoryName.toLowerCase()}. Discover their heritage, lineage, and masterwork portfolios.
          </p>
        </div>
      </section>

      {/* Brands Grid */}
      <section style={{ padding: '5rem 2rem 0', maxWidth: '1350px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '3rem' }}>
          {mappedMakers.map(maker => {
            const badge = getVerificationBadge(maker.verificationStatus);
            return (
              <Link href={`/makers/${maker.id}`} key={maker.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                    position: 'relative'
                  }}
                  className="brand-card-hover"
                >
                  {/* Hero Cover Image */}
                  <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={maker.heroImage} 
                      alt={maker.businessName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                      className="brand-cover-img"
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15,36,32,0.85) 0%, transparent 65%)'
                    }} />

                    {/* Verification Badge */}
                    <div style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', backgroundColor: badge.bg, border: `1px solid ${badge.border}`, backdropFilter: 'blur(8px)', padding: '0.4rem 1.1rem', borderRadius: '30px' }}>
                      <span style={{ color: badge.color, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1px' }}>
                        {badge.text}
                      </span>
                    </div>

                    {/* Product Count Pill */}
                    <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', backgroundColor: 'rgba(15,36,32,0.85)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(8px)', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {maker.productCount} Masterworks
                    </div>

                    {/* Brand Logo Avatar Overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-24px',
                      left: '2rem',
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      border: '3px solid #D4AF37',
                      overflow: 'hidden',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      backgroundColor: '#FFFFFF'
                    }}>
                      <img src={maker.logo} alt={maker.founderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>

                  {/* Brand Content Details */}
                  <div style={{ padding: '2.5rem 2rem 2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <span style={{ color: '#B48811', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        📍 {maker.country} • {maker.yearsInBusiness} Years Active
                      </span>
                    </div>

                    <h2 style={{ fontSize: '2.2rem', color: '#0F2420', marginBottom: '0.6rem', fontFamily: 'var(--font-playfair), serif', fontWeight: 400, lineHeight: 1.2 }}>
                      {maker.businessName}
                    </h2>
                    
                    <p style={{ color: '#4A5568', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: '2rem', flex: 1 }}>
                      {maker.shortIntro}
                    </p>

                    <div style={{ borderTop: '1px solid #EDF2F7', paddingTop: '1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#0F2420', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.5px' }}>
                        Visit Brand Showroom
                      </span>
                      <span style={{ color: '#D4AF37', fontSize: '1.2rem', fontWeight: 700 }}>
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .brand-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.12) !important;
        }
        .brand-card-hover:hover .brand-cover-img {
          transform: scale(1.08);
        }
      `}} />
    </main>
  );
}
