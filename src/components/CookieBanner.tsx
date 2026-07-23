'use client';
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('britsync_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentObj = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('britsync_cookie_consent', JSON.stringify(consentObj));
    setVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('britsync_cookie_consent', JSON.stringify(preferences));
    setVisible(false);
  };

  const handleRejectAll = () => {
    const consentObj = { essential: true, analytics: false, marketing: false };
    localStorage.setItem('britsync_cookie_consent', JSON.stringify(consentObj));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '2rem',
      right: '2rem',
      zIndex: 9999,
      backgroundColor: 'rgba(31, 75, 67, 0.98)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--accent)',
      borderRadius: '16px',
      color: '#FAF9F6',
      padding: '2rem',
      boxShadow: 'var(--shadow-lg)',
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }} className="no-print">
      <div>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--accent)', fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', letterSpacing: '1px' }}>🔒 GDPR Privacy Consent</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>
          We use cookies to optimize your marketplace experience, verify hand-made authentication passes, and analyze global artisan sourcing routes. You can accept all or customize your preferences below.
        </p>
      </div>

      {showPreferences ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', fontSize: '0.85rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={preferences.essential} disabled style={{ accentColor: 'var(--accent)' }} />
            <div>
              <strong>Essential Cookies (Always Active)</strong>
              <span style={{ display: 'block', opacity: 0.8 }}>Necessary for secure user sessions, cart contents, and escrow wallets.</span>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={preferences.analytics} onChange={e => setPreferences({...preferences, analytics: e.target.checked})} style={{ accentColor: 'var(--accent)' }} />
            <div>
              <strong>Analytics & Sourcing Metrics</strong>
              <span style={{ display: 'block', opacity: 0.8 }}>Helps us measure site performance and the geographic expansion maps.</span>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={preferences.marketing} onChange={e => setPreferences({...preferences, marketing: e.target.checked})} style={{ accentColor: 'var(--accent)' }} />
            <div>
              <strong>Personalized Marketing & Announcements</strong>
              <span style={{ display: 'block', opacity: 0.8 }}>Allows showing relevant new elite artisan story drops.</span>
            </div>
          </label>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
        <button 
          onClick={() => setShowPreferences(!showPreferences)} 
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          {showPreferences ? 'Hide Preferences' : 'Customize'}
        </button>
        {showPreferences ? (
          <button 
            onClick={handleSavePreferences} 
            style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Save Preferences
          </button>
        ) : (
          <>
            <button 
              onClick={handleRejectAll} 
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Reject Optional
            </button>
            <button 
              onClick={handleAcceptAll} 
              style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Accept All Cookies
            </button>
          </>
        )}
      </div>
    </div>
  );
}
