'use client';
import { useState, useEffect, useCallback } from 'react';

type CeoSection =
  | 'command-center' | 'studio-applications' | 'studio-audit' | 'master-catalog'
  | 'orders' | 'financial-ledger' | 'communications' | 'reporting';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  GENERAL:           { label: 'Applicant',        color: '#8a7a6a', bg: '#1a1810' },
  INCOMPLETE:        { label: 'In Progress',       color: '#c9a84c', bg: '#1a1600' },
  PENDING_AUDIT:     { label: 'Pending Audit',     color: '#6ab4f5', bg: '#091828' },
  UNDER_REVIEW:      { label: 'Under Review',      color: '#a78bfa', bg: '#120e24' },
  REVISION_REQUIRED: { label: 'Revision Required', color: '#f59e6a', bg: '#1e0e00' },
  GUILD_VERIFIED:    { label: 'Guild Verified',    color: '#4ade80', bg: '#051a0a' },
  ROYAL_CHARTER:     { label: 'Royal Charter',     color: '#c9a84c', bg: '#1a1000' },
  REJECTED:          { label: 'Not Approved',      color: '#f87171', bg: '#1a0505' },
};

const PRODUCT_STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT:                { label: 'Draft',            color: '#8a7a6a' },
  SUBMITTED_FOR_REVIEW: { label: 'CEO Review',       color: '#6ab4f5' },
  CATALOG_REVIEW:       { label: 'Under Review',     color: '#a78bfa' },
  APPROVED:             { label: 'Approved',          color: '#4ade80' },
  PUBLISHED:            { label: 'Live',              color: '#c9a84c' },
  REVISION_REQUIRED:    { label: 'Needs Revision',   color: '#f59e6a' },
  REJECTED:             { label: 'Rejected',          color: '#f87171' },
};

const fmt = (n: number) =>
  `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CeoDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<CeoSection>('command-center');
  const [kpis, setKpis] = useState<any>(null);
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [makers, setMakers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productFilter, setProductFilter] = useState('ALL');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Audit profile
  const [selectedMakerId, setSelectedMakerId] = useState<string | null>(null);
  const [auditMaker, setAuditMaker] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditAction, setAuditAction] = useState('');
  const [auditReason, setAuditReason] = useState('');
  const [auditNote, setAuditNote] = useState('');
  const [auditMsg, setAuditMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Catalog moderation
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [catalogAction, setCatalogAction] = useState('');
  const [catalogReason, setCatalogReason] = useState('');
  const [catalogMsg, setCatalogMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [catalogActionLoading, setCatalogActionLoading] = useState(false);

  // Maker search/filter
  const [makerSearch, setMakerSearch] = useState('');
  const [makerStatusFilter, setMakerStatusFilter] = useState('ALL');

  const loadDashboard = useCallback(async () => {
    try {
      const [statsRes, makersRes] = await Promise.all([
        fetch('/api/admin/dashboard-stats'),
        fetch('/api/admin/makers'),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setKpis(d.kpis);
        setPipeline(d.pipeline || {});
      }

      if (makersRes.ok) {
        const d = await makersRes.json();
        setMakers(d.makers || []);
      }
    } catch (err) {
      console.error('CEO dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/catalog?status=${productFilter}`);
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products || []);
        setStatusCounts(d.statusCounts || {});
      }
    } catch (err) {
      console.error('Catalog load error:', err);
    }
  }, [productFilter]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { if (activeSection === 'master-catalog') loadProducts(); }, [activeSection, loadProducts]);
  useEffect(() => { if (activeSection === 'master-catalog') loadProducts(); }, [productFilter]);

  const openAuditProfile = async (makerId: string) => {
    setSelectedMakerId(makerId);
    setActiveSection('studio-audit');
    setAuditLoading(true);
    setAuditMsg(null);
    try {
      const res = await fetch(`/api/admin/accreditation/${makerId}`);
      if (res.ok) {
        const d = await res.json();
        setAuditMaker(d.maker);
      }
    } finally {
      setAuditLoading(false);
    }
  };

  const submitAuditAction = async () => {
    if (!selectedMakerId || !auditAction) return;
    if (auditAction === 'REQUEST_REVISION' && !auditReason) {
      setAuditMsg({ ok: false, text: 'A revision reason is required.' });
      return;
    }
    setActionLoading(true);
    setAuditMsg(null);
    try {
      const res = await fetch(`/api/admin/accreditation/${selectedMakerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: auditAction, reason: auditReason, internalNote: auditNote }),
      });
      const json = await res.json();
      if (res.ok) {
        setAuditMsg({ ok: true, text: `Action completed: ${json.newStatus}` });
        // Refresh
        const refreshRes = await fetch(`/api/admin/accreditation/${selectedMakerId}`);
        if (refreshRes.ok) { const d = await refreshRes.json(); setAuditMaker(d.maker); }
        loadDashboard();
        setAuditAction(''); setAuditReason(''); setAuditNote('');
      } else {
        setAuditMsg({ ok: false, text: json.error || 'Action failed' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const submitCatalogAction = async (productId: string, action: string, reason?: string) => {
    setCatalogActionLoading(true);
    setCatalogMsg(null);
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action, reason }),
      });
      const json = await res.json();
      if (res.ok) {
        setCatalogMsg({ ok: true, text: `Product updated to: ${json.newStatus}` });
        loadProducts();
      } else {
        setCatalogMsg({ ok: false, text: json.error || 'Action failed' });
      }
    } finally {
      setCatalogActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080705', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '2px solid #c9a84c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#8a7a6a', fontFamily: 'var(--font-outfit)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>Loading Executive Command Center</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const filteredMakers = makers.filter(m => {
    const matchesSearch = !makerSearch ||
      m.businessName?.toLowerCase().includes(makerSearch.toLowerCase()) ||
      m.founderName?.toLowerCase().includes(makerSearch.toLowerCase()) ||
      m.email?.toLowerCase().includes(makerSearch.toLowerCase());
    const matchesStatus = makerStatusFilter === 'ALL' || m.verificationStatus === makerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080705', color: '#f5f0e8' }}>
      {/* Sidebar */}
      <CeoSidebar active={activeSection} onNavigate={setActiveSection} kpis={kpis} />

      {/* Main */}
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', minWidth: 0 }}>
        {activeSection === 'command-center' && (
          <CommandCenterSection kpis={kpis} pipeline={pipeline} makers={makers} onOpenMaker={openAuditProfile} onNavigate={setActiveSection} fmt={fmt} />
        )}
        {activeSection === 'studio-applications' && (
          <StudioApplicationsSection
            makers={filteredMakers} allMakers={makers}
            search={makerSearch} setSearch={setMakerSearch}
            statusFilter={makerStatusFilter} setStatusFilter={setMakerStatusFilter}
            onOpenMaker={openAuditProfile}
          />
        )}
        {activeSection === 'studio-audit' && (
          <StudioAuditSection
            maker={auditMaker} loading={auditLoading}
            auditAction={auditAction} setAuditAction={setAuditAction}
            auditReason={auditReason} setAuditReason={setAuditReason}
            auditNote={auditNote} setAuditNote={setAuditNote}
            auditMsg={auditMsg} actionLoading={actionLoading}
            submitAction={submitAuditAction}
            onBack={() => setActiveSection('studio-applications')}
            fmt={fmt}
          />
        )}
        {activeSection === 'master-catalog' && (
          <MasterCatalogSection
            products={products} statusCounts={statusCounts}
            productFilter={productFilter} setProductFilter={setProductFilter}
            catalogMsg={catalogMsg} catalogActionLoading={catalogActionLoading}
            submitCatalogAction={submitCatalogAction}
            fmt={fmt}
          />
        )}
        {activeSection === 'financial-ledger' && (
          <FinancialLedgerSection kpis={kpis} fmt={fmt} />
        )}
        {activeSection === 'communications' && (
          <CommunicationsSection />
        )}
        {activeSection === 'reporting' && (
          <ReportingSection kpis={kpis} fmt={fmt} />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CEO SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
function CeoSidebar({ active, onNavigate, kpis }: any) {
  const navItem = (id: string, label: string, icon: string, badge?: number) => (
    <button
      key={id}
      onClick={() => onNavigate(id)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 16px', borderRadius: 6, cursor: 'pointer',
        background: active === id ? 'rgba(201,168,76,0.12)' : 'transparent',
        border: active === id ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
        color: active === id ? '#c9a84c' : '#8a7a6a',
        fontSize: 13, fontFamily: 'var(--font-outfit)', fontWeight: active === id ? 600 : 400,
        width: '100%', textAlign: 'left', transition: 'all 0.15s',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        {label}
      </span>
      {badge != null && badge > 0 && (
        <span style={{ background: '#c9a84c', color: '#080705', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, fontFamily: 'var(--font-outfit)' }}>
          {badge}
        </span>
      )}
    </button>
  );

  const sectionLabel = (label: string) => (
    <p style={{ fontSize: 10, fontFamily: 'var(--font-outfit)', letterSpacing: 2.5, color: '#4a4030', fontWeight: 700, textTransform: 'uppercase', padding: '16px 16px 6px', margin: 0 }}>{label}</p>
  );

  return (
    <div style={{ width: 240, minWidth: 240, height: '100vh', position: 'sticky', top: 0, background: '#0c0b08', borderRight: '1px solid #1e1c18', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e1c18' }}>
        <p style={{ fontSize: 10, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 4px' }}>BritSync</p>
        <p style={{ fontSize: 15, color: '#f5f0e8', fontFamily: 'var(--font-playfair)', margin: '0 0 4px', fontWeight: 600 }}>Guild Secretariat</p>
        <span style={{ fontSize: 10, background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 4, padding: '2px 8px', fontFamily: 'var(--font-outfit)', letterSpacing: 1 }}>RESTRICTED ACCESS</span>
      </div>

      <div style={{ padding: '8px 8px', flex: 1 }}>
        {sectionLabel('Executive')}
        {navItem('command-center', 'Command Center', '◈')}

        {sectionLabel('Guild Registry')}
        {navItem('studio-applications', 'Studio Registry', '🏛', kpis?.pendingAuditCount + kpis?.underReviewCount)}

        {sectionLabel('Catalog')}
        {navItem('master-catalog', 'Master Catalog', '📚', kpis?.pendingReview)}

        {sectionLabel('Finance')}
        {navItem('financial-ledger', 'Financial Ledger', '📊')}

        {sectionLabel('Operations')}
        {navItem('communications', 'Communications', '✉️', kpis?.openInquiries)}
        {navItem('reporting', 'Reporting', '📈')}
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #1e1c18' }}>
        <a href="/" style={{ display: 'block', textAlign: 'center', padding: '8px 0', color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)', textDecoration: 'none', border: '1px solid #2a2520', borderRadius: 6 }}>
          ← Public Atelier Market
        </a>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND CENTER
// ══════════════════════════════════════════════════════════════════════════════
function CommandCenterSection({ kpis, pipeline, makers, onOpenMaker, onNavigate, fmt }: any) {
  const pendingMakers = makers.filter((m: any) => ['PENDING_AUDIT', 'UNDER_REVIEW'].includes(m.verificationStatus)).slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Executive Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>Guild Secretariat Command Center</h1>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 32 }}>
        <KpiCard label="Platform GMV" value={fmt(kpis?.gmv || 0)} sub="Gross merchandise value" accent="#c9a84c" />
        <KpiCard label="Platform Revenue" value={fmt(kpis?.platformRevenue || 0)} sub="Commission earned" accent="#4ade80" />
        <KpiCard label="Escrow Held" value={fmt(kpis?.escrowHeld || 0)} sub="Pending settlement" accent="#6ab4f5" />
        <KpiCard label="Active Studios" value={kpis?.activeStudios || 0} sub={`of ${kpis?.totalStudios || 0} registered`} accent="#a78bfa" />
        <KpiCard label="Royal Charter" value={kpis?.royalCharterStudios || 0} sub="Elite studios" accent="#c9a84c" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        <KpiCard label="Pending Audit" value={kpis?.pendingAuditCount || 0} sub="Awaiting review" accent="#6ab4f5" />
        <KpiCard label="Active Products" value={kpis?.activeProducts || 0} sub="Approved / Published" accent="#c9a84c" />
        <KpiCard label="Pending Review" value={kpis?.pendingReview || 0} sub="Products for catalog" accent="#f59e6a" />
        <KpiCard label="Total Orders" value={kpis?.totalOrders || 0} sub="All time" accent="#8a7a6a" />
      </div>

      {/* Accreditation Pipeline */}
      <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24, marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 20px', fontWeight: 700 }}>Accreditation Pipeline</p>
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 4, gap: 0 }}>
          {['GENERAL', 'INCOMPLETE', 'PENDING_AUDIT', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'GUILD_VERIFIED', 'ROYAL_CHARTER'].map((s, i) => {
            const meta = STATUS_META[s];
            const count = pipeline[s] || 0;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <button
                  onClick={() => onNavigate('studio-applications')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'none', border: 'none', padding: '0 8px', textAlign: 'center' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${meta.color}18`, border: `2px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: meta.color, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>{count}</span>
                  </div>
                  <p style={{ color: meta.color, fontSize: 9, fontFamily: 'var(--font-outfit)', letterSpacing: 0.5, margin: 0, maxWidth: 70, lineHeight: 1.3 }}>{meta.label}</p>
                </button>
                {i < 6 && <div style={{ width: 16, height: 1, background: '#2a2520' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Accreditations */}
      {pendingMakers.length > 0 && (
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', fontWeight: 700, margin: 0 }}>Applications Requiring Review</p>
            <button onClick={() => onNavigate('studio-applications')} style={btnGhostStyle}>View All →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {pendingMakers.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1a1810', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ color: '#f5f0e8', fontSize: 14, fontFamily: 'var(--font-outfit)', fontWeight: 600, margin: '0 0 2px' }}>{m.businessName}</p>
                  <p style={{ color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: 0 }}>{m.founderName} · {m.country}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={m.verificationStatus} />
                  <button onClick={() => onOpenMaker(m.id)} style={btnGoldStyle}>Review →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDIO APPLICATIONS REGISTRY
// ══════════════════════════════════════════════════════════════════════════════
function StudioApplicationsSection({ makers, allMakers, search, setSearch, statusFilter, setStatusFilter, onOpenMaker }: any) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Guild Registry</p>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>Studio Applications ({allMakers.length})</h2>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="Search studio, artisan, email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 180 }}>
          <option value="ALL">All Statuses</option>
          {Object.entries(STATUS_META).map(([code, m]) => (
            <option key={code} value={code}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-outfit)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2520', background: '#0a0908' }}>
                {['Studio', 'Artisan', 'Category', 'Registered', 'Status', 'Products', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, color: '#4a4030', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {makers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#4a4030', fontSize: 13 }}>No studios found</td>
                </tr>
              ) : makers.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #1a1810', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#100f0c')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ color: '#f5f0e8', fontSize: 13, fontWeight: 600, margin: 0 }}>{m.businessName}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ color: '#c8bfa8', fontSize: 12, margin: 0 }}>{m.founderName}</p>
                    <p style={{ color: '#4a4030', fontSize: 11, margin: '2px 0 0' }}>{m.email}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ color: '#8a7a6a', fontSize: 12, margin: 0 }}>{m.craftCategory || '—'}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ color: '#4a4030', fontSize: 12, margin: 0 }}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={m.verificationStatus} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ color: '#8a7a6a', fontSize: 12, margin: 0 }}>{m.productCount || 0}/5</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => onOpenMaker(m.id)} style={btnGoldStyle}>Audit Profile →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDIO AUDIT PROFILE
// ══════════════════════════════════════════════════════════════════════════════
function StudioAuditSection({ maker, loading, auditAction, setAuditAction, auditReason, setAuditReason, auditNote, setAuditNote, auditMsg, actionLoading, submitAction, onBack, fmt }: any) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#8a7a6a', fontFamily: 'var(--font-outfit)' }}>Loading studio profile…</div>;
  if (!maker) return <div style={{ padding: 40, textAlign: 'center', color: '#8a7a6a', fontFamily: 'var(--font-outfit)' }}>No studio selected.</div>;

  const isRoyalCharter = maker.verificationStatus === 'ROYAL_CHARTER';
  const isVerified = ['GUILD_VERIFIED', 'ROYAL_CHARTER'].includes(maker.verificationStatus);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={onBack} style={btnGhostStyle}>← Back to Registry</button>
        <div>
          <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 4px' }}>Studio Audit Profile</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>
            {maker.businessName}
            {isRoyalCharter && <span style={{ marginLeft: 12 }}>👑</span>}
          </h2>
        </div>
        <StatusBadge status={maker.verificationStatus} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Identity */}
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24 }}>
          <SectionLabel>Studio Identity</SectionLabel>
          <InfoRow label="Business Name" value={maker.businessName} />
          <InfoRow label="Founder" value={maker.founderName} />
          <InfoRow label="Email" value={maker.email} />
          <InfoRow label="Category" value={maker.craftCategory} />
          <InfoRow label="Country" value={maker.country} />
          <InfoRow label="Years Active" value={maker.yearsInBusiness} />
          <InfoRow label="Craftsmen" value={maker.employeeCount} />
          <InfoRow label="Registered" value={maker.registeredAt ? new Date(maker.registeredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
          <InfoRow label="Email Verified" value={maker.isEmailVerified ? '✓ Yes' : '✗ No'} />
          <InfoRow label="Submitted" value={maker.submittedAt ? new Date(maker.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not yet submitted'} />
        </div>

        {/* Heritage */}
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24 }}>
          <SectionLabel>Heritage & Craftsmanship</SectionLabel>
          <InfoRow label="Origin Story" value={maker.heritageOriginStory} multiline />
          <InfoRow label="Founder Bio" value={maker.founderBiography} multiline />
          <InfoRow label="Traditional Tools" value={maker.craftTools} multiline />
          <InfoRow label="Techniques" value={maker.craftTechniques} multiline />
          <InfoRow label="Philosophy" value={maker.craftPhilosophy} multiline />
        </div>

        {/* Media gallery */}
        <div style={{ gridColumn: '1 / -1', background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24 }}>
          <SectionLabel>Workshop Media</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[maker.coverImageUrl, maker.founderPhotoUrl, maker.workshopPhoto1, maker.workshopPhoto2, maker.workshopPhoto3].filter(Boolean).map((url: string, i: number) => (
              <img key={i} src={url} alt={`Media ${i}`} onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, border: '1px solid #2a2520' }} />
            ))}
            {![maker.coverImageUrl, maker.founderPhotoUrl, maker.workshopPhoto1, maker.workshopPhoto2, maker.workshopPhoto3].filter(Boolean).length && (
              <p style={{ color: '#4a4030', fontSize: 13, fontFamily: 'var(--font-outfit)', gridColumn: '1 / -1' }}>No media submitted yet</p>
            )}
          </div>
        </div>

        {/* Payout (admin-only) */}
        <div style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: 24 }}>
          <SectionLabel color="#f87171">🔒 Financial Information (Admin Only)</SectionLabel>
          <InfoRow label="Payout Method" value={maker.payoutMethod} />
          <InfoRow label="Account Details" value={maker.payoutAccountDetails || '—'} multiline />
          <InfoRow label="Cleared Balance" value={fmt(maker.clearedBalance)} />
          <InfoRow label="Escrow Held" value={fmt(maker.escrowBalance)} />
        </div>

        {/* Products in application */}
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24 }}>
          <SectionLabel>Products ({maker.productCount || 0}/5)</SectionLabel>
          {maker.products?.length === 0 ? (
            <p style={{ color: '#4a4030', fontSize: 13, fontFamily: 'var(--font-outfit)' }}>No products submitted yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {maker.products?.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1a1810' }}>
                  <p style={{ color: '#c8bfa8', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: 0 }}>{p.name}</p>
                  <span style={{ fontSize: 10, color: PRODUCT_STATUS_META[p.status]?.color || '#8a7a6a', fontFamily: 'var(--font-outfit)' }}>
                    {PRODUCT_STATUS_META[p.status]?.label || p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit log */}
      {maker.auditLog?.length > 0 && (
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <SectionLabel>Application Timeline</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {maker.auditLog.map((entry: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #1a1810' }}>
                <p style={{ color: '#4a4030', fontSize: 11, fontFamily: 'var(--font-outfit)', margin: 0, minWidth: 100 }}>
                  {new Date(entry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <StatusBadge status={entry.previousStatus} small />
                    <span style={{ color: '#4a4030', fontSize: 10 }}>→</span>
                    <StatusBadge status={entry.newStatus} small />
                  </div>
                  {entry.reason && <p style={{ color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: 0, fontStyle: 'italic' }}>"{entry.reason}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CEO Action Panel */}
      <div style={{ background: '#0f0e0b', border: '1px solid #c9a84c40', borderRadius: 10, padding: 28 }}>
        <p style={{ fontSize: 11, color: '#c9a84c', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', fontWeight: 700, margin: '0 0 20px' }}>Guild Secretariat Action</p>

        {auditMsg && (
          <div style={{ background: auditMsg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${auditMsg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ color: auditMsg.ok ? '#4ade80' : '#f87171', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>{auditMsg.text}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'SET_UNDER_REVIEW', label: '🔍 Begin Review', color: '#a78bfa' },
            { id: 'APPROVE_GUILD', label: '✅ Approve Guild', color: '#4ade80' },
            { id: 'GRANT_ROYAL_CHARTER', label: '👑 Royal Charter', color: '#c9a84c' },
            { id: 'REQUEST_REVISION', label: '📝 Request Revision', color: '#f59e6a' },
            { id: 'REJECT', label: '❌ Reject', color: '#f87171' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setAuditAction(btn.id)}
              style={{
                padding: '10px 18px', borderRadius: 6, cursor: 'pointer',
                background: auditAction === btn.id ? `${btn.color}18` : 'transparent',
                border: `1px solid ${auditAction === btn.id ? btn.color : '#2a2520'}`,
                color: auditAction === btn.id ? btn.color : '#8a7a6a',
                fontSize: 13, fontFamily: 'var(--font-outfit)', fontWeight: auditAction === btn.id ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >{btn.label}</button>
          ))}
        </div>

        {auditAction && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['REQUEST_REVISION', 'REJECT'].includes(auditAction) && (
              <div>
                <label style={labelStyle}>Reason / Instructions *</label>
                <textarea
                  value={auditReason} onChange={e => setAuditReason(e.target.value)} rows={3}
                  placeholder="Explain what needs to be corrected or why the application is rejected..."
                  style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
                />
              </div>
            )}
            <div>
              <label style={labelStyle}>Internal Note (optional, not sent to maker)</label>
              <textarea
                value={auditNote} onChange={e => setAuditNote(e.target.value)} rows={2}
                placeholder="Internal administrative note..."
                style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={submitAction} disabled={actionLoading} style={btnGoldStyle}>
                {actionLoading ? 'Processing…' : `Confirm: ${auditAction.replace(/_/g, ' ')}`}
              </button>
              <button onClick={() => { setAuditAction(''); setAuditReason(''); setAuditNote(''); }} style={btnGhostStyle}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MASTER CATALOG
// ══════════════════════════════════════════════════════════════════════════════
function MasterCatalogSection({ products, statusCounts, productFilter, setProductFilter, catalogMsg, catalogActionLoading, submitCatalogAction, fmt }: any) {
  const [localReason, setLocalReason] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState('');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Catalog</p>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>Master Catalog ({products.length})</h2>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', 'SUBMITTED_FOR_REVIEW', 'CATALOG_REVIEW', 'APPROVED', 'PUBLISHED', 'DRAFT', 'REVISION_REQUIRED', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setProductFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
              background: productFilter === s ? 'rgba(201,168,76,0.15)' : 'transparent',
              border: `1px solid ${productFilter === s ? '#c9a84c' : '#2a2520'}`,
              color: productFilter === s ? '#c9a84c' : '#8a7a6a',
              fontFamily: 'var(--font-outfit)', fontWeight: productFilter === s ? 600 : 400,
            }}
          >
            {PRODUCT_STATUS_META[s]?.label || 'All'}
            {statusCounts[s] && ` (${statusCounts[s]})`}
          </button>
        ))}
      </div>

      {catalogMsg && (
        <div style={{ background: catalogMsg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${catalogMsg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ color: catalogMsg.ok ? '#4ade80' : '#f87171', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>{catalogMsg.text}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {products.length === 0 && (
          <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#4a4030', fontSize: 13, fontFamily: 'var(--font-outfit)' }}>No products in this status</p>
          </div>
        )}
        {products.map((p: any) => (
          <div key={p.id} style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {p.primaryImageUrl && (
                <img src={p.primaryImageUrl} alt={p.name} onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #2a2520', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ color: '#f5f0e8', fontSize: 14, fontFamily: 'var(--font-outfit)', fontWeight: 600, margin: '0 0 2px' }}>{p.name}</p>
                    <p style={{ color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: 0 }}>
                      {p.studioName} · {p.craftCategory}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: '#c9a84c', fontSize: 15, fontFamily: 'var(--font-outfit)', fontWeight: 700 }}>{fmt(p.desiredPrice)}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-outfit)', padding: '2px 8px', borderRadius: 4, background: `${PRODUCT_STATUS_META[p.status]?.color || '#8a7a6a'}18`, color: PRODUCT_STATUS_META[p.status]?.color || '#8a7a6a', border: `1px solid ${PRODUCT_STATUS_META[p.status]?.color || '#8a7a6a'}40` }}>{PRODUCT_STATUS_META[p.status]?.label || p.status}</span>
                  </div>
                </div>
                {p.description && <p style={{ color: '#6a6050', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: '0 0 10px', lineHeight: 1.5 }}>{p.description.slice(0, 150)}{p.description.length > 150 ? '…' : ''}</p>}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {p.status === 'SUBMITTED_FOR_REVIEW' && (
                    <>
                      <button onClick={() => submitCatalogAction(p.id, 'SET_CATALOG_REVIEW')} disabled={catalogActionLoading} style={btnGhostStyle}>Begin Review</button>
                      <button onClick={() => { setSelectedId(p.id); setSelectedAction('APPROVE'); }} style={{ ...btnGoldStyle }}>Approve</button>
                      <button onClick={() => { setSelectedId(p.id); setSelectedAction('REQUEST_REVISION'); }} style={btnGhostStyle}>Request Revision</button>
                      <button onClick={() => { setSelectedId(p.id); setSelectedAction('REJECT'); }} style={{ ...btnGhostStyle, color: '#f87171', borderColor: '#f8717140' }}>Reject</button>
                    </>
                  )}
                  {p.status === 'APPROVED' && (
                    <button onClick={() => submitCatalogAction(p.id, 'PUBLISH')} disabled={catalogActionLoading} style={btnGoldStyle}>Publish to Market →</button>
                  )}
                </div>

                {/* Reason input for selected action */}
                {selectedId === p.id && ['REQUEST_REVISION', 'REJECT'].includes(selectedAction) && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <input
                      type="text" placeholder="Enter reason..." value={localReason} onChange={e => setLocalReason(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={() => { submitCatalogAction(p.id, selectedAction, localReason); setSelectedId(null); setLocalReason(''); }} style={btnGoldStyle}>Confirm</button>
                    <button onClick={() => { setSelectedId(null); setLocalReason(''); }} style={btnGhostStyle}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FINANCIAL LEDGER
// ══════════════════════════════════════════════════════════════════════════════
function FinancialLedgerSection({ kpis, fmt }: any) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Finance</p>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>Financial Ledger</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Gross GMV" value={fmt(kpis?.gmv || 0)} sub="Total sales value" accent="#c9a84c" large />
        <KpiCard label="Platform Revenue" value={fmt(kpis?.platformRevenue || 0)} sub="Commission collected" accent="#4ade80" large />
        <KpiCard label="Escrow Held" value={fmt(kpis?.escrowHeld || 0)} sub="Pending payout release" accent="#6ab4f5" large />
      </div>
      <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#4a4030', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>Detailed transaction ledger will populate as orders are processed</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMUNICATIONS
// ══════════════════════════════════════════════════════════════════════════════
function CommunicationsSection() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Operations</p>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>Communications</h2>
      </div>
      <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
        <p style={{ color: '#4a4030', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>Contact inquiries, B2B commissions, and custom order requests will appear here</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ══════════════════════════════════════════════════════════════════════════════
function ReportingSection({ kpis, fmt }: any) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Operations</p>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>Platform Reporting</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard label="GMV" value={fmt(kpis?.gmv || 0)} sub="All time gross" accent="#c9a84c" />
        <KpiCard label="Studios" value={kpis?.totalStudios || 0} sub="Total registered" accent="#a78bfa" />
        <KpiCard label="Products" value={kpis?.totalProducts || 0} sub="Total in catalog" accent="#c9a84c" />
      </div>
      <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#4a4030', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>Financial statements and data exports will be available here</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
function KpiCard({ label, value, sub, accent = '#c9a84c', large }: any) {
  return (
    <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 8, padding: large ? '22px 24px' : '16px 20px' }}>
      <p style={{ fontSize: 10, color: '#4a4030', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: large ? 26 : 20, fontFamily: 'var(--font-outfit)', fontWeight: 700, color: accent, margin: '0 0 4px' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#4a4030', fontFamily: 'var(--font-outfit)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status, small }: any) {
  const meta = STATUS_META[status] || { label: status || '—', color: '#8a7a6a', bg: '#1a1810' };
  return (
    <span style={{
      fontSize: small ? 10 : 11, fontFamily: 'var(--font-outfit)', fontWeight: 600, letterSpacing: 0.8,
      padding: small ? '2px 6px' : '3px 10px', borderRadius: 4,
      background: meta.bg, color: meta.color, border: `1px solid ${meta.color}40`,
      textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const,
    }}>{meta.label}</span>
  );
}

function SectionLabel({ children, color = '#c9a84c' }: any) {
  return <p style={{ fontSize: 11, color, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', fontWeight: 700, margin: '0 0 16px' }}>{children}</p>;
}

function InfoRow({ label, value, multiline }: any) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: multiline ? 'flex-start' : 'center' }}>
      <p style={{ color: '#4a4030', fontSize: 11, fontFamily: 'var(--font-outfit)', width: 110, flexShrink: 0, margin: 0, lineHeight: 1.4 }}>{label}</p>
      <p style={{ color: '#c8bfa8', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: 0, lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

// Styles
const inputStyle: React.CSSProperties = {
  background: '#0a0908',
  border: '1px solid #2a2520',
  borderRadius: 6,
  padding: '10px 14px',
  color: '#f5f0e8',
  fontSize: 13,
  fontFamily: 'var(--font-outfit)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#8a7a6a',
  fontFamily: 'var(--font-outfit)',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 8,
};

const btnGoldStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #c9a84c',
  color: '#c9a84c',
  padding: '9px 18px',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'var(--font-outfit)',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: 0.3,
  transition: 'all 0.15s',
  whiteSpace: 'nowrap' as const,
};

const btnGhostStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #2a2520',
  color: '#8a7a6a',
  padding: '9px 18px',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'var(--font-outfit)',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
};
