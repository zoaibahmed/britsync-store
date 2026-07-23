import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      
      {/* Hero Section */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 6rem', textAlign: 'center', padding: '0 2rem' }}>
         <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Our Mission</span>
         <h1 style={{ fontSize: '4rem', color: 'var(--primary)', marginTop: '1rem', marginBottom: '2rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>Sustaining Living Legacies</h1>
         <p style={{ fontSize: '1.2rem', lineHeight: 1.8, opacity: 0.8 }}>
           Britsync is a curated global registry and managed commerce platform dedicated to preserving rare, generational craftsmanship. We connect modern collectors with heritage ateliers and master artisans in developing regions, handling the complexities of global logistics and digital cataloging so their ancient arts can thrive.
         </p>
      </section>

      {/* Story Blocks */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '6rem' }}>
            <div style={{ height: '500px', background: 'url(https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=800) center/cover', borderRadius: '16px' }}></div>
            <div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>The Art of Human Craftsmanship</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, opacity: 0.8, marginBottom: '2rem' }}>
                In an era dominated by mass production and disposable goods, authentic human touch is the ultimate luxury. Our dedicated field agents physically visit each Atelier Elite studio, auditing the authenticity of natural materials, verifying fair wages, and documenting the lineage of the craft.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>✓</span> 100% Curated Artisan Registry</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>✓</span> Cryptographic Provenance Passports</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>✓</span> Escrow-Backed Collector Protection</li>
              </ul>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ order: 2, height: '500px', background: 'url(https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800) center/cover', borderRadius: '16px' }}></div>
            <div style={{ order: 1 }}>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Preserving Living Heritage</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, opacity: 0.8, marginBottom: '2rem' }}>
                Many of the world's most talented master artisans lack access to global payment gateways and international shipping networks. Britsync serves as a dedicated custodian, enabling these craft creators to reach the global market on their own terms, receiving their full desired pricing while preserving their studio traditions.
              </p>
              <Link href="/search" className="btn-accent" style={{ display: 'inline-block', padding: '1rem 2rem', marginTop: '1rem', textDecoration: 'none' }}>Support the Legacy</Link>
            </div>
        </div>
      </section>

    </main>
  );
}
