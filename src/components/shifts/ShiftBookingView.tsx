import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Zap,
  Lock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ShiftSlot } from '../../types/delivery';
import { shiftBookingService } from '../../services/shiftBookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ShiftIndicatorGraphic, ShiftIndicatorType } from '../home/ShiftIndicatorGraphic';

export const ShiftBookingView: React.FC = () => {
  const { partner } = useAuth();
  const { showToast } = useToast();

  const weekDays = shiftBookingService.getWeekDays();
  const hubZones = shiftBookingService.getHubZones();

  const [selectedDate, setSelectedDate] = useState<string>(weekDays[0]?.dateStr || '2026-09-22');
  const [selectedHub, setSelectedHub] = useState<string>('ALL');
  const [slots, setSlots] = useState<ShiftSlot[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'BOOKED' | 'AVAILABLE'>('ALL');

  const loadSlots = () => {
    const list = shiftBookingService.getShiftSlots(selectedDate, selectedHub);
    setSlots(list);
  };

  useEffect(() => {
    loadSlots();
  }, [selectedDate, selectedHub]);

  const handleBookSlot = (slot: ShiftSlot) => {
    const res = shiftBookingService.bookShiftSlot(slot.id, partner.tierLevel);
    if (res.success) {
      showToast(res.message, 'success');
      loadSlots();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCancelSlot = (slot: ShiftSlot) => {
    const res = shiftBookingService.cancelShiftBooking(slot.id);
    if (res.success) {
      showToast(res.message, 'info');
      loadSlots();
    } else {
      showToast(res.message, 'error');
    }
  };

  const filteredSlots = slots.filter((s) => {
    if (filterType === 'BOOKED') return s.status === 'BOOKED';
    if (filterType === 'AVAILABLE') return s.status === 'AVAILABLE';
    return true;
  });

  const bookedCountTotal = slots.filter((s) => s.status === 'BOOKED').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner: Tier Priority & Booking Capacity */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 text-neutral-900 shadow-2xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="orange" size="sm">
                {partner.tierLevel} TIER PRIVILEGE
              </Badge>
              <span className="text-xs text-neutral-500 font-semibold">
                72-Hour Priority Window
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
              Gig Capacity & Shift Booking
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
              Operating Hours: 08:00 AM – 08:00 PM • 4 slots of 3 hours each with guaranteed minimum earnings.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-neutral-50 px-3.5 py-2 rounded-xl self-start sm:self-auto border border-neutral-200">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <div className="text-xs">
              <span className="text-neutral-500 font-medium block">Today's Bookings</span>
              <span className="font-extrabold text-neutral-900">{bookedCountTotal} Slots Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Horizon Date Selector */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Select Operating Horizon
            </span>
          </div>
          <span className="text-xs text-neutral-400 font-medium">Mon 22 Sep - Sun 28 Sep</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          {weekDays.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`flex flex-col items-center py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#f25100] border-[#f25100] text-white shadow-xs scale-[1.02]'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200/80 text-neutral-700'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-white/90' : 'text-neutral-500'
                  }`}
                >
                  {d.dayName}
                </span>
                <span className="text-base sm:text-lg font-black my-0.5">{d.dayNumber}</span>
                {d.isToday && (
                  <span
                    className={`text-[9px] font-bold px-1 rounded-sm ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hub Zone & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Hub Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-neutral-200/80 shadow-xs flex-1">
          <MapPin className="w-4 h-4 text-[#f25100] shrink-0" />
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold text-neutral-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
          >
            {hubZones.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl self-start sm:self-auto border border-neutral-200/80">
          {(['ALL', 'AVAILABLE', 'BOOKED'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {type === 'ALL' ? 'All Slots' : type === 'AVAILABLE' ? 'Available' : 'My Bookings'}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Slots List */}
      <div className="space-y-3">
        {filteredSlots.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-800">No Shift Slots Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No shifts matching your filter criteria on this date. Try changing the hub zone or selected date.
            </p>
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const isBooked = slot.status === 'BOOKED';
            const isFilled = slot.status === 'FILLED';
            const isLocked = slot.status === 'LOCKED';
            const capacityRatio = slot.bookedCount / slot.capacityLimit;

            const getGraphicType = (shiftType: string): ShiftIndicatorType => {
              if (shiftType === 'MORNING_PEAK') return 'MORNING_RUSH';
              if (shiftType === 'MIDDAY_PEAK') return 'MIDDAY_PEAK';
              if (shiftType === 'AFTERNOON_SLOT') return 'AFTERNOON_RUN';
              return 'EVENING_WIND_DOWN';
            };

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                  isBooked
                    ? 'border-emerald-500/80 ring-1 ring-emerald-500/20 bg-emerald-50/20'
                    : 'border-neutral-200/80 hover:border-neutral-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex items-start gap-3">
                    <ShiftIndicatorGraphic type={getGraphicType(slot.shiftType)} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-neutral-900">
                          {slot.shiftName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <span className="font-bold text-neutral-800">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span>•</span>
                        <span>{slot.zoneName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start sm:self-auto">
                    {isBooked ? (
                      <Badge variant="emerald" size="sm" dot>
                        Confirmed & Booked
                      </Badge>
                    ) : isFilled ? (
                      <Badge variant="neutral" size="sm">
                        Capacity Filled
                      </Badge>
                    ) : isLocked ? (
                      <Badge variant="amber" size="sm">
                        <Lock className="w-3 h-3 inline mr-1" />
                        {slot.tierAccessRequired} Tier Only
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm" dot>
                        Open for Booking
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Metrics: Minimum Guarantee & Capacity Gauge */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[11px] font-medium">
                      Min Guaranteed Pay
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-neutral-900">
                      ₹{slot.minEarningsGuarantee}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px] font-medium">
                      Duration
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-neutral-800">
                      3 Hours Active
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500 mb-1">
                      <span>Fleet Capacity</span>
                      <span className="font-bold text-neutral-800">
                        {slot.bookedCount} / {slot.capacityLimit} Couriers
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          capacityRatio >= 0.95
                            ? 'bg-rose-500'
                            : capacityRatio >= 0.75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, capacityRatio * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-release 15 min after shift start</span>
                  </div>

                  {isBooked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelSlot(slot)}
                      className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                    >
                      Cancel Booking
                    </Button>
                  ) : isFilled ? (
                    <Button variant="secondary" size="sm" disabled className="text-xs opacity-60">
                      Slot Full
                    </Button>
                  ) : isLocked ? (
                    <Button variant="secondary" size="sm" disabled className="text-xs opacity-60">
                      Locked ({slot.tierAccessRequired})
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBookSlot(slot)}
                      className="text-xs font-bold"
                    >
                      Book This Shift
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Spot Booking / Live Surge Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Live Spot Booking & Surge Multipliers</p>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            Need flexibility? Unbooked riders can turn their duty toggle ON during active surge spikes to receive automated spot-dispatch tasks with up to 1.8x multiplier without booking ahead.
          </p>
        </div>
      </div>
    </div>
  );
};
