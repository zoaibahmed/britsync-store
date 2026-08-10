import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | Britsync — Global Heritage & Provenance Registry',
  description: 'Learn about Britsync, a sovereign curation registry dedicated to preserving rare generational craftsmanship through cryptographic provenance passports, GI appellation enforcement, and direct artisan escrow.',
};

export default function AboutPage() {
  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', color: 'var(--text)', minHeight: '100vh' }}>
      
      {/* 1. HERO SECTION */}
      <section
        style={{
          padding: '10rem 2rem 6rem',
          backgroundColor: '#0A0A0C',
          color: '#FAF9F6',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(212,175,55,0.3)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1600")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.14,
            pointerEvents: 'none',
          }}
        />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }} />

        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.4rem 1.2rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: 'var(--accent)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            <span className="glow-dot" /> GLOBAL HERITAGE & PROVENANCE REGISTRY
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontWeight: 300,
              lineHeight: 1.1,
              color: '#FAF9F6',
              marginBottom: '1.8rem',
              letterSpacing: '-0.02em',
            }}
          >
            Custodians of Living Artisanship
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              lineHeight: 1.85,
              color: 'rgba(250,249,246,0.82)',
              maxWidth: '780px',
              margin: '0 auto 3rem',
              fontWeight: 300,
            }}
          >
            Britsync is a sovereign curation platform and digital provenance registry dedicated to preserving rare, generational crafts across protected mountain valleys and historic guilds. We empower master artisans with cryptographic passports, legal Geographic Indication enforcement, and direct patron escrow.
          </p>

          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/collections"
              className="btn-accent"
              style={{
                textDecoration: 'none',
                padding: '1.1rem 2.6rem',
                borderRadius: '50px',
                fontSize: '0.75rem',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontWeight: 700,
                backgroundColor: 'var(--accent)',
                color: '#000000',
                boxShadow: '0 10px 30px rgba(212,175,55,0.3)',
              }}
            >
              Explore Registered Masterpieces &rarr;
            </Link>

            <Link
              href="/gi-certified"
              style={{
                textDecoration: 'none',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#FAF9F6',
                padding: '1.1rem 2.6rem',
                borderRadius: '50px',
                fontSize: '0.75rem',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              GI Appellations Standards
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CORE PILLARS OF BRITSYNC */}
      <section style={{ padding: '7rem 2rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.72rem', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
              OUR FOUR FOUNDATIONAL COLUMNS
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: 'var(--text)' }}>
              The Pillars of Authenticity
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '2rem' }}>
            {[
              {
                num: '01',
                title: 'Cryptographic Provenance',
                desc: 'Every masterpiece is paired with an unalterable digital passport documenting its GPS geofenced atelier, inspector signatures, and ledger block hash.',
                icon: '📜',
              },
              {
                num: '02',
                title: 'Geographic Indication (GI)',
                desc: 'We enforce legal appellation standards for protected regions (such as High Atlas Berber weaving and Iznik ceramic quartz glazes) to end counterfeit exploitation.',
                icon: '⚖️',
              },
              {
                num: '03',
                title: 'Direct Artisan Escrow',
                desc: 'Smart contracts hold patron funds in secure escrow until physical delivery is confirmed, releasing 95% of sale value directly to master craft creators.',
                icon: '🛡️',
              },
              {
                num: '04',
                title: 'Physical Studio Audits',
                desc: 'Regional field inspectors conduct on-site audits, ensuring 100% natural organic dyes, non-synthetic raw materials, and fair living wage compliance.',
                icon: '🔍',
              },
            ].map((pillar) => (
              <div
                key={pillar.num}
                style={{
                  padding: '2.5rem 2rem',
                  borderRadius: '20px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--glass-border)',
                  borderTop: '3px solid var(--accent)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '2rem' }}>{pillar.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>{pillar.num}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.3rem', fontWeight: 400, color: 'var(--text)', margin: 0 }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-muted)', margin: 0, fontWeight: 300 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE MISSION & ORIGIN NARRATIVE */}
      <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Block 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '7rem' }}>
            <div style={{ height: '480px', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)' }}>
              <img
                src="https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1200"
                alt="Artisan Blockprinting"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <span style={{ color: 'var(--accent)', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.8rem' }}>
                THE CHALLENGE OF MASS PRODUCTION
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: 'var(--text)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                Rescuing Ancient Arts from Erasure
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 300 }}>
                In an era dominated by synthetic mass production, disposable fast decor, and algorithmic factory outputs, authentic human craftsmanship has become the rarest luxury on Earth. Across secluded mountain valleys and ancient river basins, master artisans carry centuries of unwritten lineage knowledge.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 300 }}>
                Yet, isolated from international shipping networks, global payment infrastructure, and legal IP protection, these generational masters often face economic pressure to abandon their looms and kilns. Britsync was founded to bridge this divide.
              </p>
              <div style={{ padding: '1.4rem 1.8rem', borderRadius: '12px', backgroundColor: 'var(--surface)', borderLeft: '4px solid var(--accent)', border: '1px solid var(--glass-border)', borderLeftWidth: '4px' }}>
                <p style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontStyle: 'italic', fontSize: '1rem', color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
                  &ldquo;When a master artisan stops weaving or carving, a 300-year-old human library closes forever. We exist to keep those doors open.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Block 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div style={{ order: 2 }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.8rem' }}>
                THE BRITSYNC SOLUTION
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: 'var(--text)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                Transparent Commerce Meets Heritage Curation
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 300 }}>
                Britsync acts as a managed sovereign bridge. We deploy physical field agents to geofence studio boundaries, inspect raw organic materials, and issue immutable cryptographic passports for every registered piece.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 300 }}>
                Patrons around the globe gain complete transparency: exact studio GPS coordinates, inspector signatures, and certified material breakdowns, while artisans receive automated escrow payouts directly to their local accounts.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  href="/how-we-earn"
                  style={{
                    padding: '0.9rem 2rem',
                    borderRadius: '50px',
                    backgroundColor: 'var(--accent)',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  Our Fee & Escrow Structure &rarr;
                </Link>
              </div>
            </div>

            <div style={{ order: 1, height: '480px', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)' }}>
              <img
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1200"
                alt="Iznik Pottery Crafting"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 4. PROVENANCE VERIFICATION PROTOCOL */}
      <section style={{ padding: '8rem 2rem', backgroundColor: '#0A0A0C', color: '#FAF9F6', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.72rem', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
              HOW WE GUARANTEE AUTHENTICITY
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: '#FAF9F6' }}>
              The Provenance Protocol
            </h2>
            <p style={{ maxWidth: '600px', margin: '1rem auto 0', opacity: 0.75, fontSize: '0.95rem', lineHeight: 1.7, color: '#FAF9F6' }}>
              Four rigorous verification stages executed before any masterpiece receives the Britsync Provenance Seal.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              {
                step: 'STAGE 01',
                title: 'Lineage & Guild Audit',
                detail: 'Curation Board reviews artisan genealogy records, oral pattern transmission history, and historical workshop archives.',
              },
              {
                step: 'STAGE 02',
                title: 'Material Purity Test',
                detail: 'Field agents audit raw material supply chains — verifying 80%+ quartz silica clay, organic indigo pits, or pure sheep wool.',
              },
              {
                step: 'STAGE 03',
                title: 'GPS Studio Geofencing',
                detail: 'Satellite GPS geofencing bounds are established around the physical atelier building to prove exact geographical origin.',
              },
              {
                step: 'STAGE 04',
                title: 'Cryptographic Hashing',
                detail: 'A unique serial hash is engraved onto the piece and minted to the decentralized Britsync ledger for eternal verification.',
              },
            ].map((stg) => (
              <div
                key={stg.step}
                style={{
                  padding: '2.5rem 1.8rem',
                  borderRadius: '18px',
                  backgroundColor: 'rgba(18,18,22,0.85)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  borderTop: '4px solid var(--accent)',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.8rem' }}>
                  {stg.step}
                </span>
                <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.3rem', color: '#FAF9F6', fontWeight: 400, marginBottom: '0.8rem' }}>
                  {stg.title}
                </h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(250,249,246,0.72)', margin: 0, fontWeight: 300 }}>
                  {stg.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. METRICS & IMPACT COUNTER */}
      <section style={{ padding: '7rem 2rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: 'var(--accent)', fontSize: '0.72rem', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
            GLOBAL IMPACT METRICS
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: 'var(--text)', marginBottom: '4rem' }}>
            Preserving Heritage in Numbers
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
            {[
              { val: '100%', label: 'Hand-Audited Ateliers' },
              { val: '45+', label: 'Protected Regions & Valleys' },
              { val: '£1.25M+', label: 'Direct Patron Escrow Payouts' },
              { val: '15,000+', label: 'Issued Provenance Passports' },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  padding: '2.5rem 1.5rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '3rem', fontFamily: 'var(--font-playfair), serif', color: 'var(--accent)', fontWeight: 400, marginBottom: '0.5rem' }}>
                  {m.val}
                </div>
                <div style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section
        style={{
          padding: '9rem 2rem',
          backgroundColor: '#0A0A0C',
          color: '#FAF9F6',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '1.2rem' }}>
            JOIN THE PROVENANCE MOVEMENT
          </span>
          <h2 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: 'var(--accent)', marginBottom: '1.8rem' }}>
            Become a Patron of Generational Artistry
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, opacity: 0.85, color: 'rgba(250,249,246,0.85)', marginBottom: '3.5rem', fontWeight: 300 }}>
            Every masterpiece acquired through Britsync directly sustains a living atelier, protects a regional Geographic Indication, and keeps centuries of human tradition alive.
          </p>

          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/collections"
              className="btn-accent"
              style={{
                textDecoration: 'none',
                padding: '1.15rem 3rem',
                borderRadius: '50px',
                fontSize: '0.78rem',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontWeight: 700,
                backgroundColor: 'var(--accent)',
                color: '#000000',
                boxShadow: '0 10px 30px rgba(212,175,55,0.3)',
              }}
            >
              Browse Masterpieces &rarr;
            </Link>
            <Link
              href="/become-a-maker"
              style={{
                textDecoration: 'none',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#FAF9F6',
                padding: '1.15rem 3rem',
                borderRadius: '50px',
                fontSize: '0.78rem',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Apply as Master Guild
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
