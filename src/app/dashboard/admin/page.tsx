"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getPricingRules, 
  savePricingRules, 
  DEFAULT_RULES, 
  PricingRules 
} from '@/lib/pricing';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [certValidity, setCertValidity] = useState('12');
  const [pricingRules, setPricingRules] = useState<PricingRules>(DEFAULT_RULES);
  
  // Pricing rules states
  const [flatMargin, setFlatMargin] = useState('0');
  const [percentageMargin, setPercentageMargin] = useState('60');
  const [luxuryThreshold, setLuxuryThreshold] = useState('500');
  const [luxuryMargin, setLuxuryMargin] = useState('40');
  const [categoryMargins, setCategoryMargins] = useState<Record<string, string>>({});
  const [countryMargins, setCountryMargins] = useState<Record<string, string>>({});
  const [tierMargins, setTierMargins] = useState({ GENERAL: '50', ELITE: '70', GI: '80' });

  // Database-driven States
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any>({ requests: [], inspectors: [], reports: [] });
  const [tickets, setTickets] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspector registration states
  const [newInspName, setNewInspName] = useState('');
  const [newInspEmail, setNewInspEmail] = useState('');
  const [newInspRegion, setNewInspRegion] = useState('South Asia');

  // Load stats and data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, prodRes, storyRes, reviewRes, verifRes, ticketRes, logsRes] = await Promise.all([
        fetch('/api/admin/dashboard-stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/moderation/products'),
        fetch('/api/admin/moderation/stories'),
        fetch('/api/admin/moderation/reviews'),
        fetch('/api/admin/verifications'),
        fetch('/api/admin/tickets'),
        fetch('/api/admin/activity-logs'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (storyRes.ok) setStories(await storyRes.json());
      if (reviewRes.ok) setReviews(await reviewRes.json());
      if (verifRes.ok) setVerifications(await verifRes.json());
      if (ticketRes.ok) setTickets(await ticketRes.json());
      if (logsRes.ok) setActivityLogs(await logsRes.json());
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Load pricing rules
    const currentRules = getPricingRules();
    setPricingRules(currentRules);
    setFlatMargin(String(currentRules.flatMargin));
    setPercentageMargin(String(currentRules.percentageMargin));
    setLuxuryThreshold(String(currentRules.luxuryThreshold));
    setLuxuryMargin(String(currentRules.luxuryMargin));
    setTierMargins({
      GENERAL: String(currentRules.tierMargins.GENERAL),
      ELITE: String(currentRules.tierMargins.ELITE),
      GI: String(currentRules.tierMargins.GI)
    });
    const catMap: Record<string, string> = {};
    Object.entries(currentRules.categoryMargins).forEach(([k, v]) => { catMap[k] = String(v); });
    setCategoryMargins(catMap);
    const countryMap: Record<string, string> = {};
    Object.entries(currentRules.countryMargins).forEach(([k, v]) => { countryMap[k] = String(v); });
    setCountryMargins(countryMap);
  }, []);

  const handleSaveRules = () => {
    const updatedCategoryMargins: Record<string, number> = {};
    Object.entries(categoryMargins).forEach(([k, v]) => { updatedCategoryMargins[k] = parseFloat(v) || 0; });
    const updatedCountryMargins: Record<string, number> = {};
    Object.entries(countryMargins).forEach(([k, v]) => { updatedCountryMargins[k] = parseFloat(v) || 0; });
    const newRules: PricingRules = {
      flatMargin: parseFloat(flatMargin) || 0,
      percentageMargin: parseFloat(percentageMargin) || 0,
      categoryMargins: updatedCategoryMargins,
      countryMargins: updatedCountryMargins,
      tierMargins: {
        GENERAL: parseFloat(tierMargins.GENERAL) || 50,
        ELITE: parseFloat(tierMargins.ELITE) || 70,
        GI: parseFloat(tierMargins.GI) || 80
      },
      luxuryThreshold: parseFloat(luxuryThreshold) || 500,
      luxuryMargin: parseFloat(luxuryMargin) || 40
    };
    savePricingRules(newRules);
    setPricingRules(newRules);
    alert('Pricing Rules applied across global catalog.');
  };

  const handleApproveVerification = async (requestId: string, tier: string) => {
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'APPROVED', tier }),
      });
      if (res.ok) {
        alert('Verification request approved and passport signed!');
        fetchData();
      } else {
        alert('Failed to approve request');
      }
    } catch {
      alert('Error approving request');
    }
  };

  const handleAssignInspector = async (requestId: string, inspectorId: string) => {
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, inspectorId }),
      });
      if (res.ok) {
        alert('Inspector assigned successfully!');
        fetchData();
      } else {
        alert('Failed to assign inspector');
      }
    } catch {
      alert('Error assigning inspector');
    }
  };

  const handleModerateProduct = async (productId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/moderation/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status }),
      });
      if (res.ok) {
        alert(`Product set to ${status}`);
        fetchData();
      } else {
        alert('Failed to moderate product');
      }
    } catch {
      alert('Error moderating product');
    }
  };

  const handleModerateStory = async (storyId: string, isPublished: boolean) => {
    try {
      const res = await fetch('/api/admin/moderation/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, isPublished }),
      });
      if (res.ok) {
        alert(`Story publish status updated`);
        fetchData();
      } else {
        alert('Failed to moderate story');
      }
    } catch {
      alert('Error moderating story');
    }
  };

  const handleModerateReview = async (reviewId: string, moderationStatus: string) => {
    try {
      const res = await fetch('/api/admin/moderation/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, moderationStatus }),
      });
      if (res.ok) {
        alert(`Review status set to ${moderationStatus}`);
        fetchData();
      } else {
        alert('Failed to moderate review');
      }
    } catch {
      alert('Error moderating review');
    }
  };

  const handleRegisterInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspName || !newInspEmail) return;
    try {
      // Find user by email or create a new user account with role INSPECTOR
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Simple mock assignment since they already exist in database or will be role-promoted
        body: JSON.stringify({ userId: newInspEmail, role: 'INSPECTOR', inspectorRegion: newInspRegion }),
      });
      alert('Inspector assignment request processed.');
      fetchData();
    } catch {
      alert('Error assigning inspector role');
    }
  };

  const sidebarGroups = [
    {
      title: "User Management",
      items: [
        { id: 'users', label: 'Users & Roles', icon: '👥' },
        { id: 'buyers', label: 'Buyers', icon: '🛍️' },
        { id: 'makers', label: 'Makers', icon: '🎨' },
        { id: 'inspectors', label: 'Inspectors Registry', icon: '🔍' },
      ]
    },
    {
      title: "Core Operations",
      items: [
        { id: 'dashboard', label: 'Dashboard Stats', icon: '📊' },
        { id: 'orders', label: 'Global Orders', icon: '📋' },
        { id: 'support', label: 'Support Center', icon: '💬' }
      ]
    },
    {
      title: "Verification & Passports",
      items: [
        { id: 'verification', label: 'Verification Requests', icon: '🛡️' },
        { id: 'insp_reports', label: 'Inspection Reports', icon: '📹' },
        { id: 'passports', label: 'Provenance Passports', icon: '📜' },
      ]
    },
    {
      title: "Moderation & Curation",
      items: [
        { id: 'products', label: 'Product Curation', icon: '🏺' },
        { id: 'stories', label: 'Artisan Stories', icon: '🎬' },
        { id: 'reviews', label: 'Review Moderation', icon: '✍️' },
        { id: 'audit_logs', label: 'System Audit Logs', icon: '📝' }
      ]
    },
    {
      title: "Settings & Pricing",
      items: [
        { id: 'pricing', label: 'Global Pricing Rules', icon: '⚙️' }
      ]
    }
  ];

  return (
    <main style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)', width: '100%' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ 
        width: '290px', 
        borderRight: '1px solid var(--glass-border)', 
        padding: '6rem 1.5rem 2rem 1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2.5rem',
        backgroundColor: 'var(--surface)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        overflowY: 'auto',
        flexShrink: 0
      }}>
        <div style={{ paddingLeft: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: '0 0 0.25rem', fontFamily: 'var(--font-outfit)', fontWeight: 300, letterSpacing: '0.5px' }}>Britsync OS</h2>
          <span style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Enterprise Command</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sidebarGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: '500', opacity: 0.4, textTransform: 'uppercase', marginBottom: '0.6rem', paddingLeft: '0.5rem', letterSpacing: '1px' }}>
                {group.title}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      textAlign: 'left',
                      padding: '0.6rem 0.8rem',
                      border: 'none',
                      background: activeTab === item.id ? 'var(--secondary)' : 'transparent',
                      color: activeTab === item.id ? 'var(--accent)' : 'var(--primary)',
                      fontWeight: activeTab === item.id ? 500 : 400,
                      cursor: 'pointer',
                      borderRadius: '0px',
                      width: '100%',
                      transition: 'all 0.2s ease',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderLeft: activeTab === item.id ? '2px solid var(--accent)' : '2px solid transparent'
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <section className="grid-bg" style={{ flex: 1, padding: '6rem 3rem 6rem', boxSizing: 'border-box', overflowY: 'auto', position: 'relative', overflowX: 'hidden' }}>
        {/* Absolute ambient light orbs */}
        <div className="glow-orb" style={{ top: '10%', right: '5%', width: '500px', height: '500px', opacity: 0.5 }} />
        <div className="glow-orb" style={{ bottom: '15%', left: '5%', width: '400px', height: '400px', opacity: 0.3 }} />
        
        {/* Tab Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.4rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>System Control Center</h1>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Command Panel: <strong>{activeTab.toUpperCase()}</strong></p>
          </div>
        </div>

        {loading && <div style={{ opacity: 0.5, textAlign: 'center', padding: '4rem' }}>Loading system logs and databases...</div>}

        {!loading && (
          <>
            {/* 1. DASHBOARD */}
            {activeTab === 'dashboard' && stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div className="card" style={{ borderTop: '4px solid var(--accent)', padding: '1.5rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Revenue</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '0.2rem 0' }}>£{stats.counters.totalRevenue.toFixed(2)}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Cumulative platform volume</span>
                  </div>
                  <div className="card" style={{ borderTop: '4px solid var(--accent)', padding: '1.5rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Curation</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--accent)', margin: '0.2rem 0' }}>{stats.counters.pendingProducts}</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Products awaiting review</span>
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Open Tickets</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--accent)', margin: '0.2rem 0' }}>{stats.counters.openTickets}</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Awaiting agent replies</span>
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Verification Requests</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '0.2rem 0' }}>{stats.counters.pendingVerifications}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Artisan requests</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Recent Payment Transactions</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '0.5rem' }}>Tx ID</th>
                        <th style={{ padding: '0.5rem' }}>Customer</th>
                        <th style={{ padding: '0.5rem' }}>Amount</th>
                        <th style={{ padding: '0.5rem' }}>Provider</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.transactions.map((tx: any) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{tx.id.slice(0, 8)}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{tx.buyer}</td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>£{tx.amount.toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{tx.provider}</td>
                          <td style={{ padding: '0.75rem 0.5rem', color: tx.status === 'COMPLETED' ? 'var(--success)' : 'var(--accent)' }}>{tx.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. USERS */}
            {activeTab === 'users' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>User Directory</h2>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Name / Email</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Role</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Verified Email</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Artisan Studio</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Audit Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem' }}>
                            <strong style={{ display: 'block' }}>{u.name}</strong>
                            <span style={{ opacity: 0.6 }}>{u.email}</span>
                          </td>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{u.role}</td>
                          <td style={{ padding: '1.2rem' }}>{u.isEmailVerified ? '✅ Yes' : '❌ No'}</td>
                          <td style={{ padding: '1.2rem' }}>{u.makerProfile?.businessName || '-'}</td>
                          <td style={{ padding: '1.2rem' }}>{u.makerProfile?.verificationStatus || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. BUYERS */}
            {activeTab === 'buyers' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Buyer Activity Tracker</h2>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Buyer Name</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Email</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Account Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === 'BUYER').map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{b.name}</td>
                          <td style={{ padding: '1.2rem' }}>{b.email}</td>
                          <td style={{ padding: '1.2rem', color: 'var(--success)' }}>Active</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. MAKERS */}
            {activeTab === 'makers' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Registered Maker Studios</h2>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Studio</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Owner</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Location</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === 'MAKER').map((m) => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{m.makerProfile?.businessName || 'Artisan Studio'}</td>
                          <td style={{ padding: '1.2rem' }}>{m.name}</td>
                          <td style={{ padding: '1.2rem' }}>{m.makerProfile?.location || 'Global'}</td>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{m.makerProfile?.verificationStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. INSPECTORS */}
            {activeTab === 'inspectors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Certified Field Agents</h2>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                          <th style={{ padding: '1rem 1.2rem' }}>Agent Name</th>
                          <th style={{ padding: '1rem 1.2rem' }}>Email Address</th>
                          <th style={{ padding: '1rem 1.2rem' }}>Jurisdiction Region</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.role === 'INSPECTOR').map(ins => (
                          <tr key={ins.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{ins.name}</td>
                            <td style={{ padding: '1.2rem' }}>{ins.email}</td>
                            <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{ins.inspectorProfile?.regionScope || 'Global Scope'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && stats && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Global Order Pipeline</h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Order ID</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Customer</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Amount</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Pipeline Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.transactions.map((o: any) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{o.orderId?.slice(0, 12).toUpperCase()}</td>
                          <td style={{ padding: '1.2rem' }}>{o.buyer}</td>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>£{o.amount.toFixed(2)}</td>
                          <td style={{ padding: '1.2rem' }}>
                            <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUPPORT CENTER */}
            {activeTab === 'support' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Platform Support Tickets</h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Subject Inquiry</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Sender</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Priority</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Status</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem' }}>
                            <strong>{t.subject}</strong>
                            <p style={{ margin: '0.25rem 0 0', opacity: 0.6, fontSize: '0.8rem' }}>{t.description.slice(0, 60)}...</p>
                          </td>
                          <td style={{ padding: '1.2rem' }}>{t.user.name} ({t.user.role})</td>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{t.priority}</td>
                          <td style={{ padding: '1.2rem', color: t.status === 'OPEN' ? 'var(--error)' : 'var(--success)' }}>{t.status}</td>
                          <td style={{ padding: '1.2rem' }}>
                            <Link href={`/dashboard/buyer?tab=support`} style={{ textDecoration: 'underline', color: 'var(--accent)' }}>View Thread</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VERIFICATION REQUESTS */}
            {activeTab === 'verification' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Pending Verification Requests</h2>
                  <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                          <th style={{ padding: '1rem 1.2rem' }}>Artisan Studio</th>
                          <th style={{ padding: '1rem 1.2rem' }}>Assigned Inspector</th>
                          <th style={{ padding: '1rem 1.2rem' }}>Status</th>
                          <th style={{ padding: '1rem 1.2rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifications.requests.map((req: any) => (
                          <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{req.makerName}</td>
                            <td style={{ padding: '1.2rem' }}>{req.inspectorName || 'Unassigned'}</td>
                            <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{req.status}</td>
                            <td style={{ padding: '1.2rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {req.status === 'PENDING' && (
                                  <select onChange={(e) => handleAssignInspector(req.id, e.target.value)} defaultValue="" style={{ padding: '0.2rem', borderRadius: '4px' }}>
                                    <option value="" disabled>Assign Inspector...</option>
                                    {verifications.inspectors.map((ins: any) => (
                                      <option key={ins.id} value={ins.id}>{ins.name} ({ins.regionScope})</option>
                                    ))}
                                  </select>
                                )}
                                {req.status !== 'APPROVED' && (
                                  <>
                                    <button onClick={() => handleApproveVerification(req.id, 'ELITE')} style={{ border: 'none', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Verify Elite</button>
                                    <button onClick={() => handleApproveVerification(req.id, 'GI')} style={{ border: 'none', backgroundColor: '#e3f2fd', color: '#1565c0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Verify GI</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* INSPECTION REPORTS */}
            {activeTab === 'insp_reports' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Physical Inspection Reports</h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Studio</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Inspector</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Score</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.reports.map((rep: any) => (
                        <tr key={rep.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{rep.makerName}</td>
                          <td style={{ padding: '1.2rem' }}>{rep.inspectorName}</td>
                          <td style={{ padding: '1.2rem', color: 'var(--success)', fontWeight: 'bold' }}>{rep.qualityScore}/100</td>
                          <td style={{ padding: '1.2rem' }}>{rep.notes || 'No notes added'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PROVENANCE PASSPORTS */}
            {activeTab === 'passports' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Cryptographic Provenance Passports</h2>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Serial Number</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Product Name</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Maker</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Events Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.filter(a => a.action === 'CREATE_PASSPORT').map((p: any) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{JSON.parse(p.afterState || '{}').passportSerial || 'BS-PASSPORT-INIT'}</td>
                          <td style={{ padding: '1.2rem' }}>Active Passport Record</td>
                          <td style={{ padding: '1.2rem' }}>{p.adminName}</td>
                          <td style={{ padding: '1.2rem' }}>1 Event (CREATED)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PRODUCT CURATION */}
            {activeTab === 'products' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Product Moderation Queue</h2>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Product Name</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Artisan Studio</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Category</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Price</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Status</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Curation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{p.name}</td>
                          <td style={{ padding: '1.2rem' }}>{p.maker}</td>
                          <td style={{ padding: '1.2rem' }}>{p.category}</td>
                          <td style={{ padding: '1.2rem' }}>£{p.price.toFixed(2)}</td>
                          <td style={{ padding: '1.2rem', color: 'var(--accent)', fontWeight: 'bold' }}>{p.status}</td>
                          <td style={{ padding: '1.2rem' }}>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              {p.status !== 'PUBLISHED' && (
                                <button onClick={() => handleModerateProduct(p.id, 'PUBLISHED')} style={{ border: 'none', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Publish</button>
                              )}
                              {p.status !== 'REJECTED' && (
                                <button onClick={() => handleModerateProduct(p.id, 'REJECTED')} style={{ border: 'none', backgroundColor: '#ffebee', color: '#c62828', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ARTISAN STORIES */}
            {activeTab === 'stories' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Artisan Heritage Stories</h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Artisan / Village</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Story Title</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Moderation State</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stories.map((s) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem' }}>
                            <strong>{s.maker}</strong>
                            <p style={{ margin: '0.25rem 0 0', opacity: 0.5, fontSize: '0.8rem' }}>{s.village}</p>
                          </td>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{s.title}</td>
                          <td style={{ padding: '1.2rem', color: s.isPublished ? 'var(--success)' : 'var(--accent)' }}>{s.isPublished ? 'Published' : 'Draft Curation'}</td>
                          <td style={{ padding: '1.2rem' }}>
                            <button onClick={() => handleModerateStory(s.id, !s.isPublished)} className="btn-accent" style={{ padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                              {s.isPublished ? 'Unpublish' : 'Publish Story'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REVIEW MODERATION */}
            {activeTab === 'reviews' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Reviews Moderation Center</h2>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Product</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Buyer</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Rating / Review</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Flags</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Status</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{r.productName}</td>
                          <td style={{ padding: '1.2rem' }}>{r.buyerName}</td>
                          <td style={{ padding: '1.2rem' }}>
                            <strong>{'⭐'.repeat(r.rating)}</strong>
                            <p style={{ margin: '0.25rem 0 0', opacity: 0.8 }}>{r.comment || 'No comment text'}</p>
                          </td>
                          <td style={{ padding: '1.2rem', color: 'var(--error)' }}>
                            {r.reports.length > 0 ? `⚠️ Flagged: ${r.reports.map((x: any) => x.reason).join(', ')}` : 'None'}
                          </td>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{r.moderationStatus}</td>
                          <td style={{ padding: '1.2rem' }}>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {r.moderationStatus !== 'APPROVED' && (
                                <button onClick={() => handleModerateReview(r.id, 'APPROVED')} style={{ border: 'none', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>Approve</button>
                              )}
                              {r.moderationStatus !== 'REJECTED' && (
                                <button onClick={() => handleModerateReview(r.id, 'REJECTED')} style={{ border: 'none', backgroundColor: '#fff3e0', color: '#e65100', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>Flag/Reject</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SYSTEM AUDIT LOGS */}
            {activeTab === 'audit_logs' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Platform Administrative Activity Logs</h2>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        <th style={{ padding: '1rem 1.2rem' }}>Timestamp</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Admin User</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Action Taken</th>
                        <th style={{ padding: '1rem 1.2rem' }}>Target Table</th>
                        <th style={{ padding: '1rem 1.2rem' }}>State Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1.2rem' }}>{new Date(log.createdAt).toLocaleString('en-GB')}</td>
                          <td style={{ padding: '1.2rem' }}>{log.adminName} ({log.adminEmail})</td>
                          <td style={{ padding: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{log.action}</td>
                          <td style={{ padding: '1.2rem' }}>{log.tableName || '-'}</td>
                          <td style={{ padding: '1.2rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.afterState ? log.afterState : 'Initial Action'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. GLOBAL PRICING RULES */}
            {activeTab === 'pricing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Britsync Margin Pricing Rules</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.9rem' }}>Global Percentage Markup (%)</label>
                      <input type="number" value={percentageMargin} onChange={e => setPercentageMargin(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.9rem' }}>Flat Transaction Fee (£)</label>
                      <input type="number" value={flatMargin} onChange={e => setFlatMargin(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.9rem' }}>Luxury Price Threshold (£)</label>
                      <input type="number" value={luxuryThreshold} onChange={e => setLuxuryThreshold(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.9rem' }}>Luxury Tier Margin (%)</label>
                      <input type="number" value={luxuryMargin} onChange={e => setLuxuryMargin(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
                    </div>
                    <button onClick={handleSaveRules} className="btn-accent" style={{ padding: '0.85rem 2rem', marginTop: '1rem', width: 'fit-content' }}>
                      Apply Margin Matrix
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

    </main>
  );
}
