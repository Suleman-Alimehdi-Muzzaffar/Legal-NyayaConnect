import React from 'react';

interface ServiceIconProps {
  type: string;
  className?: string;
}

const ServiceIcon: React.FC<ServiceIconProps> = ({ type, className = 'w-16 h-16' }) => {
  switch (type) {
    case 'property':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M50 10L10 40v50h80V40L50 10z" stroke="#D4AF37" />
          <path d="M40 90V60h20v30" stroke="white" />
          <circle cx="65" cy="45" r="8" stroke="#D4AF37" />
          <path d="M65 53v20M58 68h14" stroke="#D4AF37" />
        </svg>
      );
    case 'criminal':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M30 60l-10 10M40 70l10-10" stroke="#D4AF37" />
          <rect x="25" y="25" width="40" height="20" transform="rotate(45 45 35)" fill="none" stroke="white" />
          <path d="M65 15l20 20M15 85h70" stroke="#D4AF37" />
        </svg>
      );
    case 'civil':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M50 10v80M20 90h60M20 30h60M20 30l-10 20M80 30l10 20" stroke="white" />
          <path d="M5 50h30M65 50h30" stroke="#D4AF37" />
        </svg>
      );
    case 'corporate':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <rect x="20" y="30" width="60" height="60" stroke="#D4AF37" />
          <rect x="30" y="40" width="40" height="20" stroke="white" />
          <path d="M40 30V15h20v15M30 60h40" stroke="#D4AF37" />
        </svg>
      );
    case 'family':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M50 80C50 80 20 60 20 35a20 20 0 0 1 40-10 20 20 0 0 1 40 10C100 60 50 80 50 80z" stroke="white" />
          <circle cx="35" cy="40" r="10" stroke="#D4AF37" />
          <circle cx="65" cy="40" r="10" stroke="#D4AF37" />
        </svg>
      );
    case 'consumer':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M10 20h20l10 40h40l10-30H35" stroke="white" />
          <circle cx="45" cy="80" r="8" stroke="#D4AF37" />
          <circle cx="75" cy="80" r="8" stroke="#D4AF37" />
          <path d="M50 10l20 20-20 20V10z" fill="none" stroke="#D4AF37" />
        </svg>
      );
    case 'cyber':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M50 10L10 30v30c0 30 40 30 40 30s40 0 40-30V30L50 10z" stroke="white" />
          <path d="M50 40v30M35 55h30" stroke="#D4AF37" />
          <circle cx="50" cy="55" r="5" fill="#D4AF37" />
        </svg>
      );
    case 'traffic':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <rect x="35" y="10" width="30" height="70" rx="5" stroke="white" />
          <circle cx="50" cy="25" r="8" stroke="#D4AF37" />
          <circle cx="50" cy="45" r="8" stroke="white" />
          <circle cx="50" cy="65" r="8" stroke="#D4AF37" />
        </svg>
      );
    case 'labour':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M20 80v-20a20 20 0 0 1 20-20h20a20 20 0 0 1 20 20v20" stroke="white" />
          <path d="M30 40a20 20 0 1 1 40 0" stroke="#D4AF37" />
          <path d="M25 45h50" stroke="#D4AF37" />
        </svg>
      );
    case 'women':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <circle cx="50" cy="30" r="15" stroke="white" />
          <path d="M50 45v45M35 60h30" stroke="#D4AF37" />
          <path d="M10 50c20 0 20-20 40-20s20 20 40 20" stroke="white" opacity="0.5" />
        </svg>
      );
    case 'senior':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M30 80V40c0-10 10-10 20-10h10" stroke="white" />
          <circle cx="45" cy="20" r="10" stroke="#D4AF37" />
          <path d="M60 90V40" stroke="#D4AF37" strokeDasharray="5,5" />
          <path d="M50 50l20 20" stroke="white" />
        </svg>
      );
    default:
      return null;
  }
};

export default ServiceIcon;
