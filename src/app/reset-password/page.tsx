'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

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
            <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-outfit)' }}>Password Updated</h2>
            <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your security password has been changed successfully. You can now use your new password to sign in.
            </p>
            <Link href="/login" className="btn-accent" style={{ display: 'block', padding: '1rem', textDecoration: 'none', fontWeight: 'bold' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', margin: '0 0 0.5rem' }}>Choose New Password</h2>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Establish a strong secure password for your Britsync account credentials.</p>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>New Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
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
                {loading ? 'Updating Credentials...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
