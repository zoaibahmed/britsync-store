import Link from 'next/link';

export default function GIProductsPage() {
  const giProducts = [
    { id: "ajrak-9823", name: "Authentic Ajrak Shawl", origin: "Sindh, Pakistan", price: 150, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800" },
    { id: "pottery-85", name: "Blue Pottery Bowl", origin: "Iznik, Turkey", price: 90, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800" },
    { id: "kilim-8411", name: "Vintage Wool Kilim", origin: "Konya, Turkey", price: 350, image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800" }
  ];

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      
      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 6rem', textAlign: 'center', padding: '0 2rem' }}>
         <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Protected Heritage</span>
         <h1 style={{ fontSize: '4rem', color: 'var(--primary)', marginTop: '1rem', marginBottom: '2rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>Appellations of Origin</h1>
         <p style={{ fontSize: '1.2rem', lineHeight: 1.8, opacity: 0.8, maxWidth: '800px', margin: '0 auto' }}>
           An Appellation of Origin (GI) designates works whose characteristics, quality, and legacy are intrinsically tied to their birthplace. By acquiring a certified appellation piece on Britsync, you directly support the preservation of ancient cultural heritage.
         </p>
      </section>

      {/* Interactive Map Placeholder & Explanation */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '6rem 2rem', marginBottom: '6rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>The Heritage Cartography</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <li>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>🌍 Regional Authenticity</h3>
                  <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>Only products created in the exact historical region can claim this title.</p>
                </li>
                <li>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>📜 Legal Protection</h3>
                  <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>GI certification prevents cultural appropriation and cheap knock-offs.</p>
                </li>
                <li>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>🏛️ Generational Craft</h3>
                  <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>The techniques used must match the historical records of the region.</p>
                </li>
              </ul>
            </div>
            
            {/* Immersive heritage origin map with pulsing hotspots */}
            <div style={{ height: '500px', background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.25)), url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200) center/cover', borderRadius: '16px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(200, 164, 93, 0.15)' }}>
               <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', backgroundColor: 'var(--primary)', color: 'var(--accent)', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.5px', boxShadow: 'var(--shadow-sm)', zIndex: 10 }}>
                 🛰️ Immersive Origin Registry
               </div>

               {/* Hotspot 1: Morocco */}
               <div className="map-hotspot-container" style={{ top: '48%', left: '38%' }}>
                 <div className="map-hotspot"></div>
                 <div className="map-tooltip">
                   <strong>🇲🇦 Morocco Hub</strong>
                   <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>Atlas Mountains Wool & Woodwork</span>
                 </div>
               </div>

               {/* Hotspot 2: Turkey (Konya) */}
               <div className="map-hotspot-container" style={{ top: '42%', left: '48%' }}>
                 <div className="map-hotspot"></div>
                 <div className="map-tooltip">
                   <strong>🇹🇷 Konya, Turkey Hub</strong>
                   <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>Atelier Elite Wool Kilim Weaving</span>
                 </div>
               </div>

               {/* Hotspot 3: Pakistan (Sindh) */}
               <div className="map-hotspot-container" style={{ top: '49%', left: '58%' }}>
                 <div className="map-hotspot"></div>
                 <div className="map-tooltip">
                   <strong>🇵🇰 Sindh, Pakistan Hub</strong>
                   <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>Hand-Block Printed Ajrak Dyeing</span>
                 </div>
               </div>

               {/* Hotspot 4: Peru */}
               <div className="map-hotspot-container" style={{ top: '74%', left: '22%' }}>
                 <div className="map-hotspot"></div>
                 <div className="map-tooltip">
                   <strong>🇵🇪 Peru Hub</strong>
                   <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>Alpaca Textiles & Andean Ceramics</span>
                 </div>
               </div>

               {/* Hotspot 5: Vietnam */}
               <div className="map-hotspot-container" style={{ top: '56%', left: '72%' }}>
                 <div className="map-hotspot"></div>
                 <div className="map-tooltip">
                   <strong>🇻🇳 Vietnam Hub</strong>
                   <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>Traditional Lacquerware & Bamboo Craft</span>
                 </div>
               </div>
            </div>
        </div>
      </section>

      {/* GI Certified Products */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '3rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>Protected Appellation Masterpieces</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '3rem' }}>
          {giProducts.map(product => (
            <Link href={`/passport/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '350px', background: `url(${product.image})` + ' center/cover', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--primary)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)' }}>
                    🏛️ Protected Appellation
                  </div>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{product.origin}</span>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>£{product.price}</p>
                    <span className="btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '8px' }}>Explore Provenance</span>
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
