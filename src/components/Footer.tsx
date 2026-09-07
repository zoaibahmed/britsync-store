'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeLogo from '@/components/ThemeLogo';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/dashboard') || pathname === '/login' || pathname === '/register' || pathname?.startsWith('/collections')) return null;
  return (
    <footer style={{
      backgroundColor: 'var(--surface)',
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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <ThemeLogo height="46px" style={{ filter: 'drop-shadow(0 2px 8px rgba(212,175,55,0.3))' }} />
          </div>

          <p style={{ opacity: 0.8, lineHeight: 1.8, fontSize: '0.88rem', maxWidth: '320px', marginBottom: '2.2rem', fontWeight: 300 }}>
            The global registry for verified master artisans and heritage ateliers. Safeguarding rare provenance.
          </p>

          {/* Luxury Newsletter Form */}
          <div style={{ maxWidth: "340px" }}>
            <h4 style={{ fontSize: "0.72rem", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.8rem", color: "var(--accent)", fontWeight: 700 }}>
              RECEIVE ATELIER GAZETTE
            </h4>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to the Britsync Gazette."); }} style={{ display: "flex", gap: "0.6rem" }}>
              <input 
                type="email" 
                required
                placeholder="Enter your email address" 
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text)",
                  fontSize: "0.82rem",
                  padding: "0.7rem 1rem",
                  outline: "none",
                  flex: 1,
                  borderRadius: "0px",
                }}
              />
              <button 
                type="submit"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#0A0A0C",
                  border: "none",
                  fontSize: "0.68rem",
                  letterSpacing: "2px",
                  fontWeight: 700,
                  padding: "0.7rem 1.2rem",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0A0A0C";
                  e.currentTarget.style.color = "#D4AF37";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent)";
                  e.currentTarget.style.color = "#0A0A0C";
                }}
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Discover */}
        <div>
          <h4 style={{ marginBottom: "1.5rem", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--accent)" }}>Discover</h4>
          <ul style={{ listStyle: "none", padding: 0, opacity: 0.85, lineHeight: 2.2, fontSize: "0.85rem", fontWeight: 300 }}>
            <li><Link href="/collections" style={{ color: "inherit", textDecoration: "none" }}>Heritage Collections</Link></li>
            <li><Link href="/gi-certified" style={{ color: "inherit", textDecoration: "none" }}>GI Protected Appellations</Link></li>
            <li><Link href="/search" style={{ color: "inherit", textDecoration: "none" }}>Recent Acquisitions</Link></li>
          </ul>
        </div>

        {/* Trust & Integrity */}
        <div>
          <h4 style={{ marginBottom: "1.5rem", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--accent)" }}>Integrity</h4>
          <ul style={{ listStyle: "none", padding: 0, opacity: 0.85, lineHeight: 2.2, fontSize: "0.85rem", fontWeight: 300 }}>
            <li><Link href="/passport" style={{ color: "inherit", textDecoration: "none" }}>Provenance Passports</Link></li>
            <li><Link href="/become-a-maker" style={{ color: "inherit", textDecoration: "none" }}>Registry Standard</Link></li>
            <li><Link href="/about#transparency" style={{ color: "inherit", textDecoration: "none" }}>Zero-Fee Maker Model</Link></li>
          </ul>
        </div>

        {/* Heritage */}
        <div>
          <h4 style={{ marginBottom: "1.5rem", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--accent)" }}>Heritage</h4>
          <ul style={{ listStyle: "none", padding: 0, opacity: 0.85, lineHeight: 2.2, fontSize: "0.85rem", fontWeight: 300 }}>
            <li><Link href="/collections" style={{ color: "inherit", textDecoration: "none" }}>Craft Categories</Link></li>
            <li><Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>Our Mission</Link></li>
            <li><Link href="/contact" style={{ color: "inherit", textDecoration: "none" }}>Mayfair Concierge</Link></li>
          </ul>
        </div>

        {/* Portals */}
        <div>
          <h4 style={{ marginBottom: "1.5rem", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--accent)" }}>Portals</h4>
          <ul style={{ listStyle: "none", padding: 0, opacity: 0.85, lineHeight: 2.2, fontSize: "0.85rem", fontWeight: 300 }}>
            <li><Link href="/login" style={{ color: "inherit", textDecoration: "none" }}>Client Space</Link></li>
            <li><Link href="/become-a-maker" style={{ color: "inherit", textDecoration: "none" }}>Artisan Workspace</Link></li>
            <li><Link href="/inspector/login" style={{ color: "inherit", textDecoration: "none" }}>Inspector Portal</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="footer-copyright" style={{ 
        maxWidth: "1200px",
        margin: "3rem auto 0",
        opacity: 0.6, 
        fontSize: "0.75rem",
        letterSpacing: "1.5px",
        fontWeight: 400
      }}>
        <span>&copy; {new Date().getFullYear()} BRITSYNC REGISTRY. ALL RIGHTS RESERVED.</span>
        <div style={{ display: "flex", gap: "2rem" }}>
          <span style={{ cursor: "pointer" }}>PRIVACY POLICY</span>
          <span style={{ cursor: "pointer" }}>TERMS & CONDITIONS</span>
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
