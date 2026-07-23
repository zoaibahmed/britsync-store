'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PassportPortal() {
  const [searchId, setSearchId] = useState('');
  const [passports, setPassports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/passport?limit=9')
      .then((res) => (res.ok ? res.json() : { passports: [] }))
      .then((data) => setPassports(data.passports || []))
      .catch(() => setPassports([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    window.location.href = `/passport/${searchId.trim()}`;
  };

  const FALLBACK = 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800';

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Banner */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Authenticity Registry</span>
          <h1 style={{ fontSize: '3.5rem', color: 'var(--primary)', marginTop: '1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
            Provenance Registry Portal
          </h1>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.8, opacity: 0.8, maxWidth: '700px', margin: '0 auto' }}>
            Verify the human hands, physical geofenced coordinates, and raw materials behind your Britsync masterpiece.
            Enter a Passport ID, Serial, or Product ID below.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="card" style={{ padding: '3.5rem', marginBottom: '5rem', border: '1px solid var(--accent)', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <label style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
              Enter Britsync Passport ID, Serial, or Product UUID
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                placeholder="e.g. BS-PASSPORT-1-ABCD1234 or a UUID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{ flex: 1, padding: '1.2rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.1rem' }}
              />
              <button type="submit" className="btn-accent" style={{ padding: '0 2.5rem', fontSize: '1.1rem', borderRadius: '8px' }}>
                Verify Provenance
              </button>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', opacity: 0.6 }}>
              🔍 The Passport Serial is listed on each product detail page and printed on physical authentication tags.
            </p>
          </form>
        </div>

        {/* Registry Records */}
        <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
          Registry Records
        </h3>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: '260px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : passports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>
            <p style={{ fontSize: '1.2rem' }}>No passport records found. Try seeding the database.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
            {passports.map((pp) => (
              <Link href={`/passport/${pp.id}`} key={pp.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ cursor: 'pointer', height: '100%', borderTop: '4px solid var(--accent)', overflow: 'hidden', padding: 0 }}>
                  {pp.heroImage && (
                    <div style={{ height: '160px', background: `url(${pp.heroImage}) center/cover`, position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem' }}>
                        <span style={{ backgroundColor: 'var(--primary)', color: 'var(--accent)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {pp.tierLabel}
                        </span>
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 0.25rem' }}>
                      {pp.category}
                    </p>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', margin: '0 0 0.5rem', fontWeight: 400 }}>
                      {pp.productName}
                    </h4>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', margin: '0 0 1rem' }}>
                      By {pp.makerName}
                      {pp.locationName && ` · ${pp.locationName}`}
                    </p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: 0, fontFamily: 'monospace' }}>
                      {pp.passportSerial}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Trust & Security Info */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '4rem', marginBottom: '3rem', border: '1px solid #eee' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', textAlign: 'center', marginBottom: '3rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
            How Britsync Provenance Verification Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
            {[
              { icon: '📍', title: 'GPS Geofencing', desc: 'Certified field inspectors check-in to exact workshop coordinates before any audit begins.' },
              { icon: '📸', title: '15+ HR Photographs', desc: 'Mandatory photographic evidence: exterior, interior, process, materials, conditions, packaging.' },
              { icon: '🎥', title: 'Video Documentary', desc: 'Real-time video recordings of craft demonstrations, founder interviews, and process validation.' },
              { icon: '🔐', title: 'Cryptographic Sealing', desc: 'Every passport is cryptographically hashed and stored tamper-proof in Britsync registry.' },
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>{item.icon}</span>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{item.title}</h4>
                <p style={{ opacity: 0.7, lineHeight: 1.5, fontSize: '0.9rem', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
