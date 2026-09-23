import React, { useState, useEffect } from 'react';
import {
  Zap,
  Navigation,
  Clock,
  ArrowRight,
  ChevronRight,
  Gift,
  Bike,
  ShoppingBag,
  Award,
  Calendar,
  AlertTriangle,
  Radar,
  RotateCw,
  Bell,
  Sparkles,
  BatteryCharging,
  MapPin,
  TrendingUp,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { earningsService } from '../../services/earningsService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DeliveryRequestModal } from '../task/DeliveryRequestModal';
import { NavTab } from '../layout/MobileBottomNav';
import { DeliveryTask } from '../../types/delivery';
import { useToast } from '../../context/ToastContext';
import { ShiftIndicatorGraphic } from './ShiftIndicatorGraphic';

interface HomeOverviewProps {
  onNavigateTab: (tab: NavTab) => void;
}

// Synthesized dispatch sound effect for incoming order alert
function playDispatchChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio context may be restricted by browser until first gesture
  }
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({ onNavigateTab }) => {
  const { partner, toggleOnlineDuty } = useAuth();
  const { activeTask, broadcastTasks, acceptBroadcastTask } = useTask();
  const { showToast } = useToast();

  const [progressTab, setProgressTab] = useState<'today' | 'week'>('today');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [assignedTaskModal, setAssignedTaskModal] = useState<DeliveryTask | null>(null);

  const summary = earningsService.getSummary();

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
        playDispatchChime();
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
        playDispatchChime();
      }
    }, 900);
  };

  // When rider clicks "Start order" in DeliveryRequestModal (Ref 2)
  const handleStartOrder = (task: DeliveryTask) => {
    acceptBroadcastTask(task.id);
    setAssignedTaskModal(null);
    onNavigateTab('navigation');
  };

  return (
    <div className="space-y-3.5 pb-16 max-w-md mx-auto animate-in fade-in duration-150">
      {/* Active Shift Card with "Go online now" Green Button & Vector Graphic */}
      {!partner.isOnline && (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/70">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wide">
                  MORNING RUSH
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  Shift has started!
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>08:00 AM – 11:00 AM</span>
                </div>
              </div>
            </div>

            {/* Custom Vector Graphic Indicator */}
            <ShiftIndicatorGraphic type="MORNING_RUSH" size="md" />
          </div>

          {/* Ref 1: Primary "Go online now" Green Button */}
          <button
            type="button"
            onClick={handleGoOnline}
            className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 tracking-wide"
          >
            <span>Go online now</span>
            <ArrowRight className="w-4 h-4 text-emerald-100" />
          </button>
        </div>
      )}

      {/* Real-time Order Search Radar state when searching */}
      {isSearching && (
        <div className="bg-white border border-emerald-300 rounded-2xl p-5 shadow-sm text-center space-y-3 animate-in fade-in duration-200">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md relative z-10">
              <RotateCw className="w-6 h-6 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900">
              Searching for nearby orders...
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Scanning 14 partner hardware & automotive spare hubs in {partner.assignedHubName}
            </p>
          </div>
        </div>
      )}

      {/* Online Duty Status Card (When Online & No Active Order) */}
      {partner.isOnline && !activeTask && !isSearching && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                You are Online · Active on Duty
              </span>
            </div>
            <button
              onClick={() => toggleOnlineDuty(false)}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
            >
              Go Offline
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>Ready for dispatch in {partner.assignedHubName}</span>
            <button
              onClick={handleSearchNearby}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              <span>Search Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Delivery Card (When in transit / assigned) */}
      {activeTask && (
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="md">
                ACTIVE DELIVERY
              </Badge>
              <span className="text-xs font-bold text-neutral-900">{activeTask.orderNumber}</span>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
              ₹{activeTask.payoutBreakdown.totalPayout} Payout
            </span>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/60 text-xs space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1 shrink-0 ring-2 ring-indigo-200" />
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">Pickup Store:</span>
                <p className="font-bold text-neutral-900 text-xs">{activeTask.pickup.storeName}</p>
                <p className="text-neutral-500 text-[11px] truncate">{activeTask.pickup.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-200/60">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0 ring-2 ring-emerald-200" />
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">Dropoff Site:</span>
                <p className="font-bold text-neutral-900 text-xs">{activeTask.drop.customerName}</p>
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
            Open Navigation & Maps
          </Button>
        </div>
      )}

      {/* Ref 1: "MY PROGRESS" Card with Today & This Week Tabs */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-neutral-400 tracking-wider">
            MY PROGRESS
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setProgressTab('today')}
              className={`text-xs font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                progressTab === 'today'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setProgressTab('week')}
              className={`text-xs font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                progressTab === 'week'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* 3 Metrics: Earnings, Login Hours, Orders */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">Earnings</span>
            <span className="text-base font-black text-neutral-900">
              ₹{progressTab === 'today' ? summary.todayTotalEarnings : 3420}
            </span>
          </div>

          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">Login Hours</span>
            <span className="text-base font-black text-neutral-900">
              {progressTab === 'today' ? '1:14 hrs' : '34:20 hrs'}
            </span>
          </div>

          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">Orders</span>
            <span className="text-base font-black text-neutral-900">
              {progressTab === 'today' ? summary.todayTripsCompleted : 28}
            </span>
          </div>
        </div>

        {/* Ref 1: Booking Shifts strip */}
        <div
          onClick={() => onNavigateTab('shifts')}
          className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/70 rounded-xl text-xs font-bold text-emerald-900 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Shifts open for today & tomorrow. Book now!</span>
          </div>
          <span>→</span>
        </div>
      </div>

      {/* Ref 1: Quick Services 2x2 Feature Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-xs font-bold text-neutral-900 leading-snug">Benefits - Loans & more</p>
          <div className="flex items-center justify-between mt-auto">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              →
            </div>
            <Award className="w-7 h-7 text-amber-500 opacity-90 shrink-0" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-28 relative overflow-hidden">
          <div>
            <p className="text-xs font-bold text-neutral-900 leading-snug">Refer & Earn</p>
            <span className="inline-block mt-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
              Upto ₹4,000
            </span>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              →
            </div>
            <Gift className="w-7 h-7 text-emerald-500 opacity-90 shrink-0" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-28 relative overflow-hidden">
          <div>
            <p className="text-xs font-bold text-neutral-900 leading-snug">Rent EV Scooter</p>
            <p className="text-[10px] text-neutral-400 font-medium">Ather 450X</p>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              →
            </div>
            <Bike className="w-7 h-7 text-indigo-500 opacity-90 shrink-0" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-28 relative overflow-hidden">
          <div>
            <p className="text-xs font-bold text-neutral-900 leading-snug">QCOM Gear Store</p>
            <p className="text-[10px] text-neutral-400 font-medium">Uniform & Gear</p>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              →
            </div>
            <ShoppingBag className="w-7 h-7 text-slate-700 opacity-90 shrink-0" />
          </div>
        </div>
      </div>

      {/* Available broadcast tasks feed when online */}
      {partner.isOnline && !activeTask && broadcastTasks.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              Available Requests ({broadcastTasks.length})
            </h3>
            <span className="text-[11px] text-neutral-400 font-medium">Indiranagar Hub</span>
          </div>

          {broadcastTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-emerald-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-neutral-900">{task.orderNumber}</span>
                  <Badge variant="emerald" size="sm">
                    ₹{task.payoutBreakdown.totalPayout}
                  </Badge>
                </div>
                <span className="text-[11px] text-neutral-400 font-medium">{task.placedAt}</span>
              </div>

              <div className="text-xs space-y-0.5">
                <p className="font-bold text-neutral-800">{task.pickup.storeName}</p>
                <p className="text-neutral-500 text-[11px] truncate">Pickup: {task.pickup.address}</p>
                <p className="text-neutral-500 text-[11px] truncate">Drop: {task.drop.address}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div className="text-[11px] text-neutral-600 flex items-center gap-2.5 font-medium">
                  <span>{task.route.distanceKm} km</span>
                  <span>~{task.route.formattedEta}</span>
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

      {/* Ref 2: Delivery Request Modal with Leaflet Map, Estimated Earning, and "Start order" button */}
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
