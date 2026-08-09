'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--secondary)',
      color: 'var(--text)',
      padding: '7rem 2rem 3rem',
      marginTop: 'auto',
      borderTop: '1px solid var(--glass-border)',
      transition: 'background-color var(--transition-slow), color var(--transition-slow)'
    }}>
      <div className="footer-grid" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingBottom: '5rem',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        {/* Brand Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <img 
              src="/logo.png" 
              alt="Britsync Logo Emblem" 
              style={{ 
                height: '34px', 
                width: '34px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '1px solid var(--accent)',
                boxShadow: '0 4px 12px rgba(212,175,55,0.3)' 
              }} 
            />
            <h3 style={{ 
              color: 'var(--accent)', 
              margin: 0, 
              fontSize: '1.25rem',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              letterSpacing: '4px',
              fontWeight: 300
            }}>BRITSYNC</h3>
          </div>
          <p style={{ opacity: 0.7, lineHeight: 1.8, fontSize: '0.85rem', maxWidth: '300px', marginBottom: '2rem' }}>
            The global registry for verified master artisans and heritage ateliers. Safeguarding rare provenance.
          </p>
          {/* Minimalist Newsletter */}
          <div style={{ maxWidth: '300px' }}>
            <h4 style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem', color: 'var(--accent)', fontWeight: 500 }}>Newsletter</h4>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--text)', opacity: 0.3, paddingBottom: '0.5rem', transition: 'opacity 0.3s ease' }}
                 onFocusCapture={(e) => e.currentTarget.style.opacity = '0.8'}
                 onBlurCapture={(e) => e.currentTarget.style.opacity = '0.3'}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontSize: '0.85rem',
                  padding: 0,
                  width: '100%',
                  outline: 'none'
                }}
              />
              <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '1px', fontWeight: '500' }}>
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* Discover */}
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)' }}>Discover</h4>
          <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7, lineHeight: 2.2, fontSize: '0.85rem' }}>
            <li><Link href="/collections" style={{ color: 'inherit', textDecoration: 'none' }}>Heritage Collections</Link></li>
            <li><Link href="/gi-certified" style={{ color: 'inherit', textDecoration: 'none' }}>GI Protected Appellations</Link></li>
            <li><Link href="/countries" style={{ color: 'inherit', textDecoration: 'none' }}>Origins & Regions</Link></li>
            <li><Link href="/search" style={{ color: 'inherit', textDecoration: 'none' }}>Recent Acquisitions</Link></li>
          </ul>
        </div>

        {/* Trust & Integrity */}
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)' }}>Integrity</h4>
          <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7, lineHeight: 2.2, fontSize: '0.85rem' }}>
            <li><Link href="/passport" style={{ color: 'inherit', textDecoration: 'none' }}>Provenance Passports</Link></li>
            <li><Link href="/become-a-maker" style={{ color: 'inherit', textDecoration: 'none' }}>Registry Standard</Link></li>
            <li><Link href="/how-we-earn" style={{ color: 'inherit', textDecoration: 'none' }}>Transparency Ledger</Link></li>
          </ul>
        </div>

        {/* Heritage */}
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)' }}>Heritage</h4>
          <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7, lineHeight: 2.2, fontSize: '0.85rem' }}>
            <li><Link href="/collections" style={{ color: 'inherit', textDecoration: 'none' }}>Craft Categories</Link></li>
            <li><Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Our Mission</Link></li>
            <li><Link href="/about#contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link></li>
          </ul>
        </div>

        {/* Portals */}
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)' }}>Portals</h4>
          <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7, lineHeight: 2.2, fontSize: '0.85rem' }}>
            <li><Link href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Client Space</Link></li>
            <li><Link href="/become-a-maker" style={{ color: 'inherit', textDecoration: 'none' }}>Artisan Workspace</Link></li>
            <li><Link href="/inspector/login" style={{ color: 'inherit', textDecoration: 'none' }}>Inspector Portal</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="footer-copyright" style={{ 
        maxWidth: '1200px',
        margin: '3rem auto 0',
        opacity: 0.5, 
        fontSize: '0.75rem',
        letterSpacing: '1px'
      }}>
        <span>&copy; {new Date().getFullYear()} BRITSYNC REGISTRY. ALL RIGHTS RESERVED.</span>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span style={{ cursor: 'pointer' }}>PRIVACY POLICY</span>
          <span style={{ cursor: 'pointer' }}>TERMS & CONDITIONS</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .footer-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr;
          gap: 4rem;
        }
        .footer-copyright {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.5fr 1fr 1fr;
            gap: 3rem;
          }
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .footer-copyright {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }
        }
      `}} />
    </footer>
  );
}
