'use client';
import Link from 'next/link';

export default function HowWeEarnPage() {
  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
        
        {/* Header Section */}
        <section style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Transparency First</span>
          <h1 style={{ fontSize: '3.5rem', color: 'var(--primary)', marginTop: '1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>Our Registry Model</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.8, opacity: 0.8, maxWidth: '800px', margin: '0 auto' }}>
            Britsync is not a commission-based broker. We are a curated, managed registry that funds meticulous physical verification, artisan biographies, and international custom logistics through a clear and transparent platform markup.
          </p>
        </section>

        {/* The Model Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '6rem' }}>
          <div className="card" style={{ padding: '3rem', borderTop: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 400 }}>1. The Artisan Desired Price</h3>
            <p style={{ opacity: 0.8, lineHeight: 1.7, marginBottom: '2rem' }}>
              Every custodian of craft on Britsync defines their own desired payout. This is the exact, uncompromised amount they receive upon acquisition. They pay no catalog fees, registry listing fees, or platform sales commissions.
            </p>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--background)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
              <span style={{ fontSize: '0.85rem', opacity: 0.6, display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Artisan Payout</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>100% of Desired Amount</strong>
            </div>
          </div>

          <div className="card" style={{ padding: '3rem', borderTop: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 400 }}>2. The Managed Registry Markup</h3>
            <p style={{ opacity: 0.8, lineHeight: 1.7, marginBottom: '2rem' }}>
              Britsync adds a managed registry markup on top of the artisan's payout. The patron pays the finalized price at checkout, and this markup directly finances our local field audits, custom export documentation, and museum-grade logistics.
            </p>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--background)', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
              <span style={{ fontSize: '0.85rem', opacity: 0.6, display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Registry Coverage</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>All Logistics & Provenance Operations</strong>
            </div>
          </div>
        </div>

        {/* Detailed services funded by the difference */}
        <section style={{ backgroundColor: 'var(--surface)', padding: '4rem', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', textAlign: 'center', marginBottom: '3.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>What Does the Markup Fund?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🛡️</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Physical Atelier Verification</h4>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6 }}>We deploy field auditors to ateliers to verify lineage, traditional hand tools, material purity, and fair working environments.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📸</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Atelier Biographies & Film</h4>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6 }}>We hire local writers and filmmakers to document the custodian's lineage and produce premium biographical media.</p>
              </div>
            </div>
 
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>✈️</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Museum-Grade Logistics</h4>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6 }}>We coordinate international air cargo, customs clearance, duty processing, and white-glove delivery, insuring each crate.</p>
              </div>
            </div>
 
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🔒</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Secure Escrow Safeguards</h4>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6 }}>Patron payouts remain protected in escrow until the masterpiece is safely delivered and accepted, eliminating transaction risk.</p>
              </div>
            </div>
 
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>💬</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>24/7 Concierge Service</h4>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6 }}>We manage all communication, translation, updates, and collector requests, acting as a direct bridge to the artisans.</p>
              </div>
            </div>
 
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>💻</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Registry Infrastructure</h4>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6 }}>We sustain the web platforms, secure hosting, and cryptographic records verifying each provenance passport.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Transaction */}
        <section style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>An Illustrative Example</h2>
          <p style={{ opacity: 0.8, marginBottom: '3.5rem' }}>Here is how the pricing breaks down for an individual product, from maker desired price to checkout.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '16px', minWidth: '200px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>1. Artisan Payout</span>
              <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '0.5rem 0' }}>£150</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Desired payout</p>
            </div>
            
            <div style={{ fontSize: '2rem', color: 'var(--accent)' }}>+</div>
            
            <div style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '16px', minWidth: '200px', boxShadow: 'var(--shadow-sm)', border: '1px dashed var(--accent)' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>2. Registry Markup</span>
              <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '0.5rem 0' }}>£90</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>60% Platform markup</p>
            </div>

            <div style={{ fontSize: '2rem', color: 'var(--accent)' }}>=</div>

            <div style={{ padding: '2rem', backgroundColor: 'var(--primary)', color: 'var(--background)', borderRadius: '16px', minWidth: '200px', boxShadow: 'var(--shadow-md)' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent)' }}>3. Patron Acquisition</span>
              <h3 style={{ fontSize: '2.5rem', color: 'var(--accent)', margin: '0.5rem 0' }}>£240</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Registry Acquisition Price</p>
            </div>
          </div>
          
          <div style={{ marginTop: '4rem' }}>
            <Link href="/search" className="btn-accent" style={{ textDecoration: 'none', padding: '1rem 3rem' }}>Browse The Collections</Link>
          </div>
        </section>

      </div>
    </main>
  );
}
