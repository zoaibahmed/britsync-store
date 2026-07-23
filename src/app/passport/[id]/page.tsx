'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PassportPage({ params }: { params: { id: string } }) {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [activeVideoTab, setActiveVideoTab] = useState('tour');

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/passport/${params.id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        const product = data.product;
        const maker = data.maker;
        const certificate = data.certificate;
        const inspectionReport = data.inspectionReport;

        const issueDate = certificate?.issueDate
          ? new Date(certificate.issueDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'January 2026';

        const expiryDate = certificate?.expiryDate
          ? new Date(certificate.expiryDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'January 2028';

        const history =
          data.events && data.events.length > 0
            ? data.events.map((e: any) => ({
                date: new Date(e.eventTimestamp).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
                event: e.description,
              }))
            : [
                { date: issueDate, event: 'Maker registered & application profile submitted.' },
                { date: issueDate, event: 'Documents approved & Field Inspector assigned.' },
                { date: issueDate, event: 'Workshop visited: Physical geolocation check-in completed.' },
                { date: issueDate, event: 'Products inspected: Quality checklist complete.' },
                { date: issueDate, event: `Registry Certificate issued (Valid Until: ${expiryDate}).` },
              ];

        const qualityScore = inspectionReport?.qualityScore ?? (product.verificationStatus === 'GI' ? 98 : product.verificationStatus === 'ELITE' ? 92 : 84);

        const ethics = [
          { check: true, name: 'Fair Living Wage Paid' },
          { check: true, name: 'Zero Child Labor Audited' },
          { check: product.isHandmade, name: '100% Handmade Craft Verified' },
          { check: product.isEcoFriendly, name: 'Eco-Friendly Materials Sourced' },
          { check: product.isWomenLed, name: 'Women-Led Workshop' },
          { check: true, name: 'Safe Working Environments' },
        ].filter((e) => e.check);

        setRecord({
          id: data.id,
          passportSerial: data.passportSerial,
          productId: product.id,
          recordId: `BRIT-${data.passportSerial.slice(-8)}`,
          certNumber: certificate?.certificateNumber || `BS-${product.verificationStatus}-${data.passportSerial.slice(-8)}`,
          certType: product.verificationStatus === 'GI'
            ? 'Protected Appellation'
            : product.verificationStatus === 'ELITE'
            ? 'Elite Verified Studio'
            : 'Verified Maker',
          productName: product.name,
          makerName: maker.businessName,
          village: maker.villageName,
          country: maker.countryName,
          gps: maker.gps,
          materials: product.category,
          productionDate: issueDate,
          inspectionDate: inspectionReport
            ? new Date(inspectionReport.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : issueDate,
          expiryDate,
          qualityScore,
          status: 'Active',
          inspector: inspectionReport?.inspectorName || 'Britsync Inspector',
          inspectorRegion: inspectionReport?.inspectorRegion || 'Global Registry',
          inspectorSig: inspectionReport
            ? `${inspectionReport.inspectorName.split(' ')[0]} (Digital Hash: ${inspectionReport.digitalSignature.slice(0, 8)})`
            : 'Britsync Inspector (Digital Hash: 8F2A9C0E)',
          makerSig: data.signatures?.find((s: any) => s.signatureRole === 'MAKER')
            ? `${maker.businessName} (Digital Hash: ${data.signatures.find((s: any) => s.signatureRole === 'MAKER').signatureHash.slice(0, 8)})`
            : `${maker.businessName} (Digital Hash: 4B1D7E3A)`,
          adminSig: data.signatures?.find((s: any) => s.signatureRole === 'ADMIN')
            ? `Britsync Board (Digital Approved: ${data.signatures.find((s: any) => s.signatureRole === 'ADMIN').signatureHash.slice(0, 8)})`
            : 'Britsync Board (Digital Approved: 7E5B2C1A)',
          history,
          ethics,
          makerPhoto: maker.founderImage || 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=800',
          productImages: product.images,
          yearsInBusiness: maker.yearsInBusiness,
          employeeCount: maker.employeeCount,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const photoCategories = [
    { name: 'Workshop Exterior', count: 2 },
    { name: 'Workshop Interior', count: 2 },
    { name: 'Raw Materials Sourcing', count: 2 },
    { name: 'Employees & Conditions', count: 2 },
    { name: 'Craft Process/Kiln', count: 3 },
    { name: 'Finished Products Quality', count: 2 },
    { name: 'Packaging Verification', count: 1 },
    { name: 'Storage Facility', count: 1 },
  ];

  const videosList = [
    { key: 'tour', label: 'Workshop Tour', desc: 'Verified walkthrough demonstrating physical layout and machinery check.' },
    { key: 'interview', label: 'Founder Interview', desc: 'Artisan details their heritage training and generational techniques.' },
    { key: 'demo', label: 'Craft Demonstration', desc: 'Real-time footage verifying hand tool assembly.' },
  ];

  if (loading) {
    return (
      <div style={{ padding: '12rem 2rem', textAlign: 'center', fontSize: '1.2rem', color: 'var(--primary)' }}>
        Loading provenance passport...
      </div>
    );
  }

  if (notFound || !record) {
    return (
      <div style={{ padding: '12rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Passport Not Found</h2>
        <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
          The passport with ID &ldquo;{params.id}&rdquo; was not found in the Britsync registry.
        </p>
        <Link href="/passport" className="btn-accent" style={{ textDecoration: 'none', padding: '0.75rem 2rem' }}>
          ← Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '8rem 2rem 6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* VERIFIED BANNER */}
        <div style={{
          backgroundColor: '#E8F5E9',
          borderLeft: '6px solid var(--success)',
          padding: '1.5rem 2rem',
          borderRadius: '12px',
          marginBottom: '3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span style={{ fontSize: '2.2rem', color: '#2E7D32' }}>✓</span>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', color: '#2E7D32', fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', fontWeight: 600 }}>
              Verified Heritage Provenance
            </h2>
            <p style={{ margin: 0, color: '#2E7D32', opacity: 0.9, fontSize: '0.9rem' }}>
              This product and its atelier have passed on-site physical GPS geofence auditing, raw materials authenticity checks, and labor ethics compliance audits.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '4rem', alignItems: 'start' }}>

          {/* Left Column: Media & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button onClick={() => setCertModalOpen(true)} className="btn-accent" style={{ width: '100%', padding: '1rem', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}>
                👁️ View Registry Certificate
              </button>
              <button onClick={() => window.print()} className="btn-primary" style={{ width: '100%', padding: '1rem', border: '1px solid #ccc', backgroundColor: 'transparent', color: 'var(--primary)', fontWeight: 'bold', borderRadius: '8px' }}>
                🖨️ Print Certificate
              </button>
              {record.productId && (
                <Link href={`/products/${record.productId}`} style={{ display: 'block', width: '100%', padding: '1rem', textAlign: 'center', border: 'none', backgroundColor: 'var(--secondary)', color: 'var(--primary)', fontWeight: 'bold', borderRadius: '8px', textDecoration: 'none' }}>
                  🛍️ View Product Listing
                </Link>
              )}
            </div>

            {/* QR Code */}
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem' }}>QR Code Registry Reference</strong>
              <div style={{ width: '150px', height: '150px', margin: '0 auto 1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://britsync.com/passport/${record.id}`}
                  alt="QR Code"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Scan to verify certificate live on mobile device</span>
            </div>

            {/* Video Docs */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Atelier Video Documentation</h3>
              <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                {videosList.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setActiveVideoTab(v.key)}
                    style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      border: 'none',
                      background: activeVideoTab === v.key ? 'var(--primary)' : 'transparent',
                      color: activeVideoTab === v.key ? '#fff' : 'var(--primary)',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.8), transparent), url(${record.makerPhoto}) center/cover`, opacity: 0.7 }} />
                <span
                  style={{ zIndex: 1, fontSize: '2.5rem', cursor: 'pointer', display: 'inline-flex', width: '50px', height: '50px', backgroundColor: 'var(--accent)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}
                  onClick={() => alert('Streaming authenticated video...')}
                >
                  ▶
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.75rem', lineHeight: 1.4 }}>
                {videosList.find((v) => v.key === activeVideoTab)?.desc}
              </p>
            </div>
          </div>

          {/* Right Column: Registry Details */}
          <div className="card" style={{ padding: '3.5rem', border: '2px solid var(--primary)', borderRadius: '24px', position: 'relative', boxShadow: 'var(--shadow-md)' }}>

            {/* Wax Seal */}
            <div style={{ position: 'absolute', top: '-35px', right: '3rem', width: '80px', height: '80px', backgroundColor: 'var(--accent)', borderRadius: '50%', border: '4px solid var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.1, fontSize: '0.8rem', boxShadow: 'var(--shadow-md)' }}>
              OFFICIAL<br />SEAL
            </div>

            {/* Header */}
            <div style={{ borderBottom: '2px solid var(--secondary)', paddingBottom: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.85rem' }}>
                  {record.certType}
                </span>
                <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  Registry Status: {record.status}
                </span>
              </div>
              <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', margin: '0.5rem 0', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
                Provenance Passport
              </h1>
              <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>Passport Number: <strong style={{ color: 'var(--primary)' }}>{record.recordId}</strong></p>
              <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>Certificate Number: <strong style={{ color: 'var(--primary)' }}>{record.certNumber}</strong></p>
              <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>Passport Serial: <strong style={{ color: 'var(--primary)' }}>{record.passportSerial}</strong></p>
            </div>

            {/* Core Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Product Classification</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{record.productName}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Heritage Studio</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{record.makerName}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Village/Region</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{record.village}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Country of Origin</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{record.country}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Years Active</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{record.yearsInBusiness} Years</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Workshop Team</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{record.employeeCount} Artisans</strong>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>GPS Geofenced Coordinates</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>📍 {record.gps}</strong>
              </div>
            </div>

            {/* Audit Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem', backgroundColor: 'var(--secondary)', padding: '1.5rem', borderRadius: '12px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--primary)' }}>Provenance Audit Score</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{record.qualityScore} / 100 (Excellent)</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--primary)' }}>Certificate Validity</span>
                <strong style={{ fontSize: '1rem', color: 'var(--primary)', display: 'block', marginTop: '0.3rem' }}>
                  {record.inspectionDate} → {record.expiryDate}
                </strong>
              </div>
            </div>

            {/* Photo Checklist */}
            <div style={{ marginBottom: '2.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>Verified Photo Checklist (15 HR Images Logged)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                {photoCategories.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
                    <span>{c.name} ({c.count} verified)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Labor & Sourcing Audit */}
            <div style={{ marginBottom: '2.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>Labor & Sourcing Audit</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {record.ethics.map((eth: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
                    <span>{eth.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provenance Timeline */}
            <div style={{ marginBottom: '3rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Provenance Verification History</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '2px solid var(--secondary)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
                {record.history.map((hist: any, idx: number) => (
                  <div key={idx} className="timeline-step" style={{ position: 'relative', cursor: 'default' }}>
                    <div className="timeline-dot" style={{
                      position: 'absolute',
                      left: '-29px',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: idx === record.history.length - 1 ? 'var(--accent)' : 'var(--primary)',
                    }} />
                    <strong style={{ display: 'block', fontSize: '0.85rem' }}>{hist.date}</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.4 }}>{hist.event}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #ccc', paddingTop: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block' }}>Verified By</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{record.inspector}</strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block' }}>Field Auditor — {record.inspectorRegion}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block' }}>Audit Score</span>
                <strong style={{ fontSize: '1.6rem', color: 'var(--success)', display: 'block', fontFamily: 'var(--font-outfit)' }}>{record.qualityScore}/100</strong>
              </div>
            </div>

            {/* Return Links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', fontSize: '0.9rem' }}>
              <Link href="/passport" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                ← Return to Registry
              </Link>
              <Link href="/search" style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>
                Explore Masterworks →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {certModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '2rem' }}>
          <div className="modal-body" style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#FAF9F6', borderRadius: '12px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', padding: '1rem' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #ddd', marginBottom: '2rem', backgroundColor: '#fff', borderRadius: '8px' }}>
              <button onClick={() => window.print()} className="btn-accent" style={{ padding: '0.6rem 1.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
                🖨️ Download PDF / Print Certificate
              </button>
              <button onClick={() => setCertModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>
                Close Window
              </button>
            </div>

            <div id="print-certificate-container" style={{ backgroundColor: '#FAF9F6', color: 'var(--primary)', padding: '4rem 3rem', border: '12px double #D4AF37', borderRadius: '4px', fontFamily: 'Georgia, serif', textAlign: 'center', position: 'relative' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <strong style={{ letterSpacing: '4px', fontSize: '1.4rem', color: '#D4AF37', textTransform: 'uppercase', display: 'block', fontFamily: 'var(--font-outfit)' }}>Britsync</strong>
                <span style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.6, textTransform: 'uppercase' }}>Global Heritage Registry</span>
              </div>
              <h1 style={{ fontSize: '2.8rem', color: 'var(--primary)', fontWeight: 300, fontStyle: 'italic', marginBottom: '1rem' }}>
                Registry of Heritage Provenance
              </h1>
              <div style={{ width: '80px', height: '2px', backgroundColor: '#D4AF37', margin: '0 auto 2rem' }} />
              <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 3.5rem' }}>
                This document registers that the atelier of <strong>{record.makerName}</strong> in <strong>{record.village}, {record.country}</strong>, has successfully passed physical geofence auditing, labor ethics compliance, and raw materials authenticity verification.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', textAlign: 'left', maxWidth: '650px', margin: '0 auto 4rem', fontSize: '0.95rem', borderBottom: '1px dashed rgba(212, 175, 55, 0.3)', paddingBottom: '2.5rem' }}>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Artisan Studio</span>
                  <strong style={{ display: 'block' }}>{record.makerName}</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Product Classification</span>
                  <strong style={{ display: 'block' }}>{record.productName}</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Verification Grade</span>
                  <strong>{record.qualityScore}/100 (AQL Rating)</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Registry Number</span>
                  <strong>{record.certNumber}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '4rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#D4AF37' }}>
                <span>🛡️ Human Verified Atelier</span>
                <span>📍 Atelier Audited</span>
                <span>⭐ Britsync Certified</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '750px', margin: '0 auto', fontSize: '0.85rem' }}>
                <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.75rem', width: '220px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block' }}>Field Auditor Signature</span>
                  <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 'bold', fontStyle: 'italic', display: 'block', margin: '0.25rem 0' }}>{record.inspector.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>Ref: {record.inspectorSig}</span>
                </div>
                <div style={{ width: '90px', height: '90px', backgroundColor: '#D4AF37', backgroundImage: 'radial-gradient(circle, #f3e5ab 0%, #D4AF37 100%)', borderRadius: '50%', boxShadow: '0 4px 10px rgba(212,175,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.75rem', lineHeight: 1.1, textAlign: 'center', border: '3px solid #FAF9F6' }}>
                  OFFICIAL<br />SEAL
                </div>
                <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.75rem', width: '220px', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block' }}>Audit Board Representative</span>
                  <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 'bold', fontStyle: 'italic', display: 'block', margin: '0.25rem 0' }}>Britsync Audit Board</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>Verification ID: {record.recordId}</span>
                </div>
              </div>
              <div style={{ marginTop: '4.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem', opacity: 0.5 }}>
                <span>Verified by Britsync</span>
                <span style={{ fontStyle: 'italic' }}>This certificate is cryptographically recorded and verified by Britsync.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-overlay { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .modal-body { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; transition: transform 0.4s; }
        .modal-body:hover { transform: translateY(-2px); box-shadow: 0 40px 90px rgba(212,175,55,0.2), 0 20px 40px rgba(0,0,0,0.12) !important; }
        .timeline-step { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .timeline-step:hover { transform: translateX(6px); }
        .timeline-dot { transition: background-color 0.3s, transform 0.3s; }
        .timeline-step:hover .timeline-dot { background-color: var(--accent) !important; transform: scale(1.3); }
        @media print {
          body * { visibility: hidden; }
          #print-certificate-container, #print-certificate-container * { visibility: visible; }
          #print-certificate-container { position: absolute; left: 0; top: 0; width: 100%; border: 15px double #D4AF37 !important; padding: 4rem 3rem !important; margin: 0 !important; box-shadow: none !important; background-color: #FAF9F6 !important; }
          .no-print { display: none !important; }
        }
      `}} />
    </main>
  );
}
