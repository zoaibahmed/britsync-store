'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandingIllustrations } from '@/components/BrandingIllustrations';
import { Icons } from '@/components/Icons';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#FFA726',
  CONFIRMED: '#29B6F6',
  SHIPPED: '#42A5F5',
  DELIVERED: '#26A69A',
  COMPLETED: '#388E3C',
  DISPUTED: '#EF5350',
  CANCELLED: '#B0BEC5',
  REFUNDED: '#78909C',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '⏳ Pending',
  CONFIRMED: '✅ Confirmed — Escrow Active',
  SHIPPED: '🚚 Shipped',
  DELIVERED: '📦 Delivered',
  COMPLETED: '⭐ Completed',
  DISPUTED: '⚠️ Disputed',
  CANCELLED: '❌ Cancelled',
  REFUNDED: '💸 Refunded',
};

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [savedMakers, setSavedMakers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Support ticket form state
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketError, setTicketError] = useState('');

  // Active ticket for reply thread
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ordersRes, notifRes, unreadRes, ticketsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/notifications'),
          fetch('/api/notifications/unread-count'),
          fetch('/api/support-tickets'),
        ]);

        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
        if (unreadRes.ok) {
          const { count } = await unreadRes.json();
          setUnreadCount(count);
        }
        if (ticketsRes.ok) setTickets(await ticketsRes.json());

        // User info from session cookie (via profile endpoint)
        const profileRes = await fetch('/api/auth/me').catch(() => null);
        if (profileRes?.ok) setUser(await profileRes.json());

        // Saved makers
        const savedRes = await fetch('/api/saved-makers').catch(() => null);
        if (savedRes?.ok) setSavedMakers(await savedRes.json());

        // Wishlist
        const wishRes = await fetch('/api/wishlist').catch(() => null);
        if (wishRes?.ok) setWishlistItems(await wishRes.json());
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id: string) => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const submitTicket = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      setTicketError('Subject and description are required.');
      return;
    }
    setTicketSubmitting(true);
    setTicketError('');
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const newTicket = await res.json();
      setTickets((prev) => [newTicket, ...prev]);
      setTicketForm({ subject: '', description: '', priority: 'MEDIUM' });
      setTicketSuccess('Ticket submitted! Our team will respond shortly.');
      setTimeout(() => setTicketSuccess(''), 4000);
    } catch (e: any) {
      setTicketError(e.message);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const openTicket = async (ticket: any) => {
    try {
      const res = await fetch(`/api/support-tickets/${ticket.id}`);
      if (res.ok) setActiveTicket(await res.json());
    } catch { setActiveTicket(ticket); }
  };

  const submitReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/support-tickets/${activeTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      });
      if (!res.ok) throw new Error('Failed');
      const { reply } = await res.json();
      setActiveTicket((prev: any) => ({ ...prev, replies: [...(prev.replies || []), reply] }));
      setReplyText('');
    } catch (e) { alert('Failed to send reply'); }
    finally { setReplySubmitting(false); }
  };

  const TABS = [
    { id: 'orders', label: '📦 Orders' },
    { id: 'wishlist', label: '❤️ Wishlist' },
    { id: 'notifications', label: `🔔 Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { id: 'support', label: '🎫 Support' },
    { id: 'saved_makers', label: '⭐ Saved Makers' },
  ];

  const cardStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '0px', padding: '2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '1rem', borderRadius: '0px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: 'var(--surface)' };

  return (
    <main className="grid-bg" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}>
      {/* Absolute ambient light orbs */}
      <div className="glow-orb" style={{ top: '10%', right: '5%', width: '500px', height: '500px', opacity: 0.6 }} />
      <div className="glow-orb" style={{ bottom: '15%', left: '5%', width: '450px', height: '450px', opacity: 0.4 }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(10, 10, 12, 0.08)', paddingBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>
            {user ? `Welcome back, ${user.name?.split(' ')[0] || 'Buyer'}` : 'Buyer Dashboard'}
          </h1>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Your orders, notifications, wishlist and support — all in one place.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '0.5rem 0', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 500 : 400,
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>{tab.label}</button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>Loading your dashboard...</div>}

        {!loading && (
          <>
            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>My Orders ({orders.length})</h2>
                {orders.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <BrandingIllustrations.EmptyCart size={140} />
                    <div>
                      <p style={{ marginBottom: '1.5rem', opacity: 0.7, fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem' }}>No Patronage Orders Yet</p>
                      <Link href="/search" className="btn-accent" style={{ textDecoration: 'none', padding: '0.8rem 2.2rem' }}>Start Shopping</Link>
                    </div>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.05rem' }}>#{order.id.toString().slice(0, 12).toUpperCase()}</span>
                          <span style={{ opacity: 0.5, fontSize: '0.85rem', marginLeft: '1rem' }}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', backgroundColor: STATUS_COLORS[order.status] || '#888' }}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>

                      {/* Items */}
                      {order.items?.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: `url(${item.image || 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=100'}) center/cover`, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{item.name}</div>
                            {item.maker && <div style={{ opacity: 0.5, fontSize: '0.8rem' }}>By {item.maker}</div>}
                          </div>
                          <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>£{(item.price || 0).toFixed(2)} × {item.quantity || item.qty || 1}</div>
                        </div>
                      ))}
                      {(order.items?.length || 0) > 3 && <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>+{order.items.length - 3} more items</p>}

                      {/* Totals */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                          {order.paymentStatus && <span>Payment: <strong>{order.paymentStatus}</strong> · </span>}
                          {order.tracking && <span>📍 {order.tracking.status}</span>}
                          {!order.tracking && order.status !== 'PENDING' && <span>🛡️ Escrow protected</span>}
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>£{(order.total || 0).toFixed(2)}</div>
                      </div>

                      {/* Review prompt for completed orders */}
                      {order.status === 'COMPLETED' && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                          {order.items?.map((item: any) => (
                            <Link key={item.productId} href={`/products/${item.productId}#reviews`} style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'underline' }}>
                              Review {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── WISHLIST TAB ── */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>My Wishlist ({wishlistItems.length})</h2>
                {wishlistItems.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <BrandingIllustrations.EmptyWishlist size={140} />
                    <div>
                      <p style={{ marginBottom: '1.5rem', opacity: 0.7, fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem' }}>Your Curated Wishlist is Empty</p>
                      <Link href="/search" className="btn-accent" style={{ textDecoration: 'none', padding: '0.8rem 2.2rem' }}>Discover Products</Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {wishlistItems.map((item: any) => (
                      <div key={item.id} style={cardStyle}>
                        <div style={{ width: '100%', paddingTop: '60%', background: `url(${item.image || ''}) center/cover`, borderRadius: '10px', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{item.name}</h3>
                        {item.maker && <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: '0.75rem' }}>By {item.maker}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>£{(item.price || 0).toFixed(2)}</span>
                          <Link href={`/products/${item.productId}`} style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'underline' }}>View</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === 'notifications' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Notifications ({notifications.length})</h2>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>
                      Mark all as read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', padding: '4.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <BrandingIllustrations.OnboardingSeal size={110} />
                    <p style={{ opacity: 0.7, fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.15rem' }}>No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <div key={n.id} onClick={() => !n.isRead && markOneRead(n.id)} style={{ ...cardStyle, borderLeft: `4px solid ${n.isRead ? '#eee' : 'var(--accent)'}`, cursor: n.isRead ? 'default' : 'pointer', opacity: n.isRead ? 0.75 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--primary)' }}>{n.title}</strong>
                        {!n.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block', alignSelf: 'center' }} />}
                      </div>
                      <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.5 }}>{n.message}</p>
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', opacity: 0.5 }}>{new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── SUPPORT TAB ── */}
            {activeTab === 'support' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Support Centre</h2>

                {/* Active ticket thread */}
                {activeTicket ? (
                  <div>
                    <button onClick={() => setActiveTicket(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      ← Back to tickets
                    </button>
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'var(--primary)', margin: 0 }}>{activeTicket.subject}</h3>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: activeTicket.status === 'OPEN' ? '#FFF3E0' : activeTicket.status === 'IN_PROGRESS' ? '#E3F2FD' : '#E8F5E9', color: activeTicket.status === 'OPEN' ? '#E65100' : activeTicket.status === 'IN_PROGRESS' ? '#1565C0' : '#2E7D32' }}>
                          {activeTicket.status}
                        </span>
                      </div>
                      {/* Thread messages */}
                      <div style={{ backgroundColor: '#F5F5F5', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Original message */}
                        <div style={{ backgroundColor: '#E3F2FD', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                          <strong style={{ fontSize: '0.8rem', color: '#1565C0' }}>You</strong>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{activeTicket.description}</p>
                        </div>
                        {(activeTicket.replies || []).map((r: any) => (
                          <div key={r.id} style={{ backgroundColor: r.isStaff ? '#FFF8E1' : '#E8F5E9', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                            <strong style={{ fontSize: '0.8rem', color: r.isStaff ? '#E65100' : '#2E7D32' }}>{r.isStaff ? '🛡️ Support Team' : 'You'}</strong>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{r.message}</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', opacity: 0.5 }}>{new Date(r.createdAt).toLocaleDateString('en-GB')}</p>
                          </div>
                        ))}
                      </div>
                      {activeTicket.status !== 'CLOSED' && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your message..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                          <button onClick={submitReply} disabled={replySubmitting || !replyText.trim()} className="btn-primary" style={{ padding: '0.75rem 1.5rem', alignSelf: 'flex-end', opacity: replySubmitting ? 0.6 : 1 }}>
                            {replySubmitting ? '...' : 'Send'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Existing tickets */}
                    {tickets.length > 0 && (
                      <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem' }}>Your Tickets</h3>
                        {tickets.map((t: any) => (
                          <div key={t.id} onClick={() => openTicket(t)} style={{ ...cardStyle, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <strong style={{ color: 'var(--primary)' }}>{t.subject}</strong>
                                <p style={{ margin: '0.25rem 0 0', opacity: 0.6, fontSize: '0.85rem' }}>{t.description?.slice(0, 80)}{(t.description?.length || 0) > 80 ? '...' : ''}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: t.priority === 'HIGH' || t.priority === 'URGENT' ? '#FDECEA' : '#F3F3F3', color: t.priority === 'HIGH' || t.priority === 'URGENT' ? '#c62828' : '#555' }}>{t.priority}</span>
                                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: t.status === 'OPEN' ? '#FFF3E0' : '#E8F5E9', color: t.status === 'OPEN' ? '#E65100' : '#2E7D32' }}>{t.status}</span>
                              </div>
                            </div>
                            <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', opacity: 0.4 }}>{new Date(t.createdAt).toLocaleDateString('en-GB')} · Click to view thread →</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New ticket form */}
                    <div style={cardStyle}>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Open a New Support Ticket</h3>
                      {ticketSuccess && <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{ticketSuccess}</div>}
                      {ticketError && <div style={{ backgroundColor: '#FDECEA', color: '#c62828', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{ticketError}</div>}
                      <input type="text" placeholder="Subject" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                      <textarea rows={5} placeholder="Describe your issue in detail..." value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical', marginBottom: '1rem' }} />
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem', flexShrink: 0 }}>Priority:</label>
                        {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                          <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="radio" name="priority" value={p} checked={ticketForm.priority === p} onChange={() => setTicketForm({ ...ticketForm, priority: p })} />{p}
                          </label>
                        ))}
                      </div>
                      <button onClick={submitTicket} disabled={ticketSubmitting} className="btn-accent" style={{ padding: '0.85rem 2rem', opacity: ticketSubmitting ? 0.6 : 1 }}>
                        {ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SAVED MAKERS TAB ── */}
            {activeTab === 'saved_makers' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Saved Makers ({savedMakers.length})</h2>
                {savedMakers.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem' }}>
                    <p style={{ opacity: 0.6, marginBottom: '1.5rem' }}>You haven't saved any makers yet. Browse the marketplace to find artisans you love.</p>
                    <Link href="/search" className="btn-accent" style={{ textDecoration: 'none', padding: '0.8rem 2rem' }}>Discover Makers</Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {savedMakers.map((maker: any) => (
                      <div key={maker.id} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                        <div style={{ height: '140px', background: `url(${maker.coverImage || 'https://images.unsplash.com/photo-1588615419951-dc668b59fa87?w=400'}) center/cover` }} />
                        <div style={{ padding: '1rem' }}>
                          <h3 style={{ color: 'var(--primary)', margin: '0 0 0.25rem', fontSize: '1rem' }}>{maker.businessName || maker.name}</h3>
                          {maker.badge && <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--accent)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>{maker.badge}</span>}
                          <div style={{ marginTop: '0.75rem' }}>
                            <Link href={`/makers/${maker.id}`} style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'underline' }}>View Studio →</Link>
                          </div>
                        </div>
                      </div>
                    ))}
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
