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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'audits' | 'inquiries' | 'exports' | 'reports'>('dashboard');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Maker Audits State
  const [makersList, setMakersList] = useState<PendingMaker[]>([]);
  const [approvingMakerId, setApprovingMakerId] = useState<string | null>(null);
  const [auditFeedback, setAuditFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Contact Inquiries & Notification Bell States
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showBellDropdown, setShowBellDropdown] = useState<boolean>(false);
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
    fetchInquiries();
    fetchMakers();

    const timer = setInterval(() => {
      fetchInquiries();
      fetchMakers();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'READ' }),
      });
      fetchInquiries();
    } catch (e) {
      console.error(e);
    }
  };

  const openReplyModal = (inq: ContactInquiry) => {
    setReplyModalInquiry(inq);
    setReplySubject(inq.subject ? `Re: ${inq.subject}` : `Re: Britsync Concierge Inquiry [${inq.id}]`);
    setReplyText(`Dear ${inq.name},\n\nThank you for reaching out to Britsync Managed Commerce Concierge regarding ${inq.category}.\n\n`);
    setReplyFeedback(null);
    markAsRead(inq.id);
  };

  const handleSendGmailReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalInquiry || !replyText.trim()) return;

    setSendingReply(true);
    setReplyFeedback(null);
    try {
      const res = await fetch('/api/admin/inquiries/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: replyModalInquiry.id,
          recipientEmail: replyModalInquiry.email,
          recipientName: replyModalInquiry.name,
          replySubject,
          replyMessage: replyText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReplyFeedback({ success: true, msg: `Reply sent successfully to ${replyModalInquiry.email}` });
        fetchInquiries();
        setTimeout(() => setReplyModalInquiry(null), 1800);
      } else {
        setReplyFeedback({ success: false, msg: data.error || 'Failed to dispatch email.' });
      }
    } catch (err: any) {
      setReplyFeedback({ success: false, msg: err.message || 'Error communicating with mail service.' });
    } finally {
      setSendingReply(false);
    }
  };

  const handleApproveMaker = async (makerProfileId: string, action: 'APPROVE' | 'REJECT') => {
    setApprovingMakerId(makerProfileId);
    setAuditFeedback(null);
    try {
      const res = await fetch('/api/admin/makers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ makerProfileId, action }),
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
    }, 1500);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (categoryFilter === 'ALL') return true;
    return inq.category.toUpperCase().includes(categoryFilter.toUpperCase());
  });

  const pendingMakersCount = makersList.filter((m) => m.verificationStatus === 'PENDING_AUDIT').length;

  return (
    <main className="grid-bg" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}>
      {/* Absolute ambient light orbs */}
      <div className="glow-orb" style={{ top: '10%', right: '5%', width: '550px', height: '550px', opacity: 0.6 }} />
      <div className="glow-orb" style={{ bottom: '15%', left: '5%', width: '450px', height: '450px', opacity: 0.4 }} />

      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--text)', marginBottom: '0.5rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400 }}>Executive Intelligence Center</h1>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Britsync Global C-Suite Dashboard & Artisan Accreditation Panel</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* Notification Bell Icon */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowBellDropdown(!showBellDropdown)}
                aria-label="Notification Bell"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text)',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#D4AF37',
                    color: '#0A0A0C',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(212,175,55,0.6)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Bell Notification Dropdown */}
              {showBellDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '56px',
                  right: 0,
                  width: '360px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                  padding: '1.2rem',
                  zIndex: 100
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', letterSpacing: '1.5px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Client Messages ({unreadCount} New)</span>
                    <button onClick={() => setShowBellDropdown(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.6 }}>Close</button>
                  </div>
                  {inquiries.slice(0, 4).map((inq) => (
                    <div
                      key={inq.id}
                      onClick={() => {
                        setActiveTab('inquiries');
                        setShowBellDropdown(false);
                        openReplyModal(inq);
                      }}
                      style={{
                        padding: '0.8rem',
                        marginBottom: '0.5rem',
                        backgroundColor: inq.status === 'UNREAD' ? 'rgba(212,175,55,0.08)' : 'transparent',
                        borderLeft: inq.status === 'UNREAD' ? '3px solid var(--accent)' : '3px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                        <span>{inq.name}</span>
                        <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{inq.category}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: '0.3rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inq.subject || inq.message}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setActiveTab('inquiries');
                      setShowBellDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      marginTop: '0.5rem',
                      backgroundColor: 'var(--accent)',
                      color: '#0A0A0C',
                      border: 'none',
                      fontSize: '0.72rem',
                      letterSpacing: '1.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    View All Inquiries Inbox
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'audits', label: `Audits (${pendingMakersCount})` },
                { id: 'inquiries', label: `Inquiries (${unreadCount})` },
                { id: 'reports', label: 'Reports' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '0.5rem 0',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'transparent',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <div style={{ opacity: 0.5, textAlign: 'center', padding: '4rem' }}>Aggregating executive metrics & audits...</div>}

        {!loading && analyticsData && (
          <>
            {/* 1. DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  <div className="card" style={{ borderTop: '4px solid var(--accent)', padding: '1.5rem', backgroundColor: 'var(--surface)' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Gross Revenue</span>
                    <h3 style={{ fontSize: '2rem', color: 'var(--text)', margin: '0.2rem 0' }}>£{analyticsData.kpis.totalRevenue.toFixed(2)}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Total orders volume</span>
                  </div>
                  <div className="card" style={{ borderTop: '4px solid var(--accent)', padding: '1.5rem', backgroundColor: 'var(--surface)' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Escrow Holds</span>
                    <h3 style={{ fontSize: '2rem', color: 'var(--accent)', margin: '0.2rem 0' }}>£{analyticsData.kpis.escrowBalance.toFixed(2)}</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Secured held transit funds</span>
                  </div>
                  <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Atelier Audits</span>
                    <h3 style={{ fontSize: '2rem', color: 'var(--accent)', margin: '0.2rem 0' }}>{pendingMakersCount}</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Artisan applications awaiting review</span>
                  </div>
                  <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Unread Inquiries</span>
                    <h3 style={{ fontSize: '2rem', color: 'var(--text)', margin: '0.2rem 0' }}>{unreadCount}</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Client Messages awaiting reply</span>
                  </div>
                </div>

                {/* Country Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                  <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--surface)' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Jurisdiction & Country Volumes</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                          <th style={{ padding: '0.5rem 0' }}>Artisan Origin</th>
                          <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Total Sales</th>
                          <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.countries.map((c: any) => (
                          <tr key={c.name} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <td style={{ padding: '0.85rem 0', fontWeight: '500' }}>{c.name}</td>
                            <td style={{ padding: '0.85rem 0', textAlign: 'center' }}>{c.orders} orders</td>
                            <td style={{ padding: '0.85rem 0', textAlign: 'right', fontWeight: 'bold' }}>£{c.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--surface)' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Curation & Verification Tiers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {analyticsData.verification.map((v: any) => (
                        <div key={v.tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '0px', border: '1px solid var(--glass-border)' }}>
                          <strong style={{ color: 'var(--text)' }}>{v.tier} Verification Status</strong>
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>{v.count} products</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ARTISAN REGISTRATION AUDITS TAB */}
            {activeTab === 'audits' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', fontFamily: 'var(--font-playfair), Georgia, serif' }}>Artisan Accreditation & Atelier Audits</h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Review artisan registration dossiers, verify geofence coordinates, and send official approval notifications via Gmail.</p>
                </div>

                {auditFeedback && (
                  <div style={{
                    padding: '1rem 1.2rem',
                    backgroundColor: auditFeedback.success ? 'rgba(46,125,50,0.12)' : 'rgba(211,47,47,0.12)',
                    color: auditFeedback.success ? '#2E7D32' : '#D32F2F',
                    border: `1px solid ${auditFeedback.success ? '#2E7D32' : '#D32F2F'}`,
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}>
                    {auditFeedback.msg}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {makersList.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        borderLeft: m.verificationStatus === 'PENDING_AUDIT' ? '4px solid var(--accent)' : '4px solid var(--success)',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.2rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair), Georgia, serif', margin: 0, color: 'var(--text)' }}>
                              {m.businessName}
                            </h3>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              backgroundColor: m.verificationStatus === 'PENDING_AUDIT' ? '#D4AF37' : '#2E7D32',
                              color: m.verificationStatus === 'PENDING_AUDIT' ? '#0A0A0C' : '#FFF'
                            }}>
                              {m.verificationStatus === 'PENDING_AUDIT' ? '🛡️ PENDING AUDIT' : '⭐ ACCREDITED ELITE'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>
                            Custodian: <strong>{m.founderName}</strong> • Email: <strong>{m.email}</strong> • Country: <strong>{m.country}</strong>
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                          Registered: {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ gridTemplateColumns: 'repeat(3, 1fr)', display: 'grid', gap: '1rem', backgroundColor: 'var(--background)', padding: '1rem', border: '1px solid var(--glass-border)' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, display: 'block' }}>Heritage Experience</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>{m.yearsInBusiness} Years</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, display: 'block' }}>Guild Craftsmen</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{m.employeeCount} Master Artisans</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, display: 'block' }}>Catalog Works</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{m.productCount} Items</strong>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'var(--background)', padding: '1.2rem', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                          Atelier Biography & Craft Discipline
                        </span>
                        <p style={{ fontSize: '0.88rem', lineHeight: 1.7, opacity: 0.9, margin: 0 }}>
                          {m.businessStory}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        {m.verificationStatus === 'PENDING_AUDIT' && (
                          <button
                            onClick={() => handleApproveMaker(m.id, 'REJECT')}
                            disabled={approvingMakerId === m.id}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--text)',
                              fontSize: '0.72rem',
                              letterSpacing: '1px',
                              padding: '0.6rem 1.2rem',
                              cursor: 'pointer'
                            }}
                          >
                            Request Audit Clarification
                          </button>
                        )}
                        <button
                          onClick={() => handleApproveMaker(m.id, 'APPROVE')}
                          disabled={approvingMakerId === m.id}
                          style={{
                            backgroundColor: 'var(--accent)',
                            color: '#0A0A0C',
                            border: 'none',
                            fontSize: '0.72rem',
                            letterSpacing: '1.5px',
                            fontWeight: 800,
                            padding: '0.65rem 1.4rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          {approvingMakerId === m.id ? 'Processing...' : m.verificationStatus === 'PENDING_AUDIT' ? 'Approve & Send Gmail Accreditation' : 'Re-Send Approval Email'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {makersList.length === 0 && (
                    <div style={{ backgroundColor: 'var(--surface)', padding: '4rem', textAlign: 'center', opacity: 0.6, border: '1px solid var(--glass-border)' }}>
                      No artisan registration applications currently in queue.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. INQUIRIES & MESSAGES INBOX TAB */}
            {activeTab === 'inquiries' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', fontFamily: 'var(--font-playfair), Georgia, serif' }}>Client Messages & Inquiry Inbox</h2>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Manage contact inquiries and reply directly via Gmail SMTP.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['ALL', 'CUSTOM ORDER', 'ARTISAN VERIFICATION', 'CONCIERGE', 'GENERAL'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.7rem',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          border: '1px solid var(--glass-border)',
                          backgroundColor: categoryFilter === cat ? 'var(--accent)' : 'transparent',
                          color: categoryFilter === cat ? '#0A0A0C' : 'var(--text)',
                          cursor: 'pointer'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        borderLeft: inq.status === 'UNREAD' ? '4px solid var(--accent)' : inq.status === 'REPLIED' ? '4px solid var(--success)' : '4px solid var(--glass-border)',
                        padding: '1.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>{inq.name}</span>
                            <span style={{
                              backgroundColor: 'rgba(212,175,55,0.15)',
                              color: 'var(--accent)',
                              border: '1px solid var(--accent)',
                              fontSize: '0.65rem',
                              padding: '0.2rem 0.6rem',
                              letterSpacing: '1px',
                              textTransform: 'uppercase',
                              fontWeight: 700
                            }}>
                              {inq.category}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>
                            {inq.email} {inq.phone ? `• ${inq.phone}` : ''} {inq.country ? `• ${inq.country}` : ''}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                          {new Date(inq.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ backgroundColor: 'var(--background)', padding: '1.2rem', border: '1px solid var(--glass-border)' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
                          Subject: {inq.subject || 'Inquiry'}
                        </p>
                        <p style={{ fontSize: '0.88rem', lineHeight: 1.7, opacity: 0.9, margin: 0, whiteSpace: 'pre-line' }}>
                          {inq.message}
                        </p>
                      </div>

                      {inq.replyMessage && (
                        <div style={{ backgroundColor: 'rgba(46,125,50,0.08)', borderLeft: '3px solid #2E7D32', padding: '1rem', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#2E7D32', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Replied via Gmail on {inq.repliedAt ? new Date(inq.repliedAt).toLocaleString() : ''}
                          </span>
                          <p style={{ fontSize: '0.84rem', marginTop: '0.4rem', opacity: 0.9, whiteSpace: 'pre-line' }}>
                            {inq.replyMessage}
                          </p>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        {inq.status === 'UNREAD' && (
                          <button
                            onClick={() => markAsRead(inq.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--text)',
                              fontSize: '0.72rem',
                              letterSpacing: '1px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer'
                            }}
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => openReplyModal(inq)}
                          style={{
                            backgroundColor: 'var(--accent)',
                            color: '#0A0A0C',
                            border: 'none',
                            fontSize: '0.72rem',
                            letterSpacing: '1.5px',
                            fontWeight: 700,
                            padding: '0.55rem 1.2rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          Reply via Gmail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. REPORTS */}
            {activeTab === 'reports' && (
              <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--surface)' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '1.5rem' }}>Generate Executive Audit Reports</h2>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent)', textTransform: 'uppercase' }}>Frequency</label>
                    <select
                      value={reportFreq}
                      onChange={(e) => setReportFreq(e.target.value as any)}
                      style={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem' }}
                    >
                      <option value="daily">Daily Audit</option>
                      <option value="weekly">Weekly Gazette</option>
                      <option value="monthly">Monthly Ledger</option>
                      <option value="quarterly">Quarterly Report</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent)', textTransform: 'uppercase' }}>Format</label>
                    <select
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value as any)}
                      style={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem' }}
                    >
                      <option value="csv">CSV Spreadsheet</option>
                      <option value="excel">Excel Workbook</option>
                      <option value="pdf">PDF Document</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleDownloadReport}
                  disabled={simulatingDownload}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0C',
                    border: 'none',
                    fontSize: '0.75rem',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    padding: '0.8rem 1.8rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {simulatingDownload ? 'Generating Executive Report...' : 'Download Report'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* GMAIL REPLY MODAL */}
      {replyModalInquiry && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--accent)',
            maxWidth: '650px',
            width: '100%',
            padding: '2.5rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', fontFamily: 'var(--font-playfair), Georgia, serif', margin: 0 }}>
                  Reply to {replyModalInquiry.name}
                </h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Recipient: {replyModalInquiry.email}</span>
              </div>
              <button
                onClick={() => setReplyModalInquiry(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendGmailReply} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Email Subject
                </label>
                <input
                  type="text"
                  required
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    padding: '0.7rem 1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Gmail Response Message
                </label>
                <textarea
                  required
                  rows={7}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    padding: '0.8rem 1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {replyFeedback && (
                <div style={{
                  padding: '0.8rem 1rem',
                  fontSize: '0.82rem',
                  backgroundColor: replyFeedback.success ? 'rgba(46,125,50,0.1)' : 'rgba(211,47,47,0.1)',
                  color: replyFeedback.success ? '#2E7D32' : '#D32F2F',
                  border: `1px solid ${replyFeedback.success ? '#2E7D32' : '#D32F2F'}`
                }}>
                  {replyFeedback.msg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReplyModalInquiry(null)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    fontSize: '0.75rem',
                    letterSpacing: '1px',
                    padding: '0.7rem 1.4rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0C',
                    border: 'none',
                    fontSize: '0.75rem',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    padding: '0.7rem 1.8rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {sendingReply ? 'Dispatching via Gmail...' : 'Send Gmail Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
