import { calculateSellingPrice, formatPrice } from '@/lib/pricing';

export default function ProductsPage() {
  const products = [
    { id: 1, name: "Hand-Block Printed Ajrak Shawl", maker: "Aisha Heritage Textiles", price: 150, badge: "GI Verified", category: "Textiles", image: "var(--secondary)" },
    { id: 2, name: "Fine Jamdani Scarf", maker: "Bengal Weavers Collective", price: 120, badge: "Elite Maker", category: "Accessories", image: "var(--primary)" },
    { id: 3, name: "Blue Pottery Vase", maker: "Jaipur Artisan Crafts", price: 85, badge: "Verified Maker", category: "Home Decor", image: "var(--secondary)" },
    { id: 4, name: "Vintage Wool Kilim", maker: "Anatolian Heritage", price: 450, badge: "Elite Maker", category: "Rugs", image: "var(--primary)" },
  ];

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>The Collection</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8 }}>Discover authentic pieces with verifiable stories.</p>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <select style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}>
          <option>All Categories</option>
          <option>Textiles</option>
          <option>Ceramics</option>
        </select>
        <select style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}>
          <option>All Makers</option>
          <option>GI Verified</option>
          <option>Elite Maker</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              width: '100%', 
              height: '350px', 
              backgroundColor: product.image, 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: 'var(--accent)',
                color: 'var(--primary)',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {product.badge}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>{product.name}</h2>
            <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem' }}>By {product.maker}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatPrice(calculateSellingPrice(product.price))}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
