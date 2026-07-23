'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { calculateSellingPrice } from '@/lib/pricing';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  maker?: string;
  inventory: number;
}

const COURIER_OPTIONS = [
  { id: 'royal_mail', name: 'Royal Mail International Premium', cost: 15.0, est: 'Est. 4-6 business days', rule: 'Standard pre-cleared customs' },
  { id: 'dhl', name: 'DHL Express Europe Sovereign', cost: 25.0, est: 'Est. 2-3 business days', rule: 'Europe duty pre-paid (DDP)' },
  { id: 'fedex', name: 'FedEx Priority International', cost: 35.0, est: 'Est. 1-2 business days', rule: 'Express priority logistics' },
];

export default function CartPage() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '', addressLine: '', city: '', postcode: '', country: 'United Kingdom',
  });
  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true, fullName: '', addressLine: '', city: '', postcode: '', country: 'United Kingdom',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [courier, setCourier] = useState('dhl');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load cart from DB (if logged in) else from localStorage
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        if (Array.isArray(data) && data.length > 0) {
          setCart(data.map((i: any) => ({
            id: i.productId,
            productId: i.productId,
            name: i.name,
            price: calculateSellingPrice(i.price, undefined, undefined, undefined),
            qty: i.qty,
            image: i.image,
            maker: i.maker,
            inventory: i.inventory,
          })));
        } else {
          // Merge localStorage cart into DB cart for guest-to-logged-in transition
          const local = localStorage.getItem('britsync_cart');
          if (local) {
            const localItems: CartItem[] = JSON.parse(local);
            for (const item of localItems) {
              await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: item.productId || item.id, quantity: item.qty }),
              });
            }
            localStorage.removeItem('britsync_cart');
            // Re-fetch after merge
            const r2 = await fetch('/api/cart');
            const d2 = await r2.json();
            setCart(d2.map((i: any) => ({
              id: i.productId, productId: i.productId, name: i.name,
              price: calculateSellingPrice(i.price), qty: i.qty,
              image: i.image, maker: i.maker, inventory: i.inventory,
            })));
          }
        }
        return;
      }
    } catch {
      // Not logged in — fall through to localStorage
    }

    // Guest: use localStorage
    const saved = localStorage.getItem('britsync_cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch { setCart([]); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCart().finally(() => setLoading(false)); }, [loadCart]);

  const syncToStorage = (newCart: CartItem[]) => {
    if (!isLoggedIn) localStorage.setItem('britsync_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const updateQty = async (id: string, delta: number) => {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    const newQty = Math.max(1, Math.min(item.qty + delta, item.inventory));
    const newCart = cart.map((c) => c.id === id ? { ...c, qty: newQty } : c);
    setCart(newCart);
    syncToStorage(newCart);
    if (isLoggedIn) {
      await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id, quantity: newQty }) });
    }
  };

  const remove = async (id: string) => {
    const newCart = cart.filter((c) => c.id !== id);
    setCart(newCart);
    syncToStorage(newCart);
    if (isLoggedIn) {
      await fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) });
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    const promos: Record<string, [string, number, string]> = {
      'BRITSYNC20': ['pct', 0.20, 'BRITSYNC20 (20% Off)'],
      'WELCOME10': ['pct', 0.10, 'WELCOME10 (10% Off)'],
      'GIFT-50': ['flat', 50, 'GIFT-50 (£50 Gift Card)'],
    };
    if (promos[code]) {
      const [type, val, label] = promos[code];
      const disc = type === 'pct' ? subtotal * (val as number) : val as number;
      setDiscountAmount(disc);
      setAppliedPromo(label);
    } else {
      alert('Invalid promo code. Try WELCOME10, BRITSYNC20, or GIFT-50.');
    }
    setPromoCode('');
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const selectedCourier = COURIER_OPTIONS.find((c) => c.id === courier) || COURIER_OPTIONS[1];
  const shippingCost = selectedCourier.cost;
  const vatRate = 0.20;
  const vatAmount = subtotal * vatRate;
  const total = Math.max(0, subtotal - discountAmount + shippingCost + vatAmount);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.fullName || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.postcode) {
      setError('Please fill out all required shipping details.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        items: cart.map((i) => ({ id: i.productId || i.id, name: i.name, qty: i.qty, price: i.price })),
        subtotal, vat: vatAmount, discount: discountAmount, shippingCost, total,
        paymentMethod, shippingAddress,
      };

      if (isLoggedIn) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Order placement failed');

        setConfirmedOrder({
          id: data.orderId,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: data.status,
          courierName: selectedCourier.name,
          estimatedDelivery: selectedCourier.est,
          shippingAddress,
          billingAddress: billingAddress.sameAsShipping ? shippingAddress : billingAddress,
          subtotal, vat: vatAmount, discount: discountAmount, shippingCost, total,
          paymentMethod,
          items: cart,
        });
        setCart([]);
        setStep(3);
      } else {
        // Guest fallback — save to localStorage only
        const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        const order = {
          id: orderId,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Order Received',
          courierName: selectedCourier.name,
          trackingNumber: `BS-${selectedCourier.id.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
          estimatedDelivery: selectedCourier.est,
          shippingAddress,
          billingAddress: billingAddress.sameAsShipping ? shippingAddress : billingAddress,
          subtotal, vat: vatAmount, discount: discountAmount, shippingCost, total,
          paymentMethod, items: cart,
        };
        const existing = JSON.parse(localStorage.getItem('britsync_orders') || '[]');
        existing.unshift(order);
        localStorage.setItem('britsync_orders', JSON.stringify(existing));
        localStorage.removeItem('britsync_cart');
        setConfirmedOrder(order);
        setCart([]);
        syncToStorage([]);
        setStep(3);
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem', boxSizing: 'border-box' as const };

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Progress */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem', gap: '2rem', alignItems: 'center' }}>
          {['Shopping Bag', 'Secure Checkout', 'Order Complete'].map((label, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ color: step >= i + 1 ? 'var(--primary)' : '#ccc', fontWeight: step >= i + 1 ? 'bold' : 'normal' }}>
                {i + 1}. {label}
              </span>
              {i < 2 && <span style={{ width: '50px', height: '2px', backgroundColor: step >= i + 2 ? 'var(--primary)' : '#eee', display: 'inline-block' }} />}
            </span>
          ))}
        </div>

        {/* ── STEP 1: BAG ── */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '4rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>Your Bag</h1>
              {loading ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', opacity: 0.5 }}>Loading cart...</div>
              ) : cart.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '16px' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Your shopping bag is empty.</p>
                  <Link href="/search" className="btn-accent" style={{ padding: '1rem 2rem', textDecoration: 'none' }}>Shop Collections</Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '2rem', padding: '2rem 0', borderBottom: '1px solid #eee' }}>
                    <div style={{ width: '150px', height: '150px', background: `url(${item.image || 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300'}) center/cover`, borderRadius: '12px', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>{item.name}</h3>
                        <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>£{(item.price * item.qty).toFixed(2)}</p>
                      </div>
                      {item.maker && <p style={{ opacity: 0.6, fontSize: '0.9rem', margin: '0 0 1rem' }}>By {item.maker}</p>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #ddd', padding: '0.25rem 1rem', borderRadius: '20px' }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                        </div>
                        <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="card" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Order Summary</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                {discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}><span>Promo Discount</span><span>−£{discountAmount.toFixed(2)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>VAT (20% UK/EU)</span><span>£{vatAmount.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}><span style={{ opacity: 0.7 }}>Shipping</span><span>£{shippingCost.toFixed(2)}</span></div>
                {appliedPromo && <div style={{ fontSize: '0.8rem', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold' }}>✓ {appliedPromo}</div>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Promo Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} style={{ ...inputStyle, padding: '0.6rem 0.8rem', fontSize: '0.9rem' }} />
                  <button onClick={handleApplyPromo} className="btn-primary" style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Apply</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0 1rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}><span>Total</span><span>£{total.toFixed(2)}</span></div>
                <button onClick={() => setStep(2)} className="btn-accent" style={{ width: '100%', padding: '1rem' }}>Proceed to Checkout →</button>
                <div style={{ paddingTop: '1rem', borderTop: '1px dashed #eee', fontSize: '0.85rem', opacity: 0.8 }}>🛡️ <strong>Managed Commerce Guarantee</strong>: Britsync holds funds in secure Escrow until physical delivery is verified.</div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: CHECKOUT ── */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '4rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>Checkout</h1>

              {/* Shipping Address */}
              <div className="card" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Shipping Address</h2>
                {['fullName', 'addressLine', 'city', 'postcode'].map((field) => (
                  <input key={field} type="text" placeholder={field === 'fullName' ? 'Full Name' : field === 'addressLine' ? 'Street Address' : field === 'city' ? 'City' : 'Postcode'}
                    value={(shippingAddress as any)[field]}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, [field]: e.target.value })}
                    style={{ ...inputStyle, marginBottom: '1rem' }} />
                ))}
                <select value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                  {['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Belgium', 'Sweden', 'Norway'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Billing Address */}
              <div className="card" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>Billing Address</h2>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={billingAddress.sameAsShipping} onChange={(e) => setBillingAddress({ ...billingAddress, sameAsShipping: e.target.checked })} /> Same as Shipping
                  </label>
                </div>
                {!billingAddress.sameAsShipping && (
                  <>
                    {['fullName', 'addressLine', 'city', 'postcode'].map((field) => (
                      <input key={field} type="text" placeholder={field === 'fullName' ? 'Full Name' : field === 'addressLine' ? 'Street Address' : field === 'city' ? 'City' : 'Postcode'}
                        value={(billingAddress as any)[field]}
                        onChange={(e) => setBillingAddress({ ...billingAddress, [field]: e.target.value })}
                        style={{ ...inputStyle, marginBottom: '1rem' }} />
                    ))}
                  </>
                )}
              </div>

              {/* Courier Selection */}
              <div className="card" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Courier & Logistics</h2>
                {COURIER_OPTIONS.map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', padding: '1rem', border: `1px solid ${courier === opt.id ? 'var(--accent)' : '#eee'}`, borderRadius: '8px', cursor: 'pointer', gap: '1rem', marginBottom: '0.75rem', backgroundColor: courier === opt.id ? '#FAF8F4' : '#fff' }}>
                    <input type="radio" name="courier" checked={courier === opt.id} onChange={() => setCourier(opt.id)} style={{ marginTop: '0.2rem' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--primary)' }}>{opt.name}</span><span>£{opt.cost.toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>{opt.est} • <span style={{ color: 'var(--accent)' }}>{opt.rule}</span></div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Payment */}
              <div className="card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Payment Method</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  {[['card', '💳 Card'], ['stripe', 'Stripe Connect'], ['paypal', 'PayPal'], ['digital', ' / G-Pay']].map(([id, label]) => (
                    <button key={id} onClick={() => setPaymentMethod(id)} style={{ padding: '0.6rem 1.2rem', borderRadius: '30px', border: paymentMethod === id ? 'none' : '1px solid #ccc', background: paymentMethod === id ? 'var(--primary)' : 'transparent', color: paymentMethod === id ? '#fff' : 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>{label}</button>
                  ))}
                </div>
                {paymentMethod === 'card' && (
                  <div>
                    <input type="text" placeholder="Cardholder Name" value={cardDetails.name} onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                    <input type="text" placeholder="Card Number (16 digits)" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} style={inputStyle} />
                      <input type="text" placeholder="CVC" value={cardDetails.cvc} onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                )}
                {paymentMethod !== 'card' && (
                  <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
                    <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      {paymentMethod === 'stripe' ? 'Stripe Checkout Gateway' : paymentMethod === 'paypal' ? 'PayPal Instant Billing' : 'Apple / Google Pay Express'}
                    </strong>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Secure payment handled via {paymentMethod === 'stripe' ? 'Stripe 3D-Secure' : paymentMethod === 'paypal' ? 'PayPal portal' : 'device biometric authentication'}.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Sidebar */}
            <div>
              <div className="card" style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Order Summary</h2>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>{item.name} × {item.qty}</span>
                    <span>£{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #eee' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                {discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}><span>Discount</span><span>−£{discountAmount.toFixed(2)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>VAT (20%)</span><span>£{vatAmount.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}><span style={{ opacity: 0.7 }}>Shipping</span><span>£{shippingCost.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}><span>Total</span><span>£{total.toFixed(2)}</span></div>
                {error && <div style={{ backgroundColor: '#FDECEA', color: '#c62828', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
                <button onClick={handlePlaceOrder} disabled={submitting} className="btn-accent" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Processing...' : `Pay £${total.toFixed(2)} & Place Order`}
                </button>
                <button onClick={() => setStep(1)} style={{ width: '100%', padding: '0.75rem', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary)' }}>
                  ← Back to Bag
                </button>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.4 }}>🔒 Secure checkout. Funds held in Britsync Escrow until delivery is verified.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: CONFIRMATION ── */}
        {step === 3 && confirmedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            <div className="no-print" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--success)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 2rem' }}>✓</div>
              <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>Order Confirmed!</h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                Your order <strong>#{confirmedOrder.id.toString().slice(0, 12).toUpperCase()}</strong> has been placed. Funds are held securely in escrow.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => window.print()} className="btn-accent" style={{ padding: '0.8rem 2rem' }}>🖨️ Print Invoice</button>
                <Link href="/dashboard/buyer" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', border: '1px solid #ccc', backgroundColor: '#fff', color: 'var(--primary)' }}>Go to Dashboard</Link>
              </div>
            </div>

            {/* Commercial Invoice */}
            <div className="card" id="printable-invoice" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', boxShadow: 'none', backgroundColor: '#fff', color: '#000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: 0 }}>BRITSYNC MARKET</h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0.25rem 0 0' }}>London, United Kingdom • support@britsync.com</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>COMMERCIAL INVOICE</h3>
                  <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>Order: #{confirmedOrder.id.toString().slice(0, 12).toUpperCase()}</p>
                  <p style={{ margin: 0 }}>{confirmedOrder.date}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                <div>
                  <h4 style={{ textTransform: 'uppercase', color: 'var(--primary)', margin: '0 0 0.5rem' }}>Bill To:</h4>
                  <strong>{(confirmedOrder.billingAddress || confirmedOrder.shippingAddress).fullName}</strong>
                  <p style={{ margin: '0.25rem 0' }}>{(confirmedOrder.billingAddress || confirmedOrder.shippingAddress).addressLine}</p>
                  <p style={{ margin: 0 }}>{(confirmedOrder.billingAddress || confirmedOrder.shippingAddress).city}, {(confirmedOrder.billingAddress || confirmedOrder.shippingAddress).postcode}</p>
                  <p style={{ margin: 0 }}>{(confirmedOrder.billingAddress || confirmedOrder.shippingAddress).country}</p>
                </div>
                <div>
                  <h4 style={{ textTransform: 'uppercase', color: 'var(--primary)', margin: '0 0 0.5rem' }}>Ship To:</h4>
                  <strong>{confirmedOrder.shippingAddress.fullName}</strong>
                  <p style={{ margin: '0.25rem 0' }}>{confirmedOrder.shippingAddress.addressLine}</p>
                  <p style={{ margin: 0 }}>{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.postcode}</p>
                  <p style={{ margin: 0 }}>{confirmedOrder.shippingAddress.country}</p>
                </div>
              </div>
              <div style={{ marginBottom: '2rem', backgroundColor: '#FAF8F4', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong>Courier:</strong> {confirmedOrder.courierName} <br />
                <strong>Estimated Delivery:</strong> {confirmedOrder.estimatedDelivery} <br />
                <strong>Escrow Status:</strong> Funds held securely — released to maker upon verified delivery.
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0' }}>Item</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Unit</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedOrder.items.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem 0' }}><strong>{item.name}</strong>{item.maker && <><br /><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>By {item.maker}</span></>}</td>
                      <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>£{item.price.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>£{(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>Subtotal</span><span>£{confirmedOrder.subtotal.toFixed(2)}</span></div>
                  {confirmedOrder.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}><span>Discount</span><span>−£{confirmedOrder.discount.toFixed(2)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>VAT (20%)</span><span>£{confirmedOrder.vat.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.7 }}>Shipping</span><span>£{confirmedOrder.shippingCost.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem' }}><span>Total</span><span>£{confirmedOrder.total.toFixed(2)}</span></div>
                </div>
              </div>
              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', opacity: 0.6 }}>
                Escrow Guarantee: Funds held by Britsync Ltd and released to the artisan upon verified delivery confirmation.
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background-color: white !important; color: black !important; }
          nav, footer, .no-print { display: none !important; }
          main { padding-top: 0 !important; }
          #printable-invoice { border: none !important; box-shadow: none !important; max-width: 100% !important; }
        }
      ` }} />
    </main>
  );
}
