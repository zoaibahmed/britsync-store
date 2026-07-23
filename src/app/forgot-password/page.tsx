'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-inter)',
      padding: '2rem'
    }} className="no-print animate-fade-in">
      <div className="card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '3rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', backgroundColor: '#E8F5E9', borderRadius: '50%', color: '#2E7D32', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>✓</div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-outfit)' }}>Reset Dispatched</h2>
            <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              We have dispatched a secure credentials configuration email to <strong>{email}</strong>. Check your inbox and follow the validation steps.
            </p>
            <Link href="/login" className="btn-accent" style={{ display: 'block', padding: '1rem', textDecoration: 'none', fontWeight: 'bold' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', margin: '0 0 0.5rem' }}>Forgot Password</h2>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Enter your registered email address and we will dispatch a verification link.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  required
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-accent" 
                style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}
              >
                {loading ? 'Processing Reset...' : 'Dispatch Reset Email'}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.9rem' }}>
                ← Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
