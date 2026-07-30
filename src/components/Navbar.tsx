'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const pathname = usePathname();

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
      
      if (currentScroll > lastScroll && currentScroll > 80) {
        setVisible(false); // Hide on scroll down
      } else {
        setVisible(true); // Show on scroll up
      }
      lastScroll = currentScroll;
    };

    // Initialize immediately on mount
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

  // Determine navbar aesthetics based on scroll state
  const isHomepage = pathname === '/';
  const shouldBeSolid = scrolled || !isHomepage;

  // Premium adaptive header variables
  const navBackground = shouldBeSolid ? 'var(--glass-bg)' : 'transparent';
  const navBorderColor = scrolled 
    ? 'var(--glass-border)' 
    : (shouldBeSolid ? 'var(--glass-border)' : 'transparent');
  const navTextColor = shouldBeSolid ? 'var(--text)' : '#FAF9F6';
  const navShadow = scrolled ? 'var(--shadow-sm)' : 'none';
  const activeGold = 'var(--accent)';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collections' },
    { name: 'Origins', path: '/countries' },
    { name: 'Transparency', path: '/how-we-earn' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/about#contact' },
  ];

  // Icons mapped to the unified icon registry
  const SearchIcon = () => <Icons.Search size={17} />;
  const WishlistIcon = () => <Icons.Wishlist size={17} />;
  const CartIcon = () => <Icons.Cart size={17} />;
  const ProfileIcon = () => <Icons.Profile size={17} />;

  const isNavVisible = visible && (!isHomepage || !heroActive);

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: scrolled ? '1.5rem' : '0',
        left: '50%',
        transform: isNavVisible 
          ? 'translateX(-50%) translateY(0)' 
          : 'translateX(-50%) translateY(-150%)',
        width: scrolled ? '92%' : '100%',
        maxWidth: scrolled ? '1400px' : '100%',
        zIndex: 1000,
        padding: scrolled ? '1.25rem 3rem' : '2rem 4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: navBackground,
        backdropFilter: shouldBeSolid ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: shouldBeSolid ? 'blur(20px)' : 'none',
        border: '1px solid',
        borderColor: navBorderColor,
        color: navTextColor,
        boxShadow: navShadow
      }}>
        {/* Logo */}
        <Link href="/" style={{
          color: shouldBeSolid ? 'var(--text)' : 'var(--accent)',
          textDecoration: 'none',
          fontSize: '1.35rem',
          fontWeight: '400',
          letterSpacing: '4px',
          fontFamily: 'var(--font-playfair), Georgia, serif',
          zIndex: 1001,
          transition: 'color var(--transition-fast)'
        }}>
          BRITSYNC
        </Link>

        {/* Desktop Links */}
        <div className="desktop-nav-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.name} href={link.path} style={{
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: isActive ? '400' : '300',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                position: 'relative',
                opacity: isActive ? 1 : 0.75,
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = isActive ? '1' : '0.75')}
              >
                {link.name}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: 0,
                    width: '100%',
                    height: '1px',
                    backgroundColor: activeGold
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="desktop-nav-actions" style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
          <Link href="/search" style={{ color: 'inherit', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}><SearchIcon /></Link>
          
          <Link href="/wishlist" style={{ color: 'inherit', opacity: 0.8, position: 'relative', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>
            <WishlistIcon />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: activeGold,
                borderRadius: '50%',
                width: '6px',
                height: '6px'
              }} />
            )}
          </Link>
          
          <Link href="/cart" style={{ color: 'inherit', opacity: 0.8, position: 'relative', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>
            <CartIcon />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: activeGold,
                borderRadius: '50%',
                width: '6px',
                height: '6px'
              }} />
            )}
          </Link>
          
          <Link href="/login" style={{ color: 'inherit', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}><ProfileIcon /></Link>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--glass-border)' }}></div>
          
          <Link href="/become-a-maker" style={{
            color: 'inherit',
            textDecoration: 'none',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            fontWeight: '400',
            border: '1px solid',
            borderColor: shouldBeSolid ? 'var(--text)' : 'rgba(255, 255, 255, 0.4)',
            padding: '0.6rem 1.2rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = navTextColor;
            e.currentTarget.style.color = shouldBeSolid ? 'var(--background)' : '#111111';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'inherit';
          }}
          >Apply to Registry</Link>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
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

      {/* Mobile Slide-in */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'var(--secondary)',
        color: 'var(--text)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        padding: '7rem 3rem 3rem',
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', fontSize: '1.1rem', fontWeight: '300', letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path} onClick={() => setMobileMenuOpen(false)} style={{ color: 'inherit', textDecoration: 'none' }}>
              {link.name}
            </Link>
          ))}
          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--glass-border)', margin: '1rem 0' }}></div>
          <Link href="/search" onClick={() => setMobileMenuOpen(false)} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}><SearchIcon /> Search</Link>
          <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}><WishlistIcon /> Wishlist</Link>
          <Link href="/cart" onClick={() => setMobileMenuOpen(false)} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}><CartIcon /> Cart</Link>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--glass-border)', margin: '1rem 0' }}></div>
          <Link href="/become-a-maker" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)', textDecoration: 'none' }}>Apply to Registry</Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'inherit', textDecoration: 'none' }}>Login / Portals</Link>
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
