'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function BespokeCommissionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetGbp, setBudgetGbp] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [materials, setMaterials] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setStatusMsg({ ok: false, text: 'Title and description are required.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/operations/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          title,
          description,
          budgetGbp,
          dimensions,
          materials,
          deadline,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ ok: true, text: 'Your bespoke commission request has been received by the BritSync Concierge Secretariat.' });
        setTitle('');
        setDescription('');
        setBudgetGbp('');
        setDimensions('');
        setMaterials('');
        setDeadline('');
      } else {
        setStatusMsg({ ok: false, text: data.error || 'Failed to submit commission request.' });
      }
    } catch (err) {
      setStatusMsg({ ok: false, text: 'Connection failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ background: '#080705', color: '#f5f0e8', minHeight: '100vh', fontFamily: 'var(--font-inter, sans-serif)', padding: '60px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/store" style={{ color: '#c9a84c', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700, display: 'block', marginBottom: 16 }}>
          ← Back to Atelier Market
        </Link>

        <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, display: 'block' }}>
          BESPOKE LUXURY CRAFT
        </span>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, margin: '8px 0 16px', color: '#f5f0e8' }}>
          Custom Commission Request
        </h1>
        <p style={{ color: '#8a7a6a', fontSize: 14, lineHeight: 1.6, marginBottom: 36 }}>
          Commission a unique, one-of-one piece handcrafted by accredited Guild Master Artisans. Your request will be routed through the Patron Concierge Secretariat.
        </p>

        {statusMsg && (
          <div style={{ background: statusMsg.ok ? '#051a0a' : '#1a0505', border: `1px solid ${statusMsg.ok ? '#4ade80' : '#f87171'}`, color: statusMsg.ok ? '#4ade80' : '#f87171', padding: 16, borderRadius: 8, marginBottom: 24, fontSize: 13 }}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: '#0d0c0a', border: '1px solid #1c1a14', borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Commission Title *</label>
            <input
              type="text"
              placeholder="e.g. 24k Gold & Crystal Presentation Bowl"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Detailed Description & Story *</label>
            <textarea
              rows={4}
              placeholder="Describe your vision, intended space, heritage details, or special requests..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Estimated Budget (£ GBP)</label>
              <input
                type="number"
                placeholder="5000"
                value={budgetGbp}
                onChange={e => setBudgetGbp(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Desired Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Dimensions / Scale</label>
              <input
                type="text"
                placeholder="e.g. 45cm x 30cm"
                value={dimensions}
                onChange={e => setDimensions(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Preferred Materials</label>
              <input
                type="text"
                placeholder="e.g. Obsidian, Brass, Silk"
                value={materials}
                onChange={e => setMaterials(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ background: '#c9a84c', color: '#080705', border: 'none', padding: '14px', borderRadius: 6, fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', marginTop: 12 }}
          >
            {submitting ? 'Dispatching Request…' : 'Submit Bespoke Request to Concierge →'}
          </button>
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#8a7a6a',
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  marginBottom: 6,
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#080705',
  border: '1px solid #2a2520',
  color: '#f5f0e8',
  padding: '10px 14px',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};
