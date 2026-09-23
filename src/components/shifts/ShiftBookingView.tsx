import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { ShiftSlot } from '../../types/delivery';
import { shiftBookingService } from '../../services/shiftBookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

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
    <div className="space-y-3 pb-8">
      {/* Sleek Operational Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
              Shift Booking
            </h1>
            <Badge variant="brand" size="sm">
              {partner.tierLevel}
            </Badge>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            3-hour operational delivery slots with minimum pay guarantees
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs text-xs">
          <Calendar className="w-3.5 h-3.5 text-[#009DE0]" />
          <span className="font-bold text-neutral-800">
            {bookedCountTotal} {bookedCountTotal === 1 ? 'Slot' : 'Slots'} Booked
          </span>
        </div>
      </div>

      {/* Redesigned Compact Date Rail */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer select-none text-center ${
                  isSelected
                    ? 'bg-[#009DE0] text-white shadow-xs font-bold'
                    : 'bg-neutral-50/70 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/50'
                }`}
              >
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-white/80' : 'text-neutral-400'
                  }`}
                >
                  {d.dayName}
                </span>
                <span className="text-xs sm:text-sm font-black my-0.5">
                  {d.dayNumber}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected
                      ? 'bg-white'
                      : d.isToday
                      ? 'bg-emerald-500'
                      : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Hub & Filter Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Hub Selector */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-neutral-200/80 shadow-2xs flex-1 max-w-xs">
          <MapPin className="w-3.5 h-3.5 text-[#009DE0] shrink-0" />
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="w-full text-xs font-semibold text-neutral-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
          >
            {hubZones.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-xl border border-neutral-200/60">
          {(['ALL', 'AVAILABLE', 'BOOKED'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {type === 'ALL' ? 'All' : type === 'AVAILABLE' ? 'Open' : 'Booked'}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Slots List */}
      <div className="space-y-2.5">
        {filteredSlots.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 text-center space-y-1.5 shadow-2xs">
            <AlertCircle className="w-6 h-6 text-neutral-400 mx-auto" />
            <h3 className="text-xs font-bold text-neutral-800">No Shifts Available</h3>
            <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
              No shift slots found for the selected filter or hub zone.
            </p>
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const isBooked = slot.status === 'BOOKED';
            const isFilled = slot.status === 'FILLED';
            const isLocked = slot.status === 'LOCKED';
            const capacityRatio = slot.bookedCount / slot.capacityLimit;

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-2xl border p-3.5 transition-all shadow-2xs ${
                  isBooked
                    ? 'border-emerald-400/80 ring-1 ring-emerald-400/20 bg-emerald-50/15'
                    : 'border-neutral-200/80 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#009DE0]" />
                      <span className="text-xs font-black text-neutral-900">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">({slot.shiftName})</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
                      {slot.zoneName}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isBooked ? (
                      <Badge variant="emerald" size="sm" dot>
                        Booked
                      </Badge>
                    ) : isFilled ? (
                      <Badge variant="neutral" size="sm">
                        Full
                      </Badge>
                    ) : isLocked ? (
                      <Badge variant="amber" size="sm">
                        <Lock className="w-3 h-3 inline mr-1" />
                        {slot.tierAccessRequired} Only
                      </Badge>
                    ) : (
                      <Badge variant="brand" size="sm">
                        Open
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Metrics: Guarantee & Capacity */}
                <div className="flex items-center justify-between py-2 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-medium block">
                      Min Guarantee
                    </span>
                    <span className="text-xs sm:text-sm font-black text-neutral-900">
                      ₹{slot.minEarningsGuarantee}
                    </span>
                  </div>

                  <div className="text-right w-36">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 mb-1">
                      <span>Capacity</span>
                      <span className="text-neutral-800 font-mono font-bold">
                        {slot.bookedCount}/{slot.capacityLimit}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
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

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Instant wallet guarantee</span>
                  </div>

                  {isBooked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelSlot(slot)}
                      className="h-8 px-3 rounded-xl text-xs text-rose-600 hover:bg-rose-50 border-rose-200 font-bold"
                    >
                      Cancel
                    </Button>
                  ) : isFilled ? (
                    <Button variant="secondary" size="sm" disabled className="h-8 px-3 rounded-xl text-xs opacity-60">
                      Full
                    </Button>
                  ) : isLocked ? (
                    <Button variant="secondary" size="sm" disabled className="h-8 px-3 rounded-xl text-xs opacity-60">
                      Locked
                    </Button>
                  ) : (
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleBookSlot(slot)}
                      className="h-8 px-4 rounded-xl text-xs font-bold"
                    >
                      Book Slot
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
