import React, { useState } from 'react';
import {
  Zap,
  Navigation,
  Clock,
  ArrowRight,
  Gift,
  Bike,
  Calendar,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { Button } from '../common/Button';
import { DeliveryRequestModal } from '../task/DeliveryRequestModal';
import { NavTab } from '../layout/MobileBottomNav';
import { DeliveryTask } from '../../types/delivery';
import { useToast } from '../../context/ToastContext';
import { ShiftIndicatorGraphic } from './ShiftIndicatorGraphic';
import { audioNotificationService } from '../../services/audioNotificationService';

interface HomeOverviewProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({ onNavigateTab }) => {
  const { partner, toggleOnlineDuty } = useAuth();
  const { activeTask, broadcastTasks, acceptBroadcastTask } = useTask();
  const { showToast } = useToast();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [assignedTaskModal, setAssignedTaskModal] = useState<DeliveryTask | null>(null);

  // Trigger immediate search and auto-assignment when rider goes online
  const handleGoOnline = () => {
    toggleOnlineDuty(true);
    setIsSearching(true);

    // Auto-search and assign order within 1.2s
    setTimeout(() => {
      setIsSearching(false);
      const available = broadcastTasks[0] || null;
      if (available && !activeTask) {
        setAssignedTaskModal(available);
        audioNotificationService.playNewOrderTone();
        showToast('New Delivery Request Assigned!', 'info');
      }
    }, 1200);
  };

  // If already online and active task exists or user searches manually
  const handleSearchNearby = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const available = broadcastTasks[0] || null;
      if (available && !activeTask) {
        setAssignedTaskModal(available);
        audioNotificationService.playNewOrderTone();
        showToast('New Delivery Request Found!', 'info');
      } else {
        showToast('Scanning hub... No new requests at this moment', 'info');
      }
    }, 900);
  };

  // When rider clicks "Start order" in DeliveryRequestModal
  const handleStartOrder = (task: DeliveryTask) => {
    acceptBroadcastTask(task.id);
    setAssignedTaskModal(null);
    onNavigateTab('navigation');
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Top Greeting & Zone Context */}
      <div className="flex items-center justify-between px-1 pt-0.5 pb-1">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight drop-shadow-2xs flex items-center gap-1.5">
            <span>Hi, {partner.name.split(' ')[0]}</span>
            <span className="animate-wave select-none text-xl leading-none">👋</span>
          </h1>
        </div>
      </div>

      {/* 1. HERO OPERATIONAL DUTY CARD */}

      {/* State A: Offline - Clean tactile card with clear call to action */}
      {!partner.isOnline && (
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Morning Rush Active</span>
              </div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight pt-0.5">
                Ready for your run?
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <Clock className="w-3.5 h-3.5 text-[#009DE0]" />
                <span>Shift slot: 08:00 AM – 11:00 AM</span>
              </div>
            </div>

            <ShiftIndicatorGraphic type="MORNING_RUSH" size="md" />
          </div>

          {/* Wolt Cerulean Primary Button */}
          <button
            type="button"
            onClick={handleGoOnline}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#009DE0] hover:bg-[#0082BD] active:bg-[#0074A8] text-white font-black text-sm shadow-[0_4px_16px_rgba(0,157,224,0.35)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center tracking-wide"
          >
            <span>Go Online</span>
          </button>
        </div>
      )}

      {/* State B: Real-time Order Search Radar state when searching */}
      {isSearching && (
        <div className="bg-white border border-[#009DE0]/40 rounded-3xl p-6 shadow-sm text-center space-y-3.5 animate-in fade-in duration-200">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#EBF7FD] animate-ping opacity-80" />
            <div className="absolute inset-2 rounded-full bg-[#009DE0]/10 animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-[#009DE0] text-white flex items-center justify-center shadow-md relative z-10">
              <RotateCw className="w-6 h-6 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-neutral-900">
              Scanning Active Area
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Matching incoming grocery & quick commerce baskets...
            </p>
          </div>
        </div>
      )}

      {/* State C: Online Duty Status Card (When Online & No Active Order) */}
      {partner.isOnline && !activeTask && !isSearching && (
        <div className="bg-white border border-[#009DE0]/30 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#009DE0] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#009DE0]" />
              </span>
              <div>
                <span className="text-xs font-black text-neutral-900 uppercase tracking-wide block">
                  You are Online · Active on Radar
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  Dispatch queue: Normal
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleOnlineDuty(false)}
              className="text-xs font-bold text-neutral-400 hover:text-neutral-700 underline cursor-pointer"
            >
              Go Offline
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-neutral-600">
              <span className="font-bold text-neutral-900 block">Waiting for order assignment</span>
              <span className="text-[11px] text-neutral-400">High volume expected in 5-10 mins</span>
            </div>

            <button
              onClick={handleSearchNearby}
              className="px-4 py-2.5 rounded-xl bg-[#EBF7FD] hover:bg-[#E0F4FC] active:bg-[#D5EEFA] text-[#009DE0] font-black text-xs border border-[#009DE0]/25 transition cursor-pointer flex items-center gap-2 shadow-2xs active:scale-95 shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Simulate Order</span>
            </button>
          </div>
        </div>
      )}

      {/* State D: Active Delivery Card (When in transit / assigned) */}
      {activeTask && (
        <div className="p-5 rounded-3xl bg-white border-2 border-[#009DE0]/40 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#009DE0] animate-pulse" />
              <span className="text-xs font-black uppercase text-[#009DE0] tracking-wider">
                ACTIVE DELIVERY
              </span>
              <span className="text-xs font-bold text-neutral-900">{activeTask.orderNumber}</span>
            </div>
            <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-xl border border-neutral-200">
              {activeTask.estimatedDeliveryAt}
            </span>
          </div>

          <div className="bg-neutral-50/90 p-3.5 rounded-2xl border border-neutral-200/60 text-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-[#009DE0] mt-0.5 shrink-0 ring-4 ring-[#EBF7FD]" />
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Pickup</span>
                <p className="font-black text-neutral-900 text-xs">{activeTask.pickup.storeName}</p>
                <p className="text-neutral-500 text-[11px] truncate">{activeTask.pickup.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2.5 border-t border-neutral-200/60">
              <div className="w-3 h-3 rounded-full bg-neutral-900 mt-0.5 shrink-0 ring-4 ring-neutral-200" />
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Dropoff</span>
                <p className="font-black text-neutral-900 text-xs">{activeTask.drop.customerName}</p>
                <p className="text-neutral-500 text-[11px] truncate">{activeTask.drop.address}</p>
              </div>
            </div>
          </div>

          <Button
            variant="brand"
            fullWidth
            onClick={() => onNavigateTab('navigation')}
            icon={<Navigation className="w-4 h-4" />}
          >
            Open Live Navigation
          </Button>
        </div>
      )}

      {/* 2. SHIFT BOOKING BANNER */}
      <div
        onClick={() => onNavigateTab('shifts')}
        className="flex items-center justify-between p-4 bg-white hover:bg-neutral-50/80 border border-neutral-200/80 rounded-3xl shadow-xs transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF7FD] text-[#009DE0] flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-neutral-900">Book High-Demand Shifts</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Evening rush slots open for booking</p>
          </div>
        </div>
        <span className="text-xs font-black text-[#009DE0] flex items-center gap-1">
          <span>Book</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* 4. PARTNER SERVICES & ACTION STRIP (Horizontal Native Scroll) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase text-neutral-400 tracking-wider">
            PARTNER UTILITIES
          </span>
          <span className="text-[11px] text-neutral-400">Quick Tools</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-24 hover:border-[#009DE0]/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900">EV Battery Swap</span>
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[11px] text-neutral-500 mt-auto">
              <span className="font-bold text-neutral-800">Swap Station</span> · 92% available
            </div>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-24 hover:border-[#009DE0]/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900">Refer Partner</span>
              <Gift className="w-4 h-4 text-[#009DE0]" />
            </div>
            <div className="text-[11px] text-neutral-500 mt-auto">
              Earn up to <strong className="text-[#009DE0]">₹4,000</strong> per verified rider
            </div>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-24 hover:border-[#009DE0]/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900">Rent EV Scooter</span>
              <Bike className="w-4 h-4 text-[#009DE0]" />
            </div>
            <div className="text-[11px] text-neutral-500 mt-auto">
              Ather 450X from <strong className="text-neutral-800">₹120/day</strong>
            </div>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-24 hover:border-[#009DE0]/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900">Roadside Assist</span>
              <ShieldCheck className="w-4 h-4 text-neutral-700" />
            </div>
            <div className="text-[11px] text-neutral-500 mt-auto">
              24/7 mechanical puncture & towing
            </div>
          </div>
        </div>
      </div>

      {/* 5. AVAILABLE BROADCAST TASKS FEED (WHEN ONLINE) */}
      {partner.isOnline && !activeTask && broadcastTasks.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#009DE0]" />
              Available Requests ({broadcastTasks.length})
            </h3>
          </div>

          {broadcastTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-xs hover:border-[#009DE0]/50 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-neutral-900">{task.orderNumber}</span>
                  <span className="text-xs font-black text-[#009DE0] bg-[#EBF7FD] px-2 py-0.5 rounded-lg border border-[#009DE0]/20 tabular-nums">
                    ₹{task.payoutBreakdown.totalPayout}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-medium">{task.placedAt}</span>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-black text-neutral-900">{task.pickup.storeName}</p>
                <p className="text-neutral-500 text-[11px] truncate">Pickup: {task.pickup.address}</p>
                <p className="text-neutral-500 text-[11px] truncate">Drop: {task.drop.address}</p>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100">
                <div className="text-[11px] text-neutral-500 flex items-center gap-2 font-medium">
                  <span>{task.route.distanceKm} km</span>
                  <span>·</span>
                  <span>~{task.route.formattedEta}</span>
                  <span>·</span>
                  <span>{task.itemCount} items</span>
                </div>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setAssignedTaskModal(task)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Request Modal with Leaflet Map, Estimated Earning, and "Start order" button */}
      {assignedTaskModal && (
        <DeliveryRequestModal
          task={assignedTaskModal}
          isOpen={!!assignedTaskModal}
          onClose={() => setAssignedTaskModal(null)}
          onStartOrder={handleStartOrder}
        />
      )}
    </div>
  );
};
