import Link from 'next/link';

export default function CollectionsPage() {
  const collections = [
    { 
      name: "Ceramics", 
      label: "Zellige Tilework & Fine Pottery",
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800", 
      count: 120,
      provenance: "Fez, Morocco & Iznik, Turkey"
    },
    { 
      name: "Textiles", 
      label: "Pashmina & Royal Weaves",
      image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800", 
      count: 340,
      provenance: "Kashmir, India & Silk Road"
    },
    { 
      name: "Jewelry", 
      label: "Filigree & Royal Silverware",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800", 
      count: 85,
      provenance: "Multan & Jaipur Ateliers"
    },
    { 
      name: "Woodwork", 
      label: "Andalusian Carvings & Marquetry",
      image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800", 
      count: 42,
      provenance: "Cordoba & Chiniot Masters"
    },
    { 
      name: "Leather", 
      label: "Fez Organic Tanned Goods",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800", 
      count: 67,
      provenance: "Chouara Tanneries, Fez"
    },
    { 
      name: "Metal Craft", 
      label: "Hand-Hammered Copper & Damascus Steel",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800", 
      count: 53,
      provenance: "Damascus & Lahore Guilds"
    },
    { 
      name: "Glass", 
      label: "Blown Stained Glass & Crystal",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800", 
      count: 38,
      provenance: "Murano & Hebron Glasswork"
    },
    { 
      name: "Home Decor", 
      label: "Brass Lanterns & Ornaments",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800", 
      count: 210,
      provenance: "Marrakesh & Cairo Ateliers"
    },
  ];

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: '8rem' }}>
      {/* Light Luxury Hero Header */}
      <section style={{ 
        padding: '9rem 2rem 4rem', 
        color: '#0F2420', 
        textAlign: 'center',
        borderBottom: '1px solid rgba(212,175,55,0.2)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#F4F3EF', border: '1px solid rgba(212,175,55,0.4)', padding: '0.55rem 1.6rem', borderRadius: '30px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />
            <span style={{ color: '#B48811', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 700 }}>
              CURATED HERITAGE REGISTRY
            </span>
          </div>

          <h1 style={{ fontSize: '4.2rem', fontFamily: 'var(--font-playfair), serif', marginBottom: '1.2rem', fontWeight: 300, color: '#0F2420', lineHeight: 1.15 }}>
            Heritage Collections
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#4A5568', maxWidth: '680px', margin: '0 auto', lineHeight: 1.8, fontWeight: 400 }}>
            Discover generational masterpieces curated and verified by our global provenance network. Certified authentic from master artisan ateliers worldwide.
          </p>
        </div>
      </section>

      {/* Grid of Heritage Collection Cards */}
      <section style={{ padding: '5rem 2rem 0', maxWidth: '1350px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem' }}>
          {collections.map(col => (
            <Link href={`/categories/${encodeURIComponent(col.name)}`} key={col.name} style={{ textDecoration: 'none' }}>
              <div 
                style={{ 
                  borderRadius: '24px', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  height: '380px', 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  backgroundColor: '#FFFFFF'
                }}
                className="collection-card-hover"
              >
                <img 
                  src={col.image} 
                  alt={col.name} 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                    transition: 'transform 0.6s ease'
                  }}
                />
                <div style={{
                  position: 'absolute', 
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,36,32,0.92) 0%, rgba(15,36,32,0.4) 60%, transparent 100%)',
                  zIndex: 1
                }} />
                
                <div style={{ position: 'relative', zIndex: 2, padding: '2.2rem 2rem', width: '100%', color: '#FAF9F6' }}>
                  <div style={{ display: 'inline-block', backgroundColor: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.5)', padding: '0.35rem 1rem', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.8rem', backdropFilter: 'blur(8px)' }}>
                    📍 {col.provenance}
                  </div>
                  <h2 style={{ color: '#FAF9F6', fontSize: '2.2rem', marginBottom: '0.4rem', fontFamily: 'var(--font-playfair), serif', fontWeight: 400 }}>
                    {col.name}
                  </h2>
                  <p style={{ color: '#E2E8F0', fontSize: '0.92rem', marginBottom: '0.8rem', opacity: 0.9 }}>
                    {col.label}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#D4AF37', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {col.count} Cataloged Masterworks
                    </span>
                    <span style={{ color: '#D4AF37', fontSize: '1.2rem' }}>
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
