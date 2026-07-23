'use client';
import { useState, useEffect } from 'react';
import { calculateSellingPrice } from '@/lib/pricing';
import { BrandingIllustrations } from '@/components/BrandingIllustrations';
import { Icons } from '@/components/Icons';

export default function MakerDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [readinessStep1, setReadinessStep1] = useState(true);
  const [readinessStep2, setReadinessStep2] = useState(true);
  const [readinessStep3, setReadinessStep3] = useState(true);
  const [readinessStep4, setReadinessStep4] = useState(true);
  const [readinessStep5, setReadinessStep5] = useState(false);
  const [readinessStep6, setReadinessStep6] = useState(false);
  const [readinessStep7, setReadinessStep7] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Textiles');
  const [newPrimaryImage, setNewPrimaryImage] = useState('');
  const [newSecondaryImage, setNewSecondaryImage] = useState('');
  const [newImage3, setNewImage3] = useState('');
  const [newImage4, setNewImage4] = useState('');
  const [newImage5, setNewImage5] = useState('');

  // Interactive Seller Wallet & Settings States
  const [preferredMethod, setPreferredMethod] = useState('Stripe Connect');
  const [payoutSchedule, setPayoutSchedule] = useState('Weekly');
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [paidOutAmount, setPaidOutAmount] = useState(1200.00);
  const [pendingAmount, setPendingAmount] = useState(0.00);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Maker profile database models state
  const [makerProfile, setMakerProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings local edit states
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(1);
  const [activeYearsInBusiness, setActiveYearsInBusiness] = useState(1);
  const [activeBusinessName, setActiveBusinessName] = useState('');
  const [activeFounderName, setActiveFounderName] = useState('');

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
      setActiveFounderName(meData.user.name);

      // 2. Fetch maker profile
      const profileRes = await fetch('/api/maker-profile');
      if (!profileRes.ok) {
        return;
      }
      const profileData = await profileRes.json();
      setMakerProfile(profileData);
      setActiveBusinessName(profileData.businessName);
      setActiveEmployeeCount(profileData.employeeCount);
      setActiveYearsInBusiness(profileData.yearsInBusiness);

      // 3. Fetch products
      const productsRes = await fetch(`/api/products?makerId=${profileData.id}&limit=100`);
      const productsData = await productsRes.json();
      const productList = Array.isArray(productsData) ? productsData : (productsData.products || []);
      const mappedProducts = productList.map((p: any) => ({
        id: p.id,
        name: p.name,
        stock: p.inventory,
        price: p.desiredPrice,
        status: p.inventory > 0 ? 'Active' : 'Out of Stock',
        verificationStatus: p.verificationStatus
      }));
      setProducts(mappedProducts);


      // 4. Fetch orders
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();
      const makerOrdersList: any[] = [];
      ordersData.forEach((order: any) => {
        order.orderItems.forEach((item: any) => {
          makerOrdersList.push({
            id: order.id,
            product: item.product.name,
            buyer: order.buyer?.name || 'Premium Buyer',
            date: new Date(order.createdAt).toLocaleDateString(),
            status: order.status
          });
        });
      });
      setOrders(makerOrdersList);

      // 5. Fetch wallet
      const walletRes = await fetch('/api/wallet');
      const walletData = await walletRes.json();
      setWalletBalance(walletData.clearedBalance);
      setPendingAmount(walletData.payoutHeldBalance);

      const mappedTxns = walletData.walletTransactions.map((tx: any) => ({
        id: tx.id.slice(0, 8).toUpperCase(),
        orderId: tx.id.slice(0, 8).toUpperCase(),
        date: new Date(tx.createdAt).toLocaleDateString(),
        buyerCountry: 'UK/Europe',
        product: tx.description,
        sellerAmount: tx.amount,
        margin: 0,
        status: tx.status === 'SUCCESSFUL' ? 'Completed' : 'Pending',
        method: tx.description.includes('Withdrawal') ? 'Withdrawal' : 'Cleared payout'
      }));
      setTransactions(mappedTxns);

      // 6. Fetch verification requests
      const vrRes = await fetch('/api/verification-requests');
      const vrData = await vrRes.json();
      setVerificationRequests(vrData);

      const latestRequest = vrData[0];
      if (profileData.verificationStatus === 'ELITE' || profileData.verificationStatus === 'GI') {
        setReadinessStep7(true);
      } else if (latestRequest && latestRequest.status === 'APPROVED') {
        setReadinessStep7(true);
      } else {
        setReadinessStep7(false);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      let dbStatus = nextStatus;
      if (nextStatus === 'Accepted' || nextStatus === 'Preparing' || nextStatus === 'Packed') {
        dbStatus = 'CONFIRMED';
      } else if (nextStatus === 'Shipped') {
        dbStatus = 'SHIPPED';
      } else if (nextStatus === 'Delivered') {
        dbStatus = 'DELIVERED';
      }

      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: dbStatus })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to update order.'}`);
        return;
      }

      alert(`✓ Order #${orderId} marked as: ${nextStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    } catch (e) {
      alert('Failed to update order.');
    }
  };

  const handleSaveProduct = async () => {
    if (!newProductName || !newProductPrice || !newProductStock) {
      alert('Please fill out all fields.');
      return;
    }

    const priceNum = parseFloat(newProductPrice);
    const stockNum = parseInt(newProductStock);

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      alert('Please enter a valid stock amount.');
      return;
    }

    try {
      const imgList = [newPrimaryImage, newSecondaryImage, newImage3, newImage4, newImage5].filter(Boolean);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          description: `A stunning handcrafted masterpiece representing traditional regional ${newProductCategory} methods.`,
          story: `Passed down through multiple generations, this craft reflects heritage design.`,
          category: newProductCategory,
          price: priceNum,
          inventory: stockNum,
          images: imgList.length > 0 ? imgList : undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Failed to create product.'}`);
        return;
      }

      const data = await res.json();
      const savedP = data.product;

      const newProduct = {
        id: savedP.id,
        name: savedP.name,
        stock: savedP.inventory,
        price: savedP.desiredPrice,
        status: savedP.inventory > 0 ? 'Active' : 'Out of Stock'
      };

      setProducts([...products, newProduct]);
      setShowAddForm(false);
      
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('');
      setNewProductCategory('Textiles');
      setNewPrimaryImage('');
      setNewSecondaryImage('');
      setNewImage3('');
      setNewImage4('');
      setNewImage5('');
      alert('✓ Product published successfully to the Britsync Market!');
    } catch (e) {
      alert('Failed to save product.');
    }
  };

  const handleWithdrawFunds = async () => {
    if (walletBalance <= 0) {
      alert('Your Britsync Wallet balance is £0.00. No payouts are currently eligible for release.');
      return;
    }
    
    const confirmWithdraw = confirm(`Request manual withdrawal of £${walletBalance.toFixed(2)} to ${preferredMethod}?`);
    if (confirmWithdraw) {
      try {
        const res = await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: walletBalance,
            method: preferredMethod
          })
        });

        if (!res.ok) {
          const err = await res.json();
          alert(`Error: ${err.error || 'Failed to process withdrawal.'}`);
          return;
        }

        const data = await res.json();
        alert(`Manual withdrawal request submitted successfully!\n- £${walletBalance.toFixed(2)} is being processed via ${preferredMethod}.\n- Funds will arrive within 2-3 business days.\n- Your Britsync Wallet balance has been updated.`);
        setPaidOutAmount(prev => prev + walletBalance);
        setWalletBalance(data.balance);
      } catch (e) {
        alert('Failed to request withdrawal.');
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/maker-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: activeBusinessName,
          employeeCount: activeEmployeeCount,
          yearsInBusiness: activeYearsInBusiness
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to update settings.'}`);
        return;
      }

      alert('✓ Maker settings saved successfully.');
      loadDashboardData();
    } catch (e) {
      alert('Failed to save settings.');
    }
  };

  const handleRequestVerification = async () => {
    try {
      const res = await fetch('/api/verification-requests', {
        method: 'POST'
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to request verification.'}`);
        return;
      }

      alert('✓ Verification audit request submitted successfully!\n- Local inspector Tariq M. has been scheduled for workshop visit.');
      loadDashboardData();
    } catch (e) {
      alert('Failed to request verification.');
    }
  };

  const handleDownloadInvoice = (txnId: string) => {
    alert(`Downloading Britsync Commercial Payout Invoice: invoice-${txnId}.pdf\nArtisan Payout statement includes tax clearance and proof of direct local currency credit.`);
  };

  return (
    <main className="grid-bg" style={{ padding: '8rem 2rem 6rem', maxWidth: '1400px', margin: '0 auto', width: '100%', backgroundColor: 'var(--background)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Absolute ambient light orbs */}
      <div className="glow-orb" style={{ top: '10%', right: '5%', width: '550px', height: '550px', opacity: 0.6 }} />
      <div className="glow-orb" style={{ bottom: '15%', left: '5%', width: '450px', height: '450px', opacity: 0.4 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '5rem', position: 'relative', zIndex: 10 }}>
        
        {/* Sidebar Navigation */}
        <aside style={{ borderRight: '1px solid var(--glass-border)', paddingRight: '3rem' }}>
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <div style={{ width: '90px', height: '90px', background: 'url(https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=800) center/cover', marginBottom: '1.5rem', border: '1px solid var(--accent)', margin: '0 auto 1.5rem' }}></div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontFamily: 'var(--font-outfit)', fontWeight: 300, marginBottom: '0.3rem' }}>{activeFounderName || 'Master Artisan'}</h2>
            <p style={{ opacity: 0.5, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>{activeBusinessName || 'Heritage Atelier'}</p>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button onClick={() => { setActiveTab('products'); setShowAddForm(false); }} style={{ textAlign: 'left', padding: '1rem', borderRadius: '0px', border: 'none', background: activeTab === 'products' ? 'var(--surface)' : 'transparent', color: activeTab === 'products' ? 'var(--accent)' : 'inherit', fontWeight: activeTab === 'products' ? 500 : 400, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', cursor: 'pointer', borderLeft: activeTab === 'products' ? '2px solid var(--accent)' : '2px solid transparent', paddingLeft: '1rem' }}>Products</button>
            <button onClick={() => { setActiveTab('orders'); setShowAddForm(false); }} style={{ textAlign: 'left', padding: '1rem', borderRadius: '0px', border: 'none', background: activeTab === 'orders' ? 'var(--surface)' : 'transparent', color: activeTab === 'orders' ? 'var(--accent)' : 'inherit', fontWeight: activeTab === 'orders' ? 500 : 400, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', cursor: 'pointer', borderLeft: activeTab === 'orders' ? '2px solid var(--accent)' : '2px solid transparent', paddingLeft: '1rem' }}>Orders</button>
            <button onClick={() => { setActiveTab('earnings'); setShowAddForm(false); }} style={{ textAlign: 'left', padding: '1rem', borderRadius: '0px', border: 'none', background: activeTab === 'earnings' ? 'var(--surface)' : 'transparent', color: activeTab === 'earnings' ? 'var(--accent)' : 'inherit', fontWeight: activeTab === 'earnings' ? 500 : 400, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', cursor: 'pointer', borderLeft: activeTab === 'earnings' ? '2px solid var(--accent)' : '2px solid transparent', paddingLeft: '1rem' }}>Earnings & Wallet</button>
            <button onClick={() => { setActiveTab('passport'); setShowAddForm(false); }} style={{ textAlign: 'left', padding: '1rem', borderRadius: '0px', border: 'none', background: activeTab === 'passport' ? 'var(--surface)' : 'transparent', color: activeTab === 'passport' ? 'var(--accent)' : 'inherit', fontWeight: activeTab === 'passport' ? 500 : 400, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', cursor: 'pointer', borderLeft: activeTab === 'passport' ? '2px solid var(--accent)' : '2px solid transparent', paddingLeft: '1rem' }}>Verification & Passports</button>
            <button onClick={() => { setActiveTab('settings'); setShowAddForm(false); }} style={{ textAlign: 'left', padding: '1rem', borderRadius: '0px', border: 'none', background: activeTab === 'settings' ? 'var(--surface)' : 'transparent', color: activeTab === 'settings' ? 'var(--accent)' : 'inherit', fontWeight: activeTab === 'settings' ? 500 : 400, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', cursor: 'pointer', borderLeft: activeTab === 'settings' ? '2px solid var(--accent)' : '2px solid transparent', paddingLeft: '1rem' }}>Settings</button>
          </nav>
        </aside>

        {/* Content Area */}
        <div>
          {/* 1. PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>Your Products</h1>
                {!showAddForm && (
                  <button onClick={() => setShowAddForm(true)} className="btn-accent" style={{ padding: '0.75rem 1.5rem' }}>+ Add New Product</button>
                )}
              </div>

              {showAddForm ? (
                <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Add New Artisan Craft</h2>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Product Name</label>
                    <input type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="e.g. Hand-Carved Oak Bowl" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>

                  <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
                      Desired Selling Price (GBP £)
                      <span 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--accent)', 
                          color: 'var(--primary)', 
                          fontSize: '0.75rem', 
                          cursor: 'help',
                          fontWeight: 'bold'
                        }}
                        title="This is the exact amount you will receive after every successful sale."
                      >
                        ?
                      </span>
                    </label>
                    <input 
                      type="number" 
                      value={newProductPrice} 
                      onChange={e => setNewProductPrice(e.target.value)} 
                      placeholder="e.g. 20" 
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }} 
                    />
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                      ℹ️ This is the exact amount you will receive after every successful sale.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Initial Stock</label>
                      <input type="number" value={newProductStock} onChange={e => setNewProductStock(e.target.value)} placeholder="e.g. 10" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Category</label>
                      <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', height: '52px' }}>
                        <option value="Textiles">Textiles</option>
                        <option value="Ceramics">Ceramics</option>
                        <option value="Jewelry">Jewelry</option>
                        <option value="Woodwork">Woodwork</option>
                        <option value="Leather">Leather</option>
                        <option value="Home Decor">Home Decor</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Primary Product Image URL (Cover)</label>
                      <input type="text" value={newPrimaryImage} onChange={e => setNewPrimaryImage(e.target.value)} placeholder="https://images.unsplash.com/..." style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>2nd Image URL (Card Hover Picture)</label>
                      <input type="text" value={newSecondaryImage} onChange={e => setNewSecondaryImage(e.target.value)} placeholder="https://images.unsplash.com/..." style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)' }}>Image 3 URL (Optional)</label>
                      <input type="text" value={newImage3} onChange={e => setNewImage3(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)' }}>Image 4 URL (Optional)</label>
                      <input type="text" value={newImage4} onChange={e => setNewImage4(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)' }}>Image 5 URL (Optional)</label>
                      <input type="text" value={newImage5} onChange={e => setNewImage5(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '8px', 
                        border: '1px solid #ccc', 
                        background: 'transparent', 
                        cursor: 'pointer' 
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSaveProduct} 
                      className="btn-accent" 
                      style={{ 
                        padding: '0.75rem 1.5rem'
                      }}
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              ) : null}

              {products.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                  <BrandingIllustrations.EmptyCart size={140} />
                  <div>
                    <p style={{ marginBottom: '1.5rem', opacity: 0.7, fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem' }}>No Artisan Crafts Published Yet</p>
                    <button onClick={() => setShowAddForm(true)} className="btn-accent" style={{ padding: '0.8rem 2.2rem' }}>Add Your First Product</button>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1.5rem' }}>Product Name</th>
                        <th style={{ padding: '1.5rem' }}>Desired Price (You Receive)</th>
                        <th style={{ padding: '1.5rem' }}>Stock</th>
                        <th style={{ padding: '1.5rem' }}>Status</th>
                        <th style={{ padding: '1.5rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{p.name}</td>
                          <td style={{ padding: '1.5rem' }}>
                            <div>£{p.price.toFixed(2)}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>Buyer pays: £{calculateSellingPrice(p.price).toFixed(2)}</div>
                          </td>
                          <td style={{ padding: '1.5rem' }}>{p.stock}</td>
                          <td style={{ padding: '1.5rem' }}>
                             <span style={{ 
                              backgroundColor: p.stock > 0 ? '#E8F5E9' : '#FFEBEE', 
                              color: p.stock > 0 ? '#2E7D32' : '#C62828',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold'
                            }}>
                              {p.stock > 0 ? 'Active' : 'Out of Stock'}
                            </span>
                          </td>
                          <td style={{ padding: '1.5rem' }}>
                            <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', marginRight: '1rem' }}>Edit</button>
                            <button style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. CUSTOMER ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>Customer Orders</h1>
              
              {orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                  <BrandingIllustrations.EmptyCart size={140} />
                  <div>
                    <p style={{ marginBottom: '1.5rem', opacity: 0.7, fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem' }}>No Customer Orders Yet</p>
                    <p style={{ opacity: 0.5, fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>Once patrons purchase your masterpiece, orders will appear here with escrow details.</p>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1.5rem' }}>Order ID</th>
                        <th style={{ padding: '1.5rem' }}>Product</th>
                        <th style={{ padding: '1.5rem' }}>Buyer</th>
                        <th style={{ padding: '1.5rem' }}>Date</th>
                        <th style={{ padding: '1.5rem' }}>Status</th>
                        <th style={{ padding: '1.5rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{o.id}</td>
                          <td style={{ padding: '1.5rem' }}>{o.product}</td>
                          <td style={{ padding: '1.5rem' }}>{o.buyer}</td>
                          <td style={{ padding: '1.5rem' }}>{o.date}</td>
                          <td style={{ padding: '1.5rem' }}>
                            <span style={{ 
                              backgroundColor: o.status === 'Delivered' ? '#e8f5e9' : o.status === 'Shipped' ? '#e0f2f1' : '#FFF3E0', 
                              color: o.status === 'Delivered' ? '#2E7D32' : o.status === 'Shipped' ? '#004d40' : '#E65100',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold'
                            }}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: '1.5rem' }}>
                            {o.status === 'Order Received' && (
                              <button onClick={() => handleUpdateOrderStatus(o.id, 'Accepted')} style={{ border: 'none', backgroundColor: '#e3f2fd', color: '#1565c0', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>Accept Order</button>
                            )}
                            {o.status === 'Accepted' && (
                              <button onClick={() => handleUpdateOrderStatus(o.id, 'Preparing')} style={{ border: 'none', backgroundColor: '#fff3e0', color: '#e65100', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>Start Preparing</button>
                            )}
                            {o.status === 'Preparing' && (
                              <button onClick={() => handleUpdateOrderStatus(o.id, 'Packed')} style={{ border: 'none', backgroundColor: '#f3e5f5', color: '#4a148c', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>Mark Packed</button>
                            )}
                            {o.status === 'Packed' && (
                              <button onClick={() => handleUpdateOrderStatus(o.id, 'Shipped')} style={{ border: 'none', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>Dispatch (Ship)</button>
                            )}
                            {o.status === 'Shipped' && (
                              <button onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')} style={{ border: 'none', backgroundColor: '#e0f2f1', color: '#004d40', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>Confirm Delivered</button>
                            )}
                            {o.status === 'Delivered' && (
                              <span style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 'bold' }}>✓ Safe Arrival</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. EARNINGS & WALLET TAB */}
          {activeTab === 'earnings' && (
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>Earnings & Britsync Wallet</h1>
              
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card">
                  <span style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Available Balance</span>
                  <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0.5rem 0' }}>£{walletBalance.toFixed(2)}</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Escrow cleared</p>
                </div>
                <div className="card">
                  <span style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Pending Earnings</span>
                  <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0.5rem 0' }}>£{pendingAmount.toFixed(2)}</h2>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Locked in Escrow</p>
                </div>
                <div className="card">
                  <span style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Paid Out</span>
                  <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0.5rem 0' }}>£{paidOutAmount.toFixed(2)}</h2>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Transferred to settings</p>
                </div>
                <div className="card">
                  <span style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Lifetime Earnings</span>
                  <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0.5rem 0' }}>£{(walletBalance + paidOutAmount).toFixed(2)}</h2>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Total artisan revenue</p>
                </div>
              </div>

              {/* Wallet Card & Graph */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', marginBottom: '4rem' }}>
                {/* Internal Britsync Wallet */}
                <div className="card" style={{ 
                  background: 'linear-gradient(135deg, var(--primary) 0%, #173630 100%)', 
                  color: 'var(--secondary)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '2.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', backgroundColor: 'rgba(200, 164, 93, 0.08)', borderRadius: '50%' }}></div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <span style={{ letterSpacing: '1.5px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent)' }}>BRITSYNC WALLET</span>
                      <span style={{ fontSize: '1.5rem' }}>💳</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Secure Escrow-Backed Balance</span>
                    <h2 style={{ fontSize: '2.8rem', color: '#FAF9F6', margin: '0.25rem 0 1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>£{walletBalance.toFixed(2)}</h2>
                  </div>
                  
                  <div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      🛡️ Money is held securely here. Withdraw anytime manually or hook up bank/digital transfer options.
                    </p>
                    <button 
                      onClick={handleWithdrawFunds}
                      className="btn-accent" 
                      style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        border: 'none', 
                        fontWeight: 'bold',
                        borderRadius: '30px'
                      }}
                    >
                      Withdraw Balance
                    </button>
                  </div>
                </div>

                {/* SVG Revenue Graph */}
                <div className="card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Earnings Growth Timeline</h3>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>AOV: £131.67 • Orders: {transactions.length}</span>
                  </div>
                  
                  {/* Line Chart Graphic */}
                  <div style={{ position: 'relative', height: '200px', width: '100%', borderBottom: '1px solid #eee', borderLeft: '1px solid #eee', paddingLeft: '1rem', paddingBottom: '1.5rem' }}>
                    <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 150 L 0 120 L 100 100 L 200 85 L 300 75 L 400 45 L 500 25 L 500 150 Z" fill="url(#chartGrad)" />
                      <path d="M 0 120 L 100 100 L 200 85 L 300 75 L 400 45 L 500 25" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="0" cy="120" r="5" fill="var(--primary)" stroke="var(--accent)" strokeWidth="2" />
                      <circle cx="100" cy="100" r="5" fill="var(--primary)" stroke="var(--accent)" strokeWidth="2" />
                      <circle cx="200" cy="85" r="5" fill="var(--primary)" stroke="var(--accent)" strokeWidth="2" />
                      <circle cx="300" cy="75" r="5" fill="var(--primary)" stroke="var(--accent)" strokeWidth="2" />
                      <circle cx="400" cy="45" r="5" fill="var(--primary)" stroke="var(--accent)" strokeWidth="2" />
                      <circle cx="500" cy="25" r="5" fill="var(--primary)" stroke="var(--accent)" strokeWidth="2" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.6 }}>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout & Frequency Settings */}
              <div className="card" style={{ marginBottom: '4rem', padding: '2.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Payout & Gateway Settings</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Preferred Transfer Method</label>
                    <select 
                      value={preferredMethod} 
                      onChange={e => setPreferredMethod(e.target.value)} 
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '1rem' }}
                    >
                      <option value="Stripe Connect">Stripe Connect (Digital Wallet)</option>
                      <option value="Wise">Wise (Local Bank Currency Transfer)</option>
                      <option value="Bank Transfer">Direct Wire Bank Transfer</option>
                      <option value="Payoneer">Payoneer Wallet</option>
                      <option value="Britsync Wallet">Keep inside Britsync Internal Wallet</option>
                      <option value="Manual Transfer">Manual Curation Payout Transfer</option>
                    </select>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem', display: 'block' }}>
                      Makers without local bank accounts are recommended to choose the internal wallet to hold funds securely.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Automatic Payout Frequency</label>
                    <select 
                      value={payoutSchedule} 
                      onChange={e => setPayoutSchedule(e.target.value)} 
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '1rem' }}
                    >
                      <option value="Instant Payout">Instant Payout (Upon Escrow Clearance)</option>
                      <option value="Weekly">Weekly (Every Friday)</option>
                      <option value="Biweekly">Biweekly (1st and 15th)</option>
                      <option value="Monthly">Monthly Statement Payout</option>
                      <option value="Manual Request">Manual Request / Wallet Only</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => alert('Payout preferences updated successfully!')} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                    Save Preferences
                  </button>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Transaction & Payment History</h3>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)', fontSize: '0.9rem' }}>
                        <th style={{ padding: '1.2rem 1.5rem' }}>Order ID / Date</th>
                        <th style={{ padding: '1.2rem 1.5rem' }}>Product / Destination</th>
                        <th style={{ padding: '1.2rem 1.5rem' }}>Pricing Structure</th>
                        <th style={{ padding: '1.2rem 1.5rem' }}>Payout Method</th>
                        <th style={{ padding: '1.2rem 1.5rem' }}>Status</th>
                        <th style={{ padding: '1.2rem 1.5rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(txn => (
                        <tr key={txn.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.5rem' }}>
                            <strong style={{ display: 'block' }}>{txn.orderId}</strong>
                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{txn.date}</span>
                          </td>
                          <td style={{ padding: '1.5rem' }}>
                            <span style={{ display: 'block', fontWeight: 'bold' }}>{txn.product}</span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>To: {txn.buyerCountry}</span>
                          </td>
                          <td style={{ padding: '1.5rem' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                              Your Price: £{txn.sellerAmount.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                              Market Price: £{(txn.sellerAmount + txn.margin).toFixed(2)}
                            </div>
                          </td>
                          <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{txn.method}</td>
                          <td style={{ padding: '1.5rem' }}>
                            <span style={{ 
                              backgroundColor: txn.status === 'Completed' ? '#E8F5E9' : '#FFEBEE', 
                              color: txn.status === 'Completed' ? '#2E7D32' : '#C62828',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold'
                            }}>
                              {txn.status}
                            </span>
                          </td>
                          <td style={{ padding: '1.5rem' }}>
                            <button 
                              onClick={() => handleDownloadInvoice(txn.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                            >
                              Download Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* 4. PASSPORTS & VERIFICATION TAB */}
          {activeTab === 'passport' && (
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <div>
                   <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0 }}>Passports & Verification</h1>
                   <p style={{ opacity: 0.7, margin: '0.25rem 0 0' }}>Monitor your Britsync Export Readiness Index and compliance status.</p>
                 </div>
                 <button 
                   onClick={handleRequestVerification} 
                   className="btn-accent" 
                   style={{ padding: '0.75rem 1.5rem' }}
                 >
                   Request Priority Inspection
                 </button>
               </div>

               {verificationRequests.length > 0 && (
                 <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <strong style={{ display: 'block', color: 'var(--primary)', fontSize: '1.1rem' }}>Elite On-Site Audit Request: {verificationRequests[0].status}</strong>
                     <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>Submitted on {new Date(verificationRequests[0].createdAt).toLocaleDateString()}</span>
                   </div>
                   <span style={{ 
                     backgroundColor: verificationRequests[0].status === 'APPROVED' ? '#E8F5E9' : '#FFF3E0', 
                     color: verificationRequests[0].status === 'APPROVED' ? '#2E7D32' : '#E65100',
                     padding: '0.4rem 1rem',
                     borderRadius: '20px',
                     fontWeight: 'bold',
                     fontSize: '0.85rem'
                   }}>
                     {verificationRequests[0].status}
                   </span>
                 </div>
               )}

               {/* Grid layout for score and checklist */}
               <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
                 
                 {/* Left Column: Interactive Checkpoints */}
                 <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                     Export Compliance Checkpoints
                   </h3>
                   <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.5, margin: 0 }}>
                     Select/uncheck items below to simulate completion of verification steps and watch your Export Readiness Score update.
                   </p>

                   {/* Verification switches */}
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem' }}>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={readinessStep1} 
                          onChange={(e) => setReadinessStep1(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>Identity Verified (+20 pts)</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>Passport ID, biometric facial recognition, and tax registry validated.</span>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={readinessStep2} 
                          onChange={(e) => setReadinessStep2(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>Workshop Registered (+20 pts)</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>GPS coordinates registered and local artisan guild certificate uploaded.</span>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={readinessStep3} 
                          onChange={(e) => setReadinessStep3(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>Story Complete (+15 pts)</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>Artisan narrative, family lineage biography, and video statement submitted.</span>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={readinessStep4} 
                          onChange={(e) => setReadinessStep4(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>Product Images Good (+15 pts)</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>High-resolution white-background catalog photography uploaded.</span>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={readinessStep5} 
                          onChange={(e) => setReadinessStep5(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>Export Documents Submitted (+10 pts)</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>Required HS code declaration, certificate of origin, and custom labels.</span>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={readinessStep6} 
                          onChange={(e) => setReadinessStep6(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>Premium Packing Standard Approved (+10 pts)</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>Artisanal crating in insulated wood, wool cushioning padding to prevent transit breakage.</span>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={readinessStep7} 
                          onChange={(e) => setReadinessStep7(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>Field Inspector On-Site Audit Cleared (+10 pts)</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>Physical verification of safety, labor wages, and working conditions by Tariq M.</span>
                        </div>
                      </label>

                    </div>
                 </div>

                 {/* Right Column: Scorecard & Personalized Recommendations */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   
                   {/* Score Display Card */}
                   <div className="card" style={{ padding: '2.5rem', textAlign: 'center', borderTop: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
                     <span style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                       Britsync Export Readiness Score
                     </span>
                     
                     {/* Score circle */}
                     {(() => {
                        const calculatedScore = (readinessStep1 ? 20 : 0) + 
                                                (readinessStep2 ? 20 : 0) + 
                                                (readinessStep3 ? 15 : 0) + 
                                                (readinessStep4 ? 15 : 0) + 
                                                (readinessStep5 ? 10 : 0) + 
                                                (readinessStep6 ? 10 : 5) + 
                                                (readinessStep7 ? 10 : 9);
                        return (
                          <div style={{ padding: '1rem 0' }}>
                            <h2 style={{ fontSize: '3.5rem', color: 'var(--primary)', margin: 0, fontFamily: 'var(--font-outfit)', fontWeight: 'bold' }}>
                              {calculatedScore}<span style={{ fontSize: '1.5rem', opacity: 0.5 }}>/100</span>
                            </h2>
                          </div>
                        );
                      })()}

                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', textAlign: 'left', fontSize: '0.85rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: readinessStep1 ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>
                         <span>{readinessStep1 ? '✓ Identity Verified' : '✗ Identity Verification Missing'}</span>
                         <span>{readinessStep1 ? '+20 pts' : '0 pts'}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: readinessStep2 ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>
                         <span>{readinessStep2 ? '✓ Workshop Registered' : '✗ Workshop Registry Missing'}</span>
                         <span>{readinessStep2 ? '+20 pts' : '0 pts'}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: readinessStep3 ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>
                         <span>{readinessStep3 ? '✓ Story Complete' : '✗ Story Form Incomplete'}</span>
                         <span>{readinessStep3 ? '+15 pts' : '0 pts'}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: readinessStep4 ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>
                         <span>{readinessStep4 ? '✓ Product Images Good' : '✗ Upload High-Res Images'}</span>
                         <span>{readinessStep4 ? '+15 pts' : '0 pts'}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: readinessStep5 ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>
                         <span>{readinessStep5 ? '✓ Export Documents Submitted' : '✗ Export Documents Missing'}</span>
                         <span>{readinessStep5 ? '+10 pts' : '0 pts'}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: readinessStep6 ? '#2E7D32' : '#E65100', fontWeight: 'bold' }}>
                         <span>{readinessStep6 ? '✓ Premium Packaging Approved' : '⚠ Packaging Needs Improvement'}</span>
                         <span>{readinessStep6 ? '+10 pts' : '+5 pts'}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', color: readinessStep7 ? '#2E7D32' : '#E65100', fontWeight: 'bold' }}>
                         <span>{readinessStep7 ? '✓ On-Site Audit Cleared' : '⚠ Inspection Pending'}</span>
                         <span>{readinessStep7 ? '+10 pts' : '+9 pts'}</span>
                       </div>
                     </div>
                   </div>

                   {/* Recommendations Panel */}
                   <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                     <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)', margin: 0, fontWeight: 'bold' }}>
                       Personalized Action Plan
                     </h4>
                      
                      {(() => {
                        const calculatedScore = (readinessStep1 ? 20 : 0) + 
                                                (readinessStep2 ? 20 : 0) + 
                                                (readinessStep3 ? 15 : 0) + 
                                                (readinessStep4 ? 15 : 0) + 
                                                (readinessStep5 ? 10 : 0) + 
                                                (readinessStep6 ? 10 : 5) + 
                                                (readinessStep7 ? 10 : 9);
                        if (calculatedScore === 100) {
                          return (
                            <div style={{ padding: '1rem', border: '1px solid #388E3C', borderRadius: '8px', backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}>
                              🎉 Excellent! Your workshop is 100% export-ready. Elite status has been successfully unlocked.
                            </div>
                          );
                        }
                        return (
                          <>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>
                              Complete the remaining steps below to elevate your workshop to <strong>Elite</strong> and unlock international buyer routes.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
                              {!readinessStep5 && (
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                  <span style={{ fontSize: '1.2rem' }}>📄</span>
                                  <div>
                                    <strong style={{ display: 'block', color: 'var(--primary)' }}>Submit Commercial Export Docs</strong>
                                    <span style={{ opacity: 0.8 }}>Upload your regional export license and complete custom declarations (+10 pts).</span>
                                  </div>
                                </div>
                              )}

                              {!readinessStep6 && (
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                  <span style={{ fontSize: '1.2rem' }}>📦</span>
                                  <div>
                                    <strong style={{ display: 'block', color: 'var(--primary)' }}>Upgrade Packaging Standards</strong>
                                    <span style={{ opacity: 0.8 }}>Switch to premium wood crating lined with wool padding to pass impact requirements (+5 pts).</span>
                                  </div>
                                </div>
                              )}

                              {!readinessStep7 && (
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                  <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                                  <div>
                                    <strong style={{ display: 'block', color: 'var(--primary)' }}>Clear Physical Inspection Audit</strong>
                                    <span style={{ opacity: 0.8 }}>Field Inspector Tariq M. is scheduled to visit your studio for wage and material validation checks (+1 pt).</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                   </div>

                 </div>

               </div>
              </div>
           )}

          {activeTab === 'settings' && (
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>Settings & Profile</h1>
              <div className="card" style={{ padding: '2.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Business Registration Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Founder Name</label>
                    <input type="text" value={activeFounderName} onChange={e => setActiveFounderName(e.target.value)} disabled style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Business Studio Name</label>
                    <input type="text" value={activeBusinessName} onChange={e => setActiveBusinessName(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Country of Origin</label>
                    <input type="text" value={makerProfile?.country || 'Global'} disabled style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Years in Craft Business</label>
                    <input type="number" value={activeYearsInBusiness} onChange={e => setActiveYearsInBusiness(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem', marginTop: '3rem' }}>Local Artisan Staffing</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Active Employee Count</label>
                    <input type="number" value={activeEmployeeCount} onChange={e => setActiveEmployeeCount(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Staff Support Guild Certification</label>
                    <input type="text" defaultValue="Sindh Artisans Guild Certificate #SAG-204" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button onClick={handleSaveSettings} className="btn-accent" style={{ padding: '0.85rem 2rem' }}>Save Settings</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
