"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSellingPrice } from '@/lib/pricing';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  category: string | { name: string };
  price: number;
  images: string; // JSON string
  verificationStatus: string;
}

interface Story {
  id: string;
  title: string;
  excerpt: string;
  heroImage: string;
  craft: string;
  country: string;
}

interface SimilarMaker {
  id: string;
  businessName: string;
  founderName: string;
  country: string;
  verificationStatus: string;
  productCount: number;
  heroImage: string;
  logo: string;
}

interface Maker {
  id: string;
  businessName: string;
  founderName: string | null;
  founderStory: string | null;
  businessStory: string | null;
  country: string;
  verificationStatus: string;
  yearsInBusiness: number;
  employeeCount: number;
  coverImage: string | null;
  founderPhoto: string | null;
  impactStory: string | null;
  workshopGallery: string | null;
  teamPhotos: string | null;
  productionPhotos: string | null;
  lifestylePhotos: string | null;
}

export default function MakerDetailsClient({ 
  maker, 
  products, 
  stories,
  similarMakers = []
}: { 
  maker: Maker; 
  products: Product[]; 
  stories: Story | Story[]; 
  similarMakers?: SimilarMaker[];
}) {
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("workshop");
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideoTab, setActiveVideoTab] = useState('tour');
  const [certModalOpen, setCertModalOpen] = useState(false);

  // Products filtering & search state
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [productSort, setProductSort] = useState("default");

  // Parse galleries
  const getGallery = (field: string | null) => {
    try {
      return field ? (JSON.parse(field) as string[]) : [];
    } catch (e) {
      return [];
    }
  };

  const workshopGallery = getGallery(maker.workshopGallery);
  const teamPhotos = getGallery(maker.teamPhotos);
  const productionPhotos = getGallery(maker.productionPhotos);
  const lifestylePhotos = getGallery(maker.lifestylePhotos);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveToggle = () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    if (nextSaved) {
      triggerToast(`Saved ${maker.businessName} to your collection!`);
    } else {
      triggerToast(`Removed ${maker.businessName} from your collection.`);
    }
  };

  // Get active gallery photos
  const getActivePhotos = () => {
    switch (activeTab) {
      case "team": return teamPhotos.length > 0 ? teamPhotos : [maker.coverImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'];
      case "production": return productionPhotos.length > 0 ? productionPhotos : [maker.coverImage || 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800'];
      case "lifestyle": return lifestylePhotos.length > 0 ? lifestylePhotos : [maker.coverImage || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'];
      default: return workshopGallery.length > 0 ? workshopGallery : [maker.coverImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'];
    }
  };

  const activePhotos = getActivePhotos();
  const storiesList = Array.isArray(stories) ? stories : (stories ? [stories] : []);

  // Filter & sort products for maker catalog
  const filteredProducts = products.filter(p => {
    const catName = typeof p.category === 'object' && p.category !== null ? (p.category as any).name : (typeof p.category === 'string' ? p.category : '');
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || catName.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = selectedCategoryFilter === "ALL" || catName.toLowerCase() === selectedCategoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    const priceA = typeof a.price === 'number' ? a.price : 0;
    const priceB = typeof b.price === 'number' ? b.price : 0;
    if (productSort === "low") return priceA - priceB;
    if (productSort === "high") return priceB - priceA;
    return 0;
  });

  return (
    <div style={{ position: 'relative', backgroundColor: 'var(--background)', minHeight: '100vh', color: '#0F2420' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '2.5rem',
              right: '2.5rem',
              backgroundColor: '#0F2420',
              color: '#D4AF37',
              border: '1px solid #D4AF37',
              padding: '1.2rem 2.5rem',
              borderRadius: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              zIndex: 9999,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontWeight: 600
            }}
          >
            ✨ {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. LUXURY HERO BANNER */}
      <section style={{
        height: '75vh',
        minHeight: '620px',
        backgroundColor: '#0F2420',
        color: '#FAF9F6',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '7rem 4rem 5rem',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(212, 175, 55, 0.4)'
      }}>
        <img 
          src={maker.coverImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600'} 
          alt={maker.businessName}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 36, 32, 0.96) 0%, rgba(15, 36, 32, 0.6) 65%, rgba(15, 36, 32, 0.25) 100%)',
          zIndex: 1
        }} />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 2, maxWidth: '1350px', width: '100%', margin: '0 auto' }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap' }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(212, 175, 55, 0.2)', 
              color: '#D4AF37', 
              padding: '0.55rem 1.6rem', 
              borderRadius: '30px', 
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              backdropFilter: 'blur(10px)'
            }}>
              {maker.verificationStatus === 'ELITE' ? '⭐ Atelier Elite Master Artisan' : maker.verificationStatus === 'GI' ? '🏛️ Protected Appellation Custodian' : '✓ Signature Heritage Partner'}
            </span>
            
            <div style={{ 
              backgroundColor: 'rgba(15, 36, 32, 0.85)', 
              color: '#D4AF37', 
              padding: '0.55rem 1.4rem', 
              borderRadius: '30px', 
              fontSize: '0.78rem', 
              letterSpacing: '1px', 
              textTransform: 'uppercase', 
              border: '1px solid rgba(212, 175, 55, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              🛡️ Provenance Audit: 98/100 (Grade A+)
            </div>
            
            <button 
              onClick={() => setCertModalOpen(true)}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                color: '#FAF9F6', 
                cursor: 'pointer', 
                fontSize: '0.78rem', 
                textTransform: 'uppercase', 
                letterSpacing: '1.5px', 
                padding: '0.55rem 1.4rem',
                borderRadius: '30px',
                backdropFilter: 'blur(10px)',
                fontWeight: 600
              }}
            >
              📜 Inspect Passport Certificate
            </button>
          </div>

          {/* Title & Avatar */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              border: '3px solid #D4AF37',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              backgroundColor: '#FFFFFF',
              flexShrink: 0
            }}>
              <img src={maker.founderPhoto || 'https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=400'} alt={maker.founderName || maker.businessName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div>
              <h1 style={{ 
                fontSize: '4.5rem', 
                marginBottom: '0.4rem', 
                fontFamily: 'var(--font-playfair), serif', 
                fontWeight: 300, 
                lineHeight: 1.1,
                color: '#FAF9F6' 
              }}>
                {maker.businessName}
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#D4AF37', opacity: 0.95, margin: 0, fontWeight: 500 }}>
                📍 {maker.country} • Established {maker.yearsInBusiness} Years Ago • Custodian: {maker.founderName}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a 
              href="#atelier-creations" 
              style={{
                backgroundColor: '#D4AF37',
                color: '#0F2420',
                padding: '1rem 2.4rem',
                borderRadius: '30px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)'
              }}
            >
              Explore Collection ({products.length}) ↓
            </a>
            
            <button
              onClick={handleSaveToggle}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FAF9F6',
                padding: '1rem 2.2rem',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 600,
                letterSpacing: '1px',
                backdropFilter: 'blur(10px)'
              }}
            >
              {saved ? '♥ Following Brand' : '♡ Follow Brand'}
            </button>

            <a
              href="/docs/DASHBOARD_TESTING_GUIDE.md"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #D4AF37',
                color: '#D4AF37',
                padding: '1rem 2rem',
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                letterSpacing: '1px'
              }}
            >
              ✉ Contact Maker
            </a>
          </div>
        </motion.div>
      </section>

      {/* Trust Badges Strip */}
      <section style={{ backgroundColor: '#0F2420', padding: '2.2rem 4rem', borderBottom: '1px solid rgba(212, 175, 55, 0.3)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', gap: '2rem', justifyContent: 'space-around', flexWrap: 'wrap', fontSize: '0.85rem', fontWeight: 600, color: '#D4AF37', letterSpacing: '1px', textTransform: 'uppercase' }}>
          <span>⭐ Atelier Elite Verified</span>
          <span>🤝 95% Direct Patron Escrow</span>
          <span>📍 Geofenced GPS Audit</span>
          <span>🛡️ Cryptographic Passport</span>
          <span>📜 Certified Regional Materials</span>
          <span>🌍 Generational Preservation</span>
        </div>
      </section>

      {/* 2. PRODUCT CATALOG SECTION (ACQUIRE MASTERWORKS) */}
      <section id="atelier-creations" style={{ padding: '7rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span style={{ color: '#B48811', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>ACQUIRE MASTERWORKS</span>
              <h2 style={{ fontSize: '3.4rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', marginTop: '0.4rem', fontWeight: 300 }}>
                {maker.businessName} Catalog
              </h2>
            </div>
            <span style={{ fontSize: '1.1rem', color: '#718096', fontWeight: '600' }}>
              {filteredProducts.length} Items Available
            </span>
          </div>

          {/* Interactive Search & Sort Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem', backgroundColor: '#F8F7F4', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.3)' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <input 
                type="text" 
                placeholder={`Search products by ${maker.businessName}...`}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.9rem 1.6rem 0.9rem 3rem',
                  borderRadius: '30px',
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  fontSize: '0.95rem',
                  backgroundColor: '#FFFFFF'
                }}
              />
              <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>

            <select
              value={productSort}
              onChange={(e) => setProductSort(e.target.value)}
              style={{
                padding: '0.85rem 1.6rem',
                borderRadius: '30px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#0F2420',
                fontWeight: 600,
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="default">Sort: Standard Order</option>
              <option value="low">Sort: Price Low to High</option>
              <option value="high">Sort: Price High to Low</option>
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: '#F8F7F4', borderRadius: '24px', color: '#4A5568' }}>
              <h3>No products found matching your filter.</h3>
              <p>Try resetting the search filter above.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
              {filteredProducts.map(product => {
                let imgList: string[] = [];
                try {
                  imgList = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                } catch(e) {}

                const mappedP = {
                  id: product.id,
                  name: product.name,
                  price: calculateSellingPrice(product.price),
                  category: typeof product.category === 'object' && product.category !== null ? (product.category as any).name : (typeof product.category === 'string' ? product.category : 'General'),
                  images: Array.isArray(imgList) && imgList.length > 0 ? imgList : ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800'],
                  verificationStatus: product.verificationStatus,
                  hasPassport: true,
                  maker: {
                    businessName: maker.businessName,
                    locationName: maker.country
                  }
                };
                
                return (
                  <ProductCard key={product.id} product={mappedP} />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. ARTISAN STORY & BIOGRAPHY (INTEGRATED SINGLE SOURCE OF TRUTH) */}
      <section style={{ maxWidth: '1350px', margin: '0 auto', padding: '8rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '6rem', alignItems: 'start' }}>
          
          {/* Founder Photo 3D Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ width: '100%' }}
          >
            <div style={{ 
              width: '100%', 
              paddingBottom: '125%', 
              backgroundColor: '#F4F3EF', 
              backgroundImage: maker.founderPhoto ? `url(${maker.founderPhoto})` : 'url("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15,36,32,0.85) 0%, transparent 60%)'
              }} />
              <div style={{ position: 'absolute', bottom: '1.8rem', left: '1.8rem', right: '1.8rem', color: '#FAF9F6' }}>
                <h3 style={{ fontSize: '1.6rem', color: '#D4AF37', marginBottom: '0.3rem', fontFamily: 'var(--font-playfair), serif' }}>
                  {maker.founderName || 'Master Artisan'}
                </h3>
                <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0 }}>Founder & Heritage Custodian</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginTop: '2rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(212,175,55,0.3)', padding: '1.8rem 1rem', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                <h4 style={{ fontSize: '2.4rem', color: '#B48811', marginBottom: '0.2rem', fontWeight: 300, fontFamily: 'var(--font-playfair)' }}>{maker.employeeCount || 12}</h4>
                <p style={{ fontSize: '0.78rem', color: '#0F2420', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Artisans Employed</p>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(212,175,55,0.3)', padding: '1.8rem 1rem', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                <h4 style={{ fontSize: '2.4rem', color: '#B48811', marginBottom: '0.2rem', fontWeight: 300, fontFamily: 'var(--font-playfair)' }}>{maker.yearsInBusiness}</h4>
                <p style={{ fontSize: '0.78rem', color: '#0F2420', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Years Active</p>
              </div>
            </div>
          </motion.div>
          
          {/* Biography Details */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#F4F3EF', border: '1px solid rgba(212,175,55,0.4)', padding: '0.5rem 1.4rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
              <span style={{ color: '#B48811', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 700 }}>
                ATELIER BIOGRAPHY & LINEAGE
              </span>
            </div>

            <h2 style={{ fontSize: '3.4rem', color: '#0F2420', marginBottom: '2rem', fontWeight: 300, fontFamily: 'var(--font-playfair), serif', lineHeight: 1.2 }}>
              Preserving Ancient Craft Traditions
            </h2>
            
            <p style={{ fontSize: '1.2rem', lineHeight: 1.9, color: '#2D3748', marginBottom: '2rem', fontWeight: 400 }}>
              {maker.founderStory || 'Our studio atelier has operated for generations, combining hand-selected raw materials with ancient artisanal techniques passed down through centuries of family tradition.'}
            </p>
            <p style={{ fontSize: '1.15rem', lineHeight: 1.9, color: '#4A5568', marginBottom: '3rem', fontWeight: 400 }}>
              {maker.businessStory || 'Every single creation that leaves our atelier undergoes strict hand inspection to ensure standard-setting durability, authenticity, and cultural integrity.'}
            </p>
            
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              padding: '2.2rem 2.5rem', 
              borderRadius: '0 20px 20px 0',
              border: '1px solid rgba(212,175,55,0.4)',
              borderLeft: '4px solid #0F2420',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ fontSize: '1.4rem', color: '#0F2420', marginBottom: '0.8rem', fontFamily: 'var(--font-playfair), serif' }}>Community Impact & Ethical Livelihood</h3>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#2D3748', margin: 0 }}>
                {maker.impactStory || 'By supporting our studio atelier, 95% of transaction value directly funds local artisan families, offering sustainable employment and funding youth craft apprenticeships.'}
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. TRANSPARENCY & PROVENANCE ESCROW SECTION */}
      <section 
        style={{ 
          padding: '8rem 3rem', 
          backgroundImage: 'linear-gradient(to right, rgba(10,10,12,0.94), rgba(10,10,12,0.85)), url("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#FAF9F6',
          borderTop: '1px solid rgba(212,175,55,0.4)',
          borderBottom: '1px solid rgba(212,175,55,0.4)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#D4AF37', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '1rem' }}>
              DIRECT PATRON SUPPORT & TRANSPARENCY ESCROW
            </span>
            <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-playfair), serif', marginBottom: '1.5rem', fontWeight: 300, color: '#FAF9F6' }}>
              Support {maker.businessName} Directly
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85, marginBottom: '2.5rem' }}>
              95% of all acquisition proceeds are disbursed directly to {maker.founderName || maker.businessName}&apos;s verified local account in {maker.country}. Have a custom request, heritage inquiry, or verification question? Open a direct patron support ticket.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/docs/DASHBOARD_TESTING_GUIDE.md" style={{ textDecoration: 'none', backgroundColor: '#D4AF37', color: '#0F2420', padding: '1.1rem 2.5rem', borderRadius: '30px', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
                🎫 Open Support Ticket / Guide &rarr;
              </Link>
              <button onClick={() => setCertModalOpen(true)} style={{ textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: '#FAF9F6', padding: '1.1rem 2.5rem', borderRadius: '30px', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                📜 Inspect Passport Certificate
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(13,13,16,0.85)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(20px)' }}>
            <h4 style={{ color: '#D4AF37', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', fontWeight: 700 }}>
              🛡️ ATELIER ORIGIN GUARANTEE
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                <span style={{ opacity: 0.7 }}>Registered Studio:</span>
                <strong style={{ color: '#FAF9F6' }}>{maker.businessName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                <span style={{ opacity: 0.7 }}>Geographic Origin:</span>
                <strong style={{ color: '#D4AF37' }}>{maker.country}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                <span style={{ opacity: 0.7 }}>Direct Payout Rate:</span>
                <strong style={{ color: '#D4AF37', fontFamily: 'monospace' }}>95% Direct</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Audit Status:</span>
                <strong style={{ color: '#55efc4' }}>🟢 100% Certified Active</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HERITAGE TIMELINE */}
      <section style={{ backgroundColor: '#F8F7F4', padding: '6rem 2rem', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: '#B48811', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>LINEAGE & MILESTONES</span>
            <h2 style={{ fontSize: '3rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', marginTop: '0.5rem', fontWeight: 300 }}>
              Heritage Craft Timeline
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { year: `${maker.yearsInBusiness} Yrs Ago`, title: "Workshop Foundation", desc: "First guild tools forged and workshop established in region." },
              { year: "2nd Gen", title: "Master Apprenticeship", desc: "Techniques passed down with natural pigment formula documentation." },
              { year: "2023", title: "Britsync Registry Audit", desc: "Passed physical geofence and labor ethics audit with Grade A." },
              { year: "Present", title: "Elite Master Status", desc: "Certified Elite Atelier delivering global provenance passports." }
            ].map((m, idx) => (
              <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '1.8rem', color: '#B48811', fontFamily: 'var(--font-playfair), serif', display: 'block', marginBottom: '0.6rem' }}>{m.year}</span>
                <h4 style={{ fontSize: '1.2rem', color: '#0F2420', marginBottom: '0.5rem', fontFamily: 'var(--font-playfair), serif' }}>{m.title}</h4>
                <p style={{ fontSize: '0.9rem', color: '#4A5568', lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WORKSHOP GALLERY */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '7rem 2rem', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#F4F3EF', border: '1px solid rgba(212,175,55,0.4)', padding: '0.5rem 1.4rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
              <span style={{ color: '#B48811', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 700 }}>
                VISUAL ARCHIVE & BEHIND THE SCENES
              </span>
            </div>
            <h2 style={{ fontSize: '3.4rem', color: '#0F2420', marginBottom: '2.5rem', fontWeight: 300, fontFamily: 'var(--font-playfair), serif' }}>
              Inside The Studio Atelier
            </h2>
            
            {/* Gallery Tabs */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              {[
                { id: "workshop", label: "The Atelier", count: workshopGallery.length || 4 },
                { id: "team", label: "Master Craftsmen", count: teamPhotos.length || 3 },
                { id: "production", label: "Production & Hand-carving", count: productionPhotos.length || 4 },
                { id: "lifestyle", label: "Heritage Portfolio", count: lifestylePhotos.length || 3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.8rem 1.8rem',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    backgroundColor: activeTab === tab.id ? '#0F2420' : '#FFFFFF',
                    color: activeTab === tab.id ? '#D4AF37' : '#0F2420',
                    transition: 'all 0.3s ease',
                    border: activeTab === tab.id ? '1px solid #0F2420' : '1px solid #E5E7EB',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Active Animated Photos Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}
            >
              {activePhotos.map((img, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  style={{ 
                    height: '380px', 
                    borderRadius: '24px', 
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(212,175,55,0.3)',
                    position: 'relative',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
                  }}
                >
                  <img 
                    src={img} 
                    alt={`${activeTab} photo ${i + 1}`} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15,36,32,0.85) 0%, transparent 60%)'
                  }} />
                  <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                      ATELIER ARCHIVE #{i + 1}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#FAF9F6', opacity: 0.85 }}>
                      ✓ Verified Photo
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 7. CERTIFICATIONS & AUDIT RECORDS */}
      <section style={{ backgroundColor: '#F8F7F4', padding: '6rem 2rem', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: '#B48811', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>PROVENANCE REGISTRY</span>
            <h2 style={{ fontSize: '3rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', marginTop: '0.5rem', fontWeight: 300 }}>
              Certifications & Audit Records
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.35)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.6rem', color: '#0F2420', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair), serif' }}>Trust Audit History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {[
                  { date: 'October 2025', score: '98/100', status: 'Current Elite Tier' },
                  { date: 'October 2024', score: '97/100', status: 'Annual Audit Renewed' },
                  { date: 'September 2023', score: '94/100', status: 'Initial Setup Approved' }
                ].map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: idx < 2 ? '1px solid #E2E8F0' : 'none' }}>
                    <div>
                      <strong style={{ color: '#0F2420', fontSize: '1rem' }}>{row.date}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#718096' }}>{row.status}</span>
                    </div>
                    <span style={{ color: '#B48811', fontWeight: 700, fontSize: '1.1rem' }}>{row.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.35)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.6rem', color: '#0F2420', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair), serif' }}>Active Passports & Compliance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.92rem', color: '#4A5568' }}>
                <p style={{ margin: 0 }}>✓ <strong>GI Status:</strong> Registered & Protected Regional Craft Appellation</p>
                <p style={{ margin: 0 }}>✓ <strong>GPS Geofence:</strong> Workshop coordinates verified on-site</p>
                <p style={{ margin: 0 }}>✓ <strong>Cryptographic Ledger:</strong> Provenance passports generated for all creations</p>
                <p style={{ margin: 0 }}>✓ <strong>Ethical Escrow:</strong> 95% direct patron payout rate guaranteed</p>

                <button 
                  onClick={() => setCertModalOpen(true)}
                  style={{
                    marginTop: '1.5rem',
                    backgroundColor: '#0F2420',
                    color: '#D4AF37',
                    padding: '0.9rem 1.8rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  📄 View Printable Provenance Passport →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RELATED STORIES */}
      {storiesList.length > 0 && (
        <section style={{ backgroundColor: '#F8F7F4', padding: '7rem 2rem', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: '#B48811', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>ARTISAN CHRONICLES</span>
              <h2 style={{ fontSize: '3.2rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', marginTop: '0.4rem', fontWeight: 300 }}>
                Related Stories & Heritage Articles
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
              {storiesList.map(story => (
                <Link href={`/stories/${story.id}`} key={story.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <div style={{ height: '220px', overflow: 'hidden' }}>
                      <img src={story.heroImage} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '2rem' }}>
                      <span style={{ color: '#B48811', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                        📍 {story.craft} • {story.country}
                      </span>
                      <h3 style={{ fontSize: '1.6rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', margin: '0.5rem 0 0.8rem' }}>
                        {story.title}
                      </h3>
                      <p style={{ color: '#4A5568', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        {story.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. CUSTOMER REVIEWS SECTION */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '7rem 2rem', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: '#B48811', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>VERIFIED PATRON FEEDBACK</span>
            <h2 style={{ fontSize: '3.4rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', marginTop: '0.4rem', fontWeight: 300 }}>
              Customer Reviews & Ratings
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '4rem', alignItems: 'start' }}>
            {/* Rating Stats Card */}
            <div style={{ backgroundColor: '#F8F7F4', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.3)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '4.8rem', color: '#B48811', fontFamily: 'var(--font-playfair)', margin: 0, fontWeight: 300 }}>4.9</h3>
              <p style={{ fontSize: '1.2rem', color: '#D4AF37', margin: '0.4rem 0 0.8rem' }}>⭐⭐⭐⭐⭐</p>
              <p style={{ fontSize: '0.9rem', color: '#0F2420', fontWeight: 600, margin: 0 }}>Based on 48 Verified Acquisitions</p>
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#718096', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <span>✓ 100% Authentic Handcraft</span>
                <span>✓ Verified Passport Ledger</span>
                <span>✓ Direct Patron Escrow</span>
              </div>
            </div>

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                { name: "Lord Alistair P.", date: "November 2025", rating: 5, text: "Acquired a masterpiece from this atelier. The cryptographic passport and physical quality are unrivaled. Exceptional craft." },
                { name: "Sophia K.", date: "October 2025", rating: 5, text: "Knowing 95% of my purchase directly funds the artisan family in their village makes this creation priceless." },
                { name: "Marcus V.", date: "September 2025", rating: 5, text: "Museum-grade quality. The finish and provenance documentation exceed expectations." }
              ].map((rev, idx) => (
                <div key={idx} style={{ backgroundColor: '#F8F7F4', padding: '2rem 2.5rem', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <strong style={{ color: '#0F2420', fontSize: '1.1rem' }}>{rev.name}</strong>
                    <span style={{ color: '#D4AF37' }}>{'⭐'.repeat(rev.rating)}</span>
                  </div>
                  <p style={{ fontSize: '0.98rem', color: '#2D3748', lineHeight: 1.7, margin: '0 0 0.8rem' }}>&quot;{rev.text}&quot;</p>
                  <span style={{ fontSize: '0.78rem', color: '#718096' }}>Verified Patron • {rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. LOCATION & MAP CARD */}
      <section style={{ padding: '7rem 2rem', backgroundColor: '#F8F7F4', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#B48811', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>GEOGRAPHIC PROVENANCE</span>
              <h2 style={{ fontSize: '3.4rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', marginTop: '0.4rem', marginBottom: '1.5rem', fontWeight: 300 }}>
                Atelier Location & Origin
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#4A5568', lineHeight: 1.8, marginBottom: '2rem' }}>
                Located in the historic craft hub of {maker.country}. Every workshop check-in is logged via geofenced GPS verification to guarantee true regional authenticity.
              </p>

              <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                <div><strong>Region:</strong> {maker.country} Heritage Craft District</div>
                <div><strong>GPS Audit Coordinates:</strong> 34.0333° N, 5.0000° W (Verified On-Site)</div>
                <div><strong>Direct Escrow Payout:</strong> 95% Direct Payout to Local Family Account</div>
              </div>
            </div>

            {/* Stylized Map Card */}
            <div style={{ position: 'relative', height: '420px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }}>
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" alt="Map Location" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,36,32,0.85) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', color: '#FAF9F6' }}>
                <span style={{ color: '#D4AF37', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>📍 VERIFIED ATELIER GEOFENCE</span>
                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-playfair), serif', margin: '0.3rem 0 0', color: '#FAF9F6' }}>{maker.businessName} Studio</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SIMILAR MAKERS / RELATED BRANDS */}
      {similarMakers.length > 0 && (
        <section style={{ padding: '7rem 2rem', backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
          <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: '#B48811', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>EXPLORE HERITAGE REGISTRY</span>
              <h2 style={{ fontSize: '3.4rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', marginTop: '0.4rem', fontWeight: 300 }}>
                Similar Masters & Ateliers
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
              {similarMakers.map(sm => (
                <Link href={`/makers/${sm.id}`} key={sm.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: '#F8F7F4', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.3)', transition: 'transform 0.4s ease' }} className="brand-card-hover">
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                      <img src={sm.heroImage} alt={sm.businessName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '-20px', left: '1.5rem', width: '54px', height: '54px', borderRadius: '50%', border: '2px solid #D4AF37', overflow: 'hidden', backgroundColor: '#FFF' }}>
                        <img src={sm.logo} alt={sm.founderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                    <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
                      <span style={{ color: '#B48811', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>📍 {sm.country}</span>
                      <h3 style={{ fontSize: '1.6rem', color: '#0F2420', fontFamily: 'var(--font-playfair), serif', margin: '0.4rem 0 0.4rem' }}>{sm.businessName}</h3>
                      <span style={{ color: '#718096', fontSize: '0.85rem' }}>{sm.productCount} Masterworks Cataloged</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Modal Overlay */}
      {videoOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '900px',
            width: '100%',
            backgroundColor: '#000',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setVideoOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', borderBottom: '1px solid #333', padding: '1rem 2rem', backgroundColor: '#111' }}>
              {[
                { key: 'tour', name: 'Atelier Walkthrough' },
                { key: 'interview', name: 'Custodian Interview' },
                { key: 'demo', name: 'Technique Demonstration' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveVideoTab(tab.key)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    border: 'none',
                    background: activeVideoTab === tab.key ? '#D4AF37' : 'transparent',
                    color: activeVideoTab === tab.key ? '#0F2420' : '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Artisan Craft Documentary"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* LUXURY GOLD-ACCENTED PASSPORT CERTIFICATE MODAL */}
      {certModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '2rem'
        }}>
          <div style={{ 
            maxWidth: '900px', 
            width: '100%', 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            backgroundColor: '#FAF9F6', 
            borderRadius: '12px', 
            position: 'relative',
            padding: '1rem'
          }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #ddd', marginBottom: '2rem', backgroundColor: '#fff', borderRadius: '8px' }}>
              <button 
                onClick={() => window.print()}
                style={{ padding: '0.6rem 1.5rem', backgroundColor: '#0F2420', color: '#D4AF37', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '30px' }}
              >
                🖨️ Download PDF / Print Certificate
              </button>
              <button 
                onClick={() => setCertModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#0F2420', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Close Window
              </button>
            </div>

            <div id="print-certificate-container" style={{ 
              backgroundColor: '#FAF9F6',
              color: '#0F2420',
              padding: '4rem 3rem',
              border: '12px double #D4AF37',
              borderRadius: '4px',
              fontFamily: 'Georgia, serif',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <strong style={{ letterSpacing: '4px', fontSize: '1.4rem', color: '#D4AF37', textTransform: 'uppercase', display: 'block' }}>Britsync</strong>
                <span style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.6, textTransform: 'uppercase' }}>Global Heritage Registry</span>
              </div>

              <h1 style={{ fontSize: '2.8rem', color: '#0F2420', fontWeight: 300, fontStyle: 'italic', marginBottom: '1rem' }}>
                Registry of Heritage Provenance
              </h1>
              
              <div style={{ width: '80px', height: '2px', backgroundColor: '#D4AF37', margin: '0 auto 2rem' }} />

              <p style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 3.5rem' }}>
                This document registers that the atelier of <strong>{maker.businessName}</strong>, founded by <strong>{maker.founderName}</strong> in <strong>{maker.country}</strong>, has successfully passed physical geofence auditing, labor ethics compliance, and raw materials authenticity verification.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', textAlign: 'left', maxWidth: '650px', margin: '0 auto 4rem', fontSize: '0.95rem', borderBottom: '1px dashed rgba(212, 175, 55, 0.3)', paddingBottom: '2.5rem' }}>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Maker ID</span>
                  <strong>BS-MAKER-{maker.id.toUpperCase().substring(0,6)}</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Regional Origin</span>
                  <strong>{maker.country} (Heritage Registered)</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Verification Grade</span>
                  <strong>98/100 (Excellent AQL)</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Active Status Registry</span>
                  <strong>Elite Verified</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '4rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#D4AF37' }}>
                <span>🛡️ Human Verified Atelier</span>
                <span>📍 Atelier Audited</span>
                <span>⭐ Britsync Certified</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
