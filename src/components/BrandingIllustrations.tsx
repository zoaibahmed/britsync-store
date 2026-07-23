import React from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
}

export const BrandingIllustrations = {
  EmptyCart: ({ size = 180, ...props }: IllustrationProps) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="100" cy="100" r="80" stroke="var(--glass-border)" strokeDasharray="3 3" />
      <g transform="translate(60, 55)" strokeWidth="1.2">
        {/* Shopping bag outline */}
        <path d="M10,25 L70,25 L65,85 L15,85 Z" stroke="var(--text)" />
        {/* Handles */}
        <path d="M30,25 C30,10 50,10 50,25" stroke="var(--accent)" />
        {/* Technical crosshairs representing audit grid */}
        <line x1="0" y1="45" x2="80" y2="45" stroke="var(--glass-border)" strokeDasharray="2 2" />
        <line x1="40" y1="5" x2="40" y2="95" stroke="var(--glass-border)" strokeDasharray="2 2" />
        {/* Gold credential mark */}
        <circle cx="40" cy="55" r="8" stroke="var(--accent)" fill="none" />
        <path d="M37,55 L39,57 L43,53" stroke="var(--accent)" strokeWidth="1.5" />
      </g>
    </svg>
  ),

  EmptyWishlist: ({ size = 180, ...props }: IllustrationProps) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="100" cy="100" r="80" stroke="var(--glass-border)" strokeDasharray="3 3" />
      <g transform="translate(55, 55)" strokeWidth="1.2">
        {/* Fine heart path */}
        <path d="M45,20 C32,5 10,15 10,38 C10,60 45,85 45,85 C45,85 80,60 80,38 C80,15 58,5 45,20 Z" stroke="var(--text)" />
        {/* Compass lines intersecting */}
        <line x1="-15" y1="45" x2="105" y2="45" stroke="var(--glass-border)" strokeDasharray="2 2" />
        <line x1="45" y1="-15" x2="45" y2="105" stroke="var(--glass-border)" strokeDasharray="2 2" />
        {/* Tiny gold validation star/crest */}
        <path d="M45,30 L47,35 L52,35 L48,38 L50,43 L45,40 L40,43 L42,38 L38,35 L43,35 Z" fill="var(--accent)" />
      </g>
    </svg>
  ),

  SuccessSeal: ({ size = 200, ...props }: IllustrationProps) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="100" cy="100" r="90" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="80" stroke="var(--glass-border)" />
      <g transform="translate(60, 60)" strokeWidth="1.5">
        {/* Certified wax seal octagonal crest */}
        <path d="M40,10 L70,10 L75,35 L60,75 L20,75 L5,35 Z" stroke="var(--accent)" fill="none" />
        <circle cx="40" cy="40" r="24" stroke="var(--text)" />
        {/* Checkmark inside */}
        <path d="M30,40 L37,47 L50,33" stroke="var(--accent)" strokeWidth="2.5" />
        {/* Dotted target lines */}
        <line x1="-20" y1="40" x2="100" y2="40" stroke="var(--glass-border)" strokeDasharray="2 2" strokeWidth="0.8" />
        <line x1="40" y1="-20" x2="40" y2="100" stroke="var(--glass-border)" strokeDasharray="2 2" strokeWidth="0.8" />
      </g>
    </svg>
  ),

  ErrorSeal: ({ size = 200, ...props }: IllustrationProps) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="100" cy="100" r="90" stroke="#E05A47" strokeWidth="0.8" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="80" stroke="var(--glass-border)" />
      <g transform="translate(60, 60)" strokeWidth="1.5">
        {/* Broken seal structure */}
        <path d="M40,10 L70,10 L75,35 L60,75 L20,75 L5,35 Z" stroke="#E05A47" fill="none" />
        {/* Intersecting diagnostic lines */}
        <line x1="25" y1="25" x2="55" y2="55" stroke="#E05A47" strokeWidth="2" />
        <line x1="55" y1="25" x2="25" y2="55" stroke="#E05A47" strokeWidth="2" />
        <line x1="-20" y1="40" x2="100" y2="40" stroke="var(--glass-border)" strokeDasharray="2 2" strokeWidth="0.8" />
        <line x1="40" y1="-20" x2="40" y2="100" stroke="var(--glass-border)" strokeDasharray="2 2" strokeWidth="0.8" />
      </g>
    </svg>
  ),

  OnboardingSeal: ({ size = 220, ...props }: IllustrationProps) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="100" cy="100" r="85" stroke="var(--glass-border)" />
      <circle cx="100" cy="100" r="60" stroke="var(--glass-border)" strokeDasharray="2 2" />
      {/* Compass/Ship navigation wheel represents onboarding of local global makers */}
      <g transform="translate(70, 70)" strokeWidth="1.2">
        <circle cx="30" cy="30" r="20" stroke="var(--text)" />
        <line x1="30" y1="-10" x2="30" y2="70" stroke="var(--accent)" />
        <line x1="-10" y1="30" x2="70" y2="30" stroke="var(--accent)" />
        <line x1="2" y1="2" x2="58" y2="58" stroke="var(--glass-border)" />
        <line x1="58" y1="2" x2="2" y2="58" stroke="var(--glass-border)" />
        {/* Central hub */}
        <circle cx="30" cy="30" r="4" fill="var(--accent)" stroke="var(--accent)" />
      </g>
      <path d="M100,5 L100,15 M195,100 L185,100 M100,195 L100,185 M5,100 L15,100" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  )
};
