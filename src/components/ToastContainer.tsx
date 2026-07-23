'use client';

import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Listen for custom toast events
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: Toast['type'] }>;
      if (customEvent.detail) {
        addToast(customEvent.detail.message, customEvent.detail.type || 'info');
      }
    };

    window.addEventListener('britsync_toast', handleCustomToast);

    // High-leverage global override for window.alert
    const originalAlert = window.alert;
    window.alert = (message: string) => {
      // Determine type based on common keywords
      let type: Toast['type'] = 'info';
      const msgLower = message.toLowerCase();
      if (msgLower.includes('✓') || msgLower.includes('success') || msgLower.includes('approved') || msgLower.includes('cleared')) {
        type = 'success';
      } else if (msgLower.includes('failed') || msgLower.includes('invalid') || msgLower.includes('error') || msgLower.includes('must') || msgLower.includes('required')) {
        type = 'error';
      } else if (msgLower.includes('warning') || msgLower.includes('soon') || msgLower.includes('pending') || msgLower.includes('offline')) {
        type = 'warning';
      }
      
      // Clean up common emojis/formatting prefix if any, to keep it clean
      let cleanMessage = message;
      if (cleanMessage.startsWith('✓ ')) cleanMessage = cleanMessage.substring(2);
      if (cleanMessage.startsWith('🛡️ ')) cleanMessage = cleanMessage.substring(2);
      if (cleanMessage.startsWith('🔒 ')) cleanMessage = cleanMessage.substring(2);
      
      addToast(cleanMessage, type);
    };

    return () => {
      window.removeEventListener('britsync_toast', handleCustomToast);
      window.alert = originalAlert; // Restore original alert on unmount
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '420px',
      width: '100%',
      pointerEvents: 'none' // Don't block clicking things behind it
    }} className="no-print">
      {toasts.map((toast) => {
        // Style parameters based on toast type
        let icon = 'ℹ️';
        let borderColor = 'rgba(255, 255, 255, 0.15)';
        let accentBarColor = 'var(--accent)';
        
        if (toast.type === 'success') {
          icon = '🏛️';
          borderColor = 'rgba(56, 142, 60, 0.2)';
          accentBarColor = 'var(--accent)';
        } else if (toast.type === 'error') {
          icon = '🛡️';
          borderColor = 'rgba(211, 47, 47, 0.3)';
          accentBarColor = 'var(--error)';
        } else if (toast.type === 'warning') {
          icon = '⚠️';
          borderColor = 'rgba(200, 164, 93, 0.3)';
          accentBarColor = 'var(--accent)';
        }

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              display: 'flex',
              alignItems: 'start',
              gap: '1rem',
              backgroundColor: 'rgba(31, 75, 67, 0.96)', // Luxurious deep forest green base
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${borderColor}`,
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              color: '#FAF9F6',
              boxShadow: 'var(--shadow-lg), 0 4px 20px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              pointerEvents: 'auto', // Allow clicking the toast itself to dismiss
              cursor: 'pointer',
              animation: 'toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Color Accent Indicator Left Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: accentBarColor
            }} />

            {/* Icon */}
            <span style={{ fontSize: '1.2rem', marginTop: '0.1rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
              {icon}
            </span>

            {/* Message Content */}
            <div style={{ flex: 1 }}>
              <p style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                lineHeight: 1.4, 
                fontWeight: '500',
                letterSpacing: '0.2px' 
              }}>
                {toast.message}
              </p>
            </div>

            {/* Dismiss Cross */}
            <span style={{ 
              opacity: 0.5, 
              fontSize: '0.8rem', 
              marginLeft: '0.5rem',
              transition: 'opacity 0.2s' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
            >
              ✕
            </span>
          </div>
        );
      })}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}} />
    </div>
  );
}
