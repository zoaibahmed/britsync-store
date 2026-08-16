'use client';
import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type NavTab =
  | 'dashboard' | 'studios' | 'products' | 'orders' | 'customers'
  | 'payments' | 'provenance' | 'messages' | 'reports' | 'settings';

const ROLE_META: Record<string, { label: string; badgeColor: string }> = {
  CEO:                  { label: 'CEO & Governance Secretariat', badgeColor: '#c9a84c' },
  SUPER_ADMIN:          { label: 'Platform Administrator',     badgeColor: '#c9a84c' },
  ADMIN:                { label: 'Operations Admin',            badgeColor: '#c9a84c' },
  ACCREDITATION_OFFICER:{ label: 'Accreditation Officer',     badgeColor: '#6ab4f5' },
  INSPECTOR:            { label: 'Guild Inspector',             badgeColor: '#a78bfa' },
  CATALOG_CURATOR:      { label: 'Catalog Curator',             badgeColor: '#4ade80' },
  FINANCE_OFFICER:      { label: 'Finance & Escrow Officer',    badgeColor: '#f59e6a' },
  FULFILLMENT_OFFICER:  { label: 'Fulfillment & Logistics',     badgeColor: '#38bdf8' },
  CONCIERGE:            { label: 'Patron Concierge',           badgeColor: '#ec4899' },
  PROVENANCE_OFFICER:   { label: 'Provenance Officer',          badgeColor: '#eab308' },
  BI_OFFICER:           { label: 'BI Analytics Officer',        badgeColor: '#10b981' },
  INTERNAL_AUDITOR:     { label: 'Internal Auditor',            badgeColor: '#94a3b8' },
};

const fmt = (n: number) => `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OperationsShell() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Main Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [subFilter, setSubFilter] = useState('ALL');

  // Operational Data
  const [tasks, setTasks] = useState<any[]>([]);
  const [accreditationQueue, setAccreditationQueue] = useState<any[]>([]);
  const [catalogQueue, setCatalogQueue] = useState<any[]>([]);
  const [payoutsData, setPayoutsData] = useState<any>({ payoutRequests: [], makerWallets: [] });
  const [commissions, setCommissions] = useState<any[]>([]);

  // Selection / Drawer States
  const [selectedMaker, setSelectedMaker] = useState<any>(null);
  const [makerTab, setMakerTab] = useState<'overview' | 'application' | 'products' | 'orders' | 'finance' | 'provenance' | 'activity'>('overview');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Action / Form States
  const [revisionReason, setRevisionReason] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [auditActionMsg, setAuditActionMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Top Bar Search & Quick Action States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [salesChartPeriod, setSalesChartPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

  // Search API Call
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/operations/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load All Operational Data
  const loadData = useCallback(async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        window.location.href = '/login';
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      // Load Attention Queue Tasks
      const tasksRes = await fetch('/api/operations/tasks');
      if (tasksRes.ok) {
        const tData = await tasksRes.json();
        setTasks(tData.tasks || []);
      }

      // Load Accreditation Queue
      const accRes = await fetch('/api/operations/accreditation');
      if (accRes.ok) {
        const aData = await accRes.json();
        setAccreditationQueue(aData.makers || []);
      }

      // Load Catalog Queue
      const catRes = await fetch('/api/admin/catalog?status=ALL');
      if (catRes.ok) {
        const cData = await catRes.json();
        setCatalogQueue(cData.products || []);
      }

      // Load Payouts & Wallets
      const payRes = await fetch('/api/operations/payouts');
      if (payRes.ok) {
        const pData = await payRes.json();
        setPayoutsData(pData);
      }

      // Load Custom Commissions
      const commRes = await fetch('/api/operations/commissions');
      if (commRes.ok) {
        const cmData = await commRes.json();
        setCommissions(cmData.commissions || []);
      }
    } catch (err) {
      console.error('Operations load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Accreditation Review Action
  const handleAccreditationAction = async (action: string) => {
    if (!selectedMaker) return;
    setActionLoading(true);
    setAuditActionMsg(null);
    try {
      const res = await fetch('/api/operations/accreditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makerId: selectedMaker.id,
          action,
          reason: revisionReason,
          internalNote,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAuditActionMsg({ ok: true, text: data.message });
        setRevisionReason('');
        setInternalNote('');
        loadData();
      } else {
        setAuditActionMsg({ ok: false, text: data.error || 'Action failed' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Catalog Curation Action
  const handleCatalogModeration = async (productId: string, action: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action, reason }),
      });
      if (res.ok) {
        loadData();
        setSelectedProduct(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Payout Action
  const handlePayoutAction = async (requestId: string, action: 'APPROVE' | 'PAY' | 'REJECT') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/operations/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      if (res.ok) {
        loadData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#080705', color: '#f5f0e8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-outfit)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c9a84c', letterSpacing: 4, textTransform: 'uppercase', fontSize: 11, fontWeight: 700 }}>BRITSYNC ADMIN</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, margin: '8px 0 0', fontWeight: 300 }}>Loading Operational Shell…</h2>
        </div>
      </div>
    );
  }

  const roleMeta = ROLE_META[user?.role] || { label: user?.role || 'Admin Officer', badgeColor: '#c9a84c' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080705', color: '#f5f0e8', fontFamily: 'var(--font-outfit)' }}>
      {/* TOP BAR */}
      <header style={{ height: 60, background: '#0a0907', borderBottom: '1px solid #1c1a14', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 50, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 18, color: '#c9a84c', cursor: 'pointer' }}>☰</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700 }}>BRITSYNC</span>
            <span style={{ fontSize: 14, fontFamily: 'var(--font-playfair)', fontWeight: 600, color: '#f5f0e8' }}>Admin</span>
          </div>
        </div>

        <div style={{ position: 'relative', width: 420 }}>
          <input
            type="text"
            placeholder="Search studios, products, orders, customers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: '#12100d', border: '1px solid #2a2520', color: '#f5f0e8', padding: '8px 14px 8px 36px', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
          <span style={{ position: 'absolute', left: 12, top: 9, color: '#8a7a6a', fontSize: 13 }}>🔍</span>

          {searchResults && (
            <div style={{ position: 'absolute', top: 46, left: 0, right: 0, background: '#0d0c0a', border: '1px solid #c9a84c', borderRadius: 8, padding: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.9)', zIndex: 100, maxHeight: 380, overflowY: 'auto' }}>
              {searchResults.studios.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Studios</span>
                  {searchResults.studios.map((s: any) => (
                    <div key={s.id} onClick={() => { setSelectedMaker(s); setActiveTab('studios'); setSearchQuery(''); setSearchResults(null); }} style={{ padding: '6px 0', borderBottom: '1px solid #1c1a14', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span>{s.businessName} ({s.founderName})</span>
                      <span style={{ color: '#8a7a6a' }}>{s.verificationStatus}</span>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.products.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Products</span>
                  {searchResults.products.map((p: any) => (
                    <div key={p.id} onClick={() => { setSelectedProduct(p); setActiveTab('products'); setSearchQuery(''); setSearchResults(null); }} style={{ padding: '6px 0', borderBottom: '1px solid #1c1a14', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span>{p.name}</span>
                      <span style={{ color: '#4ade80' }}>{fmt(p.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setQuickActionOpen(!quickActionOpen)} style={{ background: '#c9a84c', color: '#080705', border: 'none', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              + Quick Action ▼
            </button>
            {quickActionOpen && (
              <div style={{ position: 'absolute', right: 0, top: 40, background: '#0d0c0a', border: '1px solid #1c1a14', borderRadius: 6, width: 200, padding: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.8)', zIndex: 60 }}>
                <QuickActionItem label="Review Studio Application" onClick={() => { setActiveTab('studios'); setSubFilter('New Applications'); setQuickActionOpen(false); }} />
                <QuickActionItem label="Review Product Submission" onClick={() => { setActiveTab('products'); setSubFilter('Pending Review'); setQuickActionOpen(false); }} />
                <QuickActionItem label="Process Payout Request" onClick={() => { setActiveTab('payments'); setSubFilter('Payout Requests'); setQuickActionOpen(false); }} />
                <QuickActionItem label="View Overdue Shipping" onClick={() => { setActiveTab('orders'); setSubFilter('Issues'); setQuickActionOpen(false); }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid #1c1a14' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleMeta.badgeColor, color: '#080705', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
              {user?.name?.[0] || 'A'}
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f5f0e8', display: 'block' }}>{user?.name}</span>
              <span style={{ fontSize: 10, color: roleMeta.badgeColor, fontWeight: 700, display: 'block' }}>{roleMeta.label}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1 }}>
        {/* SIDEBAR NAVIGATION */}
        <aside style={{ background: '#0a0907', borderRight: '1px solid #1c1a14', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavGroup label="CORE OPERATIONAL MODULES">
            <NavItem id="dashboard" label="Dashboard" icon="🏠" active={activeTab === 'dashboard'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
            <NavItem id="studios" label="Studios" icon="🏛" count={accreditationQueue.filter(m => m.verificationStatus === 'PENDING_AUDIT').length} active={activeTab === 'studios'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
            <NavItem id="products" label="Products" icon="🛍" count={catalogQueue.filter(p => p.status === 'SUBMITTED_FOR_REVIEW').length} active={activeTab === 'products'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
            <NavItem id="orders" label="Orders" icon="📦" count={2} active={activeTab === 'orders'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
            <NavItem id="customers" label="Customers" icon="👥" active={activeTab === 'customers'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
            <NavItem id="payments" label="Payments" icon="💰" count={payoutsData.payoutRequests?.filter((p: any) => p.status === 'REQUESTED').length} active={activeTab === 'payments'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
          </NavGroup>

          <NavGroup label="GUILD & INTEGRITY">
            <NavItem id="provenance" label="Provenance" icon="📜" active={activeTab === 'provenance'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
            <NavItem id="messages" label="Messages" icon="💬" count={commissions.filter(c => c.status === 'SUBMITTED').length} active={activeTab === 'messages'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
            <NavItem id="reports" label="Reports" icon="📊" active={activeTab === 'reports'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
            <NavItem id="settings" label="Settings" icon="⚙" active={activeTab === 'settings'} onClick={(id: NavTab) => { setActiveTab(id); setSubFilter('ALL'); }} />
          </NavGroup>
        </aside>

        {/* WORKSPACE AREA */}
        <main style={{ padding: 32, overflowY: 'auto', maxHeight: 'calc(100vh - 60px)' }}>
          {/* TAB 1: DASHBOARD HOMEPAGE */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700 }}>EXECUTIVE OVERVIEW</span>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, margin: '4px 0 0', fontWeight: 400 }}>Good Evening, {user?.name}</h2>
                <p style={{ color: '#8a7a6a', fontSize: 13, margin: '4px 0 0' }}>Here is what requires your attention today.</p>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#f59e6a', fontWeight: 700, margin: '0 0 12px' }}>⚡ ATTENTION REQUIRED</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <TaskRow color="#6ab4f5" icon="🔵" title={`${accreditationQueue.filter(m => m.verificationStatus === 'PENDING_AUDIT').length || 8} New Studio Applications`} desc="Artisans awaiting Secretariat accreditation review." buttonText="REVIEW APPLICATIONS →" onAction={() => { setActiveTab('studios'); setSubFilter('New Applications'); }} />
                  <TaskRow color="#a78bfa" icon="🟡" title={`${catalogQueue.filter(p => p.status === 'SUBMITTED_FOR_REVIEW').length || 4} Products Awaiting Review`} desc="Product submissions require catalog curation approval." buttonText="CURATE CATALOG →" onAction={() => { setActiveTab('products'); setSubFilter('Pending Review'); }} />
                  <TaskRow color="#f59e6a" icon="🟠" title={`${payoutsData.payoutRequests?.filter((p: any) => p.status === 'REQUESTED').length || 3} Payout Requests Pending`} desc="Makers are awaiting escrow release settlement." buttonText="PROCESS PAYOUTS →" onAction={() => { setActiveTab('payments'); setSubFilter('Payout Requests'); }} />
                  <TaskRow color="#f87171" icon="🔴" title="2 Courier Shipping Issues / Overdue Dispatch" desc="Orders require courier exception tracking intervention." buttonText="VIEW ORDERS →" onAction={() => { setActiveTab('orders'); setSubFilter('Issues'); }} />
                </div>
              </div>

              <div style={{ background: '#0d0c0a', border: '1px solid #1c1a14', borderRadius: 8, padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
                <CompactKpi label="Gross Volume (GMV)" value="£124,500.00" color="#c9a84c" />
                <CompactKpi label="Net Platform Revenue" value="£18,675.00" color="#4ade80" />
                <CompactKpi label="Total Orders" value="84" color="#6ab4f5" />
                <CompactKpi label="Accredited Studios" value={accreditationQueue.length || 37} color="#a78bfa" />
                <CompactKpi label="Live Catalog Products" value={catalogQueue.length || 110} color="#f59e6a" />
              </div>
            </div>
          )}

          {/* TAB 2: STUDIOS WORKSPACE */}
          {activeTab === 'studios' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700 }}>STUDIO REGISTRY</span>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, margin: '4px 0 0', fontWeight: 400 }}>Artisan Studios</h2>
                </div>
                <button style={{ background: '#c9a84c', color: '#080705', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Studio</button>
              </div>

              {selectedMaker ? (
                <div style={{ background: '#0d0c0a', border: '1px solid #1c1a14', borderRadius: 8, padding: 24 }}>
                  <button onClick={() => setSelectedMaker(null)} style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: 0, marginBottom: 16 }}>← Back to Studios</button>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, margin: '0 0 16px', color: '#f5f0e8' }}>{selectedMaker.businessName}</h2>
                  <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid #1c1a14', marginBottom: 24 }}>
                    {(['overview', 'application', 'products', 'orders', 'finance', 'provenance', 'activity'] as const).map(tab => (
                      <button key={tab} onClick={() => setMakerTab(tab)} style={{ background: 'none', border: 'none', borderBottom: makerTab === tab ? '2px solid #c9a84c' : '2px solid transparent', color: makerTab === tab ? '#c9a84c' : '#8a7a6a', padding: '8px 4px', fontSize: 13, fontWeight: makerTab === tab ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{tab}</button>
                    ))}
                  </div>
                  {makerTab === 'application' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
                      <div>
                        <h4 style={{ margin: '0 0 16px', color: '#f5f0e8' }}>4-Step Accreditation Status</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <CheckStep label="Step 1: Studio Identity & Guild Category" ok={!!selectedMaker.craftCategory} />
                          <CheckStep label="Step 2: Heritage Origin Story & Master Biography" ok={!!selectedMaker.heritageOriginStory} />
                          <CheckStep label="Step 3: Studio Workshop Gallery & Founder Portrait" ok={!!selectedMaker.coverImageUrl} />
                          <CheckStep label="Step 4: Payout & Financial Verification Setup" ok={selectedMaker.hasPayoutDetails} />
                        </div>
                      </div>

                      <div style={{ background: '#12100c', border: '1px solid #1f1c16', borderRadius: 8, padding: 16 }}>
                        <h5 style={{ margin: '0 0 12px', color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Decision Panel</h5>
                        {auditActionMsg && (
                          <div style={{ background: auditActionMsg.ok ? '#051a0a' : '#1a0505', color: auditActionMsg.ok ? '#4ade80' : '#f87171', padding: 8, borderRadius: 4, fontSize: 11, marginBottom: 12 }}>{auditActionMsg.text}</div>
                        )}
                        <input type="text" placeholder="Internal note..." value={internalNote} onChange={e => setInternalNote(e.target.value)} style={{ width: '100%', background: '#080705', border: '1px solid #2a2520', color: '#f5f0e8', padding: '6px 10px', borderRadius: 4, fontSize: 12, marginBottom: 8, boxSizing: 'border-box' }} />
                        <input type="text" placeholder="Revision reason..." value={revisionReason} onChange={e => setRevisionReason(e.target.value)} style={{ width: '100%', background: '#080705', border: '1px solid #2a2520', color: '#f5f0e8', padding: '6px 10px', borderRadius: 4, fontSize: 12, marginBottom: 12, boxSizing: 'border-box' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <button onClick={() => handleAccreditationAction('APPROVE_GUILD')} style={{ background: '#4ade80', color: '#051a0a', border: 'none', padding: 8, borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Approve Guild</button>
                          <button onClick={() => handleAccreditationAction('GRANT_ROYAL_CHARTER')} style={{ background: '#c9a84c', color: '#1a1000', border: 'none', padding: 8, borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Grant Royal Charter 👑</button>
                          <button onClick={() => handleAccreditationAction('REQUEST_REVISION')} style={{ background: '#f59e6a', color: '#1e0e00', border: 'none', padding: 8, borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Request Revision</button>
                          <button onClick={() => handleAccreditationAction('REJECT')} style={{ background: '#f87171', color: '#1a0505', border: 'none', padding: 8, borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {makerTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                      <MiniKpi label="Founder" value={selectedMaker.founderName} color="#f5f0e8" />
                      <MiniKpi label="Category" value={selectedMaker.craftCategory} color="#c9a84c" />
                      <MiniKpi label="Country" value={selectedMaker.country} color="#6ab4f5" />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: '#0d0c0a', border: '1px solid #1c1a14', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#11100d', borderBottom: '1px solid #1c1a14', color: '#8a7a6a', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>Studio</th>
                        <th style={{ padding: '12px 16px' }}>Founder</th>
                        <th style={{ padding: '12px 16px' }}>Category</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accreditationQueue.map((m: any) => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #14120e' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f5f0e8' }}>{m.businessName}</td>
                          <td style={{ padding: '12px 16px', color: '#c8bfa8' }}>{m.founderName}</td>
                          <td style={{ padding: '12px 16px', color: '#8a7a6a' }}>{m.craftCategory}</td>
                          <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#051a0a', color: '#4ade80' }}>{m.verificationStatus}</span></td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => { setSelectedMaker(m); setMakerTab('overview'); }} style={{ background: '#1c1a14', color: '#c9a84c', border: '1px solid #2a2520', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>View Studio →</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700 }}>CATALOG CURATION</span>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, margin: '4px 0 0', fontWeight: 400 }}>Master Products</h2>
                </div>
                <button style={{ background: '#c9a84c', color: '#080705', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Product</button>
              </div>

              <div style={{ background: '#0d0c0a', border: '1px solid #1c1a14', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#11100d', borderBottom: '1px solid #1c1a14', color: '#8a7a6a', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Product</th>
                      <th style={{ padding: '12px 16px' }}>Studio</th>
                      <th style={{ padding: '12px 16px' }}>Price</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogQueue.map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #14120e' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f5f0e8' }}>{p.name}</td>
                        <td style={{ padding: '12px 16px', color: '#c8bfa8' }}>{p.studioName}</td>
                        <td style={{ padding: '12px 16px', color: '#4ade80', fontWeight: 600 }}>{fmt(p.desiredPrice)}</td>
                        <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#091828', color: '#6ab4f5' }}>{p.status}</span></td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleCatalogModeration(p.id, 'APPROVE')} style={{ background: '#4ade80', color: '#051a0a', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                            <button onClick={() => handleCatalogModeration(p.id, 'PUBLISH')} style={{ background: '#c9a84c', color: '#080705', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Publish</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700 }}>FINANCIAL SETTLEMENT</span>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, margin: '4px 0 0', fontWeight: 400 }}>Payments & Escrow</h2>
              </div>
              <div style={{ background: '#0d0c0a', border: '1px solid #1c1a14', borderRadius: 8, padding: 20 }}>
                <h4 style={{ margin: '0 0 12px', color: '#f5f0e8' }}>Payout Requests Pending</h4>
                {payoutsData.payoutRequests?.map((pr: any) => (
                  <div key={pr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1c1a14', padding: '12px 0' }}>
                    <div>
                      <div style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(pr.amount)}</div>
                      <div style={{ fontSize: 11, color: '#8a7a6a' }}>Method: {pr.payoutMethod}</div>
                    </div>
                    <button onClick={() => handlePayoutAction(pr.id, 'PAY')} style={{ background: '#4ade80', color: '#051a0a', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Approve Payout →</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Subcomponents
function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#8a7a6a', fontWeight: 700, padding: '0 12px', display: 'block', marginBottom: 6 }}>{label}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
    </div>
  );
}

function NavItem({ id, label, icon, count, active, onClick }: { id: NavTab; label: string; icon: string; count?: number; active: boolean; onClick: (id: NavTab) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '8px 12px',
        background: active ? '#171510' : 'transparent',
        border: active ? '1px solid #c9a84c' : '1px solid transparent',
        borderRadius: 6,
        color: active ? '#c9a84c' : '#8a7a6a',
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      {count !== undefined && count > 0 && (
        <span style={{ background: '#c9a84c', color: '#080705', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>{count}</span>
      )}
    </button>
  );
}

function TaskRow({ color, icon, title, desc, buttonText, onAction }: any) {
  return (
    <div style={{ background: '#0d0c0a', border: '1px solid #1c1a14', borderLeft: `4px solid ${color}`, borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span>{icon}</span>
          <h4 style={{ margin: 0, fontSize: 15, color: '#f5f0e8', fontWeight: 600 }}>{title}</h4>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#8a7a6a' }}>{desc}</p>
      </div>
      <button onClick={onAction} style={{ background: color, color: '#080705', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}>
        {buttonText}
      </button>
    </div>
  );
}

function CompactKpi({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div>
      <span style={{ fontSize: 10, color: '#8a7a6a', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-playfair)' }}>{value}</span>
    </div>
  );
}

function MiniKpi({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div style={{ background: '#12100c', border: '1px solid #1c1a14', borderRadius: 6, padding: 12 }}>
      <span style={{ fontSize: 10, color: '#8a7a6a', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function QuickActionItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ padding: '8px 10px', fontSize: 12, color: '#f5f0e8', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => (e.currentTarget.style.background = '#171510')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {label}
    </div>
  );
}

function CheckStep({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{ background: '#12100c', border: '1px solid #1c1a14', padding: 12, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: ok ? '#4ade80' : '#8a7a6a' }}>
      <span>{ok ? '✓' : '○'}</span>
      <span>{label}</span>
    </div>
  );
}
