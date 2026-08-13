'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MakerDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'profile' | 'orders' | 'wallet' | 'verification'>('products');
  
  // Data states
  const [makerProfile, setMakerProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [pendingAmount, setPendingAmount] = useState(0.00);
  const [paidOutAmount, setPaidOutAmount] = useState(1200.00);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Ceramics');
  const [newPrimaryImage, setNewPrimaryImage] = useState('');
  const [newProductStory, setNewProductStory] = useState('');

  // Multi-Step Profile Onboarding Wizard State (Steps 1 - 4)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 Fields: Identity & Category
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editFounderName, setEditFounderName] = useState('');
  const [editCraftCategory, setEditCraftCategory] = useState('Ceramics & Pottery');
  const [editYearsInBusiness, setEditYearsInBusiness] = useState('5');
  const [editEmployeeCount, setEditEmployeeCount] = useState('3');
  const [editCityCountry, setEditCityCountry] = useState('Kashmir, India');

  // Step 2 Fields: Heritage & Stories
  const [editBusinessStory, setEditBusinessStory] = useState('');
  const [editFounderStory, setEditFounderStory] = useState('');
  const [editCraftTechniques, setEditCraftTechniques] = useState('Hand-turned wheel, natural wood-fire kilns, mineral glazes');

  // Step 3 Fields: Media & Gallery
  const [editCoverImage, setEditCoverImage] = useState('https://images.unsplash.com/photo-1565193566173-7a0cb3d162cc');
  const [editFounderPhoto, setEditFounderPhoto] = useState('https://images.unsplash.com/photo-1544256718-3bcf237f3974');
  const [editGallery1, setEditGallery1] = useState('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61');
  const [editGallery2, setEditGallery2] = useState('https://images.unsplash.com/photo-1513694203232-719a280e022f');
  const [editGallery3, setEditGallery3] = useState('https://images.unsplash.com/photo-1601662528567-526cd06f6582');

  // Step 4 Fields: Payout Account
  const [preferredMethod, setPreferredMethod] = useState('Stripe Connect');
  const [payoutAccountDetails, setPayoutAccountDetails] = useState('GB89 WEST 1234 5678 9012 34');

  const [savingProfile, setSavingProfile] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch user session
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        window.location.href = '/login';
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);
      setEditFounderName(meData.user.name);

      // 2. Fetch maker profile
      const profileRes = await fetch('/api/maker-profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setMakerProfile(profileData);
        setEditBusinessName(profileData.businessName || '');
        setEditEmployeeCount(profileData.employeeCount || '1');
        setEditYearsInBusiness(profileData.yearsInBusiness || '1');
        setEditCraftCategory(profileData.craftCategory || 'Ceramics & Pottery');
        setEditBusinessStory(profileData.businessStory || '');
        setEditFounderStory(profileData.founderStory || '');
        if (profileData.coverImage) setEditCoverImage(profileData.coverImage);
        if (profileData.founderPhoto) setEditFounderPhoto(profileData.founderPhoto);

        // 3. Fetch products for this maker
        const productsRes = await fetch(`/api/products?makerId=${profileData.id}&limit=100`);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const productList = Array.isArray(productsData) ? productsData : (productsData.products || []);
          setProducts(productList.map((p: any) => ({
            id: p.id,
            name: p.name,
            stock: p.inventory,
            price: p.desiredPrice,
            category: p.category || 'Ceramics',
            status: p.inventory > 0 ? 'Active' : 'Out of Stock',
            verificationStatus: p.verificationStatus || 'GENERAL'
          })));
        }
      }

      // 4. Fetch orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const makerOrdersList: any[] = [];
        ordersData.forEach((order: any) => {
          order.orderItems.forEach((item: any) => {
            makerOrdersList.push({
              id: order.id,
              product: item.product?.name || 'Masterwork Handcrafted Item',
              buyer: order.buyer?.name || 'Patron Buyer',
              date: new Date(order.createdAt).toLocaleDateString(),
              price: item.sellingPrice || item.desiredPrice,
              status: order.status
            });
          });
        });
        setOrders(makerOrdersList);
      }

      // 5. Fetch wallet
      const walletRes = await fetch('/api/wallet');
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWalletBalance(walletData.clearedBalance || 0);
        setPendingAmount(walletData.payoutHeldBalance || 0);
        if (walletData.walletTransactions) {
          setTransactions(walletData.walletTransactions.map((tx: any) => ({
            id: tx.id.slice(0, 8).toUpperCase(),
            date: new Date(tx.createdAt).toLocaleDateString(),
            product: tx.description,
            amount: tx.amount,
            status: tx.status
          })));
        }
      }

      // 6. Fetch verification requests
      const vrRes = await fetch('/api/verification-requests');
      if (vrRes.ok) {
        const vrData = await vrRes.json();
        setVerificationRequests(vrData);
      }

    } catch (err) {
      console.error('Error loading maker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const isVerifiedMaker = makerProfile?.verificationStatus === 'GUILD_VERIFIED' || makerProfile?.verificationStatus === 'ROYAL_CHARTER';

  const handleSaveProfileWizard = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/maker-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: editBusinessName,
          employeeCount: editEmployeeCount,
          yearsInBusiness: editYearsInBusiness,
          craftCategory: editCraftCategory,
          businessStory: editBusinessStory,
          founderStory: editFounderStory,
          coverImage: editCoverImage,
          founderPhoto: editFounderPhoto
        })
      });

      setSavingProfile(false);

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to update studio profile.'}`);
        return;
      }

      // Request verification audit automatically
      await fetch('/api/verification-requests', { method: 'POST' });

      alert('✓ Studio Accreditation Profile completed!\n- Audit request submitted to Britsync Governance.\n- You will be notified once a Guild Inspector reviews your workshop.');
      setShowProfileModal(false);
      loadDashboardData();
    } catch (e) {
      setSavingProfile(false);
      alert('Failed to save profile.');
    }
  };

  const handlePublishProductClick = () => {
    if (!isVerifiedMaker) {
      alert('🔒 Studio Verification Required:\n\nTo maintain Britsync\'s high standards of authenticity, master artisans must complete their 4-step accreditation profile and receive Guild Audit approval before publishing items.\n\nPlease complete your studio profile and request a Guild Audit below!');
      setShowProfileModal(true);
      return;
    }
    setShowAddForm(true);
  };

  const handlePublishProductSubmit = async () => {
    if (!newProductName || !newProductPrice || !newProductStock) {
      alert('Please fill out product name, price, and inventory stock.');
      return;
    }

    const priceNum = parseFloat(newProductPrice);
    const stockNum = parseInt(newProductStock);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          description: newProductStory || `A handcrafted masterpiece created in traditional regional techniques.`,
          story: newProductStory || `Passed down through generations of guild artisans.`,
          category: newProductCategory,
          price: priceNum,
          inventory: stockNum,
          images: newPrimaryImage ? [newPrimaryImage] : undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to publish product.'}`);
        return;
      }

      alert('✓ Handcrafted Masterpiece published live to Britsync Market!');
      setShowAddForm(false);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('');
      setNewPrimaryImage('');
      setNewProductStory('');
      loadDashboardData();
    } catch (e) {
      alert('Failed to publish product.');
    }
  };

  const handleWithdrawFunds = async () => {
    if (walletBalance <= 0) {
      alert('Your cleared balance is £0.00. No payouts eligible for release.');
      return;
    }
    const confirmW = confirm(`Withdraw £${walletBalance.toFixed(2)} to ${payoutAccountDetails} via ${preferredMethod}?`);
    if (confirmW) {
      try {
        const res = await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: walletBalance, method: preferredMethod })
        });
        if (!res.ok) {
          const err = await res.json();
          alert(`Error: ${err.error || 'Failed to process payout.'}`);
          return;
        }
        alert('✓ Payout request submitted! Funds will arrive within 2-3 business days.');
        loadDashboardData();
      } catch (e) {
        alert('Failed to request payout.');
      }
    }
  };

  // Calculate profile completion percentage
  const profileCompletionScore = () => {
    let score = 30; // base registered
    if (editBusinessName) score += 15;
    if (editCraftCategory) score += 15;
    if (editBusinessStory) score += 20;
    if (editCoverImage || editFounderPhoto) score += 20;
    return Math.min(score, 100);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      minHeight: '100vh',
      backgroundColor: '#0A0A0C',
      color: '#FAF9F6',
      fontFamily: 'var(--font-inter, sans-serif)'
    }}>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEFT SIDEBAR ARTISAN COMMAND PANEL                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <aside style={{
        backgroundColor: '#070709',
        borderRight: '1px solid rgba(212, 175, 55, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.8rem 1.2rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50
      }}>
        <div>
          {/* Header Brand Badge */}
          <div style={{ marginBottom: '2.5rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(212, 175, 55, 0.15)' }}>
            <span style={{ fontSize: '0.6rem', letterSpacing: '3px', color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
              ARTISAN MAKER PORTAL
            </span>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
              {makerProfile?.businessName || user?.name || 'Master Atelier'}
            </h2>
            <span style={{
              display: 'inline-block',
              marginTop: '0.4rem',
              padding: '0.25rem 0.6rem',
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              backgroundColor: isVerifiedMaker ? 'rgba(46,125,50,0.15)' : 'rgba(212,175,55,0.15)',
              color: isVerifiedMaker ? '#2E7D32' : '#D4AF37',
              border: isVerifiedMaker ? '1px solid #2E7D32' : '1px solid #D4AF37'
            }}>
              {makerProfile?.verificationStatus || 'GENERAL MAKER'}
            </span>
          </div>

          {/* SIDEBAR SECTIONS */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* SECTION 1: CATALOG MANAGEMENT */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                ATELIER CATALOG
              </span>
              <button
                onClick={() => setActiveTab('products')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'products' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'products' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'products' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'products' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🏺 Handcrafted Products ({products.length})
              </button>
            </div>

            {/* SECTION 2: STUDIO PROFILE & ACCREDITATION */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                STUDIO ACCREDITATION
              </span>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'profile' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'profile' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'profile' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'profile' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>🎨 Studio Bio & Gallery</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: profileCompletionScore() >= 80 ? '#2E7D32' : '#D4AF37' }}>
                  {profileCompletionScore()}%
                </span>
              </button>
            </div>

            {/* SECTION 3: ORDERS & DISPATCH */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                PATRON ORDERS
              </span>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'orders' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'orders' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'orders' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'orders' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>🛍️ Buyer Orders</span>
                {orders.length > 0 && (
                  <span style={{ backgroundColor: '#D4AF37', color: '#0A0A0C', fontSize: '0.62rem', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    {orders.length}
                  </span>
                )}
              </button>
            </div>

            {/* SECTION 4: WALLET & PAYOUTS */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                EARNINGS & PAYOUTS
              </span>
              <button
                onClick={() => setActiveTab('wallet')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'wallet' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'wallet' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'wallet' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'wallet' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                💰 Earnings & Wallet
              </button>
            </div>

            {/* SECTION 5: PROVENANCE PASSPORTS */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                PROVENANCE PASSPORTS
              </span>
              <button
                onClick={() => setActiveTab('verification')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'verification' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'verification' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'verification' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'verification' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📜 QR Certificates & Audit
              </button>
            </div>

          </nav>
        </div>

        {/* Bottom Navigation Link */}
        <div style={{ paddingTop: '1.2rem', borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <Link
            href="/"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.55rem',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid #D4AF37',
              color: '#D4AF37',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              textDecoration: 'none'
            }}
          >
            ← Public Atelier Market
          </Link>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN WORKSPACE                                                   */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main style={{ padding: '2.5rem 3rem', backgroundColor: '#0A0A0C', minHeight: '100vh', overflowY: 'auto' }}>

        {/* UNVERIFIED MAKER LOCK WARNING BANNER */}
        {!isVerifiedMaker && (
          <div style={{
            backgroundColor: '#121216',
            border: '1px solid #D4AF37',
            padding: '1.8rem 2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                🔒 PRODUCT PUBLISHING LOCKED — STUDIO ACCREDITATION REQUIRED
              </span>
              <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
                Complete your 4-step accreditation profile to unlock product listings
              </h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0.4rem 0 0 0' }}>
                To maintain Britsync's authentic luxury standards, all craft studios must submit their category, workshop media, and heritage story for Guild Audit approval.
              </p>
            </div>

            <button
              onClick={() => { setShowProfileModal(true); setWizardStep(1); }}
              style={{
                padding: '0.85rem 1.6rem',
                backgroundColor: '#D4AF37',
                color: '#0A0A0C',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Start 4-Step Accreditation Wizard →
            </button>
          </div>
        )}

        {/* TOP STATUS BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '1.8rem' }}>
          <div>
            <span style={{ fontSize: '0.62rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
              MAKER WORKSPACE
            </span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
              {activeTab === 'products' && 'Handcrafted Atelier Items'}
              {activeTab === 'profile' && 'Studio Profile & Media Gallery'}
              {activeTab === 'orders' && 'Buyer Orders & Dispatch Management'}
              {activeTab === 'wallet' && 'Earnings, Balance & Bank Withdrawals'}
              {activeTab === 'verification' && 'Cryptographic Passports & Audits'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handlePublishProductClick}
              style={{
                padding: '0.8rem 1.4rem',
                backgroundColor: isVerifiedMaker ? '#D4AF37' : '#2A2A30',
                color: isVerifiedMaker ? '#0A0A0C' : 'rgba(255,255,255,0.4)',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                border: isVerifiedMaker ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              {isVerifiedMaker ? '+ Publish Handcrafted Item' : '🔒 Publish Item (Locked)'}
            </button>

            <button
              onClick={() => { setShowProfileModal(true); setWizardStep(1); }}
              style={{
                padding: '0.8rem 1.4rem',
                backgroundColor: 'transparent',
                color: '#D4AF37',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                border: '1px solid #D4AF37',
                cursor: 'pointer'
              }}
            >
              Edit Studio Details
            </button>
          </div>
        </div>

        {/* TAB 1: PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div>
            {/* ADD PRODUCT MODAL / PANEL */}
            {showAddForm && isVerifiedMaker && (
              <div style={{ backgroundColor: '#121216', border: '1px solid #D4AF37', padding: '2rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.5rem', color: '#FFFFFF' }}>
                  Publish New Handcrafted Item to Britsync Market
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Item Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Crown Ceramic Urn"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Guild Category
                    </label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    >
                      <option value="Ceramics">Ceramics & Pottery</option>
                      <option value="Textiles">Textiles & Weaving</option>
                      <option value="Jewelry">Jewelry & Metalwork</option>
                      <option value="Woodwork">Woodwork & Furniture</option>
                      <option value="Leather">Leather Crafting</option>
                      <option value="Home Decor">Home Decor & Glassware</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Price (£ GBP)
                    </label>
                    <input
                      type="number"
                      placeholder="450.00"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Stock Inventory Count
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Item Image URL (Unsplash or direct link)
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newPrimaryImage}
                      onChange={(e) => setNewPrimaryImage(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Craftsmanship Story & Techniques Used
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how this item was created, materials used, and regional heritage..."
                    value={newProductStory}
                    onChange={(e) => setNewProductStory(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handlePublishProductSubmit}
                    style={{ padding: '0.9rem 2rem', backgroundColor: '#D4AF37', color: '#0A0A0C', fontSize: '0.75rem', fontWeight: 800, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px' }}
                  >
                    Confirm & Publish Item
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    style={{ padding: '0.9rem 1.5rem', backgroundColor: 'transparent', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.8rem', color: '#FFFFFF' }}>
                Your Studio Products ({products.length})
              </h2>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37' }}>
                      <th style={{ padding: '1rem' }}>Handcrafted Item</th>
                      <th style={{ padding: '1rem' }}>Category</th>
                      <th style={{ padding: '1rem' }}>Desired Price</th>
                      <th style={{ padding: '1rem' }}>Stock Inventory</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', opacity: 0.6, fontSize: '0.85rem' }}>
                          No products published yet. Complete your studio profile and request Guild Audit approval to list your items!
                        </td>
                      </tr>
                    ) : (
                      products.map((prod) => (
                        <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <td style={{ padding: '1.2rem 1rem', fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                            {prod.name}
                          </td>
                          <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem' }}>{prod.category}</td>
                          <td style={{ padding: '1.2rem 1rem', fontSize: '0.9rem', color: '#D4AF37', fontWeight: 700 }}>£{Number(prod.price).toFixed(2)}</td>
                          <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem' }}>{prod.stock} units</td>
                          <td style={{ padding: '1.2rem 1rem' }}>
                            <span style={{ padding: '0.3rem 0.7rem', fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid #D4AF37' }}>
                              {prod.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDIO PROFILE & GALLERY */}
        {activeTab === 'profile' && (
          <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '1.2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
                  {makerProfile?.businessName || editBusinessName || 'Atelier Studio Profile'}
                </h2>
                <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>
                  Guild Category: <strong>{editCraftCategory}</strong> • Active for <strong>{editYearsInBusiness} Years</strong> in <strong>{editCityCountry}</strong>
                </p>
              </div>
              <button
                onClick={() => { setShowProfileModal(true); setWizardStep(1); }}
                style={{ padding: '0.8rem 1.5rem', backgroundColor: '#D4AF37', color: '#0A0A0C', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
              >
                Edit Studio Details & Gallery
              </button>
            </div>

            {/* STUDIO BANNER MEDIA */}
            <div style={{ marginBottom: '2.5rem', position: 'relative', height: '220px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
              {editCoverImage ? (
                <img src={editCoverImage} alt="Studio Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#070709', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '0.8rem', letterSpacing: '2px' }}>
                  STUDIO WORKSHOP COVER BANNER
                </div>
              )}
            </div>

            {/* STORIES GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ backgroundColor: '#0A0A0C', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#D4AF37', marginTop: 0, marginBottom: '1rem' }}>Studio Heritage Bio</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.85 }}>
                  {editBusinessStory || 'Dedicated to preserving traditional regional craft techniques and passed-down artisan methods.'}
                </p>
              </div>

              <div style={{ backgroundColor: '#0A0A0C', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#D4AF37', marginTop: 0, marginBottom: '1rem' }}>Master Founder Story</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.85 }}>
                  {editFounderStory || `${user?.name || 'Master Artisan'} leads the studio with a commitment to uncompromised quality and heritage.`}
                </p>
              </div>
            </div>

            {/* CRAFTSMANSHIP PROCESS GALLERY */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, color: '#FFFFFF', marginBottom: '1.2rem' }}>
                Workshop & Craftsmanship Process Gallery
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
                {[editGallery1, editGallery2, editGallery3].map((url, idx) => (
                  <div key={idx} style={{ height: '160px', backgroundColor: '#0A0A0C', border: '1px solid rgba(212,175,55,0.2)', overflow: 'hidden' }}>
                    <img src={url} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.8rem', color: '#FFFFFF' }}>
              Active Patron Orders ({orders.length})
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37' }}>
                    <th style={{ padding: '1rem' }}>Order ID</th>
                    <th style={{ padding: '1rem' }}>Product Purchased</th>
                    <th style={{ padding: '1rem' }}>Buyer Patron</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Order Date</th>
                    <th style={{ padding: '1rem' }}>Dispatch Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', opacity: 0.6, fontSize: '0.85rem' }}>
                        No buyer orders placed yet. As patrons purchase your items, orders will appear here for shipping!
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '1.2rem 1rem', fontWeight: 700, fontSize: '0.85rem', color: '#D4AF37' }}>#{ord.id.slice(0, 8)}</td>
                        <td style={{ padding: '1.2rem 1rem', fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>{ord.product}</td>
                        <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem' }}>{ord.buyer}</td>
                        <td style={{ padding: '1.2rem 1rem', fontSize: '0.9rem', color: '#D4AF37', fontWeight: 700 }}>£{Number(ord.price || 0).toFixed(2)}</td>
                        <td style={{ padding: '1.2rem 1rem', fontSize: '0.82rem' }}>{ord.date}</td>
                        <td style={{ padding: '1.2rem 1rem' }}>
                          <span style={{ padding: '0.3rem 0.7rem', fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(46,125,50,0.15)', color: '#2E7D32', border: '1px solid #2E7D32' }}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: WALLET & PAYOUTS */}
        {activeTab === 'wallet' && (
          <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.8rem', color: '#FFFFFF' }}>
              Studio Earnings & Guild Wallet
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ padding: '1.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  CLEARED BALANCE (ELIGIBLE NOW)
                </span>
                <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', color: '#FFFFFF' }}>
                  £{walletBalance.toFixed(2)}
                </span>
                <button
                  onClick={handleWithdrawFunds}
                  style={{ width: '100%', marginTop: '1.2rem', padding: '0.75rem', backgroundColor: '#D4AF37', color: '#0A0A0C', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
                >
                  Request Payout Now
                </button>
              </div>

              <div style={{ padding: '1.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  ESCROW HELD BALANCE
                </span>
                <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', color: '#FFFFFF' }}>
                  £{pendingAmount.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '1rem' }}>
                  Held until buyer receives order
                </span>
              </div>

              <div style={{ padding: '1.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  TOTAL PAID OUT TO DATE
                </span>
                <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', color: '#FFFFFF' }}>
                  £{paidOutAmount.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#2E7D32', display: 'block', marginTop: '1rem', fontWeight: 600 }}>
                  Processed via {preferredMethod}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VERIFICATION & AUDIT */}
        {activeTab === 'verification' && (
          <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2.5rem', maxWidth: '750px' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.5rem', color: '#FFFFFF' }}>
              Cryptographic Provenance Passports & Guild Verification
            </h2>

            <div style={{ backgroundColor: '#0A0A0C', padding: '1.8rem', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
                CURRENT ACCREDITATION TIER
              </span>
              <h3 style={{ fontSize: '1.5rem', color: '#FFFFFF', margin: 0 }}>
                {makerProfile?.verificationStatus || 'GENERAL MAKER'}
              </h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '0.8rem 0 1.5rem 0', lineHeight: 1.6 }}>
                Request a physical workshop audit by a local Guild Inspector to achieve <strong>GUILD_VERIFIED</strong> status and unlock item publishing on your products.
              </p>

              <button
                onClick={() => { setShowProfileModal(true); setWizardStep(1); }}
                style={{ padding: '0.9rem 1.8rem', backgroundColor: '#D4AF37', color: '#0A0A0C', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
              >
                Request Guild Audit Visit
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 4-STEP STUDIO ACCREDITATION ONBOARDING WIZARD MODAL              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: '#121216',
            border: '1px solid #D4AF37',
            padding: '2.5rem',
            boxShadow: '0 25px 70px rgba(0,0,0,0.9)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* WIZARD HEADER & PROGRESS INDICATOR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 800, display: 'block' }}>
                  STUDIO ACCREDITATION WIZARD — STEP {wizardStep} OF 4
                </span>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
                  {wizardStep === 1 && '1. Guild Category & Studio Identity'}
                  {wizardStep === 2 && '2. Heritage Story & Craftsmanship'}
                  {wizardStep === 3 && '3. Studio & Workshop Media Gallery'}
                  {wizardStep === 4 && '4. Bank Account & Payout Setup'}
                </h3>
              </div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* STEP PROGRESS BAR */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  style={{
                    flex: 1,
                    height: '4px',
                    backgroundColor: wizardStep >= stepNum ? '#D4AF37' : 'rgba(255,255,255,0.1)'
                  }}
                />
              ))}
            </div>

            {/* WIZARD STEP 1: IDENTITY & CATEGORY */}
            {wizardStep === 1 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Guild Craft Specialty Category
                    </label>
                    <select
                      value={editCraftCategory}
                      onChange={(e) => setEditCraftCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    >
                      <option value="Ceramics & Pottery">Ceramics & Pottery</option>
                      <option value="Textiles & Weaving">Textiles & Weaving</option>
                      <option value="Jewelry & Precious Metals">Jewelry & Precious Metals</option>
                      <option value="Woodwork & Joinery">Woodwork & Joinery</option>
                      <option value="Leather Crafting">Leather Crafting</option>
                      <option value="Home Decor & Glassware">Home Decor & Glassware</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Studio / Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Heritage Ceramics"
                      value={editBusinessName}
                      onChange={(e) => setEditBusinessName(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', marginBottom: '1.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Years Active in Craft
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={editYearsInBusiness}
                      onChange={(e) => setEditYearsInBusiness(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Craftsmen Count
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={editEmployeeCount}
                      onChange={(e) => setEditEmployeeCount(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Location (City & Country)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Multan, Pakistan"
                      value={editCityCountry}
                      onChange={(e) => setEditCityCountry(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* WIZARD STEP 2: HERITAGE & STORIES */}
            {wizardStep === 2 && (
              <div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Studio Bio & Generation Origin Story
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share your atelier history, regional roots, and traditional techniques..."
                    value={editBusinessStory}
                    onChange={(e) => setEditBusinessStory(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Master Founder Story & Vision
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share your personal journey as a master artisan..."
                    value={editFounderStory}
                    onChange={(e) => setEditFounderStory(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '1.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Traditional Craft Techniques & Raw Materials Used
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hand-turned wheel, natural wood-fire kilns, mineral glazes"
                    value={editCraftTechniques}
                    onChange={(e) => setEditCraftTechniques(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* WIZARD STEP 3: MEDIA & GALLERY */}
            {wizardStep === 3 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Studio Cover Banner Image URL
                    </label>
                    <input
                      type="text"
                      value={editCoverImage}
                      onChange={(e) => setEditCoverImage(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Master Founder Portrait URL
                    </label>
                    <input
                      type="text"
                      value={editFounderPhoto}
                      onChange={(e) => setEditFounderPhoto(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Workshop Craftsmanship Process Photos (3 URLs)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input type="text" value={editGallery1} onChange={(e) => setEditGallery1(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.82rem' }} />
                    <input type="text" value={editGallery2} onChange={(e) => setEditGallery2(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.82rem' }} />
                    <input type="text" value={editGallery3} onChange={(e) => setEditGallery3(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.82rem' }} />
                  </div>
                </div>
              </div>
            )}

            {/* WIZARD STEP 4: PAYOUT & SUBMISSION */}
            {wizardStep === 4 && (
              <div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Preferred Payout Method
                  </label>
                  <select
                    value={preferredMethod}
                    onChange={(e) => setPreferredMethod(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                  >
                    <option value="Stripe Connect">Stripe Connect (Direct Transfer)</option>
                    <option value="Wise Transfer">Wise (International SWIFT/IBAN)</option>
                    <option value="Direct Bank Transfer">Direct Bank Wire Transfer</option>
                  </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Bank Account / IBAN / Email Details
                  </label>
                  <input
                    type="text"
                    value={payoutAccountDetails}
                    onChange={(e) => setPayoutAccountDetails(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* WIZARD NAVIGATION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1.5rem' }}>
              {wizardStep > 1 && (
                <button
                  onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                  style={{ padding: '0.9rem 1.6rem', backgroundColor: 'transparent', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                >
                  ← Previous Step
                </button>
              )}

              {wizardStep < 4 ? (
                <button
                  onClick={() => setWizardStep((prev) => (prev + 1) as any)}
                  style={{ marginLeft: 'auto', padding: '0.9rem 2rem', backgroundColor: '#D4AF37', color: '#0A0A0C', fontSize: '0.75rem', fontWeight: 800, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px' }}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  disabled={savingProfile}
                  onClick={handleSaveProfileWizard}
                  style={{ marginLeft: 'auto', padding: '0.9rem 2rem', backgroundColor: '#D4AF37', color: '#0A0A0C', fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2.5px' }}
                >
                  {savingProfile ? 'Submitting Profile...' : 'Submit Profile for Guild Verification Audit'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
