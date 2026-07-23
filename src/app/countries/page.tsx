import Link from 'next/link';

export default function CountriesPage() {
  const regions = [
    { name: "Morocco", description: "Ancient woodwork, ceramics, and Berber textiles.", image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80&w=800" },
    { name: "Peru", description: "Alpaca weaving, silver filigree, and Andean ceramics.", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800" },
    { name: "India", description: "GI-certified silks, block printing, and metalwork.", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800" },
    { name: "Kenya", description: "Soapstone carving, beadwork, and woven sisal baskets.", image: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&q=80&w=800" },
    { name: "Mexico", description: "Talavera pottery, Oaxacan textiles, and alebrijes.", image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&q=80&w=800" },
    { name: "Vietnam", description: "Bamboo crafting, lacquerware, and silk embroidery.", image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800" }
  ];

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      
      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 6rem', textAlign: 'center', padding: '0 2rem' }}>
         <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Global Heritage</span>
         <h1 style={{ fontSize: '4rem', color: 'var(--primary)', marginTop: '1rem', marginBottom: '2rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>Appellations of Origin</h1>
         <p style={{ fontSize: '1.2rem', lineHeight: 1.8, opacity: 0.8, maxWidth: '800px', margin: '0 auto' }}>
           Explore masterworks categorized by their historical and geographical appellations. Each region represents a unique dialogue between local raw materials, centuries of culture, and generational techniques.
         </p>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '3rem' }}>
          {regions.map(region => (
            <Link href={`/search?country=${region.name}`} key={region.name} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '350px', background: `url(${region.image}) center/cover`, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '2rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-outfit)' }}>{region.name}</h3>
                    <p style={{ opacity: 0.9 }}>{region.description}</p>
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
