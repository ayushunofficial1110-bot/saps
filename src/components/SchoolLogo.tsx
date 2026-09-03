import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  customLogoUrl?: string;
}

export const resolveSchoolLogoUrl = (url?: string): string => {
  if (!url || !url.trim()) {
    return 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg';
  }
  const clean = url.trim();
  if (clean.includes('postimg.cc/sBLgnd51')) {
    return 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg';
  }
  return clean;
};

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 56,
  showText = false,
  customLogoUrl,
}) => {
  const { siteContent } = useSiteContent();
  const [imgFailed, setImgFailed] = React.useState(false);

  const rawLogo = customLogoUrl || siteContent?.school?.logoUrl;
  const effectiveLogoUrl = resolveSchoolLogoUrl(rawLogo);
  const schoolName = siteContent?.school?.name || 'SWAMI ADGADANAND PUBLIC SCHOOL';
  const tagline = siteContent?.school?.tagline || 'Excellence in Value-Based Education';
  const motto = siteContent?.school?.motto || 'सा विद्या या विमुक्तये';

  React.useEffect(() => {
    setImgFailed(false);
  }, [effectiveLogoUrl]);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {effectiveLogoUrl && !imgFailed ? (
        <img
          src={effectiveLogoUrl}
          alt={schoolName}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          style={{ width: size, height: size }}
          className="rounded-full object-cover shadow-sm border-2 border-amber-400 shrink-0 bg-white"
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-sm"
          aria-label="Swami Adgadanand Public School Logo"
        >
          <defs>
            {/* Gold outer gradient */}
            <radialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF1B8" />
              <stop offset="60%" stopColor="#F5B301" />
              <stop offset="90%" stopColor="#C68900" />
              <stop offset="100%" stopColor="#8A5A00" />
            </radialGradient>
            {/* Sky blue ring */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C4FF" />
              <stop offset="100%" stopColor="#0084C7" />
            </linearGradient>
            {/* Navy shield gradient */}
            <linearGradient id="navyShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0B1F4D" />
            </linearGradient>
            {/* Ribbon Gold */}
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Outer Golden Border */}
          <circle cx="200" cy="200" r="195" fill="url(#goldGrad)" stroke="#5E3B00" strokeWidth="4" />
          
          {/* Dark separator circle */}
          <circle cx="200" cy="200" r="184" fill="#0B1F4D" />

          {/* Sky Blue Text Band */}
          <circle cx="200" cy="200" r="180" fill="url(#skyGrad)" stroke="#F5B301" strokeWidth="3" />

          {/* Curved Text along path */}
          <path
            id="topCurve"
            d="M 45 200 A 155 155 0 1 1 355 200"
            fill="none"
          />
          <text fill="#0B1F4D" fontWeight="900" fontSize="24" letterSpacing="3" fontFamily="sans-serif">
            <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
              SWAMI ADGADANAND PUBLIC SCHOOL
            </textPath>
          </text>

          {/* Inner Golden Field */}
          <circle cx="200" cy="200" r="130" fill="#FFF275" stroke="#D49B00" strokeWidth="4" />

          {/* Laurel / Wheat Wreath on Left and Right */}
          {/* Left wreath leaves */}
          <g fill="#2E7D32" stroke="#1B5E20" strokeWidth="1">
            <ellipse cx="105" cy="140" rx="6" ry="14" transform="rotate(-30 105 140)" />
            <ellipse cx="95" cy="170" rx="6" ry="14" transform="rotate(-15 95 170)" />
            <ellipse cx="95" cy="200" rx="6" ry="14" transform="rotate(0 95 200)" />
            <ellipse cx="105" cy="230" rx="6" ry="14" transform="rotate(20 105 230)" />
            <ellipse cx="120" cy="255" rx="6" ry="14" transform="rotate(45 120 255)" />
            {/* Inner leaf pairs */}
            <ellipse cx="115" cy="155" rx="5" ry="11" transform="rotate(-10 115 155)" />
            <ellipse cx="110" cy="185" rx="5" ry="11" transform="rotate(10 110 185)" />
            <ellipse cx="120" cy="215" rx="5" ry="11" transform="rotate(30 120 215)" />
          </g>
          {/* Right wreath leaves */}
          <g fill="#2E7D32" stroke="#1B5E20" strokeWidth="1">
            <ellipse cx="295" cy="140" rx="6" ry="14" transform="rotate(30 295 140)" />
            <ellipse cx="305" cy="170" rx="6" ry="14" transform="rotate(15 305 170)" />
            <ellipse cx="305" cy="200" rx="6" ry="14" transform="rotate(0 305 200)" />
            <ellipse cx="295" cy="230" rx="6" ry="14" transform="rotate(-20 295 230)" />
            <ellipse cx="280" cy="255" rx="6" ry="14" transform="rotate(-45 280 255)" />
            {/* Inner right leaf pairs */}
            <ellipse cx="285" cy="155" rx="5" ry="11" transform="rotate(10 285 155)" />
            <ellipse cx="290" cy="185" rx="5" ry="11" transform="rotate(-10 290 185)" />
            <ellipse cx="280" cy="215" rx="5" ry="11" transform="rotate(-30 280 215)" />
          </g>

          {/* Top Open Book with Rays */}
          <g transform="translate(180, 85) scale(0.8)">
            <path d="M25 15 C15 5, 0 8, -10 12 L-10 28 C0 24, 15 21, 25 30 C35 21, 50 24, 60 28 L60 12 C50 8, 35 5, 25 15 Z" fill="#00AEEF" stroke="#0B1F4D" strokeWidth="2" />
            <path d="M25 15 L25 30" stroke="#0B1F4D" strokeWidth="2" />
            <circle cx="25" cy="4" r="5" fill="#F5B301" />
            <line x1="25" y1="-4" x2="25" y2="-1" stroke="#F5B301" strokeWidth="2" />
            <line x1="16" y1="-1" x2="19" y2="1" stroke="#F5B301" strokeWidth="2" />
            <line x1="34" y1="-1" x2="31" y2="1" stroke="#F5B301" strokeWidth="2" />
          </g>

          {/* Central Shield Outer Gold / Navy */}
          <path
            d="M 135 130 Q 200 115 265 130 L 265 200 C 265 245 200 270 200 270 C 200 270 135 245 135 200 Z"
            fill="url(#navyShieldGrad)"
            stroke="#F5B301"
            strokeWidth="6"
          />

          {/* White Grid in Shield */}
          <line x1="138" y1="190" x2="262" y2="190" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
          <line x1="200" y1="125" x2="200" y2="265" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
          <line x1="136" y1="155" x2="264" y2="155" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />
          <line x1="145" y1="225" x2="255" y2="225" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />

          {/* Central Small Circle in Shield with Book/Pen */}
          <circle cx="200" cy="140" r="16" fill="#FFFFFF" stroke="#0B1F4D" strokeWidth="1.5" />
          <path d="M193 140 Q197 136 200 138 Q203 136 207 140 L207 144 Q203 141 200 143 Q197 141 193 144 Z" fill="#8A5A00" />
          <line x1="200" y1="138" x2="200" y2="143" stroke="#0B1F4D" strokeWidth="1" />
          <line x1="201" y1="134" x2="204" y2="131" stroke="#0B1F4D" strokeWidth="1.5" />

          {/* SAPS Letters in Red Cursive Style in 4 Quadrants */}
          <text x="175" y="180" fill="#E53E3E" fontWeight="bold" fontSize="28" fontFamily="'Georgia', serif" fontStyle="italic" textAnchor="middle">S</text>
          <text x="225" y="180" fill="#E53E3E" fontWeight="bold" fontSize="28" fontFamily="'Georgia', serif" fontStyle="italic" textAnchor="middle">A</text>
          <text x="175" y="235" fill="#E53E3E" fontWeight="bold" fontSize="28" fontFamily="'Georgia', serif" fontStyle="italic" textAnchor="middle">P</text>
          <text x="225" y="235" fill="#E53E3E" fontWeight="bold" fontSize="28" fontFamily="'Georgia', serif" fontStyle="italic" textAnchor="middle">S</text>

          {/* Motto Ribbon Banner at bottom */}
          <g id="mottoRibbon">
            <path
              d="M 125 285 Q 200 305 275 285 L 285 305 Q 200 325 115 305 Z"
              fill="url(#ribbonGrad)"
              stroke="#B45309"
              strokeWidth="2"
            />
            {/* Ribbon tails */}
            <polygon points="115,305 95,295 105,315" fill="#B45309" />
            <polygon points="285,305 305,295 295,315" fill="#B45309" />
            {/* Sanskrit Motto: सा विद्या या विमुक्तये */}
            <text x="200" y="302" fill="#0B1F4D" fontWeight="bold" fontSize="13" fontFamily="sans-serif" textAnchor="middle">
              सा विद्या या विमुक्तये
            </text>
          </g>

          {/* Pink Lotus Flower */}
          <g transform="translate(180, 305) scale(0.6)">
            <path d="M33 35 C20 15, 33 0, 33 0 C33 0, 46 15, 33 35 Z" fill="#FF4081" stroke="#C2185B" strokeWidth="1.5" />
            <path d="M22 35 C5 22, 12 10, 12 10 C12 10, 26 20, 22 35 Z" fill="#F06292" stroke="#C2185B" strokeWidth="1.5" />
            <path d="M44 35 C61 22, 54 10, 54 10 C54 10, 40 20, 44 35 Z" fill="#F06292" stroke="#C2185B" strokeWidth="1.5" />
            <ellipse cx="33" cy="36" rx="20" ry="4" fill="#4CAF50" />
          </g>

          {/* Heraldic Lions on Left and Right Bottom */}
          {/* Left Lion Head Icon */}
          <g transform="translate(70, 290) scale(0.4)">
            <circle cx="20" cy="20" r="18" fill="#FFFFFF" stroke="#0B1F4D" strokeWidth="2" />
            <path d="M12 14 Q20 8 28 14 Q24 24 20 28 Q16 24 12 14 Z" fill="#0B1F4D" />
            <circle cx="16" cy="18" r="2" fill="#FFFFFF" />
            <circle cx="24" cy="18" r="2" fill="#FFFFFF" />
          </g>
          {/* Right Lion Head Icon */}
          <g transform="translate(305, 290) scale(0.4)">
            <circle cx="20" cy="20" r="18" fill="#FFFFFF" stroke="#0B1F4D" strokeWidth="2" />
            <path d="M12 14 Q20 8 28 14 Q24 24 20 28 Q16 24 12 14 Z" fill="#0B1F4D" />
            <circle cx="16" cy="18" r="2" fill="#FFFFFF" />
            <circle cx="24" cy="18" r="2" fill="#FFFFFF" />
          </g>

          {/* 3 Red Stars at the base */}
          <g fill="#EF4444" stroke="#991B1B" strokeWidth="1">
            {/* Left Star */}
            <polygon points="145,340 148,348 156,348 150,353 152,361 145,356 138,361 140,353 134,348 142,348" />
            {/* Center Star */}
            <polygon points="200,355 204,365 215,365 207,372 210,382 200,375 190,382 193,372 185,365 196,365" transform="scale(1.1) translate(-20,-20)" />
            {/* Right Star */}
            <polygon points="255,340 258,348 266,348 260,353 262,361 255,356 248,361 250,353 244,348 252,348" />
          </g>
        </svg>
      )}

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-serif font-black tracking-tight text-slate-900 leading-tight text-base md:text-lg">
            {schoolName}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-[#0B1F4D] text-xs md:text-sm tracking-wide">
              {tagline}
            </span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium hidden sm:inline">
            {motto}
          </span>
        </div>
      )}
    </div>
  );
};

