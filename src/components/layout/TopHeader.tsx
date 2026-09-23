import React, { useEffect, useState } from 'react';
import { Headphones, MapPin, BatteryCharging, Bluetooth } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { batteryTelemetryService, TelemetryPacket } from '../../modules/battery-telemetry';

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
  const [telemetry, setTelemetry] = useState<TelemetryPacket>(() =>
    batteryTelemetryService.getCurrentPacket()
  );

  useEffect(() => {
    const unsub = batteryTelemetryService.subscribe((packet) => {
      setTelemetry(packet);
    });
    return () => unsub();
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      onClick={handleScrollToTop}
      className="sticky top-0 z-40 bg-gradient-to-r from-[#007eb8] via-[#009DE0] to-[#00B2EE] text-white px-3.5 sm:px-6 py-2.5 shadow-md cursor-pointer select-none border-b border-sky-400/30"
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

        {/* Right: Battery & BLE Pill (EV only), Location Verification, Rider Support */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Battery & BLE indicator - EV Only */}
          {(partner.vehicleType === 'EV_SCOOTER' || partner.vehicleType === 'E_CARGO_3W') && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/20 border border-white/10 text-[11px] font-bold text-white/90 shrink-0"
              title={`EV BMS Telemetry: ${telemetry.soc}% (${telemetry.estimatedRangeKm} km)`}
            >
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{telemetry.soc}%</span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                telemetry.connectionStatus === 'connected'
                  ? 'bg-emerald-400'
                  : telemetry.connectionStatus === 'reconnecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-400'
              }`} />
            </div>
          )}

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
