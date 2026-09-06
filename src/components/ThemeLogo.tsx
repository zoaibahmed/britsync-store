'use client';

import { useState, useEffect } from 'react';

interface ThemeLogoProps {
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  height?: string | number;
}

export default function ThemeLogo({ alt = "Nobleshop Logo", className, style, height = '44px' }: ThemeLogoProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('britsync_theme');
      const currentAttr = document.documentElement.getAttribute('data-theme');
      if (savedTheme === 'light' || currentAttr === 'light') {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    };

    updateTheme();

    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const logoSrc = theme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: 'auto',
        objectFit: 'contain',
        transition: 'all 0.3s ease',
        ...style
      }}
    />
  );
}
