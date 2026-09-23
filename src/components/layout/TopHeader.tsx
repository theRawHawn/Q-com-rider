import React from 'react';
import { Headphones, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopHeaderProps {
  onOpenNotifications?: () => void;
  onOpenSupport: () => void;
  onOpenLocation: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenSupport,
  onOpenLocation,
}) => {
  const { partner, toggleOnlineDuty } = useAuth();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      onClick={handleScrollToTop}
      className="sticky top-0 z-40 bg-[#009DE0] text-white px-3.5 sm:px-6 pt-3 pb-2 cursor-pointer select-none"
      title="Tap to scroll back to top"
    >
      <div
        className="max-w-md sm:max-w-7xl mx-auto flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Compact Capsule Duty Toggle with Real Smooth Sliding Knob */}
        <button
          type="button"
          onClick={() => toggleOnlineDuty(!partner.isOnline)}
          className={`relative w-[76px] h-[26px] rounded-full transition-colors duration-300 cursor-pointer border shadow-inner flex items-center select-none overflow-hidden shrink-0 ${
            partner.isOnline
              ? 'bg-white/25 border-white/50 text-white backdrop-blur-xs'
              : 'bg-black/30 border-black/20 text-white/70 hover:bg-black/40'
          }`}
          title={partner.isOnline ? 'Switch to Offline' : 'Switch to Online'}
          aria-label="Toggle Online/Offline Duty"
        >
          {/* Hardware-accelerated sliding white knob */}
          <span
            className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-xs flex items-center justify-center transition-transform duration-300 ease-in-out z-10 ${
              partner.isOnline ? 'translate-x-[50px]' : 'translate-x-0'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                partner.isOnline ? 'bg-[#009DE0] animate-pulse' : 'bg-neutral-400'
              }`}
            />
          </span>

          {/* Text Labels positioned on either side */}
          <span
            className={`absolute inset-0 flex items-center text-[10px] font-black uppercase tracking-tight transition-opacity duration-200 ${
              partner.isOnline
                ? 'justify-start pl-2.5 text-white font-extrabold'
                : 'justify-end pr-2.5 text-white/80'
            }`}
          >
            {partner.isOnline ? 'On' : 'Off'}
          </span>
        </button>

        {/* Center: Flexible spacer */}
        <div className="flex-1" />

        {/* Right: Location Verification, Rider Support */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1. Location Verification */}
          <button
            onClick={onOpenLocation}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition cursor-pointer shrink-0"
            title="Verify Rider Location"
          >
            <MapPin className="w-4 h-4 text-emerald-300" />
          </button>

          {/* 2. Rider Support 24/7 */}
          <button
            onClick={onOpenSupport}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition cursor-pointer shrink-0"
            title="Rider Support 24/7"
          >
            <Headphones className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
