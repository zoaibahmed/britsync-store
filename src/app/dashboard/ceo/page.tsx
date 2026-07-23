"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';


interface CountryStats {
  name: string;
  type: 'maker' | 'buyer';
  makers: number;
  eliteMakers: number;
  products: number;
  orders: number;
  revenue: number;
  giProducts: number;
  topCategories: string;
  growthRate: number;
  coordinates: { x: number; y: number };
}

interface MapPin {
  id: string;
  name: string;
  type: 'village' | 'workshop' | 'elite' | 'inspection' | 'project';
  country: string;
  description: string;
  coordinates: { x: number; y: number };
}

export default function CEODashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expansion' | 'exports' | 'impact' | 'insights' | 'performance' | 'reports'>('dashboard');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Executive Reports states
  const [reportFreq, setReportFreq] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('csv');
  const [simulatingDownload, setSimulatingDownload] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Fetch real-time CEO analytics from mount
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
  }, []);

  const handleDownloadReport = () => {
    setSimulatingDownload(true);
    setDownloadSuccess(null);
    setTimeout(() => {
      setSimulatingDownload(false);
      setDownloadSuccess(`Britsync-Executive-${reportFreq.toUpperCase()}-Report.${reportFormat}`);
      // Create a simulated client-side download of CSV
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

  const cardStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '0px', padding: '2.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' };

  return (
    <main className="grid-bg" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}>
      {/* Absolute ambient light orbs */}
      <div className="glow-orb" style={{ top: '10%', right: '5%', width: '550px', height: '550px', opacity: 0.6 }} />
      <div className="glow-orb" style={{ bottom: '15%', left: '5%', width: '450px', height: '450px', opacity: 0.4 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(10, 10, 12, 0.08)', paddingBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>Executive Intelligence Center</h1>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Britsync Global C-Suite Dashboard & Growth Analytics</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['dashboard', 'exports', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  padding: '0.5rem 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: activeTab === tab ? 500 : 400,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading && <div style={{ opacity: 0.5, textAlign: 'center', padding: '4rem' }}>Aggregating business metrics...</div>}

        {!loading && analyticsData && (
          <>
            {/* 1. DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                {/* Financial KPIs row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  <div className="card" style={{ borderTop: '4px solid var(--accent)', padding: '1.5rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Gross Revenue</span>
                    <h3 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0.2rem 0' }}>£{analyticsData.kpis.totalRevenue.toFixed(2)}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Total orders volume</span>
                  </div>
                  <div className="card" style={{ borderTop: '4px solid var(--accent)', padding: '1.5rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Escrow Holds</span>
                    <h3 style={{ fontSize: '2rem', color: 'var(--accent)', margin: '0.2rem 0' }}>£{analyticsData.kpis.escrowBalance.toFixed(2)}</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Secured held transit funds</span>
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Britsync Net Margin</span>
                    <h3 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0.2rem 0' }}>£{analyticsData.kpis.netMargin.toFixed(2)}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Margin revenue collected</span>
                  </div>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Maker Payouts</span>
                    <h3 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0.2rem 0' }}>£{analyticsData.kpis.makerPayouts.toFixed(2)}</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Cleared artisan earnings</span>
                  </div>
                </div>

                {/* Country Breakdown & Verification matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                  
                  <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Jurisdiction & Country Volumes</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                          <th style={{ padding: '0.5rem 0' }}>Artisan Origin</th>
                          <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Total Sales</th>
                          <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.countries.map((c: any) => (
                          <tr key={c.name} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.85rem 0', fontWeight: '500' }}>{c.name}</td>
                            <td style={{ padding: '0.85rem 0', textAlign: 'center' }}>{c.orders} orders</td>
                            <td style={{ padding: '0.85rem 0', textAlign: 'right', fontWeight: 'bold' }}>£{c.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                        {analyticsData.countries.length === 0 && (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No orders placed from active countries.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Curation & Verification Tiers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {analyticsData.verification.map((v: any) => (
                        <div key={v.tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#FAF8F4', borderRadius: '8px' }}>
                          <strong style={{ color: 'var(--primary)' }}>{v.tier} Verification Status</strong>
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>{v.count} products</span>
                        </div>
                      ))}
                      {analyticsData.verification.length === 0 && (
                        <p style={{ opacity: 0.5, textAlign: 'center' }}>No products cataloged.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Top Performing products */}
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Top Performing Products</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '0.5rem 0' }}>Product Name</th>
                        <th style={{ padding: '0.5rem 0' }}>Artisan</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Views</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topProducts.map((p: any) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.85rem 0', fontWeight: '500' }}>{p.name}</td>
                          <td style={{ padding: '0.85rem 0' }}>{p.makerName}</td>
                          <td style={{ padding: '0.85rem 0', textAlign: 'center' }}>{p.views}</td>
                          <td style={{ padding: '0.85rem 0', textAlign: 'right', fontWeight: 'bold' }}>{p.purchases} units</td>
                        </tr>
                      ))}
                      {analyticsData.topProducts.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No purchase metrics logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* 2. EXPORTS READINESS */}
            {activeTab === 'exports' && (
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>Global Export Readiness Logs</h2>
                <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Automated customs declaration, pre-cleared logistics, and wood crate compliance controls.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '12px' }}>
                    <h3>Royal Mail Pre-Cleared</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Standard pre-arranged customs check-in active. UK duty pre-payment is automatically calculated during Checkout.</p>
                  </div>
                  <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '12px' }}>
                    <h3>DHL Sovereign Connect</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Europe DDP (Duty Paid) shipping. Customs forms generated cryptographically using Product Authenticity serial keys.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. EXECUTIVE REPORTS */}
            {activeTab === 'reports' && (
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>Generate Executive Growth Report</h2>
                <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Compile high-performance billing summaries, tax withholdings, and commission revenues.</p>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Frequency</label>
                    <select value={reportFreq} onChange={(e: any) => setReportFreq(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                      <option value="daily">Daily report</option>
                      <option value="weekly">Weekly report</option>
                      <option value="monthly">Monthly executive</option>
                      <option value="quarterly">Quarterly report</option>
                      <option value="yearly">Annual audit</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Format</label>
                    <select value={reportFormat} onChange={(e: any) => setReportFormat(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                      <option value="csv">CSV (Spreadsheet)</option>
                      <option value="excel">Excel Sheet</option>
                      <option value="pdf">PDF Document</option>
                    </select>
                  </div>
                  <button onClick={handleDownloadReport} disabled={simulatingDownload} className="btn-accent" style={{ padding: '0.75rem 2rem', alignSelf: 'flex-end', opacity: simulatingDownload ? 0.7 : 1 }}>
                    {simulatingDownload ? 'Generating...' : 'Compile & Export Report'}
                  </button>
                </div>
                {downloadSuccess && (
                  <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                    ✓ Report generated successfully: {downloadSuccess}
                  </div>
                )}
              </div>
            )}

          </>
        )}

      </div>
    </main>
  );
}
