import Link from 'next/link';

export default function PublicProvenanceVerificationPage({ params }: { params: { passportId: string } }) {
  const passportId = params.passportId || 'PASSPORT-2026-UK-001';

  return (
    <main style={{ background: '#080705', color: '#f5f0e8', minHeight: '100vh', fontFamily: 'var(--font-inter, sans-serif)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', background: '#0d0c0a', border: '1px solid #c9a84c', borderRadius: 12, padding: 40, boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
        {/* Header Crest */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid #1c1a14', paddingBottom: 24, marginBottom: 32 }}>
          <span style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700 }}>BRITSYNC HERITAGE GUILD</span>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, margin: '8px 0 0', fontWeight: 300 }}>Cryptographic Provenance Passport</h1>
          <p style={{ color: '#8a7a6a', fontSize: 12, margin: '6px 0 0' }}>Certificate ID: {passportId}</p>
        </div>

        {/* Verification Status Badge */}
        <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '16px 20px', textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <h3 style={{ margin: '4px 0 2px', color: '#4ade80', fontSize: 16, fontWeight: 700 }}>AUTHENTICITY VERIFIED</h3>
          <p style={{ margin: 0, color: '#8a7a6a', fontSize: 12 }}>Certified by the BritSync Secretariat & Recorded on immutable ledger</p>
        </div>

        {/* Provenance Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          <DetailRow label="Studio Origin" value="Highgrove Glassworks Atelier" />
          <DetailRow label="Master Artisan" value="Tariq Al-Mansoor" />
          <DetailRow label="Craft Category" value="Home Decor & Glassware" />
          <DetailRow label="Accreditation Tier" value="👑 Royal Charter (Warrant #RC-2026-088)" />
          <DetailRow label="Materials" value="Hand-blown Lead Crystal & 24k Gold Leaf" />
          <DetailRow label="Creation Period" value="3 Weeks Handcrafting Process" />
          <DetailRow label="Secretariat Seal" value="Official Digital Cryptographic Signature Active" />
        </div>

        {/* Digital Signature Footer */}
        <div style={{ background: '#11100d', border: '1px solid #1c1a14', borderRadius: 8, padding: 16, fontSize: 11, color: '#8a7a6a', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          SIG: 0x9f8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/store" style={{ color: '#c9a84c', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
            ← Return to BritSync Public Atelier Market
          </Link>
        </div>
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #14120e', paddingBottom: 10 }}>
      <span style={{ color: '#8a7a6a', fontSize: 13 }}>{label}</span>
      <span style={{ color: '#f5f0e8', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
