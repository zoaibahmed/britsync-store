'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Boundary Error:', error);
  }, [error]);

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
        <h1 style={{ fontSize: '7rem', color: 'var(--error)', margin: 0, fontWeight: 300, lineHeight: 1 }}>500</h1>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          System Interruption
        </h2>
        <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '2rem' }}>
          We encountered an unexpected error reading from the Britsync ledger. Please attempt to reload the request.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => reset()} className="btn-accent" style={{ padding: '0.85rem 2rem' }}>
            Retry Request
          </button>
          <a href="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.85rem 2rem', border: '1px solid #ccc', backgroundColor: '#fff', color: 'var(--primary)' }}>
            Return Home
          </a>
        </div>
      </div>
    </main>
  );
}
