import type { SVGProps } from 'react';

interface LogoProps extends SVGProps<SVGSVGElement> {
  showText?: boolean;
  variant?: 'default' | 'light' | 'dark';
}

export function Logo({ showText = true, variant = 'default', className, ...props }: LogoProps) {
  const iconColors = {
    default: {
      gradient1: 'from-blue-500 to-blue-700',
      gradient2: 'from-amber-500 to-amber-600',
      text: 'text-gray-900 dark:text-white'
    },
    light: {
      gradient1: 'from-blue-400 to-blue-600',
      gradient2: 'from-amber-400 to-amber-500',
      text: 'text-white'
    },
    dark: {
      gradient1: 'from-blue-600 to-blue-800',
      gradient2: 'from-amber-600 to-amber-700',
      text: 'text-gray-900'
    }
  };

  const colors = iconColors[variant];

  return (
    <div className={`flex items-center gap-3 group-data-[collapsible=icon]:justify-center ${className}`}>
      {/* Modern SVG Logo */}
      <div className="relative">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-data-[collapsible=icon]:scale-90 hover:scale-105 duration-200"
          {...props}
        >
          <defs>
            <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="text-blue-500" stopColor="currentColor" />
              <stop offset="100%" className="text-blue-700" stopColor="currentColor" />
            </linearGradient>
            <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="text-amber-500" stopColor="currentColor" />
              <stop offset="100%" className="text-amber-600" stopColor="currentColor" />
            </linearGradient>
          </defs>
          
          {/* Background Circle with gradient */}
          <circle 
            cx="16" 
            cy="16" 
            r="15" 
            fill="url(#logoGrad1)" 
            className="drop-shadow-sm"
          />
          
          {/* Book Base */}
          <rect 
            x="8" 
            y="10" 
            width="16" 
            height="14" 
            rx="2" 
            fill="white" 
            stroke="url(#logoGrad2)" 
            strokeWidth="0.5"
          />
          
          {/* Book Pages */}
          <rect 
            x="9" 
            y="11" 
            width="14" 
            height="12" 
            rx="1" 
            fill="#F8FAFC"
          />
          
          {/* Book Spine */}
          <rect 
            x="8" 
            y="10" 
            width="2" 
            height="14" 
            rx="2" 
            fill="url(#logoGrad2)"
          />
          
          {/* Page Lines */}
          <line x1="11" y1="14" x2="21" y2="14" stroke="#CBD5E1" strokeWidth="0.5"/>
          <line x1="11" y1="16" x2="19" y2="16" stroke="#CBD5E1" strokeWidth="0.5"/>
          <line x1="11" y1="18" x2="20" y2="18" stroke="#CBD5E1" strokeWidth="0.5"/>
          <line x1="11" y1="20" x2="18" y2="20" stroke="#CBD5E1" strokeWidth="0.5"/>
          
          {/* Sparkle/Wisdom Icons */}
          <circle cx="20" cy="12" r="1.5" fill="url(#logoGrad2)" className="animate-pulse"/>
          <circle cx="22" cy="15" r="1" fill="#F59E0B"/>
          <circle cx="19" cy="17" r="0.8" fill="#FBBF24"/>
        </svg>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <span className={`text-2xl font-bold bg-gradient-to-r ${colors.gradient1} bg-clip-text text-transparent group-data-[collapsible=icon]:hidden transition-all duration-200`}>
          StudyWise
        </span>
      )}
    </div>
  );
}
