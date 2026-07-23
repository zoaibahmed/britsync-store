"use client";

import { useState, useEffect } from 'react';

const images = [
  '/bg1.jpg',
  '/bg2.jpg',
  '/bg3.jpg',
  '/bg4.jpg',
  '/bg5.jpg',
  '/bg6.jpg'
];

export default function HeroBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-background">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          className="hero-background-image"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
      ))}
      <div className="hero-background-overlay" />
    </div>
  );
}
