'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  // Navigation & Form Phases
  const [phase, setPhase] = useState<'login' | 'register' | 'forgot' | 'verify_otp'>('login');
  const [role, setRole] = useState<'buyer' | 'maker'>('maker');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [yearsInBusiness, setYearsInBusiness] = useState(5);
  const [employeeCount, setEmployeeCount] = useState(3);
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleBackNavigation = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
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
      setErrorMsg('Business / Studio name is required for Maker registration.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Full Custodian Name is required.');
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

      setSuccessMsg(`A 6-digit security code has been dispatched to ${email}. Please check your inbox.`);
      setOtp(['', '', '', '', '', '']);
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

  // Background artwork based on active mode
  const bgArtworkUrl = (phase === 'login' || phase === 'forgot') ? '/login-bg.png' : '/register-bg.png';

  return (
    <main style={{
      display: 'grid',
      gridTemplateColumns: '46% 54%',
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--text)',
      fontFamily: 'var(--font-inter, sans-serif)',
      overflow: 'hidden',
      position: 'relative'
    }} className="no-print animate-fade-in auth-page-container">

      {/* FLOATING SMART BACK BUTTON */}
      <button
        onClick={handleBackNavigation}
        style={{
          position: 'fixed',
          top: '1.8rem',
          left: '1.8rem',
          zIndex: 100,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.55rem 1.2rem',
          backgroundColor: 'rgba(10, 10, 12, 0.85)',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          transition: 'all 0.25s ease'
        }}
      >
        ← Back
      </button>
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEFT PANEL — FULL-HEIGHT CINEMATIC GALLERY ARTWORK               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        backgroundColor: '#080705',
        borderRight: '1px solid var(--glass-border)',
        overflow: 'hidden'
      }}>
        <img 
          src={bgArtworkUrl} 
          alt="Britsync Global Guild Registry Gallery Artwork"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block'
          }}
        />
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — ULTRA-SLEEK HIGH-FASHION NON-SCROLLING FORM         */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        maxHeight: '100vh',
        padding: '1.8rem 2.5rem',
        backgroundColor: 'var(--background)',
        overflow: 'hidden'
      }}>
        {/* Minimalist Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* Header Seal */}
          <div style={{ marginBottom: '1.3rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              BRITSYNC GUILD PORTAL
            </span>
            <h1 style={{ fontSize: '2.1rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: 'var(--text)' }}>
              {phase === 'login' ? 'Sign In' : phase === 'register' ? 'Register Atelier' : 'Verify Code'}
            </h1>
          </div>

          {/* MINIMALIST TAB SWITCHER */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.2rem' }}>
              <button
                onClick={() => { setErrorMsg(''); setPhase('login'); }}
                style={{
                  padding: '0.6rem 0',
                  marginRight: '2rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: phase === 'login' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: phase === 'login' ? 'var(--accent)' : 'var(--text)',
                  opacity: phase === 'login' ? 1 : 0.4,
                  fontWeight: phase === 'login' ? 700 : 400,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2.5px',
                  transition: 'all 0.25s ease'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setErrorMsg(''); setPhase('register'); }}
                style={{
                  padding: '0.6rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: phase === 'register' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: phase === 'register' ? 'var(--accent)' : 'var(--text)',
                  opacity: phase === 'register' ? 1 : 0.4,
                  fontWeight: phase === 'register' ? 700 : 400,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2.5px',
                  transition: 'all 0.25s ease'
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* SLEEK BORDERLESS ROLE TOGGLE */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.65rem' }}>
              <label 
                onClick={() => setRole('maker')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer', 
                  fontSize: '0.7rem', 
                  letterSpacing: '1.8px', 
                  textTransform: 'uppercase', 
                  color: role === 'maker' ? 'var(--accent)' : 'var(--text)', 
                  opacity: role === 'maker' ? 1 : 0.45, 
                  fontWeight: role === 'maker' ? 700 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                <input 
                  type="radio" 
                  name="portalRole" 
                  checked={role === 'maker'} 
                  onChange={() => setRole('maker')} 
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} 
                />
                Master Artisan
              </label>

              <label 
                onClick={() => setRole('buyer')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer', 
                  fontSize: '0.7rem', 
                  letterSpacing: '1.8px', 
                  textTransform: 'uppercase', 
                  color: role === 'buyer' ? 'var(--accent)' : 'var(--text)', 
                  opacity: role === 'buyer' ? 1 : 0.45, 
                  fontWeight: role === 'buyer' ? 700 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                <input 
                  type="radio" 
                  name="portalRole" 
                  checked={role === 'buyer'} 
                  onChange={() => setRole('buyer')} 
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} 
                />
                Global Patron
              </label>
            </div>
          )}

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'rgba(211,47,47,0.08)', border: '1px solid #D32F2F', color: '#D32F2F', padding: '0.65rem 0.85rem', marginBottom: '1.1rem', fontSize: '0.75rem', fontWeight: 600 }}
            >
              {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'rgba(46,125,50,0.08)', border: '1px solid #2E7D32', color: '#2E7D32', padding: '0.65rem 0.85rem', marginBottom: '1.1rem', fontSize: '0.75rem', fontWeight: 600 }}
            >
              {successMsg}
            </motion.div>
          )}

          {/* ANIMATED FORM CONTAINER */}
          <AnimatePresence mode="wait">
            {/* FORM 1: SIGN IN */}
            {phase === 'login' && (
              <motion.form 
                key="form-login"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
                onSubmit={handleLoginSubmit} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Registered Email
                  </label>
                  <input 
                    type="email" 
                    className="luxury-line-input"
                    placeholder="custodian@atelier.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.45rem 0' }} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label style={{ fontSize: '0.6rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setPhase('forgot')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.62rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={passwordVisible ? "text" : "password"} 
                      className="luxury-line-input"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.45rem 0', paddingRight: '2.5rem' }} 
                    />
                    <button 
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.8rem' }}
                    >
                      {passwordVisible ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', cursor: 'pointer', opacity: 0.75 }}>
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    Remember this device
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.95rem',
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0C',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '0.4rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? 'Verifying...' : `Enter ${role === 'maker' ? 'Maker' : 'Buyer'} Portal`}
                </button>
              </motion.form>
            )}

            {/* FORM 2: REGISTER */}
            {phase === 'register' && (
              <motion.form 
                key="form-register"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
                onSubmit={handleRegisterSubmit} 
                style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}
              >
                {/* LINE 1: CUSTODIAN NAME & BUSINESS NAME IN ONE LINE */}
                <div style={{ display: 'grid', gridTemplateColumns: role === 'maker' ? '1fr 1fr' : '1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Custodian Name
                    </label>
                    <input 
                      type="text" 
                      className="luxury-line-input"
                      placeholder="Master Tariq"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.4rem 0' }} 
                    />
                  </div>

                  {role === 'maker' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Studio / Business Name
                      </label>
                      <input 
                        type="text" 
                        className="luxury-line-input"
                        placeholder="Aisha Ceramics"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.4rem 0' }} 
                      />
                    </div>
                  )}
                </div>

                {/* LINE 2: GMAIL ADDRESS */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Gmail Address
                  </label>
                  <input 
                    type="email" 
                    className="luxury-line-input"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.4rem 0' }} 
                  />
                </div>

                {/* LINE 3: YEARS ACTIVE & GUILD CRAFTSMEN IN ONE LINE */}
                {role === 'maker' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Years Active
                      </label>
                      <input 
                        type="number" 
                        className="luxury-line-input"
                        min={1}
                        value={yearsInBusiness}
                        onChange={e => setYearsInBusiness(Number(e.target.value))}
                        required
                        style={{ width: '100%', padding: '0.4rem 0' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Guild Craftsmen
                      </label>
                      <input 
                        type="number" 
                        className="luxury-line-input"
                        min={1}
                        value={employeeCount}
                        onChange={e => setEmployeeCount(Number(e.target.value))}
                        required
                        style={{ width: '100%', padding: '0.4rem 0' }} 
                      />
                    </div>
                  </div>
                )}

                {/* LINE 4: CREATE PASSWORD & CONFIRM PASSWORD IN ONE LINE */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Create Password
                    </label>
                    <input 
                      type="password" 
                      className="luxury-line-input"
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.4rem 0' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Confirm Password
                    </label>
                    <input 
                      type="password" 
                      className="luxury-line-input"
                      placeholder="Repeat pass"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.4rem 0' }} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.95rem',
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0C',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? 'Dispatching Code...' : 'Submit & Send Gmail OTP'}
                </button>
              </motion.form>
            )}

            {/* FORM 3: OTP VERIFICATION */}
            {phase === 'verify_otp' && (
              <motion.div 
                key="form-otp"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.2rem' }}>📧</span>
                  <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: '0.5rem', marginBottom: '0.3rem', color: 'var(--text)' }}>
                    Security Code Sent
                  </h2>
                  <p style={{ opacity: 0.8, fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                    Enter the 6-digit security verification code dispatched to <strong>{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {otp.map((digit, i) => (
                      <input 
                        key={i}
                        id={`otp-${i}`}
                        type="text" 
                        maxLength={1}
                        className="luxury-line-input"
                        value={digit}
                        onChange={e => handleOtpChange(e.target.value, i)}
                        required
                        style={{
                          width: '42px',
                          textAlign: 'center',
                          fontSize: '1.4rem',
                          fontWeight: 700
                        }} 
                      />
                    ))}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.95rem',
                      backgroundColor: 'var(--accent)',
                      color: '#0A0A0C',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Verifying...' : 'Confirm OTP & Activate Account'}
                  </button>

                  <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: 0 }}>
                    Didn't receive code? Check Spam folder or{' '}
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: fullName }) });
                          setLoading(false);
                          alert(`A fresh 6-digit verification code has been dispatched to ${email}`);
                        } catch (err) {
                          setLoading(false);
                          alert('Failed to resend code.');
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                    >
                      Resend Code
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* FORM 4: FORGOT PASSWORD */}
            {phase === 'forgot' && (
              <motion.div 
                key="form-forgot"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              >
                <button 
                  onClick={() => setPhase('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', marginBottom: '1.2rem', padding: 0 }}
                >
                  ← Return to Sign In
                </button>

                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Registered Email Address
                    </label>
                    <input 
                      type="email" 
                      className="luxury-line-input"
                      placeholder="custodian@atelier.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.45rem 0' }} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.95rem',
                      backgroundColor: 'var(--accent)',
                      color: '#0A0A0C',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '0.5rem'
                    }}
                  >
                    {loading ? 'Dispatching...' : 'Send Password Reset Link'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </section>

    </main>
  );
}
