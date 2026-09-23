import React, { useState } from 'react';
import { Home, Calendar, Navigation, DollarSign, History, User, ShieldCheck } from 'lucide-react';
import { NavTab } from './MobileBottomNav';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { BatteryStatusCard } from '../../modules/battery-telemetry';
import { Modal } from '../common/Modal';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const { partner } = useAuth();
  const { activeTask } = useTask();
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  const isEV = partner.vehicleType === 'EV_SCOOTER' || partner.vehicleType === 'E_CARGO_3W';

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Command Center', icon: <Home className="w-4 h-4" /> },
    { id: 'shifts', label: 'Gig Shifts & Capacity', icon: <Calendar className="w-4 h-4" /> },
    {
      id: 'navigation',
      label: 'Active Delivery',
      icon: <Navigation className="w-4 h-4" />,
      badge: activeTask ? activeTask.orderNumber : undefined,
    },
    { id: 'earnings', label: 'Earnings & Payouts', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'history', label: 'Trip History', icon: <History className="w-4 h-4" /> },
    { id: 'profile', label: 'Partner Profile & KYC', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-neutral-200/80 bg-white min-h-[calc(100vh-57px)] p-4 shrink-0">
      {/* Active Duty Status & BLE Telemetry Card (Only shown for EV vehicles) */}
      {isEV && (
        <div className="mb-5">
          <BatteryStatusCard
            compact
            vehicleModel={partner.vehicleModel}
            vehicleId={partner.vehicleNumber}
            onOpenDetails={() => setIsTelemetryModalOpen(true)}
          />
        </div>
      )}

      {/* Navigation Links */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-orange-50 text-[#f25100] border border-orange-200/80 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-[#f25100] text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Verified Partner Badge */}
      <div className="pt-3 border-t border-neutral-200/80 mt-auto">
        <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-bold text-[11px] leading-tight">KYC & BGV Verified</p>
            <p className="text-[10px] text-emerald-700/80">Authorized QCOM Partner</p>
          </div>
        </div>
      </div>

      {/* Telemetry Detail Modal */}
      {isTelemetryModalOpen && (
        <Modal
          isOpen={isTelemetryModalOpen}
          onClose={() => setIsTelemetryModalOpen(false)}
          title="Vehicle & Battery Telemetry"
          subtitle="Live EV BMS diagnostics and Bluetooth connection"
        >
          <div className="space-y-4">
            <BatteryStatusCard
              vehicleModel={partner.vehicleModel}
              vehicleId={partner.vehicleNumber}
            />
          </div>
        </Modal>
      )}
    </aside>
  );
};
