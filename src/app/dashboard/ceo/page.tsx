"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  country?: string;
  subject?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  createdAt: string;
  repliedAt?: string;
  replyMessage?: string;
}

interface PendingMaker {
  id: string;
  userId: string;
  businessName: string;
  founderName: string;
  email: string;
  verificationStatus: string;
  yearsInBusiness: number;
  employeeCount: number;
  country: string;
  businessStory: string;
  founderStory: string;
  createdAt: string;
  productCount: number;
}

export default function CEODashboard() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'audits' | 'products' | 'inquiries' | 'financials' | 'reports'
  >('dashboard');

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Maker Audits State
  const [makersList, setMakersList] = useState<PendingMaker[]>([]);
  const [approvingMakerId, setApprovingMakerId] = useState<string | null>(null);
  const [auditFeedback, setAuditFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Contact Inquiries States
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Gmail Reply Modal States
  const [replyModalInquiry, setReplyModalInquiry] = useState<ContactInquiry | null>(null);
  const [replySubject, setReplySubject] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [replyFeedback, setReplyFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Executive Reports states
  const [reportFreq, setReportFreq] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('csv');
  const [simulatingDownload, setSimulatingDownload] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Mock Products list for admin catalog overview
  const [adminProducts, setAdminProducts] = useState<any[]>([
    { id: '1', name: 'Royal Crown Ceramic Urn', maker: 'Aisha Ceramics', price: 450, category: 'Ceramics', status: 'VERIFIED', stock: 12 },
    { id: '2', name: 'Heritage Cashmere Shawl', maker: 'Scottish Looms', price: 890, category: 'Textiles', status: 'ROYAL_CHARTER', stock: 5 },
    { id: '3', name: 'Hand-Hammered Brass Bowl', maker: 'Tariq Metalcraft', price: 320, category: 'Woodwork', status: 'GENERAL', stock: 20 },
    { id: '4', name: 'Victorian Leather Holdall', maker: 'Kensington Leather', price: 1250, category: 'Leather', status: 'GUILD_VERIFIED', stock: 8 },
  ]);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch inquiries:', e);
    }
  };

  const fetchMakers = async () => {
    try {
      const res = await fetch('/api/admin/makers');
      if (res.ok) {
        const data = await res.json();
        setMakersList(data.makers || []);
      }
    } catch (e) {
      console.error('Failed to fetch admin makers:', e);
    }
  };

  useEffect(() => {
    const fetchCeoData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/analytics/ceo');
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (e) {
        console.error('Failed to load CEO analytics:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCeoData();
    fetchMakers();
    fetchInquiries();

    const interval = setInterval(() => {
      fetchInquiries();
      fetchMakers();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const openReplyModal = (inquiry: ContactInquiry) => {
    setReplyModalInquiry(inquiry);
    setReplySubject(inquiry.subject ? `Re: ${inquiry.subject}` : `Reply regarding ${inquiry.category} Inquiry`);
    setReplyText(`Dear ${inquiry.name},\n\nThank you for reaching out to the Britsync Global Guild Registry Secretariat.\n\n\nSincerely,\nBritsync Governance Team\nMayfair Headquarters, London`);
    setReplyFeedback(null);
  };

  const handleSendReply = async () => {
    if (!replyModalInquiry) return;
    setSendingReply(true);
    setReplyFeedback(null);

    try {
      const res = await fetch('/api/admin/inquiries/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: replyModalInquiry.id,
          toEmail: replyModalInquiry.email,
          toName: replyModalInquiry.name,
          subject: replySubject,
          message: replyText
        })
      });

      const data = await res.json();
      setSendingReply(false);

      if (res.ok && data.success) {
        setReplyFeedback({ success: true, msg: 'Email reply dispatched via Gmail SMTP.' });
        fetchInquiries();
        setTimeout(() => {
          setReplyModalInquiry(null);
        }, 1200);
      } else {
        setReplyFeedback({ success: false, msg: data.error || 'Failed to dispatch email.' });
      }
    } catch (e: any) {
      setSendingReply(false);
      setReplyFeedback({ success: false, msg: e.message || 'Network error sending email.' });
    }
  };

  const handleMakerAction = async (makerId: string, status: string) => {
    setApprovingMakerId(makerId);
    setAuditFeedback(null);
    try {
      const res = await fetch('/api/admin/makers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ makerId, status })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuditFeedback({ success: true, msg: data.message });
        fetchMakers();
      } else {
        setAuditFeedback({ success: false, msg: data.error || 'Failed to update maker status.' });
      }
    } catch (e: any) {
      setAuditFeedback({ success: false, msg: e.message || 'Error communicating with server.' });
    } finally {
      setApprovingMakerId(null);
    }
  };

  const handleDownloadReport = () => {
    setSimulatingDownload(true);
    setDownloadSuccess(null);
    setTimeout(() => {
      setSimulatingDownload(false);
      setDownloadSuccess(`Britsync-Executive-${reportFreq.toUpperCase()}-Report.${reportFormat}`);
      const csvContent = "data:text/csv;charset=utf-8,KPI,Value\n" +
        `Total Revenue,£${analyticsData?.kpis?.totalRevenue?.toFixed(2) || '0.00'}\n` +
        `Escrow Holds,£${analyticsData?.kpis?.escrowBalance?.toFixed(2) || '0.00'}\n` +
        `Net Britsync Margin,£${analyticsData?.kpis?.netMargin?.toFixed(2) || '0.00'}\n` +
        `Completed Orders,${analyticsData?.kpis?.orderCount || '0'}\n`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Britsync_${reportFreq}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (categoryFilter === 'ALL') return true;
    return inq.category.toUpperCase().includes(categoryFilter.toUpperCase());
  });

  const pendingMakersCount = makersList.filter((m) => m.verificationStatus === 'PENDING_AUDIT' || m.verificationStatus === 'GENERAL').length;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      minHeight: '100vh',
      backgroundColor: '#0A0A0C',
      color: '#FAF9F6',
      fontFamily: 'var(--font-inter, sans-serif)',
      position: 'relative'
    }}>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* FULL LEFT SIDEBAR COMMAND NAVIGATION PANEL                       */}
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
              SECRETARIAT PORTAL
            </span>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
              BritSync CEO
            </h2>
          </div>

          {/* SIDEBAR SECTIONS */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* SECTION 1: OVERVIEW & ANALYTICS */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                OVERVIEW & ANALYTICS
              </span>
              <button
                onClick={() => setActiveTab('dashboard')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'dashboard' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'dashboard' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'dashboard' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'dashboard' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                📊 Command Overview
              </button>
            </div>

            {/* SECTION 2: ARTISAN & GUILD REGISTRY */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                ARTISAN & GUILD REGISTRY
              </span>
              <button
                onClick={() => setActiveTab('audits')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'audits' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'audits' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'audits' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'audits' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🧶 Guild Studio Audits</span>
                {pendingMakersCount > 0 && (
                  <span style={{ backgroundColor: '#D4AF37', color: '#0A0A0C', fontSize: '0.62rem', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    {pendingMakersCount}
                  </span>
                )}
              </button>
            </div>

            {/* SECTION 3: CATALOG & PRODUCTS */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                CATALOG & PRICING
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
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                🏺 Guild Master Catalog
              </button>
            </div>

            {/* SECTION 4: COMMUNICATIONS & GMAIL */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                CLIENT COMMUNICATIONS
              </span>
              <button
                onClick={() => setActiveTab('inquiries')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'inquiries' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'inquiries' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'inquiries' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'inquiries' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>📬 Contact Inquiries</span>
                {unreadCount > 0 && (
                  <span style={{ backgroundColor: '#D4AF37', color: '#0A0A0C', fontSize: '0.62rem', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* SECTION 5: FINANCIAL ESCROW & MARGINS */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                FINANCE & ESCROW
              </span>
              <button
                onClick={() => setActiveTab('financials')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'financials' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'financials' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'financials' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'financials' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                💰 Financial Escrow & Margin
              </button>
            </div>

            {/* SECTION 6: EXECUTIVE REPORTS */}
            <div>
              <span style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', paddingLeft: '0.6rem' }}>
                EXECUTIVE REPORTS
              </span>
              <button
                onClick={() => setActiveTab('reports')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: activeTab === 'reports' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  borderLeft: activeTab === 'reports' ? '3px solid #D4AF37' : '3px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  color: activeTab === 'reports' ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'reports' ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                📈 Intelligence Exporter
              </button>
            </div>

          </nav>
        </div>

        {/* Bottom User Info & Store Link */}
        <div style={{ paddingTop: '1.2rem', borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
            Chief Executive Officer
          </div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '1rem' }}>
            admin@nobleshop.co.uk
          </div>
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
            ← Public Atelier Store
          </Link>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN EXECUTIVE DASHBOARD CONTENT WORKSPACE (FULL WIDTH)          */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main style={{ padding: '2.5rem 3rem', backgroundColor: '#0A0A0C', minHeight: '100vh', overflowY: 'auto' }}>

        {/* TOP STATUS BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '1.8rem' }}>
          <div>
            <span style={{ fontSize: '0.62rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
              SYSTEM LEVEL ACCREDITATION CONTROL
            </span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
              {activeTab === 'dashboard' && 'Executive Intelligence Overview'}
              {activeTab === 'audits' && 'Artisan Atelier Accreditation Panel'}
              {activeTab === 'products' && 'Guild Master Catalog & Inventory'}
              {activeTab === 'inquiries' && 'Client Communications & Gmail Desk'}
              {activeTab === 'financials' && 'Financial Escrow & Margin Control'}
              {activeTab === 'reports' && 'Executive Data Exporter'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', padding: '0.5rem 1rem', backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              🟢 Network Status: <strong>LIVE (London W1K)</strong>
            </span>
          </div>
        </div>

        {/* TAB 1: COMMAND DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI METRIC CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ padding: '1.8rem', backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <span style={{ fontSize: '0.64rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                  TOTAL PLATFORM REVENUE
                </span>
                <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400, color: '#FFFFFF' }}>
                  £{analyticsData?.kpis?.totalRevenue?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '124,500.00'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#2E7D32', display: 'block', marginTop: '0.4rem', fontWeight: 600 }}>↑ +18.4% this quarter</span>
              </div>

              <div style={{ padding: '1.8rem', backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <span style={{ fontSize: '0.64rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                  ESCROW HELD FUNDS
                </span>
                <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400, color: '#FFFFFF' }}>
                  £{analyticsData?.kpis?.escrowBalance?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '48,200.00'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '0.4rem' }}>Protected in Guild Escrow</span>
              </div>

              <div style={{ padding: '1.8rem', backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <span style={{ fontSize: '0.64rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                  NET BRITSYNC MARGIN
                </span>
                <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400, color: '#FFFFFF' }}>
                  £{analyticsData?.kpis?.netMargin?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '18,675.00'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#2E7D32', display: 'block', marginTop: '0.4rem', fontWeight: 600 }}>15% Commission Rate</span>
              </div>

              <div style={{ padding: '1.8rem', backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <span style={{ fontSize: '0.64rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                  PENDING AUDITS
                </span>
                <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400, color: '#FFFFFF' }}>
                  {pendingMakersCount || 2}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#D4AF37', display: 'block', marginTop: '0.4rem', fontWeight: 600 }}>Requires CEO Accreditation</span>
              </div>
            </div>

            {/* LIVE REGISTRY ACTIVITY & QUICK ACTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              
              <div style={{ padding: '2rem', backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400, marginTop: 0, marginBottom: '1.5rem', color: '#FFFFFF' }}>
                  Recent Artisan Accreditation Activity
                </h3>
                {makersList.slice(0, 5).map((maker) => (
                  <div key={maker.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFFFFF', display: 'block' }}>{maker.businessName}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{maker.founderName} • {maker.country}</span>
                    </div>
                    <div>
                      <span style={{
                        padding: '0.35rem 0.8rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        backgroundColor: maker.verificationStatus === 'GUILD_VERIFIED' ? 'rgba(46,125,50,0.15)' : 'rgba(212,175,55,0.15)',
                        color: maker.verificationStatus === 'GUILD_VERIFIED' ? '#2E7D32' : '#D4AF37',
                        border: maker.verificationStatus === 'GUILD_VERIFIED' ? '1px solid #2E7D32' : '1px solid #D4AF37'
                      }}>
                        {maker.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '2rem', backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400, marginTop: 0, marginBottom: '1.5rem', color: '#FFFFFF' }}>
                  Secretariat Quick Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={() => setActiveTab('audits')}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      backgroundColor: '#D4AF37',
                      color: '#0A0A0C',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Accredit Pending Studios ({pendingMakersCount})
                  </button>

                  <button
                    onClick={() => setActiveTab('inquiries')}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      backgroundColor: 'transparent',
                      color: '#D4AF37',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      border: '1px solid #D4AF37',
                      cursor: 'pointer'
                    }}
                  >
                    View Unread Inquiries ({unreadCount})
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      backgroundColor: 'transparent',
                      color: '#FAF9F6',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    Download Financial Statement
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MAKER ACCREDITATION AUDITS */}
        {activeTab === 'audits' && (
          <div>
            {auditFeedback && (
              <div style={{
                backgroundColor: auditFeedback.success ? 'rgba(46,125,50,0.15)' : 'rgba(211,47,47,0.15)',
                border: auditFeedback.success ? '1px solid #2E7D32' : '1px solid #D32F2F',
                color: auditFeedback.success ? '#2E7D32' : '#D32F2F',
                padding: '1rem',
                marginBottom: '2rem',
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                {auditFeedback.msg}
              </div>
            )}

            <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.8rem', color: '#FFFFFF' }}>
                Pending & Registered Master Artisan Studios ({makersList.length})
              </h2>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37' }}>
                      <th style={{ padding: '1rem' }}>Studio & Founder</th>
                      <th style={{ padding: '1rem' }}>Location</th>
                      <th style={{ padding: '1rem' }}>Craft Experience</th>
                      <th style={{ padding: '1rem' }}>Current Status</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Accreditation Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {makersList.map((maker) => (
                      <tr key={maker.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '1.2rem 1rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF', display: 'block' }}>{maker.businessName}</span>
                          <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>{maker.founderName} ({maker.email})</span>
                        </td>
                        <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem' }}>
                          {maker.country || 'United Kingdom'}
                        </td>
                        <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem' }}>
                          {maker.yearsInBusiness} Years • {maker.employeeCount} Craftsmen
                        </td>
                        <td style={{ padding: '1.2rem 1rem' }}>
                          <span style={{
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            backgroundColor: maker.verificationStatus === 'GUILD_VERIFIED' ? 'rgba(46,125,50,0.15)' : 'rgba(212,175,55,0.15)',
                            color: maker.verificationStatus === 'GUILD_VERIFIED' ? '#2E7D32' : '#D4AF37',
                            border: maker.verificationStatus === 'GUILD_VERIFIED' ? '1px solid #2E7D32' : '1px solid #D4AF37'
                          }}>
                            {maker.verificationStatus}
                          </span>
                        </td>
                        <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                            <button
                              disabled={approvingMakerId === maker.id}
                              onClick={() => handleMakerAction(maker.id, 'GUILD_VERIFIED')}
                              style={{
                                padding: '0.5rem 0.9rem',
                                backgroundColor: '#D4AF37',
                                color: '#0A0A0C',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                              }}
                            >
                              Approve Guild
                            </button>
                            <button
                              disabled={approvingMakerId === maker.id}
                              onClick={() => handleMakerAction(maker.id, 'ROYAL_CHARTER')}
                              style={{
                                padding: '0.5rem 0.9rem',
                                backgroundColor: 'transparent',
                                color: '#D4AF37',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                border: '1px solid #D4AF37',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                              }}
                            >
                              Grant Royal Charter
                            </button>
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

        {/* TAB 3: GUILD MASTER CATALOG */}
        {activeTab === 'products' && (
          <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.8rem', color: '#FFFFFF' }}>
              Registered Handcrafted Guild Items
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37' }}>
                    <th style={{ padding: '1rem' }}>Item Name</th>
                    <th style={{ padding: '1rem' }}>Atelier Maker</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Selling Price</th>
                    <th style={{ padding: '1rem' }}>Stock</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminProducts.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '1.2rem 1rem', fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                        {prod.name}
                      </td>
                      <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem' }}>{prod.maker}</td>
                      <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem' }}>{prod.category}</td>
                      <td style={{ padding: '1.2rem 1rem', fontSize: '0.9rem', color: '#D4AF37', fontWeight: 700 }}>£{prod.price.toFixed(2)}</td>
                      <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem' }}>{prod.stock} units</td>
                      <td style={{ padding: '1.2rem 1rem' }}>
                        <span style={{ padding: '0.3rem 0.7rem', fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid #D4AF37' }}>
                          {prod.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CLIENT COMMUNICATIONS & GMAIL */}
        {activeTab === 'inquiries' && (
          <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
                Client Inquiries & Gmail Desk ({inquiries.length})
              </h2>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['ALL', 'GENERAL', 'CUSTOM', 'B2B'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      backgroundColor: categoryFilter === cat ? '#D4AF37' : 'transparent',
                      color: categoryFilter === cat ? '#0A0A0C' : '#FAF9F6',
                      border: '1px solid #D4AF37',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37' }}>
                    <th style={{ padding: '1rem' }}>Client</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Message Snippet</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Gmail Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '1.2rem 1rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFFFFF', display: 'block' }}>{inq.name}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{inq.email}</span>
                      </td>
                      <td style={{ padding: '1.2rem 1rem', fontSize: '0.82rem' }}>{inq.category}</td>
                      <td style={{ padding: '1.2rem 1rem', fontSize: '0.82rem', opacity: 0.8, maxWidth: '300px' }}>
                        {inq.message.length > 70 ? `${inq.message.substring(0, 70)}...` : inq.message}
                      </td>
                      <td style={{ padding: '1.2rem 1rem' }}>
                        <span style={{
                          padding: '0.3rem 0.7rem',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: inq.status === 'REPLIED' ? 'rgba(46,125,50,0.15)' : 'rgba(212,175,55,0.15)',
                          color: inq.status === 'REPLIED' ? '#2E7D32' : '#D4AF37',
                          border: inq.status === 'REPLIED' ? '1px solid #2E7D32' : '1px solid #D4AF37'
                        }}>
                          {inq.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => openReplyModal(inq)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#D4AF37',
                            color: '#0A0A0C',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                          }}
                        >
                          Reply via Gmail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCIAL ESCROW & MARGIN CONTROL */}
        {activeTab === 'financials' && (
          <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.8rem', color: '#FFFFFF' }}>
              Double-Entry Financial Escrow & Ledger Accounts
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ padding: '1.5rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#D4AF37', marginTop: 0, marginBottom: '1rem' }}>Escrow Vault Status</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span>Active Escrow Hold Balance</span>
                  <strong style={{ color: '#D4AF37' }}>£48,200.00</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span>Cleared Payout Balance</span>
                  <strong>£76,300.00</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0' }}>
                  <span>Net Britsync Commission (15%)</span>
                  <strong style={{ color: '#2E7D32' }}>£18,675.00</strong>
                </div>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#D4AF37', marginTop: 0, marginBottom: '1rem' }}>Markup Pricing Rules</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span>Standard Guild Markup</span>
                  <strong>15.0%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span>Royal Charter Tier</span>
                  <strong>12.5%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0' }}>
                  <span>Currency Conversion Rate</span>
                  <strong>1 GBP = 1.27 USD</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EXECUTIVE DATA EXPORTER */}
        {activeTab === 'reports' && (
          <div style={{ backgroundColor: '#121216', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '2.5rem', maxWidth: '650px' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, marginTop: 0, marginBottom: '1.5rem', color: '#FFFFFF' }}>
              Generate Executive Financial & Audit Statement
            </h2>

            {downloadSuccess && (
              <div style={{ backgroundColor: 'rgba(46,125,50,0.15)', border: '1px solid #2E7D32', color: '#2E7D32', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
                Successfully generated and downloaded {downloadSuccess}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.5rem' }}>
                Reporting Frequency
              </label>
              <select
                value={reportFreq}
                onChange={(e: any) => setReportFreq(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="daily">Daily Statement</option>
                <option value="weekly">Weekly Statement</option>
                <option value="monthly">Monthly Executive Report</option>
                <option value="quarterly">Quarterly C-Suite Audit</option>
                <option value="yearly">Annual Fiscal Balance</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.5rem' }}>
                Export File Format
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['csv', 'excel', 'pdf'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setReportFormat(fmt as any)}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      backgroundColor: reportFormat === fmt ? '#D4AF37' : '#0A0A0C',
                      color: reportFormat === fmt ? '#0A0A0C' : '#FFFFFF',
                      border: '1px solid #D4AF37',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={simulatingDownload}
              onClick={handleDownloadReport}
              style={{
                width: '100%',
                padding: '1.1rem',
                backgroundColor: '#D4AF37',
                color: '#0A0A0C',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {simulatingDownload ? 'Generating Executive Report...' : 'Download Statement Now'}
            </button>
          </div>
        )}

      </main>

      {/* GMAIL REPLY MODAL POPUP */}
      {replyModalInquiry && (
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
            maxWidth: '580px',
            backgroundColor: '#121216',
            border: '1px solid #D4AF37',
            padding: '2.2rem',
            boxShadow: '0 25px 70px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.62rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, display: 'block' }}>
                  SECRETARIAT GMAIL DESK
                </span>
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 300, margin: 0, color: '#FFFFFF' }}>
                  Reply to {replyModalInquiry.name}
                </h3>
              </div>
              <button onClick={() => setReplyModalInquiry(null)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {replyFeedback && (
              <div style={{
                backgroundColor: replyFeedback.success ? 'rgba(46,125,50,0.15)' : 'rgba(211,47,47,0.15)',
                border: replyFeedback.success ? '1px solid #2E7D32' : '1px solid #D32F2F',
                color: replyFeedback.success ? '#2E7D32' : '#D32F2F',
                padding: '0.8rem',
                marginBottom: '1.2rem',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {replyFeedback.msg}
              </div>
            )}

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                Recipient Gmail
              </label>
              <input
                type="text"
                readOnly
                value={`${replyModalInquiry.name} <${replyModalInquiry.email}>`}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                Email Subject
              </label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 700, marginBottom: '0.3rem' }}>
                Official Reply Message
              </label>
              <textarea
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                disabled={sendingReply}
                onClick={handleSendReply}
                style={{
                  flex: 1,
                  padding: '0.95rem',
                  backgroundColor: '#D4AF37',
                  color: '#0A0A0C',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {sendingReply ? 'Dispatching via Gmail...' : 'Send Gmail Reply'}
              </button>
              <button
                onClick={() => setReplyModalInquiry(null)}
                style={{
                  padding: '0.95rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
