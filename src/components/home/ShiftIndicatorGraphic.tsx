import React from 'react';
import { Sunrise, Sun, Truck, Sunset, Zap } from 'lucide-react';

export type ShiftIndicatorType =
  | 'MORNING_RUSH'
  | 'MIDDAY_PEAK'
  | 'AFTERNOON_RUN'
  | 'EVENING_WIND_DOWN';

interface ShiftIndicatorGraphicProps {
  type: ShiftIndicatorType;
  size?: 'sm' | 'md' | 'lg';
}

export const ShiftIndicatorGraphic: React.FC<ShiftIndicatorGraphicProps> = ({
  type,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  switch (type) {
    case 'MORNING_RUSH':
      return (
        <div className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center`}>
          {/* Subtle Ambient Ring */}
          <div className="absolute inset-0 rounded-2xl bg-rose-50 border border-rose-200/80 shadow-2xs" />
          
          {/* Decorative Vector Graphic */}
          <svg
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full p-2"
          >
            {/* Horizon and Rays */}
            <circle cx="28" cy="30" r="12" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.75" />
            <path d="M12 40H44" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 45H40" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
            
            {/* Rising Sun Core */}
            <path
              d="M20 30C20 25.5817 23.5817 22 28 22C32.4183 22 36 25.5817 36 30H20Z"
              fill="#f43f5e"
            />
            {/* Sun Rays */}
            <line x1="28" y1="14" x2="28" y2="18" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            <line x1="38.5" y1="18.5" x2="35.5" y2="21.5" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            <line x1="17.5" y1="18.5" x2="20.5" y2="21.5" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          </svg>

          {/* Foreground Mini Badge */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs border-2 border-white">
            <Sunrise className="w-3 h-3" />
          </div>
        </div>
      );

    case 'MIDDAY_PEAK':
      return (
        <div className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center`}>
          <div className="absolute inset-0 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-2xs" />
          <svg
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full p-2"
          >
            {/* Central Radiant Sun & Workshop Gear Silhouette */}
            <circle cx="28" cy="28" r="10" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
            <circle cx="28" cy="28" r="5" fill="#d97706" />
            {/* Cardinal Rays */}
            <line x1="28" y1="10" x2="28" y2="14" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="42" x2="28" y2="46" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="10" y1="28" x2="14" y2="28" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="42" y1="28" x2="46" y2="28" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            {/* Diagonal Rays */}
            <line x1="15.5" y1="15.5" x2="18.5" y2="18.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <line x1="37.5" y1="37.5" x2="40.5" y2="40.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <line x1="40.5" y1="15.5" x2="37.5" y2="18.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.5" y1="37.5" x2="15.5" y2="40.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs border-2 border-white">
            <Sun className="w-3 h-3" />
          </div>
        </div>
      );

    case 'AFTERNOON_RUN':
      return (
        <div className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center`}>
          <div className="absolute inset-0 rounded-2xl bg-sky-50 border border-sky-200/80 shadow-2xs" />
          <svg
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full p-2"
          >
            {/* Express Delivery Box & Route Vectors */}
            <rect x="16" y="20" width="24" height="20" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <path d="M16 26H40" stroke="#0284c7" strokeWidth="1.5" />
            <path d="M28 20V40" stroke="#0284c7" strokeWidth="1.5" />
            {/* Speed Lines */}
            <line x1="10" y1="23" x2="13" y2="23" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="28" x2="13" y2="28" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="33" x2="13" y2="33" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs border-2 border-white">
            <Truck className="w-3 h-3" />
          </div>
        </div>
      );

    case 'EVENING_WIND_DOWN':
    default:
      return (
        <div className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center`}>
          <div className="absolute inset-0 rounded-2xl bg-indigo-50 border border-indigo-200/80 shadow-2xs" />
          <svg
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full p-2"
          >
            {/* Sunset Horizon & Dusk Waves */}
            <path d="M12 36H44" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 41H40" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
            {/* Sun Dipping below Horizon */}
            <path
              d="M22 36C22 32.6863 24.6863 30 28 30C31.3137 30 34 32.6863 34 36H22Z"
              fill="#6366f1"
              stroke="#4f46e5"
              strokeWidth="1.5"
            />
            {/* Twilight Stars / Calm Points */}
            <circle cx="18" cy="18" r="1.5" fill="#818cf8" />
            <circle cx="38" cy="16" r="2" fill="#6366f1" />
            <circle cx="28" cy="14" r="1.2" fill="#a5b4fc" />
          </svg>

          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs border-2 border-white">
            <Sunset className="w-3 h-3" />
          </div>
        </div>
      );
  }
};
