'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from '@/components/CustomCursor';
import ThemeLogo from '@/components/ThemeLogo';

const CRAFT_CATEGORIES = [
  { id: 'ceramics', label: 'Ceramics & Pottery' },
  { id: 'textiles', label: 'Textiles & Weaving' },
  { id: 'jewelry', label: 'Jewelry & Precious Metals' },
  { id: 'woodwork', label: 'Woodwork & Joinery' },
  { id: 'leather', label: 'Leather Crafting' },
  { id: 'homedecor', label: 'Home Decor & Glassware' },
];

export default function LoginPage() {
  const router = useRouter();

  // Theme Management ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navigation & Form Phases
  const [phase, setPhase] = useState<'login' | 'register' | 'forgot' | 'verify_otp'>('login');
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<'buyer' | 'maker'>('maker');

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Step 2: Profile
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [phone, setPhone] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState(5);
  const [employeeCount, setEmployeeCount] = useState(3);
  const [preferredName, setPreferredName] = useState('');

  // Step 3: Heritage / Interests
  const [primaryCraft, setPrimaryCraft] = useState('Ceramics & Pottery');
  const [craftTradition, setCraftTradition] = useState('Hand-thrown stoneware');
  const [atelierDescription, setAtelierDescription] = useState('');
  const [selectedPatronInterests, setSelectedPatronInterests] = useState<string[]>(['ceramics', 'jewelry']);

  // OTP Verification
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync theme with document & URL query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('britsync_theme');
      const currentAttr = document.documentElement.getAttribute('data-theme');
      let activeTheme: 'dark' | 'light' = 'dark';
      if (savedTheme === 'light' || savedTheme === 'dark') {
        activeTheme = savedTheme;
      } else if (currentAttr === 'light' || currentAttr === 'dark') {
        activeTheme = currentAttr as 'dark' | 'light';
      }
      setTheme(activeTheme);

      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const roleParam = params.get('role');

      if (roleParam === 'maker' || roleParam === 'buyer') {
        setRole(roleParam as 'maker' | 'buyer');
      }

      if (tabParam === 'register') {
        setPhase('register');
        setRegisterStep(1);
      } else {
        setPhase('login');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('britsync_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const ref = document.referrer;
      const sameOrigin = ref && ref.startsWith(window.location.origin);
      if (sameOrigin || window.history.length > 2) {
        router.back();
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  const validateEmail = (emailStr: string) => /\S+@\S+\.\S+/.test(emailStr);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'None', color: '#4a4030', score: 0 };
    if (pass.length < 6) return { label: 'Weak', color: '#f87171', score: 1 };
    if (pass.length < 10 || !/\d/.test(pass) || !/[A-Z]/.test(pass)) {
      return { label: 'Fair', color: '#f59e6a', score: 2 };
    }
    return { label: 'Strong', color: '#4ade80', score: 3 };
  };

  const passwordStrength = getPasswordStrength(password);

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
        if (data.requiresOtp) {
          setErrorMsg('Your email address is not yet verified. Please check your inbox for the 6-digit OTP code.');
        } else {
          setErrorMsg(data.error || 'Authentication failed.');
        }
        return;
      }

      const user = data.user;
      localStorage.setItem('britsync_user', JSON.stringify(user));

      const staffRoles = [
        'CEO', 'SUPER_ADMIN', 'ADMIN', 'ACCREDITATION_OFFICER', 'INSPECTOR',
        'CATALOG_CURATOR', 'FINANCE_OFFICER', 'FULFILLMENT_OFFICER', 'CONCIERGE',
        'PROVENANCE_OFFICER', 'BI_OFFICER', 'PLATFORM_ADMIN', 'INTERNAL_AUDITOR'
      ];

      if (staffRoles.includes(user.role)) {
        window.location.href = '/dashboard/operations';
      } else if (user.role === 'MAKER' || user.role === 'STUDIO_MANAGER') {
        window.location.href = '/dashboard/maker';
      } else {
        window.location.href = '/dashboard/buyer';
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to connect to authentication services.');
    }
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setRegisterStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Name is required.');
      return;
    }
    if (role === 'maker' && !businessName.trim()) {
      setErrorMsg('Studio / Atelier Name is required.');
      return;
    }
    setRegisterStep(3);
  };

  const handleStep3Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setRegisterStep(4);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
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

      setSuccessMsg(`A 6-digit security code has been dispatched to ${email}. Check your inbox.`);
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
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const vRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, otp: code }),
      });
      const vData = await vRes.json();

      if (!vRes.ok) {
        setLoading(false);
        setErrorMsg(vData.error || 'Invalid verification code.');
        return;
      }

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
          phone,
          yearsInBusiness,
          employeeCount,
          craftType: primaryCraft,
          shortIntro: atelierDescription
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
      setSuccessMsg(`A password reset link has been sent to ${email}.`);
      setEmail('');
    }, 1200);
  };

  const togglePatronInterest = (id: string) => {
    if (selectedPatronInterests.includes(id)) {
      setSelectedPatronInterests(selectedPatronInterests.filter(i => i !== id));
    } else {
      setSelectedPatronInterests([...selectedPatronInterests, id]);
    }
  };

  // Color Tokens based on active theme
  const isDark = theme === 'dark';
  const pageBg = isDark ? '#080705' : '#FFFFFF';
  const textPrimary = isDark ? '#FAF9F6' : '#1A1815';
  const textMuted = isDark ? '#8A7A6A' : '#5A5044';
  const goldAccent = isDark ? '#C9A84C' : '#9E8030';
  const borderNeutral = isDark ? '#1C1A16' : '#DCD6CA';
  const inputBg = isDark ? '#0C0B08' : '#FAF9F6';

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      width: '100vw',
      backgroundColor: pageBg,
      color: textPrimary,
      fontFamily: 'var(--font-inter, sans-serif)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <CustomCursor />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MINIMAL PRIVATE ENTRANCE HEADER                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <header style={{
        height: '65px',
        minHeight: '65px',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${borderNeutral}`
      }}>
        {/* Top-Left: Intelligent Back Button */}
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: textMuted,
            fontSize: '0.78rem',
            fontFamily: 'var(--font-outfit, sans-serif)',
            fontWeight: 600,
            letterSpacing: '1px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0',
            transition: 'color 0.2s ease'
          }}
        >
          ← Back
        </button>

        {/* Top-Center: Minimal Brand Mark with Theme Logo */}
        <Link href="/" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <ThemeLogo height="36px" />
        </Link>

        {/* Top-Right: Discreet Theme Switch */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: `1px solid ${borderNeutral}`,
            borderRadius: '4px',
            padding: '0.35rem 0.75rem',
            color: textMuted,
            fontSize: '0.7rem',
            fontFamily: 'var(--font-outfit)',
            fontWeight: 600,
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ◐ {isDark ? 'Light' : 'Dark'}
        </button>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* CENTERED SINGLE-VIEWPORT AUTHENTICATION FORM                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>

          {/* Form Heading */}
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: '1.65rem',
              fontWeight: 300,
              color: textPrimary,
              margin: '0 0 0.35rem 0',
              lineHeight: 1.2
            }}>
              {phase === 'login' && 'Welcome Back'}
              {phase === 'register' && (role === 'maker' ? 'Register Your Atelier' : 'Create Patron Membership')}
              {phase === 'verify_otp' && 'Verify Your Email'}
              {phase === 'forgot' && 'Recover Your Account'}
            </h2>

            <p style={{
              color: textMuted,
              fontSize: '0.82rem',
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontStyle: 'italic',
              margin: 0,
              lineHeight: 1.4
            }}>
              {phase === 'login' && 'Enter your registered credentials.'}
              {phase === 'register' && (role === 'maker' ? 'Present your craftsmanship to a global community of discerning patrons.' : 'Begin your journey with exceptional craftsmanship.')}
              {phase === 'verify_otp' && 'We have dispatched a 6-digit verification code to your email.'}
              {phase === 'forgot' && 'Enter the email address associated with your account.'}
            </p>
          </div>

          {/* ── MINIMAL COMPACT ROLE SELECTOR ─────────────────────────────────── */}
          {(phase === 'login' || phase === 'register') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1.2rem'
            }}>
              <button
                type="button"
                onClick={() => setRole('maker')}
                style={{
                  padding: '0.65rem 0.8rem',
                  backgroundColor: role === 'maker' ? (isDark ? '#0F0E0B' : '#E8E1D2') : inputBg,
                  border: `1px solid ${role === 'maker' ? goldAccent : borderNeutral}`,
                  borderRadius: '4px',
                  color: role === 'maker' ? goldAccent : textMuted,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-outfit)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  MASTER ARTISAN
                </div>
                <div style={{ fontSize: '0.68rem', color: textMuted, fontFamily: 'var(--font-inter)' }}>
                  Register your atelier
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('buyer')}
                style={{
                  padding: '0.65rem 0.8rem',
                  backgroundColor: role === 'buyer' ? (isDark ? '#0F0E0B' : '#E8E1D2') : inputBg,
                  border: `1px solid ${role === 'buyer' ? goldAccent : borderNeutral}`,
                  borderRadius: '4px',
                  color: role === 'buyer' ? goldAccent : textMuted,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-outfit)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  GLOBAL PATRON
                </div>
                <div style={{ fontSize: '0.68rem', color: textMuted, fontFamily: 'var(--font-inter)' }}>
                  Discover craftsmanship
                </div>
              </button>
            </div>
          )}

          {/* ── SUBTLE PROGRESS STEP INDICATOR ────────────────────────────────── */}
          {phase === 'register' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.2rem',
              paddingBottom: '0.6rem',
              borderBottom: `1px solid ${borderNeutral}`
            }}>
              {[
                { step: 1, label: '01 ACCOUNT' },
                { step: 2, label: '02 PROFILE' },
                { step: 3, label: '03 HERITAGE' },
                { step: 4, label: '04 REVIEW' },
              ].map((s, idx) => (
                <div
                  key={s.step}
                  onClick={() => { if (s.step < registerStep) setRegisterStep(s.step as any); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: s.step < registerStep ? 'pointer' : 'default',
                    opacity: registerStep === s.step ? 1 : s.step < registerStep ? 0.8 : 0.4
                  }}
                >
                  <span style={{
                    fontSize: '0.6rem',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 700,
                    color: registerStep === s.step ? goldAccent : s.step < registerStep ? '#4ade80' : textMuted,
                    letterSpacing: '1.2px'
                  }}>
                    {s.label}
                  </span>
                  {idx < 3 && <span style={{ color: borderNeutral, fontSize: '0.6rem' }}>—</span>}
                </div>
              ))}
            </div>
          )}

          {/* INLINE ERROR & SUCCESS FEEDBACK */}
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '4px', padding: '0.6rem 0.8rem', marginBottom: '1rem' }}>
              <p style={{ color: '#f87171', fontSize: '0.75rem', fontFamily: 'var(--font-inter)', margin: 0 }}>{errorMsg}</p>
            </motion.div>
          )}

          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '4px', padding: '0.6rem 0.8rem', marginBottom: '1rem' }}>
              <p style={{ color: '#4ade80', fontSize: '0.75rem', fontFamily: 'var(--font-inter)', margin: 0 }}>{successMsg}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* ════════════════════════════════════════════════════════════════ */}
            {/* LOGIN FORM                                                       */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {phase === 'login' && (
              <motion.form
                key="form-login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleLoginSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    placeholder="custodian@atelier.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={makeInputStyle(inputBg, borderNeutral, textPrimary)}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700 }}>
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => setPhase('forgot')}
                      style={{ background: 'none', border: 'none', color: textMuted, fontSize: '0.72rem', fontFamily: 'var(--font-inter)', cursor: 'pointer', padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{
                        ...makeInputStyle(inputBg, borderNeutral, textPrimary),
                        paddingRight: '2.2rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '0.78rem' }}
                    >
                      {passwordVisible ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: textMuted, cursor: 'pointer' }}>
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ accentColor: goldAccent }} />
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.8rem 0',
                    backgroundColor: goldAccent,
                    color: isDark ? '#080705' : '#FAF9F6',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    marginTop: '0.3rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? 'Authenticating…' : 'SIGN IN →'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <p style={{ color: textMuted, fontSize: '0.78rem', fontFamily: 'var(--font-inter)', margin: 0 }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setPhase('register'); setRegisterStep(1); }}
                      style={{ background: 'none', border: 'none', color: goldAccent, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Create an account
                    </button>
                  </p>
                </div>
              </motion.form>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* REGISTER STEP 1: ACCOUNT                                        */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {phase === 'register' && registerStep === 1 && (
              <motion.form
                key="reg-step-1"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                onSubmit={handleStep1Next}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} required
                    style={makeInputStyle(inputBg, borderNeutral, textPrimary)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    PASSWORD
                  </label>
                  <input
                    type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required
                    style={makeInputStyle(inputBg, borderNeutral, textPrimary)}
                  />
                  {password && (
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '3px', backgroundColor: borderNeutral, borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(passwordStrength.score / 3) * 100}%`, backgroundColor: passwordStrength.color, transition: 'all 0.3s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.6rem', color: passwordStrength.color, fontFamily: 'var(--font-outfit)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    style={makeInputStyle(inputBg, borderNeutral, textPrimary)}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.8rem 0',
                    backgroundColor: goldAccent,
                    color: isDark ? '#080705' : '#FAF9F6',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    marginTop: '0.3rem'
                  }}
                >
                  CONTINUE TO PROFILE →
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.4rem' }}>
                  <p style={{ color: textMuted, fontSize: '0.78rem', fontFamily: 'var(--font-inter)', margin: 0 }}>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setPhase('login')} style={{ background: 'none', border: 'none', color: goldAccent, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.form>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* REGISTER STEP 2: PROFILE                                        */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {phase === 'register' && registerStep === 2 && (
              <motion.form
                key="reg-step-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                onSubmit={handleStep2Next}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
              >
                {role === 'maker' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          CUSTODIAN NAME *
                        </label>
                        <input type="text" placeholder="Master Artisan Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          STUDIO NAME *
                        </label>
                        <input type="text" placeholder="Atelier Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          COUNTRY
                        </label>
                        <input type="text" value={country} onChange={e => setCountry(e.target.value)} style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          PHONE NUMBER
                        </label>
                        <input type="tel" placeholder="+44 20 7946 0912" value={phone} onChange={e => setPhone(e.target.value)} style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          YEARS ACTIVE
                        </label>
                        <input type="number" min={1} value={yearsInBusiness} onChange={e => setYearsInBusiness(Number(e.target.value))} style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          CRAFTSMEN
                        </label>
                        <input type="number" min={1} value={employeeCount} onChange={e => setEmployeeCount(Number(e.target.value))} style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                      </div>
                    </div>
                  </>
                )}

                {role === 'buyer' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                        FULL NAME *
                      </label>
                      <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          COUNTRY
                        </label>
                        <input type="text" value={country} onChange={e => setCountry(e.target.value)} style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: textMuted, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          PHONE NUMBER
                        </label>
                        <input type="tel" placeholder="+44 20 7946 0912" value={phone} onChange={e => setPhone(e.target.value)} style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <button type="button" onClick={() => setRegisterStep(1)} style={makeBtnMutedStyle(inputBg, borderNeutral, textMuted)}>← BACK</button>
                  <button type="submit" style={{ ...makeBtnGoldStyle(goldAccent, isDark), flex: 1 }}>CONTINUE TO HERITAGE →</button>
                </div>
              </motion.form>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* REGISTER STEP 3: HERITAGE / INTERESTS                           */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {phase === 'register' && registerStep === 3 && (
              <motion.form
                key="reg-step-3"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                onSubmit={handleStep3Next}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
              >
                {role === 'maker' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                        PRIMARY CRAFT CATEGORY
                      </label>
                      <select value={primaryCraft} onChange={e => setPrimaryCraft(e.target.value)} style={makeInputStyle(inputBg, borderNeutral, textPrimary)}>
                        {CRAFT_CATEGORIES.map(c => <option key={c.id} value={c.label} style={{ background: pageBg, color: textPrimary }}>{c.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                        CRAFT TRADITION & TECHNIQUE
                      </label>
                      <input type="text" placeholder="e.g. Traditional stoneware" value={craftTradition} onChange={e => setCraftTradition(e.target.value)} style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: textMuted, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.25rem' }}>
                        ATELIER DESCRIPTION (OPTIONAL)
                      </label>
                      <input type="text" placeholder="Workshop background..." value={atelierDescription} onChange={e => setAtelierDescription(e.target.value)} style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                    </div>
                  </>
                )}

                {role === 'buyer' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.6rem' }}>
                      COLLECTING INTERESTS
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {CRAFT_CATEGORIES.map(cat => {
                        const active = selectedPatronInterests.includes(cat.id);
                        return (
                          <div
                            key={cat.id}
                            onClick={() => togglePatronInterest(cat.id)}
                            style={{
                              backgroundColor: active ? (isDark ? '#0F0E0B' : '#E8E1D2') : inputBg,
                              border: `1px solid ${active ? goldAccent : borderNeutral}`,
                              borderRadius: '4px',
                              padding: '0.5rem 0.65rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span style={{ fontSize: '0.72rem', color: active ? goldAccent : textPrimary, fontFamily: 'var(--font-inter)' }}>
                              {cat.label}
                            </span>
                            {active && <span style={{ color: goldAccent, fontSize: '0.72rem' }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <button type="button" onClick={() => setRegisterStep(2)} style={makeBtnMutedStyle(inputBg, borderNeutral, textMuted)}>← BACK</button>
                  <button type="submit" style={{ ...makeBtnGoldStyle(goldAccent, isDark), flex: 1 }}>REVIEW REGISTRATION →</button>
                </div>
              </motion.form>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* REGISTER STEP 4: REVIEW & CREATE                                */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {phase === 'register' && registerStep === 4 && (
              <motion.form
                key="reg-step-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                onSubmit={handleRegisterSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
              >
                <div style={{ backgroundColor: inputBg, border: `1px solid ${borderNeutral}`, borderRadius: '6px', padding: '0.8rem 1rem' }}>
                  <p style={{ fontSize: '0.58rem', color: goldAccent, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                    REGISTRATION SUMMARY
                  </p>
                  <SummaryRow label="Account Email" value={email} borderNeutral={borderNeutral} textMuted={textMuted} textPrimary={textPrimary} />
                  <SummaryRow label="Custodian" value={fullName} borderNeutral={borderNeutral} textMuted={textMuted} textPrimary={textPrimary} />
                  {role === 'maker' && <SummaryRow label="Studio / Atelier" value={businessName} borderNeutral={borderNeutral} textMuted={textMuted} textPrimary={textPrimary} />}
                  <SummaryRow label="Country" value={country} borderNeutral={borderNeutral} textMuted={textMuted} textPrimary={textPrimary} />
                  {phone && <SummaryRow label="Phone" value={phone} borderNeutral={borderNeutral} textMuted={textMuted} textPrimary={textPrimary} />}
                  {role === 'maker' && <SummaryRow label="Primary Craft" value={primaryCraft} borderNeutral={borderNeutral} textMuted={textMuted} textPrimary={textPrimary} />}
                </div>

                <div style={{ backgroundColor: 'rgba(201,168,76,0.06)', border: `1px solid ${borderNeutral}`, borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
                  <p style={{ color: goldAccent, fontSize: '0.65rem', fontFamily: 'var(--font-outfit)', fontWeight: 700, margin: '0 0 2px 0', letterSpacing: '1px' }}>
                    REGISTRY REVIEW NOTICE
                  </p>
                  <p style={{ color: textMuted, fontSize: '0.72rem', fontFamily: 'var(--font-inter)', margin: 0, lineHeight: 1.4 }}>
                    {role === 'maker'
                      ? 'Your atelier details will be reviewed according to accreditation audit standards.'
                      : 'Your patron account will be registered for authenticated provenance acquisition.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button type="button" onClick={() => setRegisterStep(3)} style={makeBtnMutedStyle(inputBg, borderNeutral, textMuted)}>← BACK</button>
                  <button type="submit" disabled={loading} style={{ ...makeBtnGoldStyle(goldAccent, isDark), flex: 1 }}>
                    {loading ? 'Creating Account…' : 'CREATE ACCOUNT →'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* OTP VERIFICATION STATE                                          */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {phase === 'verify_otp' && (
              <motion.div key="otp-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <p style={{ color: textMuted, fontSize: '0.78rem', fontFamily: 'var(--font-inter)', margin: 0 }}>
                    Security code dispatched to: <strong style={{ color: textPrimary }}>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center' }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(e.target.value, i)} required
                        style={{ width: '40px', height: '46px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, backgroundColor: inputBg, border: `1px solid ${borderNeutral}`, borderRadius: '4px', color: textPrimary, outline: 'none' }}
                      />
                    ))}
                  </div>

                  <button type="submit" disabled={loading} style={{ ...makeBtnGoldStyle(goldAccent, isDark), width: '100%' }}>
                    {loading ? 'Verifying…' : 'CONFIRM CODE & ACTIVATE ACCOUNT'}
                  </button>

                  <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.75rem' }}>
                    <button type="button" onClick={async () => { setLoading(true); await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: fullName }) }); setLoading(false); alert('Resent verification code.'); }} style={{ background: 'none', border: 'none', color: goldAccent, cursor: 'pointer', padding: 0 }}>
                      Resend Code
                    </button>
                    <button type="button" onClick={() => { setPhase('register'); setRegisterStep(1); }} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 0 }}>
                      Change Email
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* FORGOT PASSWORD STATE                                           */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {phase === 'forgot' && (
              <motion.form key="forgot-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: goldAccent, fontFamily: 'var(--font-outfit)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    EMAIL ADDRESS
                  </label>
                  <input type="email" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} required style={makeInputStyle(inputBg, borderNeutral, textPrimary)} />
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button type="button" onClick={() => setPhase('login')} style={makeBtnMutedStyle(inputBg, borderNeutral, textMuted)}>← RETURN TO SIGN IN</button>
                  <button type="submit" disabled={loading} style={{ ...makeBtnGoldStyle(goldAccent, isDark), flex: 1 }}>
                    {loading ? 'Sending…' : 'SEND RESET LINK'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </main>

    </div>
  );
}

// ── Shared Minimal Input & Button Generators ────────────────────────────────
function makeInputStyle(inputBg: string, borderNeutral: string, textPrimary: string) {
  return {
    width: '100%',
    padding: '0.58rem 0.75rem',
    backgroundColor: inputBg,
    border: `1px solid ${borderNeutral}`,
    borderRadius: '4px',
    color: textPrimary,
    fontSize: '0.82rem',
    fontFamily: 'var(--font-inter)',
    outline: 'none',
  };
}

function makeBtnGoldStyle(goldAccent: string, isDark: boolean) {
  return {
    padding: '0.75rem 0',
    backgroundColor: goldAccent,
    color: isDark ? '#080705' : '#FAF9F6',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.68rem',
    fontFamily: 'var(--font-outfit)',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };
}

function makeBtnMutedStyle(inputBg: string, borderNeutral: string, textMuted: string) {
  return {
    padding: '0.75rem 1rem',
    backgroundColor: inputBg,
    color: textMuted,
    border: `1px solid ${borderNeutral}`,
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontFamily: 'var(--font-outfit)',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
  };
}

function SummaryRow({ label, value, borderNeutral, textMuted, textPrimary }: { label: string; value: string; borderNeutral: string; textMuted: string; textPrimary: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${borderNeutral}` }}>
      <span style={{ color: textMuted, fontSize: '0.72rem', fontFamily: 'var(--font-inter)' }}>{label}</span>
      <span style={{ color: textPrimary, fontSize: '0.72rem', fontFamily: 'var(--font-inter)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
