"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface MakerProfileWithCounts {
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
  products: { id: string }[];
  stories: { id: string }[];
}

export default function MakerList({ makers }: { makers: MakerProfileWithCounts[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("default");

  const filteredMakers = makers
    .filter(maker => {
      const matchesSearch = 
        maker.businessName.toLowerCase().includes(search.toLowerCase()) ||
        (maker.founderName && maker.founderName.toLowerCase().includes(search.toLowerCase())) ||
        maker.country.toLowerCase().includes(search.toLowerCase()) ||
        (maker.businessStory && maker.businessStory.toLowerCase().includes(search.toLowerCase()));
        
      const matchesStatus = 
        statusFilter === "ALL" || 
        maker.verificationStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "years") {
        return b.yearsInBusiness - a.yearsInBusiness;
      }
      if (sortBy === "employees") {
        return b.employeeCount - a.employeeCount;
      }
      if (sortBy === "products") {
        return (b.products?.length || 0) - (a.products?.length || 0);
      }
      return 0;
    });

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'ELITE':
        return { 
          backgroundColor: '#0F2420', 
          color: '#D4AF37', 
          border: '1px solid #D4AF37'
        };
      case 'GI':
        return { 
          backgroundColor: '#1E3A8A', 
          color: '#93C5FD', 
          border: '1px solid #60A5FA'
        };
      case 'VERIFIED':
        return { 
          backgroundColor: '#065F46', 
          color: '#A7F3D0', 
          border: '1px solid #34D399'
        };
      default:
        return { 
          backgroundColor: '#F3F4F6', 
          color: '#374151', 
          border: '1px solid #E5E7EB' 
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ELITE': return '⭐ Atelier Elite Master';
      case 'GI': return '🏛️ Protected Appellation (GI)';
      case 'VERIFIED': return '✓ Signature Heritage Studio';
      default: return '• Heritage Certified';
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 2rem' }}>
      
      {/* Sleek Light Luxury Search and Filters Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          marginBottom: '4rem', 
          maxWidth: '1100px',
          margin: '0 auto 4rem'
        }}
      >
        {/* Main Search Box */}
        <div style={{ position: 'relative', marginBottom: '1.8rem' }}>
          <input 
            type="text" 
            placeholder="Search registry by artisan name, studio atelier, country, or craft..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              padding: '1.2rem 2rem 1.2rem 3.5rem', 
              width: '100%', 
              borderRadius: '50px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              backgroundColor: '#FFFFFF',
              color: '#0F2420',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
            }}
          />
          <span style={{ position: 'absolute', left: '1.4rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', opacity: 0.5 }}>
            🔍
          </span>
        </div>

        {/* Filter Pills & Sort Selector Row */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {["ALL", "VERIFIED", "ELITE", "GI"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '30px',
                  backgroundColor: statusFilter === status ? '#0F2420' : '#FFFFFF',
                  color: statusFilter === status ? '#D4AF37' : '#0F2420',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease',
                  border: statusFilter === status ? '1px solid #0F2420' : '1px solid #E2E8F0',
                  boxShadow: statusFilter === status ? '0 4px 15px rgba(15,36,32,0.15)' : '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                {status === "ALL" ? "All Ateliers" : getStatusText(status)}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '30px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              backgroundColor: '#FFFFFF',
              color: '#0F2420',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <option value="default">Sort: Standard Order</option>
            <option value="years">Sort: Years Preserving Craft</option>
            <option value="employees">Sort: Artisans Employed</option>
            <option value="products">Sort: Masterworks Count</option>
          </select>
        </div>
      </motion.div>

      {/* Grid of Makers */}
      {filteredMakers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '6rem 0', color: '#0F2420' }}
        >
          <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-playfair), serif', marginBottom: '0.8rem', color: '#0F2420' }}>No Ateliers Match Registry Query</h3>
          <p style={{ opacity: 0.7 }}>Try adjusting your search criteria or clearing status filter pills.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '3rem' }}>
          <AnimatePresence mode="popLayout">
            {filteredMakers.map((maker, idx) => (
              <motion.div 
                key={maker.id} 
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                style={{ 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                  position: 'relative'
                }}
              >
                {/* Cover Banner with Zoom Effect */}
                <div style={{ 
                  height: '170px', 
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#F4F3EF'
                }}>
                  <motion.div 
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6 }}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundImage: maker.coverImage ? `url(${maker.coverImage})` : 'url("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800")', 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center'
                    }} 
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(10, 10, 12, 0.35)',
                  }} />
                  
                  {/* Verification Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '1.2rem',
                    right: '1.2rem',
                    padding: '0.45rem 1.1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    ...getStatusBadgeStyles(maker.verificationStatus)
                  }}>
                    {getStatusText(maker.verificationStatus)}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '2.5rem 2.2rem 2.2rem', position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  
                  {/* Overlapping Founder Photo */}
                  <div style={{ 
                    width: '88px', 
                    height: '88px', 
                    borderRadius: '50%', 
                    backgroundColor: '#FAF9F6', 
                    backgroundImage: maker.founderPhoto ? `url(${maker.founderPhoto})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '3px solid #D4AF37',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    position: 'absolute',
                    top: '-44px',
                    left: '2.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0F2420',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}>
                    {!maker.founderPhoto && maker.businessName.charAt(0)}
                  </div>

                  <div style={{ marginTop: '0.6rem', marginBottom: '1.4rem' }}>
                    <h2 style={{ fontSize: '1.75rem', color: '#0F2420', marginBottom: '0.4rem', fontWeight: 400, fontFamily: 'var(--font-playfair), serif' }}>
                      {maker.businessName}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', color: '#B48811', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>📍 {maker.country}</span>
                      <span style={{ opacity: 0.4 }}>•</span>
                      <span>Preserving craft for {maker.yearsInBusiness} years</span>
                    </div>
                  </div>

                  {maker.founderName && (
                    <p style={{ fontSize: '0.92rem', color: '#2D3748', opacity: 0.9, marginBottom: '1rem' }}>
                      <strong style={{ color: '#0F2420' }}>Master Artisan:</strong> {maker.founderName}
                    </p>
                  )}

                  <p style={{ 
                    fontSize: '0.94rem', 
                    lineHeight: 1.7, 
                    color: '#4A5568',
                    marginBottom: '2rem',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontStyle: 'italic'
                  }}>
                    "{maker.founderStory || maker.businessStory || 'Dedicated to handcrafting heritage items with certified regional raw materials.'}"
                  </p>

                  {/* Stats Grid */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.8rem',
                    backgroundColor: '#F8F7F4',
                    padding: '1rem 1.2rem',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    marginBottom: '1.8rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>ARTISANS</span>
                      <strong style={{ fontSize: '1.1rem', color: '#0F2420' }}>{maker.employeeCount || 12} Craftsmen</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>MASTERWORKS</span>
                      <strong style={{ fontSize: '1.1rem', color: '#B48811' }}>{maker.products?.length || 0} Pieces</strong>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div style={{ marginTop: 'auto' }}>
                    <Link href={`/makers/${maker.id}`} style={{ width: '100%', display: 'block' }}>
                      <button 
                        style={{ 
                          width: '100%',
                          padding: '1rem', 
                          borderRadius: '30px', 
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          backgroundColor: '#0F2420',
                          color: '#D4AF37',
                          border: 'none',
                          cursor: 'pointer',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          boxShadow: '0 4px 15px rgba(15,36,32,0.2)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Explore Studio Atelier &rarr;
                      </button>
                    </Link>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
