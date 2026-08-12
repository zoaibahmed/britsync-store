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
  const [activeGraphicStep, setActiveGraphicStep] = useState(0);

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

  // Cycle animated graphic steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveGraphicStep(prev => (prev + 1) % 3);
    }, 4500);
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

  const graphicSteps = [
    {
      title: "95% Patron Direct Escrow",
      badge: "MANAGED COMMERCE ESCROW",
      desc: "Direct financial routing ensures 95% of gross sales transit directly to the master artisan's local bank account."
    },
    {
      title: "Geofenced Inspector Audits",
      badge: "PHYSICAL PROVENANCE VERIFICATION",
      desc: "Every atelier undergoes physical on-site auditing by regional inspectors to verify labor ethics & authentic raw materials."
    },
    {
      title: "Cryptographic Provenance Ledger",
      badge: "IMMUTABLE GUILD REGISTRY",
      desc: "Every creation is issued a unique digital & physical NFC passport logging exact village coordinates and audit certificates."
    }
  ];

  return (
    <main style={{
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--text)',
      fontFamily: 'var(--font-inter, sans-serif)',
      overflow: 'hidden'
    }} className="no-print animate-fade-in">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEFT SPLIT SCREEN — ANIMATED GEOMETRIC LUXURY ARTWORK (NO PHOTOS) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0A0A0C',
        color: '#FAF9F6',
        padding: '3.5rem 4vw',
        borderRight: '1px solid var(--glass-border)',
        overflow: 'hidden'
      }}>
        {/* Subtle Hairline Grid Pattern Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.8,
          pointerEvents: 'none'
        }} />

        {/* Outer Hairline Gold Border Frame */}
        <div style={{ position: 'absolute', inset: '1.8rem', border: '1px solid rgba(212,175,55,0.2)', pointerEvents: 'none', zIndex: 2 }} />

        {/* TOP BRAND HEADER */}
        <div style={{ zIndex: 10, position: 'relative' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.85rem' }}>
            <img src="/logo.png" alt="Britsync Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
            <div>
              <h2 style={{ letterSpacing: '5px', fontSize: '1.35rem', color: '#FAF9F6', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400 }}>BRITSYNC</h2>
              <span style={{ fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block' }}>HERITAGE GUILD REGISTRY</span>
            </div>
          </Link>
        </div>

        {/* CENTER — ANIMATED VECTOR GEOMETRY SHOWCASE */}
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0', width: '100%', maxWidth: '580px' }}>
          {/* Animated Vector Gold Guild Emblem */}
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer Spinning Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1px dashed rgba(212, 175, 55, 0.4)'
              }}
            />
            {/* Inner Counter-Spinning Octagon */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
              style={{
                position: 'absolute',
                inset: '16px',
                borderRadius: '50%',
                border: '1px solid rgba(212, 175, 55, 0.25)'
              }}
            />
            {/* Center Pulsing Shield Emblem */}
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{
                width: '74px',
                height: '74px',
                backgroundColor: '#0A0A0C',
                border: '2px solid #D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)'
              }}
            >
              🛡️
            </motion.div>
          </div>

          {/* Dynamic Animated Text Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGraphicStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center' }}
            >
              <span style={{ color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.72rem', display: 'block', marginBottom: '0.8rem' }}>
                {graphicSteps[activeGraphicStep].badge}
              </span>
              <h1 style={{ fontSize: 'clamp(2rem, 3vw, 3.2rem)', lineHeight: 1.2, marginBottom: '1.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: '#FAF9F6' }}>
                {graphicSteps[activeGraphicStep].title}
              </h1>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.8, fontWeight: 300, maxWidth: '480px', margin: '0 auto' }}>
                {graphicSteps[activeGraphicStep].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Animated Step Bars */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '2.5rem' }}>
            {graphicSteps.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setActiveGraphicStep(i)}
                style={{ 
                  width: i === activeGraphicStep ? '40px' : '14px', 
                  height: '3px', 
                  backgroundColor: i === activeGraphicStep ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease' 
                }} 
              />
            ))}
          </div>
        </div>

        {/* BOTTOM STATS METRICS GRID */}
        <div style={{ zIndex: 10, position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.8rem', textAlign: 'center' }}>
          <div>
            <span style={{ color: '#D4AF37', fontSize: '1.4rem', fontWeight: 300, fontFamily: 'var(--font-playfair), Georgia, serif', display: 'block' }}>95%</span>
            <span style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7 }}>Artisan Payout</span>
          </div>
          <div>
            <span style={{ color: '#FAF9F6', fontSize: '1.4rem', fontWeight: 300, fontFamily: 'var(--font-playfair), Georgia, serif', display: 'block' }}>Grade A+</span>
            <span style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7 }}>Geofence Audit</span>
          </div>
          <div>
            <span style={{ color: '#D4AF37', fontSize: '1.4rem', fontWeight: 300, fontFamily: 'var(--font-playfair), Georgia, serif', display: 'block' }}>100%</span>
            <span style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7 }}>NFC Passports</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* RIGHT SPLIT SCREEN — COMPACT, ANIMATED & ULTRA-SLEEK FORM        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        backgroundColor: 'var(--background)',
        overflowY: 'auto'
      }}>
        {/* Compact Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: '100%', maxWidth: '390px' }}
        >
          {/* Header Seal */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.62rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              OFFICIAL AUTHENTICATION
            </span>
            <h1 style={{ fontSize: '1.9rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: 'var(--text)' }}>
              {phase === 'login' ? 'Sign In' : phase === 'register' ? 'Register Atelier' : 'Verify Security Code'}
            </h1>
          </div>

          {/* COMPACT GOLD TAB SWITCHER */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{ display: 'flex', backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '2px', padding: '3px', marginBottom: '1.8rem' }}>
              <button
                onClick={() => { setErrorMsg(''); setPhase('login'); }}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  backgroundColor: phase === 'login' ? 'var(--background)' : 'transparent',
                  border: phase === 'login' ? '1px solid var(--glass-border)' : '1px solid transparent',
                  color: phase === 'login' ? 'var(--accent)' : 'var(--text)',
                  opacity: phase === 'login' ? 1 : 0.65,
                  fontWeight: phase === 'login' ? 700 : 400,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  transition: 'all 0.25s ease'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setErrorMsg(''); setPhase('register'); }}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  backgroundColor: phase === 'register' ? 'var(--background)' : 'transparent',
                  border: phase === 'register' ? '1px solid var(--glass-border)' : '1px solid transparent',
                  color: phase === 'register' ? 'var(--accent)' : 'var(--text)',
                  opacity: phase === 'register' ? 1 : 0.65,
                  fontWeight: phase === 'register' ? 700 : 400,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  transition: 'all 0.25s ease'
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ROLE SELECTOR PILLS */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{ marginBottom: '1.6rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('maker')}
                  style={{
                    padding: '0.75rem 0.8rem',
                    backgroundColor: role === 'maker' ? 'rgba(212,175,55,0.1)' : 'var(--surface)',
                    border: role === 'maker' ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    opacity: role === 'maker' ? 1 : 0.6,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>🧶 Master Artisan</span>
                  <span style={{ fontSize: '0.64rem', opacity: 0.7 }}>Maker Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  style={{
                    padding: '0.75rem 0.8rem',
                    backgroundColor: role === 'buyer' ? 'rgba(212,175,55,0.1)' : 'var(--surface)',
                    border: role === 'buyer' ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    opacity: role === 'buyer' ? 1 : 0.6,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>🏺 Global Patron</span>
                  <span style={{ fontSize: '0.64rem', opacity: 0.7 }}>Buyer Portal</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'rgba(211,47,47,0.1)', border: '1px solid #D32F2F', color: '#D32F2F', padding: '0.8rem 1rem', marginBottom: '1.2rem', fontSize: '0.8rem', fontWeight: 600 }}
            >
              {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'rgba(46,125,50,0.1)', border: '1px solid #2E7D32', color: '#2E7D32', padding: '0.8rem 1rem', marginBottom: '1.2rem', fontSize: '0.8rem', fontWeight: 600 }}
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
                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.3 }}
                onSubmit={handleLoginSubmit} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                      padding: '0.8rem 1rem',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
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
                        padding: '0.8rem 1rem',
                        paddingRight: '2.8rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }} 
                    />
                    <button 
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.85rem' }}
                    >
                      {passwordVisible ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', cursor: 'pointer', opacity: 0.85 }}>
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
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
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
                initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.3 }}
                onSubmit={handleRegisterSubmit} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.05rem' }}
              >
                {role === 'maker' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                        padding: '0.8rem 1rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }} 
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                      padding: '0.8rem 1rem',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                      padding: '0.8rem 1rem',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }} 
                  />
                </div>

                {role === 'maker' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                          padding: '0.75rem 0.8rem',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text)',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                          padding: '0.75rem 0.8rem',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text)',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }} 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                      padding: '0.8rem 1rem',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                      padding: '0.8rem 1rem',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }} 
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
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
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
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>📧</span>
                  <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: '0.8rem', marginBottom: '0.4rem', color: 'var(--text)' }}>
                    Security Code Sent
                  </h2>
                  <p style={{ opacity: 0.8, fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>
                    Enter the 6-digit security verification code dispatched to <strong>{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', alignItems: 'center' }}>
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
                          fontSize: '1.5rem',
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
                      padding: '0.95rem',
                      backgroundColor: 'var(--accent)',
                      color: '#0A0A0C',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '2.5px',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Verifying...' : 'Confirm OTP & Activate Account'}
                  </button>

                  <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>
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
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => setPhase('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginBottom: '1.5rem', padding: 0 }}
                >
                  ← Return to Sign In
                </button>

                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
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
                        padding: '0.8rem 1rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }} 
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
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '2.5px',
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
