'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

const CATEGORIES = ['Textiles', 'Ceramics', 'Jewelry', 'Woodwork', 'Leather', 'Home Decor', 'Fashion', 'Art'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    country: '',
    minPrice: '',
    maxPrice: '',
    verification: searchParams.get('tier') === 'elite'
      ? 'ELITE'
      : searchParams.get('tier') === 'general'
      ? 'GENERAL'
      : searchParams.get('tier') === 'gi'
      ? 'GI'
      : '',
    handmade: false,
    womenLed: false,
    ecoFriendly: false,
    sort: 'newest',
    page: 1,
  });

  const buildApiUrl = useCallback((f: typeof filters, q: string) => {
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (f.category) params.set('category', f.category);
    if (f.country) params.set('country', f.country);
    if (f.verification) params.set('verification', f.verification);
    if (f.minPrice) params.set('minPrice', f.minPrice);
    if (f.maxPrice) params.set('maxPrice', f.maxPrice);
    if (f.handmade) params.set('handmade', 'true');
    if (f.womenLed) params.set('womenLed', 'true');
    if (f.ecoFriendly) params.set('ecoFriendly', 'true');
    params.set('sort', f.sort);
    params.set('page', String(f.page));
    params.set('limit', '24');
    return `/api/products?${params.toString()}`;
  }, []);

  const fetchProducts = useCallback(
    async (f: typeof filters, q: string) => {
      setLoading(true);
      try {
        const url = buildApiUrl(f, q);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, limit: 24, total: 0, totalPages: 0 });
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [buildApiUrl]
  );

  // Initial fetch and whenever filters change
  useEffect(() => {
    fetchProducts(filters, searchInput);
  }, [filters, fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      category: '',
      country: '',
      minPrice: '',
      maxPrice: '',
      verification: '',
      handmade: false,
      womenLed: false,
      ecoFriendly: false,
      sort: 'newest',
      page: 1,
    });
  };

  const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800';

  return (
    <main
      className="animate-fade-in"
      style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: '6rem' }}
    >
      {/* Ultra Luxury Split Hero Section */}
      <section style={{ 
        padding: '7rem 2rem 4rem', 
        color: '#0F2420',
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '4rem', alignItems: 'center' }}>
            
            {/* Left Content Column */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#F4F3EF', border: '1px solid rgba(212,175,55,0.4)', padding: '0.55rem 1.6rem', borderRadius: '30px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />
                <span style={{ color: '#B48811', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 700 }}>
                  ROYAL HERITAGE & WORLD ATELIERS
                </span>
              </div>

              <h1 style={{ fontSize: '4rem', fontFamily: 'var(--font-playfair), serif', marginBottom: '1.2rem', fontWeight: 300, color: '#0F2420', lineHeight: 1.15 }}>
                Curated World Masterworks
              </h1>
              <p style={{ fontSize: '1.15rem', color: '#4A5568', maxWidth: '680px', marginBottom: '2.5rem', lineHeight: 1.8, fontWeight: 400 }}>
                Discover certified hand-audited creations from verified studio cooperatives across Morocco, Turkey, Pakistan, India, and Peru. Protected by cryptographic provenance passports.
              </p>

              {/* Light Search Bar + Sort Dropdown */}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '2.5rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search masterworks, artisans, stories, or craft types..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1.2rem 2rem 1.2rem 3.4rem',
                      borderRadius: '50px',
                      border: '1px solid rgba(212,175,55,0.4)',
                      fontSize: '0.98rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#0F2420',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '1.4rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', opacity: 0.5 }}>
                    🔍
                  </span>
                </div>

                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  style={{
                    padding: '1.2rem 1.8rem',
                    borderRadius: '50px',
                    border: '1px solid rgba(212,175,55,0.4)',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF',
                    color: '#0F2420',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trust Metric Badges */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: 600, color: '#0F2420', opacity: 0.85 }}>
                <span>✨ 100% Certified Provenance</span>
                <span>🛡️ Cryptographic Passport</span>
                <span>🤝 Direct Patron Escrow</span>
              </div>
            </div>

            {/* Right Side - Luxury Featured Craft Showcase Card */}
            <div style={{ 
              position: 'relative', 
              borderRadius: '28px', 
              overflow: 'hidden', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
              border: '1px solid rgba(212,175,55,0.4)',
              height: '420px',
              backgroundColor: '#FFFFFF'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1000" 
                alt="Royal Heritage Crafts" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(10, 10, 12, 0.65)'
              }} />
              <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', backgroundColor: 'rgba(15,36,32,0.85)', backdropFilter: 'blur(10px)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.5)', padding: '0.45rem 1.2rem', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                ⭐ Heritage Atelier Spotlight
              </div>
              <div style={{ position: 'absolute', bottom: '1.8rem', left: '1.8rem', right: '1.8rem', color: '#FAF9F6' }}>
                <h3 style={{ fontSize: '1.6rem', color: '#FAF9F6', marginBottom: '0.4rem', fontFamily: 'var(--font-playfair), serif' }}>
                  Royal Fez Zellige Tilework & Ceramics
                </h3>
                <p style={{ fontSize: '0.88rem', opacity: 0.9, margin: 0, color: '#D4AF37' }}>
                  Hand-chiseled by 5th Generation Master Craftsmen in Morocco
                </p>
              </div>
            </div>

          </div>

          {/* Category Filter Tiles Bar */}
          <div style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { name: "ALL", label: "All Collections", icon: "💎" },
                { name: "Textiles", label: "Heritage Textiles", icon: "🧵" },
                { name: "Ceramics", label: "Zellige & Pottery", icon: "🏺" },
                { name: "Jewelry", label: "Royal Silver & Gold", icon: "✨" },
                { name: "Woodwork", label: "Andalusian Carvings", icon: "🪵" },
                { name: "Leather", label: "Fez Tanned Leather", icon: "👜" },
                { name: "Home Decor", label: "Atelier Metalwork", icon: "🕯️" }
              ].map((cat) => {
                const isActive = (cat.name === "ALL" && !filters.category) || filters.category === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => updateFilter('category', cat.name === "ALL" ? '' : cat.name)}
                    style={{
                      padding: '0.75rem 1.6rem',
                      borderRadius: '30px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      backgroundColor: isActive ? '#0F2420' : '#FFFFFF',
                      color: isActive ? '#D4AF37' : '#0F2420',
                      border: isActive ? '1px solid #0F2420' : '1px solid #E2E8F0',
                      boxShadow: isActive ? '0 6px 20px rgba(15,36,32,0.18)' : '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '4rem' }}>
          {/* Sidebar Filters */}
          <aside style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
              }}
            >
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>
                Advanced Filters
              </h2>
              <button
                onClick={clearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  padding: 0,
                }}
              >
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 'bold' }}>
                Categories
              </h3>
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === cat}
                    onChange={() => updateFilter('category', cat)}
                    style={{ marginRight: '0.5rem' }}
                  />{' '}
                  {cat}
                </label>
              ))}
              {filters.category && (
                <button
                  onClick={() => updateFilter('category', '')}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--error)',
                    textDecoration: 'underline',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: '0.5rem',
                  }}
                >
                  Clear Category
                </button>
              )}
            </div>

            {/* Verification Tiers */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 'bold' }}>
                Verification Tier
              </h3>
              {[
                { key: 'GI', name: '🏛️ GI Protected Heritage' },
                { key: 'ELITE', name: '⭐ Elite Verified Studio' },
                { key: 'VERIFIED', name: '✓ Verified Maker' },
                { key: 'GENERAL', name: '• General Approved' },
              ].map((tier) => (
                <label
                  key={tier.key}
                  style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <input
                    type="radio"
                    name="verification"
                    checked={filters.verification === tier.key}
                    onChange={() => updateFilter('verification', tier.key)}
                    style={{ marginRight: '0.5rem' }}
                  />{' '}
                  {tier.name}
                </label>
              ))}
              {filters.verification && (
                <button
                  onClick={() => updateFilter('verification', '')}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--error)',
                    textDecoration: 'underline',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: '0.5rem',
                  }}
                >
                  Clear Tier
                </button>
              )}
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 'bold' }}>
                Price Range (£)
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontSize: '0.85rem',
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>

            {/* Ethical Standards */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 'bold' }}>
                Ethical Standards
              </h3>
              <label style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={filters.handmade}
                  onChange={(e) => updateFilter('handmade', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />{' '}
                100% Handmade
              </label>
              <label style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={filters.womenLed}
                  onChange={(e) => updateFilter('womenLed', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />{' '}
                Women-Led Workshop
              </label>
              <label style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={filters.ecoFriendly}
                  onChange={(e) => updateFilter('ecoFriendly', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />{' '}
                Eco-Friendly Materials
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
              }}
            >
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0 }}>
                {filters.category ? `${filters.category} Collection` : 'All Products'}
              </h1>
              <span style={{ opacity: 0.7, fontWeight: 'bold' }}>
                {loading ? '…' : `${pagination.total} items found`}
              </span>
            </div>

            {loading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '3rem',
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
                ))}
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '3rem',
                  }}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}

                  {products.length === 0 && (
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        padding: '6rem 2rem',
                        textAlign: 'center',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '16px',
                      }}
                    >
                      <h3 style={{ fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                        No products match your search criteria
                      </h3>
                      <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto' }}>
                        Try adjusting your filters or search keywords to discover authentic pieces.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="btn-accent"
                        style={{ marginTop: '2rem', padding: '0.75rem 2rem' }}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginTop: '4rem',
                    }}
                  >
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => updateFilter('page', filters.page - 1)}
                      style={{
                        padding: '0.5rem 1.2rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        backgroundColor: filters.page <= 1 ? '#f5f5f5' : '#fff',
                        cursor: filters.page <= 1 ? 'not-allowed' : 'pointer',
                        opacity: filters.page <= 1 ? 0.5 : 1,
                      }}
                    >
                      ← Previous
                    </button>
                    <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      disabled={filters.page >= pagination.totalPages}
                      onClick={() => updateFilter('page', filters.page + 1)}
                      style={{
                        padding: '0.5rem 1.2rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        backgroundColor:
                          filters.page >= pagination.totalPages ? '#f5f5f5' : '#fff',
                        cursor:
                          filters.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                        opacity: filters.page >= pagination.totalPages ? 0.5 : 1,
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: '12rem 2rem',
            textAlign: 'center',
            fontSize: '1.2rem',
            color: 'var(--primary)',
          }}
        >
          Loading advanced search...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
