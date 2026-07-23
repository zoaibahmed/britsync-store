'use client';
import Link from 'next/link';

export default function BecomeMakerPage() {
  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      
      {/* Hero Section */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 6rem', textAlign: 'center', padding: '0 2rem' }}>
         <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Join The Ecosystem</span>
         <h1 style={{ fontSize: '4rem', color: 'var(--primary)', marginTop: '1rem', marginBottom: '2rem' }}>Focus on Craft. We'll Handle the Rest.</h1>
         <p style={{ fontSize: '1.2rem', lineHeight: 1.8, opacity: 0.8 }}>
           Britsync Market is an invite and application-only platform for verified artisans, heritage brands, and GI producers. We provide the technology, global marketing, logistics, and trust infrastructure so you can dedicate your time to what matters most: your craft.
         </p>
      </section>

      {/* Benefits */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '6rem 2rem', marginBottom: '6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '3rem', textAlign: 'center' }}>Why Join Britsync?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
             <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Zero Tech Required</h3>
               <p style={{ opacity: 0.7 }}>No domains, no hosting, no plugins. We build and maintain your premium digital storefront and handle all ecommerce operations.</p>
             </div>
             <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Global Logistics</h3>
               <p style={{ opacity: 0.7 }}>We partner with top-tier international couriers to handle complex cross-border shipping, customs, and delivery insurance.</p>
             </div>
             <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Premium Trust</h3>
               <p style={{ opacity: 0.7 }}>Our physical verification and digital passports mean you can command true value for your work without being undercut by mass-produced copies.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ backgroundColor: 'var(--primary)', color: 'var(--background)', padding: '4rem', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '2rem', textAlign: 'center' }}>The Application Process</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '1.2rem' }}>1</div>
                <div>
                   <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Submit Initial Application</h3>
                   <p style={{ opacity: 0.8, lineHeight: 1.6 }}>Share your portfolio, workshop details, and story with our curation team.</p>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '1.2rem' }}>2</div>
                <div>
                   <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Digital Review</h3>
                   <p style={{ opacity: 0.8, lineHeight: 1.6 }}>Our experts review your craft for quality, authenticity, and alignment with our ecosystem.</p>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '1.2rem' }}>3</div>
                <div>
                   <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Physical Verification (For Elite Tier)</h3>
                   <p style={{ opacity: 0.8, lineHeight: 1.6 }}>If applying for Elite status, a Britsync field agent will visit your workshop to verify ethical standards and document your process.</p>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '1.2rem' }}>4</div>
                <div>
                   <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Onboarding & Documentary</h3>
                   <p style={{ opacity: 0.8, lineHeight: 1.6 }}>We build your premium profile, digitize your story, and mint your product passports.</p>
                </div>
             </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
             <button className="btn-accent" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }} onClick={() => alert('Application Portal opening soon!')}>Apply Now</button>
          </div>
        </div>
      </section>

    </main>
  );
}
