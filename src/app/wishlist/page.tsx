'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WishlistItem {
  id: string;
  name: string;
  maker: string;
  price: number;
  image: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('britsync_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        setWishlist([]);
      }
    }
  }, []);

  const saveWishlist = (newWishlist: WishlistItem[]) => {
    setWishlist(newWishlist);
    localStorage.setItem('britsync_wishlist', JSON.stringify(newWishlist));
    window.dispatchEvent(new Event('wishlistUpdate'));
  };

  const remove = (id: string) => {
    const newWishlist = wishlist.filter(item => item.id !== id);
    saveWishlist(newWishlist);
  };

  const moveToCart = (item: WishlistItem) => {
    try {
      const savedCart = localStorage.getItem('britsync_cart');
      const cartItems = savedCart ? JSON.parse(savedCart) : [];
      const existing = cartItems.find((ci: any) => ci.id === item.id);
      
      if (existing) {
        existing.qty += 1;
      } else {
        cartItems.push({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          image: item.image,
          maker: item.maker
        });
      }
      localStorage.setItem('britsync_cart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cartUpdate'));

      // Remove from wishlist
      const newWishlist = wishlist.filter(ci => ci.id !== item.id);
      saveWishlist(newWishlist);

      alert(`✓ ${item.name} moved to your Shopping Bag!`);
    } catch (e) {}
  };

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '2rem' }}>Your Wishlist</h1>
        
        {wishlist.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>Your wishlist is empty</h3>
            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Discover unique handcrafted pieces and save them here.</p>
            <Link href="/search" className="btn-primary" style={{ textDecoration: 'none' }}>Explore Collections</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {wishlist.map(item => (
              <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: '250px', background: `url(${item.image}) center/cover` }}></div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>{item.name}</h3>
                  <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>{item.maker}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: 'auto' }}>£{item.price.toFixed(2)}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                    <button onClick={() => moveToCart(item)} className="btn-accent" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}>Move to Cart</button>
                    <button onClick={() => remove(item.id)} className="btn-primary" style={{ backgroundColor: 'var(--surface)', color: 'var(--error)', border: '1px solid var(--error)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
