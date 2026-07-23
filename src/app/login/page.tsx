'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  // Navigation & Form Phases
  // 'selection' -> choose role (buyer vs maker)
  // 'login' | 'register' | 'forgot' | 'verify_otp' | 'verify_email' | 'activation_success'
  // 'onboarding_review' | 'onboarding_rejected' | 'onboarding_approved'
  const [phase, setPhase] = useState<'selection' | 'login' | 'register' | 'forgot' | 'verify_otp' | 'verify_email' | 'activation_success' | 'onboarding_review' | 'onboarding_rejected' | 'onboarding_approved'>('selection');
  const [role, setRole] = useState<'buyer' | 'maker' | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 4
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Premium lifestyle images matching Britsync brand
  const lifestyleImages = [
    {
      url: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1200",
      title: "Generational Crafts",
      desc: "Direct support of artisan families preserving heritage skills in local workshops."
    },
    {
      url: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1200",
      title: "Human Verified",
      desc: "Physical geofenced on-site audits validating labor ethics and material origins."
    },
    {
      url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1200",
      title: "Export Ready",
      desc: "Curated GI-marked pieces integrated with automated Europe customs clearance."
    }
  ];

  // Rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % lifestyleImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Password strength meter
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    setPasswordStrength(score);
  };

  const handleRoleSelection = (selectedRole: 'buyer' | 'maker') => {
    setRole(selectedRole);
    setPhase('login');
  };

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
        window.location.href = '/dashboard/admin';
      } else if (user.role === 'INSPECTOR') {
        window.location.href = '/dashboard/inspector';
      } else if (user.role === 'MAKER') {
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('reject')) {
          setPhase('onboarding_rejected');
        } else if (lowerEmail.includes('pending') || lowerEmail.includes('review') || !lowerEmail.includes('approved')) {
          setPhase('onboarding_review');
        } else {
          setPhase('onboarding_approved');
        }
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
    if (passwordStrength < 3) {
      setErrorMsg('Please create a stronger password (include uppercase, number, symbol).');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          role: role === 'maker' ? 'MAKER' : 'BUYER',
          businessName: role === 'maker' ? businessName : undefined,
          country
        })
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed.');
        return;
      }

      localStorage.setItem('britsync_user', JSON.stringify(data.user));
      setPhase('verify_otp');
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to connect to registration services.');
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextEl = document.getElementById(`otp-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhase('activation_success');
    }, 1200);
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
      fontFamily: 'var(--font-inter)'
    }} className="no-print animate-fade-in">
      
      {/* LEFT SPLIT SCREEN: Luxury Sourcing Showcase Carousel */}
      <section style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '4rem 5rem',
        backgroundImage: `linear-gradient(to bottom, rgba(17, 21, 20, 0.6) 0%, rgba(17, 21, 20, 0.9) 100%), url(${lifestyleImages[carouselIndex].url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FAF9F6',
        transition: 'background-image 1s ease-in-out',
        overflow: 'hidden'
      }}>
        {/* Top Header branding */}
        <div style={{ zIndex: 2 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ letterSpacing: '4px', fontSize: '1.8rem', color: '#D4AF37', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', fontWeight: 600 }}>Britsync</h2>
            <span style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.8, color: '#FAF9F6' }}>Managed Trust Marketplace</span>
          </Link>
        </div>

        {/* Carousel Content */}
        <div style={{ zIndex: 2, maxWidth: '600px', marginBottom: '4rem' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', display: 'block', marginBottom: '1rem' }}>Ecosystem Foundations</span>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.2, marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
            {lifestyleImages[carouselIndex].title}
          </h1>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.7, opacity: 0.9 }}>
            {lifestyleImages[carouselIndex].desc}
          </p>
          
          {/* Slide dots */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
            {lifestyleImages.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCarouselIndex(i)}
                style={{ 
                  width: '30px', 
                  height: '3px', 
                  backgroundColor: i === carouselIndex ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s' 
                }} 
              />
            ))}
          </div>
        </div>

        {/* Trust features footer list */}
        <div style={{ zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem', fontSize: '0.85rem' }}>
          <div>🛡️ <strong>Curated Marketplace</strong><span style={{ display: 'block', opacity: 0.7 }}>Handpicked elite global heritage products.</span></div>
          <div>📍 <strong>Product Passports</strong><span style={{ display: 'block', opacity: 0.7 }}>Cryptographic GPS coordinates of workshops.</span></div>
          <div>🤝 <strong>Human Verified</strong><span style={{ display: 'block', opacity: 0.7 }}>Physical audits ensure ethical workspaces.</span></div>
          <div>✈️ <strong>Europe Export Ready</strong><span style={{ display: 'block', opacity: 0.7 }}>Pre-cleared customs clearance and duties.</span></div>
        </div>
      </section>

      {/* RIGHT SPLIT SCREEN: Interactive Authentication forms */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 3rem',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          
          {/* PHASE 1: ROLE SELECTION */}
          {phase === 'selection' && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginBottom: '0.75rem' }}>Welcome to Britsync</h1>
                <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>Select your portal to continue into our managed commerce ecosystem.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div 
                  onClick={() => handleRoleSelection('buyer')}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '16px',
                    padding: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    backgroundColor: '#fff'
                  }}
                  className="role-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🏺</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Buyer Hub</span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', margin: '0 0 0.5rem' }}>Continue as Buyer</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>Discover, verify, and purchase legacy handmade crafts from elite world communities.</p>
                </div>

                <div 
                  onClick={() => handleRoleSelection('maker')}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '16px',
                    padding: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    backgroundColor: '#fff'
                  }}
                  className="role-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🧶</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Artisan Partner</span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', margin: '0 0 0.5rem' }}>Continue as Maker</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>Onboard your workshop studio, upload credentials, and export to international buyers.</p>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 2: LOGIN */}
          {phase === 'login' && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <button 
                onClick={() => setPhase('selection')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2.5rem', padding: 0 }}
              >
                ← Back
              </button>

              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginBottom: '0.5rem' }}>
                  {role === 'maker' ? 'Maker Sign In' : 'Buyer Sign In'}
                </h1>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>
                  Enter your verification email to enter the dashboard.
                </p>
              </div>

              {errorMsg && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMsg}</div>}

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Registered Email</label>
                  <input 
                    type="email" 
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Secure Password</label>
                    <button 
                      type="button" 
                      onClick={() => setPhase('forgot')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}
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
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem', paddingRight: '3rem' }} 
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    Remember this device
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-accent" 
                  style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}
                >
                  {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
                </button>
              </form>

              {/* OAuth Buttons */}
              <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button onClick={() => alert('Simulating secure Google Sign-In redirect...')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Google
                </button>
                <button onClick={() => alert('Simulating secure Apple Sign-In redirect...')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Apple
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                Don't have an account?{' '}
                <button 
                  onClick={() => { setErrorMsg(''); setPhase('register'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}
                >
                  Create one now
                </button>
              </p>
            </div>
          )}

          {/* PHASE 3: REGISTRATION */}
          {phase === 'register' && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <button 
                onClick={() => setPhase('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2.5rem', padding: 0 }}
              >
                ← Back to Login
              </button>

              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginBottom: '0.5rem' }}>
                  {role === 'maker' ? 'Register Studio' : 'Create Account'}
                </h1>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>
                  {role === 'maker' 
                    ? 'Start your application. Every maker is manually audited before international export approval.'
                    : 'Discover legacy items by verified global artisans.'
                  }
                </p>
              </div>

              {errorMsg && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMsg}</div>}

              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {role === 'maker' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Business / Studio Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Aisha Heritage Textiles"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jane Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                  />
                </div>

                {role === 'maker' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +92 300 1234567"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      required
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Country</label>
                    <input 
                      type="text" 
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      required
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Password Strength</label>
                    <div style={{ display: 'flex', gap: '4px', height: '8px', marginTop: '1rem' }}>
                      {[1, 2, 3, 4].map(idx => (
                        <div 
                          key={idx} 
                          style={{ 
                            flex: 1, 
                            borderRadius: '4px',
                            backgroundColor: idx <= passwordStrength 
                              ? (passwordStrength <= 2 ? '#E65100' : 'var(--success)') 
                              : '#eee' 
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Choose Password</label>
                  <input 
                    type="password" 
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); calculatePasswordStrength(e.target.value); }}
                    required
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                  />
                </div>

                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', lineHeight: 1.4, alignItems: 'flex-start', marginTop: '0.5rem' }}>
                  <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} style={{ marginTop: '3px' }} />
                  <span>
                    I represent that the information is true and agree to Britsync's{' '}
                    <a href="/terms" target="_blank" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Terms of Service</a> &{' '}
                    <a href="/privacy" target="_blank" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Privacy Policy</a>.
                  </span>
                </label>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-accent" 
                  style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}
                >
                  {loading ? 'Creating Secure Profile...' : 'Submit Profile Application'}
                </button>
              </form>
            </div>
          )}

          {/* PHASE 4: FORGOT PASSWORD */}
          {phase === 'forgot' && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <button 
                onClick={() => { setErrorMsg(''); setSuccessMsg(''); setPhase('login'); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2.5rem', padding: 0 }}
              >
                ← Return to Login
              </button>

              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginBottom: '0.5rem' }}>Reset Password</h1>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>
                  Enter your email address and we will dispatch a secure one-time credentials validation link.
                </p>
              </div>

              {successMsg && <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{successMsg}</div>}
              {errorMsg && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMsg}</div>}

              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>Verify Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-accent" 
                  style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}
                >
                  {loading ? 'Dispatching Verification...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          )}

          {/* PHASE 5: OTP VERIFICATION */}
          {phase === 'verify_otp' && (
            <div style={{ animation: 'slideUp 0.5s ease', textAlign: 'center' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '3rem' }}>📧</span>
                <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginTop: '1rem', marginBottom: '0.5rem' }}>Security OTP Sent</h1>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>
                  Enter the 4-digit code dispatched to your registered email to activate your account.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  {otp.map((digit, i) => (
                    <input 
                      key={i}
                      id={`otp-${i}`}
                      type="text" 
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      required
                      style={{ width: '60px', height: '60px', borderRadius: '12px', border: '2px solid #ccc', textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }} 
                    />
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-accent" 
                  style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {loading ? 'Activating Profile...' : 'Confirm OTP Activation'}
                </button>

                <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>
                  Didn't receive code?{' '}
                  <button type="button" onClick={() => alert('A fresh activation code was sent.')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
                    Resend Code
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* PHASE 6: ACTIVATION SUCCESS */}
          {phase === 'activation_success' && (
            <div style={{ animation: 'slideUp 0.5s ease', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#E8F5E9', borderRadius: '50%', color: '#2E7D32', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>✓</div>
              <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginBottom: '1rem' }}>Profile Activated</h1>
              <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                Your Britsync security key pair has been cryptographically generated. Your profile is 100% active and validated.
              </p>

              <button 
                onClick={() => {
                  if (role === 'maker') {
                    setPhase('onboarding_review');
                  } else {
                    window.location.href = '/dashboard/buyer';
                  }
                }}
                className="btn-accent" 
                style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                {role === 'maker' ? 'Enter Maker Onboarding Workflow' : 'Access Buyer Portal'}
              </button>
            </div>
          )}

          {/* PHASE 7: MAKER ONBOARDING REVIEW STATE */}
          {phase === 'onboarding_review' && (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <span style={{ fontSize: '3rem' }}>⏳</span>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginTop: '1rem', marginBottom: '0.5rem' }}>Application Submitted</h1>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Estimated Review Time: <strong>48 Hours</strong></p>
              </div>

              {/* Onboarding Review Timeline */}
              <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '2rem', fontWeight: 'bold' }}>Application Progress Log</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', borderLeft: '2px solid var(--secondary)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
                  {[
                    { label: 'Application Submitted', desc: 'Maker registration details successfully recorded.', active: true },
                    { label: 'Documents Under Review', desc: 'Verify tax records, studio address, and guild certifications.', active: true },
                    { label: 'Verification In Progress', desc: 'Automated geofence tracking and product class categorization.', active: false },
                    { label: 'Inspector Assignment (Elite Only)', desc: 'Regional field inspector Tariq M. scheduled for workshop audit.', active: false },
                    { label: 'Approval Pending', desc: 'Final sign-off by Britsync Quality Trust Board.', active: false }
                  ].map((step, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-29px',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: step.active ? 'var(--accent)' : '#eee'
                      }} />
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: step.active ? 'var(--primary)' : '#aaa' }}>{step.label}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', opacity: step.active ? 0.7 : 0.4, marginTop: '0.25rem', lineHeight: 1.4 }}>{step.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setPhase('onboarding_rejected')}
                  style={{ flex: 1, padding: '0.85rem', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontSize: '0.85rem' }}
                >
                  Simulate Rejection
                </button>
                <button 
                  onClick={() => setPhase('onboarding_approved')}
                  className="btn-accent"
                  style={{ flex: 1, padding: '0.85rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Simulate Approval
                </button>
              </div>
            </div>
          )}

          {/* PHASE 8: MAKER ONBOARDING REJECTED STATE */}
          {phase === 'onboarding_rejected' && (
            <div style={{ animation: 'slideUp 0.5s ease', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#FFEBEE', borderRadius: '50%', color: '#C62828', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>✗</div>
              <h1 style={{ fontSize: '2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginBottom: '1rem' }}>Documents Rejected</h1>
              <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Reason: <strong>Invalid Address Verification & Missing Sindh Guild License #SAG-204</strong>
              </p>

              <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '2.5rem', backgroundColor: '#fff', borderLeft: '4px solid #C62828' }}>
                <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Inspector Note:</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.5 }}>Please upload a clear scan of the official regional guild certificate showing active registry date and founder credentials matching Jane Doe.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    setErrorMsg('');
                    setPhase('register');
                  }}
                  className="btn-accent" 
                  style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Resubmit Application Documents
                </button>
                <button 
                  onClick={() => setPhase('onboarding_review')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                >
                  Back to Status Timeline
                </button>
              </div>
            </div>
          )}

          {/* PHASE 9: MAKER ONBOARDING APPROVED WELCOME STATE */}
          {phase === 'onboarding_approved' && (
            <div style={{ animation: 'slideUp 0.5s ease', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#E8F5E9', borderRadius: '50%', color: '#2E7D32', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>⭐</div>
              <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginBottom: '1rem' }}>Approved Partner!</h1>
              <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                Congratulations! Aisha Heritage Textiles is verified and registered in the Britsync Global Database.
              </p>

              <div className="card" style={{ padding: '2rem', textAlign: 'left', marginBottom: '3rem' }}>
                <h4 style={{ margin: '0 0 1rem', color: 'var(--primary)' }}>Artisan Onboarding Steps</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div>🟢 <strong>Step 1: Set Wallet Preferences</strong> (Stripe Connect/Wise)</div>
                  <div>🟢 <strong>Step 2: List Crafts Catalog</strong> (Minimum 1 item)</div>
                  <div>⚪ <strong>Step 3: Setup Optional Elite Audits</strong> (Free geofence scan)</div>
                </div>
              </div>

              <Link href="/dashboard/maker" style={{ textDecoration: 'none' }}>
                <button 
                  className="btn-accent" 
                  style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Go to Maker Dashboard
                </button>
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* Embedded Animations styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .role-card:hover {
          border-color: var(--accent) !important;
          box-shadow: var(--shadow-md) !important;
          transform: translateY(-2px);
        }
      `}} />

    </main>
  );
}
