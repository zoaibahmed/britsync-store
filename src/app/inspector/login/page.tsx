'use client';
import { useState } from 'react';

export default function InspectorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Unauthorized Inspector credentials.');
        return;
      }

      const user = data.user;
      if (user.role !== 'INSPECTOR') {
        setErrorMsg('Access denied: Unauthorized role credentials.');
        return;
      }

      localStorage.setItem('britsync_user', JSON.stringify(user));
      window.location.href = '/dashboard/inspector';
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to connect to authentication services.');
    }
  };

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#111514', // Sleek dark brand color
      fontFamily: 'var(--font-inter)',
      padding: '2rem'
    }} className="no-print animate-fade-in">
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#1A2120',
        border: '1px solid var(--accent)',
        borderRadius: '16px',
        padding: '3rem 2.5rem',
        color: '#FAF9F6',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ letterSpacing: '4px', fontSize: '1.6rem', color: '#D4AF37', margin: '0 0 0.5rem', textTransform: 'uppercase', fontFamily: 'var(--font-outfit)' }}>Britsync</h2>
          <span style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.6, textTransform: 'uppercase' }}>Inspector Dispatch Portal</span>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.8 }}>Inspector ID (Email)</label>
            <input 
              type="email" 
              placeholder="inspector@britsync.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.95rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.8 }}>Passkey</label>
            <input 
              type="password" 
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.95rem' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-accent" 
            style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}
          >
            {loading ? 'Validating Dispatch Authority...' : 'Verify Inspector Device'}
          </button>
        </form>
      </div>
    </main>
  );
}
