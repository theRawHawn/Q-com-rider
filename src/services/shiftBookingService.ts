/**
 * QCOM Gig & Shift Booking Service (Swiggy / Zomato Delivery Partner Model)
 * Manages 7-day horizon delivery gigs, peak windows, and surge multipliers.
 */

import { ShiftSlot, PartnerTier } from '../types/delivery';
import { INITIAL_SHIFT_SLOTS } from './mockData';

const SHIFT_STORAGE_KEY = 'qcom_gigs_slots_v5';

class ShiftBookingService {
  private slots: ShiftSlot[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(SHIFT_STORAGE_KEY);
      if (stored) {
        this.slots = JSON.parse(stored);
        return;
      }
    } catch (e) {
      console.warn('Could not read stored gig slots', e);
    }
    this.slots = [...INITIAL_SHIFT_SLOTS];
  }

  private saveState() {
    try {
      localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(this.slots));
    } catch (e) {
      console.warn('Could not save gig slots', e);
    }
  }

  public getWeekDays(): { dateStr: string; label: string; dayName: string; dayNumber: string; isToday: boolean }[] {
    const days: { dateStr: string; label: string; dayName: string; dayNumber: string; isToday: boolean }[] = [];
    // Anchor to 2026-09-22 (Monday)
    const baseDate = new Date('2026-09-22T00:00:00');

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate().toString();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      days.push({
        dateStr,
        label: `${dayName}, ${dayNumber} ${monthName}`,
        dayName,
        dayNumber,
        isToday: i === 0,
      });
    }

    return days;
  }

  public getHubZones(): { id: string; name: string }[] {
    return [
      { id: 'ALL', name: 'All Delivery Clusters' },
      { id: 'HUB-INDIRANAGAR', name: 'Indiranagar Central Cluster' },
      { id: 'HUB-KORAMANGALA', name: 'Koramangala 4th Block Cluster' },
      { id: 'HUB-HSR', name: 'HSR Layout 27th Main Cluster' },
    ];
  }

  public getShiftSlots(selectedDate?: string, hubId?: string): ShiftSlot[] {
    return this.slots.filter((slot) => {
      if (selectedDate && slot.dateStr !== selectedDate) {
        return false;
      }
      if (hubId && hubId !== 'ALL' && slot.hubId !== hubId) {
        return false;
      }
      return true;
    });
  }

  public bookShiftSlot(slotId: string, partnerTier: PartnerTier = 'PLATINUM'): { success: boolean; slot?: ShiftSlot; message: string } {
    const slotIndex = this.slots.findIndex((s) => s.id === slotId);
    if (slotIndex === -1) {
      return { success: false, message: 'Gig slot not found' };
    }

    const slot = this.slots[slotIndex];

    if (slot.status === 'BOOKED') {
      return { success: false, message: 'You have already booked this gig' };
    }

    if (slot.status === 'FILLED' || slot.bookedCount >= slot.capacityLimit) {
      return { success: false, message: 'This gig is at maximum capacity' };
    }

    // Check tier access
    const tierRanks: Record<PartnerTier, number> = {
      BRONZE: 1,
      SILVER: 2,
      GOLD: 3,
      PLATINUM: 4,
    };

    if (tierRanks[partnerTier] < tierRanks[slot.tierAccessRequired]) {
      return {
        success: false,
        message: `Requires ${slot.tierAccessRequired} tier access. Your tier is ${partnerTier}.`,
      };
    }

    const updatedSlot: ShiftSlot = {
      ...slot,
      bookedCount: slot.bookedCount + 1,
      status: 'BOOKED',
    };

    this.slots[slotIndex] = updatedSlot;
    this.saveState();

    return {
      success: true,
      slot: updatedSlot,
      message: `Gig confirmed! ${slot.shiftName} (${slot.startTime} - ${slot.endTime})`,
    };
  }

  public cancelShiftBooking(slotId: string): { success: boolean; slot?: ShiftSlot; message: string } {
    const slotIndex = this.slots.findIndex((s) => s.id === slotId);
    if (slotIndex === -1) {
      return { success: false, message: 'Gig not found' };
    }

    const slot = this.slots[slotIndex];
    if (slot.status !== 'BOOKED') {
      return { success: false, message: 'Gig is not currently booked' };
    }

    const updatedSlot: ShiftSlot = {
      ...slot,
      bookedCount: Math.max(0, slot.bookedCount - 1),
      status: 'AVAILABLE',
    };

    this.slots[slotIndex] = updatedSlot;
    this.saveState();

    return {
      success: true,
      slot: updatedSlot,
      message: `Gig cancelled: ${slot.shiftName}`,
    };
  }
}

export const shiftBookingService = new ShiftBookingService();
