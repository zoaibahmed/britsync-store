'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('britsync_theme');
      const currentAttr = document.documentElement.getAttribute('data-theme');
      let activeTheme: 'light' | 'dark' = 'dark';
      if (savedTheme === 'light' || savedTheme === 'dark') {
        activeTheme = savedTheme;
      } else if (currentAttr === 'light' || currentAttr === 'dark') {
        activeTheme = currentAttr;
      }
      setTheme(activeTheme);
      document.documentElement.setAttribute('data-theme', activeTheme);
      document.body.setAttribute('data-theme', activeTheme);
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('britsync_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  };

  const updateCounts = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('britsync_cart');
        const cartItems = savedCart ? JSON.parse(savedCart) : [];
        setCartCount(cartItems.reduce((acc: number, item: any) => acc + (item.qty || 1), 0));
      } catch (e) {
        setCartCount(0);
      }

      try {
        const savedWishlist = localStorage.getItem('britsync_wishlist');
        const wishlistItems = savedWishlist ? JSON.parse(savedWishlist) : [];
        setWishlistCount(wishlistItems.length);
      } catch (e) {
        setWishlistCount(0);
      }
    }
  };

  const [heroActive, setHeroActive] = useState(false);

  useEffect(() => {
    let lastScroll = window.scrollY;

    const checkHeroState = () => {
      if (typeof document !== 'undefined') {
        setHeroActive(document.documentElement.classList.contains('hero-active'));
      }
    };

    checkHeroState();

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrolled(currentScroll > 30);
      
      if (currentScroll <= 10) {
        setVisible(true);
      } else if (currentScroll > lastScroll) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastScroll = currentScroll;
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('heroStateChange', checkHeroState);
    updateCounts();
    window.addEventListener('cartUpdate', updateCounts);
    window.addEventListener('wishlistUpdate', updateCounts);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('heroStateChange', checkHeroState);
      window.removeEventListener('cartUpdate', updateCounts);
      window.removeEventListener('wishlistUpdate', updateCounts);
    };
  }, []);

  if (pathname === '/login' || pathname?.startsWith('/dashboard')) return null;

  const isHomepage = pathname === '/';
  const shouldBeSolid = scrolled || !isHomepage;

  const navBackground = shouldBeSolid ? 'var(--surface)' : 'transparent';
  const navBorderColor = scrolled ? 'var(--glass-border)' : (shouldBeSolid ? 'var(--glass-border)' : 'transparent');
  const navTextColor = 'var(--text)';
  const navShadow = scrolled ? 'var(--shadow-md)' : 'none';
  const activeGold = 'var(--accent)';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collections' },
    { name: 'Artisans', path: '/makers' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const SearchIcon = () => <Icons.Search size={17} />;
  const WishlistIcon = () => <Icons.Wishlist size={17} />;
  const CartIcon = () => <Icons.Cart size={17} />;
  const ProfileIcon = () => <Icons.Profile size={17} />;

  const isNavVisible = visible && (!isHomepage || !heroActive);

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: scrolled ? '1rem' : '0',
        left: '50%',
        transform: isNavVisible 
          ? 'translateX(-50%) translateY(0)' 
          : 'translateX(-50%) translateY(-150%)',
        width: scrolled ? '92%' : '100%',
        maxWidth: scrolled ? '1400px' : '100%',
        zIndex: 1000,
        padding: scrolled ? '1rem 2.5rem' : '1.8rem 3.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: navBackground,
        backdropFilter: shouldBeSolid ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: shouldBeSolid ? 'blur(20px)' : 'none',
        border: '1px solid',
        borderColor: navBorderColor,
        borderTop: scrolled ? '2px solid var(--accent)' : '1px solid ' + navBorderColor,
        color: navTextColor,
        boxShadow: navShadow
      }}>
        {/* Brand Logo & Tag */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          textDecoration: 'none',
          zIndex: 1001,
        }}>
          <img 
            src="/logo.png" 
            alt="Britsync Logo" 
            style={{ 
              height: '44px', 
              width: 'auto', 
              objectFit: 'contain',
              transition: 'transform 0.3s ease',
              filter: 'drop-shadow(0 2px 8px rgba(212,175,55,0.3))'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{
              color: 'var(--text)',
              fontSize: '1.3rem',
              fontWeight: '400',
              letterSpacing: '5px',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              lineHeight: 1.05,
              textTransform: 'uppercase'
            }}>
              BRITSYNC
            </span>
            <span style={{
              color: 'var(--accent)',
              fontSize: '0.52rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginTop: '0.15rem'
            }}>
              MANAGED COMMERCE
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="desktop-nav-links" style={{ display: 'flex', gap: '2.2rem', alignItems: 'center' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.name} href={link.path} style={{
                color: isActive ? 'var(--accent)' : 'var(--text)',
                textDecoration: 'none',
                fontWeight: isActive ? '700' : '400',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                position: 'relative',
                opacity: isActive ? 1 : 0.8,
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? 'var(--accent)' : 'var(--text)')}
              >
                {link.name}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: 0,
                    width: '100%',
                    height: '2px',
                    backgroundColor: activeGold
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="desktop-nav-actions" style={{ display: 'flex', gap: '1.3rem', alignItems: 'center' }}>
          <Link href="/search" aria-label="Search" style={{ color: 'var(--text)', opacity: 0.85, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}><SearchIcon /></Link>
          
          <Link href="/wishlist" aria-label="Wishlist" style={{ color: 'var(--text)', opacity: 0.85, position: 'relative', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}>
            <WishlistIcon />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: activeGold,
                color: '#0A0A0C',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                fontSize: '0.58rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {wishlistCount}
              </span>
            )}
          </Link>
          
          <Link href="/cart" aria-label="Cart" style={{ color: 'var(--text)', opacity: 0.85, position: 'relative', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}>
            <CartIcon />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: activeGold,
                color: '#0A0A0C',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                fontSize: '0.58rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          <Link href="/login" aria-label="Sign In / Account" style={{ color: 'var(--text)', opacity: 0.85, position: 'relative', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}>
            <ProfileIcon />
          </Link>

          <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--glass-border)' }} />

          {/* Theme Toggle Button */}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <Link href="/login" style={{
            color: 'var(--text)',
            backgroundColor: 'transparent',
            textDecoration: 'none',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 600,
            padding: '0.65rem 1rem',
            border: '1px solid var(--glass-border)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          >
            Sign In
          </Link>

          <Link href="/become-a-maker" style={{
            color: '#0A0A0C',
            backgroundColor: 'var(--accent)',
            textDecoration: 'none',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            fontWeight: 700,
            padding: '0.65rem 1.4rem',
            border: '1px solid var(--accent)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0A0A0C';
            e.currentTarget.style.color = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
            e.currentTarget.style.color = '#0A0A0C';
          }}
          >
            Apply to Registry
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            zIndex: 1001,
            display: 'none'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8"></line>
                <line x1="4" y1="16" x2="20" y2="16"></line>
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Slide-in Menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'var(--surface)',
        color: 'var(--text)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        padding: '7rem 3rem 3rem',
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', fontSize: '1.1rem', fontWeight: '300', letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none' }}>
              {link.name}
            </Link>
          ))}
          
          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--glass-border)', margin: '1rem 0' }}></div>
          
          <Link href="/search" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}><SearchIcon /> Search</Link>
          <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}><WishlistIcon /> Wishlist ({wishlistCount})</Link>
          <Link href="/cart" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}><CartIcon /> Cart ({cartCount})</Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}><ProfileIcon /> Sign In / Account</Link>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.8rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-playfair), Georgia, serif', color: 'var(--text)' }}>
              Appearance Theme
            </span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--glass-border)', margin: '1rem 0' }}></div>
          
          <Link href="/become-a-maker" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>Apply to Registry &rarr;</Link>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .desktop-nav-links, .desktop-nav-actions {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}} />
    </>
  );
}
