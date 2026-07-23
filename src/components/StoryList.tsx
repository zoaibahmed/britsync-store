"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function StoryList({ stories }: { stories: any[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredStories = stories.filter(story => {
    const matchesSearch = 
      story.title.toLowerCase().includes(search.toLowerCase()) ||
      story.country.toLowerCase().includes(search.toLowerCase()) ||
      story.craft.toLowerCase().includes(search.toLowerCase()) ||
      (story.maker?.businessName && story.maker.businessName.toLowerCase().includes(search.toLowerCase()));
      
    if (filter === "Atelier Elite") return matchesSearch && story.maker?.verificationStatus === "ELITE";
    if (filter === "Protected Appellation") return matchesSearch && story.maker?.verificationStatus === "GI";
    
    return matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 2rem' }}>
      {/* Sleek Light Luxury Search Input */}
      <div style={{ maxWidth: '750px', margin: '0 auto 2.5rem', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search biographies by country, craft, master artisan, or title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            padding: '1.2rem 2rem 1.2rem 3.4rem', 
            width: '100%', 
            borderRadius: '50px', 
            border: '1px solid rgba(212, 175, 55, 0.4)', 
            backgroundColor: '#FFFFFF',
            color: '#0F2420',
            fontSize: '1rem',
            outline: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
          }}
        />
        <span style={{ position: 'absolute', left: '1.4rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', opacity: 0.5 }}>
          🔍
        </span>
      </div>
      
      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
        {["All", "Atelier Elite", "Protected Appellation", "Newest"].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{ 
              padding: '0.7rem 1.6rem', 
              borderRadius: '30px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.88rem',
              letterSpacing: '0.5px',
              backgroundColor: filter === f ? '#0F2420' : '#FFFFFF',
              color: filter === f ? '#D4AF37' : '#0F2420',
              border: filter === f ? '1px solid #0F2420' : '1px solid #E2E8F0',
              boxShadow: filter === f ? '0 6px 20px rgba(15,36,32,0.18)' : '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.3s ease'
            }}
          >
            {f === "All" ? "All Biographies" : f}
          </button>
        ))}
      </div>

      {/* Grid of Story Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '3rem' }}>
        {filteredStories.map(story => (
          <Link href={`/stories/${story.id}`} key={story.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div 
              style={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '24px', 
                overflow: 'hidden', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                border: '1px solid rgba(212, 175, 55, 0.35)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease' 
              }}
              className="story-card-luxury"
            >
              <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
                <img 
                   src={story.heroImage} 
                   alt={story.title} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                   className="story-img"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,36,32,0.7) 0%, transparent 60%)'
                }} />
                <div style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', backgroundColor: 'rgba(15,36,32,0.85)', backdropFilter: 'blur(8px)', padding: '0.4rem 1.1rem', borderRadius: '30px', border: '1px solid rgba(212,175,55,0.4)' }}>
                  <span style={{ color: '#D4AF37', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1.5px' }}>
                    📍 {story.country} • {story.craft}
                  </span>
                </div>
              </div>

              <div style={{ padding: '2.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h2 style={{ fontSize: '1.8rem', color: '#0F2420', marginBottom: '1rem', lineHeight: 1.3, fontFamily: 'var(--font-playfair), serif', fontWeight: 400 }}>
                  {story.title}
                </h2>
                <p style={{ color: '#4A5568', lineHeight: 1.7, marginBottom: '2rem', flex: 1, fontSize: '0.96rem' }}>
                  {story.excerpt}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #EDF2F7', paddingTop: '1.5rem' }}>
                   <div style={{ width: '46px', height: '46px', borderRadius: '50%', border: '2px solid #D4AF37', backgroundImage: `url(${story.maker?.founderPhoto || story.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F4F3EF' }}></div>
                   <div style={{ flex: 1 }}>
                     <p style={{ fontWeight: '600', fontSize: '0.95rem', color: '#0F2420', margin: 0 }}>{story.maker?.businessName || 'Heritage Atelier'}</p>
                     <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0.1rem 0 0' }}>{story.village}, {story.country}</p>
                   </div>
                   <span style={{ color: '#B48811', fontWeight: 600, fontSize: '0.85rem' }}>
                     Read Chronicle →
                   </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .story-card-luxury:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.12) !important;
        }
        .story-card-luxury:hover .story-img {
          transform: scale(1.08);
        }
      `}} />
    </div>
  );
}
