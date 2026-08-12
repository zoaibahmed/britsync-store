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
      minHeight: '100vh',
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
          top: '2rem',
          left: '2rem',
          zIndex: 100,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.65rem 1.4rem',
          backgroundColor: 'rgba(10, 10, 12, 0.85)',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          fontSize: '0.72rem',
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
      {/* RIGHT PANEL — MAYFAIR LUXURY & CLEAN AUTHENTICATION FORM        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '3rem 2.5rem',
        backgroundColor: 'var(--background)',
        overflowY: 'auto'
      }}>
        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          {/* Top Brand Tag */}
          <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
            <span style={{ fontSize: '0.62rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              MAYFAIR GUILD AUTHENTICATION
            </span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: 'var(--text)', letterSpacing: '0.5px' }}>
              {phase === 'login' ? 'Sign In' : phase === 'register' ? 'Register Atelier' : 'Verify Security Code'}
            </h1>
          </div>

          {/* LUXURY UNDERLINE TAB SWITCHER */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
              <button
                onClick={() => { setErrorMsg(''); setPhase('login'); }}
                style={{
                  flex: 1,
                  padding: '0.85rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: phase === 'login' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: phase === 'login' ? 'var(--accent)' : 'var(--text)',
                  opacity: phase === 'login' ? 1 : 0.5,
                  fontWeight: phase === 'login' ? 700 : 400,
                  fontSize: '0.78rem',
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
                  padding: '0.85rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: phase === 'register' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: phase === 'register' ? 'var(--accent)' : 'var(--text)',
                  opacity: phase === 'register' ? 1 : 0.5,
                  fontWeight: phase === 'register' ? 700 : 400,
                  fontSize: '0.78rem',
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

          {/* ROLE SELECTOR CARDS */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('maker')}
                  style={{
                    padding: '0.85rem 0.9rem',
                    backgroundColor: role === 'maker' ? 'rgba(212,175,55,0.08)' : 'var(--surface)',
                    border: role === 'maker' ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    opacity: role === 'maker' ? 1 : 0.6,
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderRadius: '2px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>🧶 Master Artisan</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Maker Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  style={{
                    padding: '0.85rem 0.9rem',
                    backgroundColor: role === 'buyer' ? 'rgba(212,175,55,0.08)' : 'var(--surface)',
                    border: role === 'buyer' ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    opacity: role === 'buyer' ? 1 : 0.6,
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderRadius: '2px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>🏺 Global Patron</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Buyer Portal</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'rgba(211,47,47,0.1)', border: '1px solid #D32F2F', color: '#D32F2F', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 600 }}
            >
              {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'rgba(46,125,50,0.1)', border: '1px solid #2E7D32', color: '#2E7D32', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 600 }}
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
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }}
                onSubmit={handleLoginSubmit} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
                    Registered Email
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
                      outline: 'none',
                      borderRadius: '2px'
                    }} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <label style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setPhase('forgot')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600 }}
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
                        outline: 'none',
                        borderRadius: '2px'
                      }} 
                    />
                    <button 
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.9rem' }}
                    >
                      {passwordVisible ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.2rem 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.85 }}>
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    Remember this device
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1.05rem',
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0C',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    marginTop: '0.6rem',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? 'Verifying...' : `Access ${role === 'maker' ? 'Maker' : 'Buyer'} Portal`}
                </button>
              </motion.form>
            )}

            {/* FORM 2: REGISTER */}
            {phase === 'register' && (
              <motion.form 
                key="form-register"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}
                onSubmit={handleRegisterSubmit} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
              >
                {role === 'maker' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
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
                        outline: 'none',
                        borderRadius: '2px'
                      }} 
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
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
                      outline: 'none',
                      borderRadius: '2px'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
                    Gmail Address
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
                      outline: 'none',
                      borderRadius: '2px'
                    }} 
                  />
                </div>

                {role === 'maker' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
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
                          padding: '0.85rem',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          borderRadius: '2px'
                        }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
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
                          padding: '0.85rem',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          borderRadius: '2px'
                        }} 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
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
                      outline: 'none',
                      borderRadius: '2px'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
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
                      outline: 'none',
                      borderRadius: '2px'
                    }} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1.05rem',
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0C',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    marginTop: '0.6rem',
                    boxShadow: 'var(--shadow-sm)',
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
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ marginBottom: '1.8rem' }}>
                  <span style={{ fontSize: '2.4rem' }}>📧</span>
                  <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: '0.6rem', marginBottom: '0.3rem', color: 'var(--text)' }}>
                    Security Code Sent
                  </h2>
                  <p style={{ opacity: 0.8, fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
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
                        value={digit}
                        onChange={e => handleOtpChange(e.target.value, i)}
                        required
                        style={{
                          width: '45px',
                          height: '52px',
                          borderRadius: '2px',
                          border: '1px solid var(--accent)',
                          backgroundColor: 'var(--surface)',
                          textAlign: 'center',
                          fontSize: '1.4rem',
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
                      padding: '1rem',
                      backgroundColor: 'var(--accent)',
                      color: '#0A0A0C',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      letterSpacing: '2.5px',
                      textTransform: 'uppercase',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Verifying...' : 'Confirm OTP & Activate Account'}
                  </button>

                  <p style={{ fontSize: '0.78rem', opacity: 0.6, margin: 0 }}>
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
              </motion.div>
            )}

            {/* FORM 4: FORGOT PASSWORD */}
            {phase === 'forgot' && (
              <motion.div 
                key="form-forgot"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              >
                <button 
                  onClick={() => setPhase('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', marginBottom: '1.4rem', padding: 0 }}
                >
                  ← Return to Sign In
                </button>

                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.45rem' }}>
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
                        outline: 'none',
                        borderRadius: '2px'
                      }} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'var(--accent)',
                      color: '#0A0A0C',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      letterSpacing: '2.5px',
                      textTransform: 'uppercase',
                      border: 'none',
                      borderRadius: '2px',
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
