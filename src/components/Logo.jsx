import React from 'react';

/**
 * Kowaguru TCMS Logo Component
 * Supports static SVG logo or a dynamic company logo image uploaded in settings.
 * 
 * @param {Object} props
 * @param {'horizontal' | 'vertical' | 'icon'} props.variant - Layout variation
 * @param {number} props.size - Height/width sizing scale factor
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.logoUrl - Dynamic company logo URL from settings (optional)
 * @param {string} props.businessName - Dynamic company name from settings (optional)
 */
export default function Logo({ variant = 'horizontal', size = 48, className = '', logoUrl = null, businessName = null }) {
  const displayName = businessName || 'Kowaguru TCMS';

  // If a custom company logo is uploaded, show it instead of the SVG
  const CustomLogoImage = () => (
    <img
      src={logoUrl}
      alt={displayName}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: '6px',
        flexShrink: 0,
      }}
    />
  );

  // SVG Icon Component containing the fused Dress Form, Scissors, and Dashboard Grid
  const SvgIcon = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* 1. DIGITAL DASHBOARD GRID */}
      <g id="dashboard-grid" opacity="0.35">
        <line x1="15" y1="20" x2="85" y2="20" stroke="#888888" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="15" y1="40" x2="85" y2="40" stroke="#888888" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="15" y1="60" x2="85" y2="60" stroke="#888888" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="15" y1="80" x2="85" y2="80" stroke="#888888" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="20" y1="15" x2="20" y2="85" stroke="#888888" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="40" y1="15" x2="40" y2="85" stroke="#888888" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="60" y1="15" x2="60" y2="85" stroke="#888888" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="80" y1="15" x2="80" y2="85" stroke="#888888" strokeWidth="0.5" strokeDasharray="2,2" />
        <circle cx="20" cy="20" r="1.5" fill="#1E1E1E" />
        <circle cx="60" cy="20" r="1.5" fill="#1E1E1E" />
        <circle cx="80" cy="40" r="1.5" fill="#B22222" />
        <circle cx="20" cy="60" r="1.5" fill="#B22222" />
        <circle cx="40" cy="80" r="1.5" fill="#1E1E1E" />
        <circle cx="80" cy="80" r="1.5" fill="#888888" />
      </g>

      {/* 2. DRESS FORM */}
      <g id="dress-form">
        <path d="M47 16 C47 13, 53 13, 53 16" stroke="#B22222" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="48.5" y="17" width="3" height="5" rx="1" fill="#B22222" />
        <path
          d="M 42 22 C 42 22, 50 20, 58 22 C 61 28, 62 36, 56 42 C 52 46, 54 52, 57 58 C 59 62, 56 66, 50 66 C 44 66, 41 62, 43 58 C 46 52, 48 46, 44 42 C 38 36, 39 28, 42 22 Z"
          fill="#B22222"
        />
        <path d="M50 22 V66" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
        <rect x="49" y="66" width="2" height="20" fill="#1E1E1E" />
        <ellipse cx="50" cy="66" rx="2.5" ry="1.5" fill="#1E1E1E" />
        <path d="M50 85 L38 94" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 85 L62 94" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 85 V94" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* 3. SCISSORS */}
      <g id="scissors">
        <path d="M32 30 L48 50 L53 56 M53 56 L64 68" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M68 30 L52 50 L47 56 M47 56 L36 68" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="52" r="1.5" fill="#888888" stroke="#1E1E1E" strokeWidth="0.5" />
        <circle cx="32" cy="72" r="5" stroke="#1E1E1E" strokeWidth="2" fill="none" />
        <circle cx="68" cy="72" r="5" stroke="#1E1E1E" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );

  const IconEl = logoUrl ? CustomLogoImage : SvgIcon;

  if (variant === 'icon') {
    return (
      <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
        <IconEl />
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div style={{ width: size, height: size }}>
          <IconEl />
        </div>
        <div className="mt-3">
          <h1
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '800',
              color: '#1E1E1E',
              letterSpacing: '0.05em',
              fontSize: `${size * 0.4}px`,
              lineHeight: '1.1'
            }}
          >
            Kowaguru <span style={{ color: '#B22222' }}>TCMS</span>
          </h1>
          <p
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: `${size * 0.14}px`,
              color: '#888888',
              letterSpacing: '0.05em',
              marginTop: '4px',
              fontWeight: '500'
            }}
          >
            By KowaGuru Technology
          </p>
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div className={`flex items-center ${className}`}>
      <div style={{ width: size, height: size, flexShrink: 0 }}>
        <IconEl />
      </div>
      <div className="ml-3" style={{ textAlign: 'left' }}>
        <h1
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '800',
            color: '#1E1E1E',
            letterSpacing: '0.05em',
            fontSize: `${size * 0.42}px`,
            lineHeight: '1'
          }}
        >
          {logoUrl ? displayName : <>Kowaguru <span style={{ color: '#B22222' }}>TCMS</span></>}
        </h1>
        <p
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: `${size * 0.16}px`,
            color: '#888888',
            letterSpacing: '0.05em',
            marginTop: '2px',
            fontWeight: '500'
          }}
        >
          {logoUrl ? 'Powered by Kowaguru TCMS' : 'By KowaGuru Technology'}
        </p>
      </div>
    </div>
  );
}
