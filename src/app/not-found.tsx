'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      backgroundColor: 'var(--background)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <h1 style={{ fontSize: '7rem', color: 'var(--accent)', margin: 0, fontWeight: 300, lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Heritage Lost in Transit
        </h2>
        <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '2rem' }}>
          The page or artisan collection you are looking for does not exist or has been relocated within the Britsync Registry.
        </p>
        <Link href="/" className="btn-accent" style={{ textDecoration: 'none', padding: '0.85rem 2rem', display: 'inline-block' }}>
          Return to Marketplace
        </Link>
      </div>
    </main>
  );
}
