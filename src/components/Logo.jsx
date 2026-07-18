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

  // Unified Icon Component (Red Scissors from Setup page)
  const SvgIcon = () => (
    <div 
      className="bg-red-700 flex items-center justify-center rounded-xl"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size * 0.55} 
        height={size * 0.55} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    </div>
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
