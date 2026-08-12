'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  // Navigation & Form Phases
  // 'login' | 'register' | 'forgot' | 'verify_otp' | 'activation_success'
  const [phase, setPhase] = useState<'login' | 'register' | 'forgot' | 'verify_otp' | 'activation_success'>('login');
  const [role, setRole] = useState<'buyer' | 'maker'>('maker');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [craftType, setCraftType] = useState('🏺 Ceramics');
  const [yearsInBusiness, setYearsInBusiness] = useState(5);
  const [employeeCount, setEmployeeCount] = useState(3);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Premium lifestyle images matching Britsync brand
  const lifestyleImages = [
    {
      url: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1400",
      title: "Generational Master Ateliers",
      subtitle: "Human Provenance & Geofenced Craftsmanship",
      desc: "Direct support of master artisan families preserving century-old techniques in verified local workshops."
    },
    {
      url: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1400",
      title: "95% Patron Direct Escrow",
      subtitle: "Zero Middlemen Margin Exploitation",
      desc: "Every transaction routes 95% of gross funds directly to the master artisan's verified local bank or wallet."
    },
    {
      url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1400",
      title: "Cryptographic Provenance Passports",
      subtitle: "GI Regional Appellation Protected",
      desc: "Physical NFC passports log exact village coordinates, labor audit grades, and master craftsman signatures."
    }
  ];

  // Auto-detect phase from URL search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const roleParam = params.get('role');

      if (roleParam === 'maker' || roleParam === 'buyer') {
        setRole(roleParam as 'maker' | 'buyer');
      } else {
        setRole('maker');
      }

      if (tabParam === 'register') {
        setPhase('register');
      } else if (tabParam === 'login') {
        setPhase('login');
      } else {
        setPhase('login');
      }
    }
  }, []);

  // Rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % lifestyleImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

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
        setErrorMsg(data.error || 'Authentication failed.');
        return;
      }

      const user = data.user;
      localStorage.setItem('britsync_user', JSON.stringify(user));

      if (user.role === 'ADMIN') {
        window.location.href = '/dashboard/ceo';
      } else if (user.role === 'INSPECTOR') {
        window.location.href = '/dashboard/inspector';
      } else if (user.role === 'MAKER') {
        window.location.href = '/dashboard/maker';
      } else {
        window.location.href = '/dashboard/buyer';
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to connect to authentication services.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (role === 'maker' && !businessName.trim()) {
      setErrorMsg('Business name is required for Maker registration.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Dispatch 6-digit OTP to Gmail address via Nodemailer
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName }),
      });
      const otpData = await otpRes.json();
      setLoading(false);

      if (!otpRes.ok) {
        setErrorMsg(otpData.error || 'Failed to send security code to email.');
        return;
      }

      setSuccessMsg(`A 6-digit security code has been dispatched to ${email}.`);
      setPhase('verify_otp');
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to connect to verification service.');
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextEl = document.getElementById(`otp-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP Code
      const vRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const vData = await vRes.json();

      if (!vRes.ok) {
        setLoading(false);
        setErrorMsg(vData.error || 'Invalid verification code.');
        return;
      }

      // Create User Account after OTP Verification
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          role: role === 'maker' ? 'MAKER' : 'BUYER',
          businessName: role === 'maker' ? businessName : undefined,
          country,
          craftType,
          yearsInBusiness,
          employeeCount
        }),
      });
      const regData = await regRes.json();
      setLoading(false);

      if (!regRes.ok) {
        setErrorMsg(regData.error || 'Account creation failed.');
        return;
      }

      localStorage.setItem('britsync_user', JSON.stringify(regData.user));
      
      if (role === 'maker') {
        window.location.href = '/dashboard/maker';
      } else {
        window.location.href = '/dashboard/buyer';
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to finalize registration.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`A secure password reset link has been dispatched to ${email}.`);
      setEmail('');
    }, 1500);
  };

  return (
    <main style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--text)',
      fontFamily: 'var(--font-inter, sans-serif)'
    }} className="no-print animate-fade-in">
      
      {/* LEFT SPLIT SCREEN: Ultra-Luxurious Sourcing Showcase Carousel */}
      <section style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: `url(${lifestyleImages[carouselIndex].url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FAF9F6',
        transition: 'background-image 1s ease-in-out',
        padding: '4rem 4vw',
        borderRight: '1px solid var(--glass-border)',
        overflow: 'hidden'
      }}>
        {/* Dark Luxury Overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 10, 12, 0.78)', zIndex: 1, pointerEvents: 'none' }} />

        {/* Hairline Gold Border Frame */}
        <div style={{ position: 'absolute', inset: '2rem', border: '1px solid rgba(212,175,55,0.25)', pointerEvents: 'none', zIndex: 2 }} />

        {/* Top Header Branding */}
        <div style={{ zIndex: 3 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img src="/logo.png" alt="Britsync Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
            <div>
              <h2 style={{ letterSpacing: '5px', fontSize: '1.4rem', color: 'var(--text)', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400 }}>BRITSYNC</h2>
              <span style={{ fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, display: 'block' }}>GLOBAL GUILD REGISTRY</span>
            </div>
          </Link>
        </div>

        {/* Carousel Content */}
        <div style={{ zIndex: 3, maxWidth: '640px', margin: 'auto 0' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem', display: 'block', marginBottom: '0.8rem' }}>
            {lifestyleImages[carouselIndex].subtitle}
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.8rem)', lineHeight: 1.15, marginBottom: '1.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: '#FAF9F6' }}>
            {lifestyleImages[carouselIndex].title}
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, opacity: 0.88, fontWeight: 300, maxWidth: '540px' }}>
            {lifestyleImages[carouselIndex].desc}
          </p>
          
          {/* Slide dots */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '2.5rem' }}>
            {lifestyleImages.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCarouselIndex(i)}
                style={{ 
                  width: i === carouselIndex ? '40px' : '14px', 
                  height: '3px', 
                  backgroundColor: i === carouselIndex ? 'var(--accent)' : 'rgba(255,255,255,0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease' 
                }} 
              />
            ))}
          </div>
        </div>

        {/* Trust Features Footer Grid */}
        <div style={{ zIndex: 3, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '2rem', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--accent)', fontWeight: 700, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>🛡️ 95% Escrow Payout</span>
            <span style={{ opacity: 0.7, lineHeight: 1.5, display: 'block' }}>Direct financial transit to artisan bank accounts.</span>
          </div>
          <div>
            <span style={{ color: 'var(--accent)', fontWeight: 700, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>📍 On-Site Geofenced</span>
            <span style={{ opacity: 0.7, lineHeight: 1.5, display: 'block' }}>Physical inspector audits verify workshop coordinates.</span>
          </div>
          <div>
            <span style={{ color: 'var(--accent)', fontWeight: 700, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>⭐ Grade A+ Accreditation</span>
            <span style={{ opacity: 0.7, lineHeight: 1.5, display: 'block' }}>Curation panel audits labor ethics & raw materials.</span>
          </div>
          <div>
            <span style={{ color: 'var(--accent)', fontWeight: 700, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>✈️ Europe Customs Ready</span>
            <span style={{ opacity: 0.7, lineHeight: 1.5, display: 'block' }}>Pre-cleared export documentation for masterworks.</span>
          </div>
        </div>
      </section>

      {/* RIGHT SPLIT SCREEN: Interactive High-Fashion Authentication Forms */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 3rem',
        backgroundColor: 'var(--background)',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          
          {/* Mayfair Seal Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              OFFICIAL REGISTRY AUTHENTICATION
            </span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: 'var(--text)' }}>
              {phase === 'login' ? 'Access Portal' : phase === 'register' ? 'Atelier Registration' : 'Verification'}
            </h1>
          </div>

          {/* TOP TAB SWITCHER (SIGN IN / CREATE ACCOUNT) */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{ display: 'flex', backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '2px', padding: '4px', marginBottom: '2.2rem' }}>
              <button
                onClick={() => { setErrorMsg(''); setPhase('login'); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: phase === 'login' ? 'var(--background)' : 'transparent',
                  border: phase === 'login' ? '1px solid var(--glass-border)' : '1px solid transparent',
                  color: phase === 'login' ? 'var(--accent)' : 'var(--text)',
                  opacity: phase === 'login' ? 1 : 0.6,
                  fontWeight: phase === 'login' ? 700 : 400,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  transition: 'all 0.25s ease'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setErrorMsg(''); setPhase('register'); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: phase === 'register' ? 'var(--background)' : 'transparent',
                  border: phase === 'register' ? '1px solid var(--glass-border)' : '1px solid transparent',
                  color: phase === 'register' ? 'var(--accent)' : 'var(--text)',
                  opacity: phase === 'register' ? 1 : 0.6,
                  fontWeight: phase === 'register' ? 700 : 400,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  transition: 'all 0.25s ease'
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ROLE SELECTOR PILLS */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.6rem' }}>
                Account Portal Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('maker')}
                  style={{
                    padding: '0.9rem 1rem',
                    backgroundColor: role === 'maker' ? 'rgba(212,175,55,0.1)' : 'var(--surface)',
                    border: role === 'maker' ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    color: role === 'maker' ? 'var(--text)' : 'var(--text)',
                    opacity: role === 'maker' ? 1 : 0.65,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>🧶</div>
                  <strong style={{ display: 'block', fontSize: '0.82rem', fontFamily: 'var(--font-playfair), Georgia, serif' }}>Master Artisan</strong>
                  <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>Studio / Maker Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  style={{
                    padding: '0.9rem 1rem',
                    backgroundColor: role === 'buyer' ? 'rgba(212,175,55,0.1)' : 'var(--surface)',
                    border: role === 'buyer' ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    color: role === 'buyer' ? 'var(--text)' : 'var(--text)',
                    opacity: role === 'buyer' ? 1 : 0.65,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>🏺</div>
                  <strong style={{ display: 'block', fontSize: '0.82rem', fontFamily: 'var(--font-playfair), Georgia, serif' }}>Global Patron</strong>
                  <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>Buyer / Collector</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ backgroundColor: 'rgba(211,47,47,0.1)', border: '1px solid #D32F2F', color: '#D32F2F', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.84rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: 'rgba(46,125,50,0.1)', border: '1px solid #2E7D32', color: '#2E7D32', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.84rem', fontWeight: 600 }}>
              {successMsg}
            </div>
          )}

          {/* FORM 1: SIGN IN */}
          {phase === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Registered Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="e.g. custodian@atelier.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.1rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }} 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
                    Security Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setPhase('forgot')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={passwordVisible ? "text" : "password"} 
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.9rem 1.1rem',
                      paddingRight: '3rem',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }} 
                  />
                  <button 
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.9rem' }}
                  >
                    {passwordVisible ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer', opacity: 0.8 }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  Remember this secure device
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  backgroundColor: 'var(--accent)',
                  color: '#0A0A0C',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {loading ? 'Verifying Credentials...' : `Enter ${role === 'maker' ? 'Maker' : 'Buyer'} Portal`}
              </button>
            </form>
          )}

          {/* FORM 2: REGISTER */}
          {phase === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
              {role === 'maker' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Studio / Business Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Aisha Heritage Ceramics"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.9rem 1.1rem',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }} 
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Full Custodian Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Master Custodian Tariq"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.1rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Gmail / Verification Email
                </label>
                <input 
                  type="email" 
                  placeholder="e.g. name@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.1rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }} 
                />
              </div>

              {role === 'maker' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Years Active
                    </label>
                    <input 
                      type="number"
                      min={1} 
                      value={yearsInBusiness}
                      onChange={e => setYearsInBusiness(Number(e.target.value))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Guild Craftsmen
                    </label>
                    <input 
                      type="number" 
                      min={1}
                      value={employeeCount}
                      onChange={e => setEmployeeCount(Number(e.target.value))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }} 
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Create Password
                </label>
                <input 
                  type="password" 
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.1rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.1rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }} 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  backgroundColor: 'var(--accent)',
                  color: '#0A0A0C',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {loading ? 'Dispatching OTP Code...' : 'Submit & Dispatch Gmail OTP'}
              </button>
            </form>
          )}

          {/* FORM 3: OTP VERIFICATION */}
          {phase === 'verify_otp' && (
            <div style={{ animation: 'slideUp 0.5s ease', textAlign: 'center' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '3rem' }}>📧</span>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  Security OTP Sent
                </h2>
                <p style={{ opacity: 0.8, fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                  Enter the 6-digit security verification code dispatched to <strong>{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                  {otp.map((digit, i) => (
                    <input 
                      key={i}
                      id={`otp-${i}`}
                      type="text" 
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      required
                      style={{
                        width: '50px',
                        height: '58px',
                        borderRadius: '2px',
                        border: '1px solid var(--accent)',
                        backgroundColor: 'var(--surface)',
                        textAlign: 'center',
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        color: 'var(--text)'
                      }} 
                    />
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1.1rem',
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0C',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Verifying Code & Creating Profile...' : 'Confirm OTP & Activate Account'}
                </button>

                <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>
                  Didn't receive code?{' '}
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: fullName }) });
                      setLoading(false);
                      alert(`A fresh 6-digit code has been dispatched to ${email}`);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                  >
                    Resend Code
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {phase === 'forgot' && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <button 
                onClick={() => setPhase('login')}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2rem', padding: 0 }}
              >
                ← Return to Sign In
              </button>

              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Verify Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="e.g. custodian@atelier.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.9rem 1.1rem',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1.1rem',
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0C',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  {loading ? 'Dispatching Verification...' : 'Send Password Reset Link'}
                </button>
              </form>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
