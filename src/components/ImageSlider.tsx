"use client";
import { useState, useEffect } from 'react';

const images = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200", // Brand store
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1200", // Shirts
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200", // Customers / Paying bill
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200"  // Selling things
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', overflow: 'hidden', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Store visual ${index + 1}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: currentIndex === index ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      ))}
      {/* Navigation Dots */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? 'var(--accent, #f0a500)' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
