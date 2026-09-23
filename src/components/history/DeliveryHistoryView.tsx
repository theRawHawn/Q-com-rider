import React, { useState } from 'react';
import {
  History,
  Search,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  Camera,
  ShieldCheck,
  Lock,
  Package,
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DeliveryTask } from '../../types/delivery';

export const DeliveryHistoryView: React.FC = () => {
  const { completedHistory } = useTask();
  const [activeSegment, setActiveSegment] = useState<'shifts' | 'trips'>('trips');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<DeliveryTask | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Mock Shifts Data for the delivery partner
  const shifts = [
    {
      id: 'shift-1',
      dateLabel: 'Today (Tue, 22 Sep)',
      timeSlot: '11:00 AM - 02:00 PM',
      hubName: 'Indiranagar Hub 04',
      status: 'active',
      statusLabel: 'CURRENT SHIFT',
      minGuarantee: '₹450 Min Guarantee',
      targetOrders: '4 of 6 orders done',
    },
    {
      id: 'shift-2',
      dateLabel: 'Today (Tue, 22 Sep)',
      timeSlot: '05:00 PM - 08:00 PM',
      hubName: 'Indiranagar Hub 04',
      status: 'upcoming',
      statusLabel: 'CONFIRMED',
      minGuarantee: '₹550 Peak Guarantee',
      targetOrders: 'Evening Repair Surge Eligible',
    },
    {
      id: 'shift-3',
      dateLabel: 'Tomorrow (Wed, 23 Sep)',
      timeSlot: '11:00 AM - 02:00 PM',
      hubName: 'Koramangala Hub 01',
      status: 'upcoming',
      statusLabel: 'CONFIRMED',
      minGuarantee: '₹460 Midday Guarantee',
      targetOrders: 'Auto Spares Rush Zone',
    },
    {
      id: 'shift-4',
      dateLabel: 'Yesterday (Mon, 21 Sep)',
      timeSlot: '02:00 PM - 05:00 PM',
      hubName: 'Indiranagar Hub 04',
      status: 'completed',
      statusLabel: 'COMPLETED',
      minGuarantee: 'Earned ₹620',
      targetOrders: '7 orders fulfilled',
    },
  ];

  const filteredTrips = completedHistory.filter(
    (task) =>
      task.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.pickup.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.drop.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-12">
      {/* Top Header & Segmented Pill Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight">
              {activeSegment === 'shifts' ? 'My Shifts & Schedules' : 'Trip History & Audit'}
            </h2>
            <p className="text-xs text-neutral-500">
              {activeSegment === 'shifts'
                ? 'Manage active booked slots and future fulfillment shifts'
                : `${completedHistory.length} completed quick-commerce fulfillment logs`}
            </p>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="grid grid-cols-2 p-1 bg-neutral-200/70 rounded-xl max-w-sm">
          <button
            type="button"
            onClick={() => setActiveSegment('shifts')}
            className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
              activeSegment === 'shifts'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Booked Shifts ({shifts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment('trips')}
            className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
              activeSegment === 'trips'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Completed Trips ({completedHistory.length})
          </button>
        </div>
      </div>

      {/* SEGMENT 1: BOOKED SHIFTS */}
      {activeSegment === 'shifts' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#EBF7FD] rounded-xl text-neutral-700">
                    <Calendar className="w-4 h-4 text-[#009DE0]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{shift.dateLabel}</p>
                    <p className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {shift.timeSlot}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    shift.status === 'active'
                      ? 'brand'
                      : shift.status === 'upcoming'
                      ? 'emerald'
                      : 'neutral'
                  }
                  size="sm"
                  dot={shift.status === 'active'}
                >
                  {shift.statusLabel}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100 text-neutral-600">
                <span className="font-medium text-neutral-500">{shift.hubName}</span>
                <span className="font-bold text-emerald-700">{shift.minGuarantee}</span>
              </div>
            </div>
          ))}

          {/* Book Shift CTA Banner */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 text-neutral-900 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-bold text-neutral-500">Need more earnings?</p>
              <p className="text-sm font-extrabold text-neutral-900">Book weekend high-demand slots</p>
            </div>
            <Button variant="brand" size="sm">
              Book More Slots
            </Button>
          </div>
        </div>
      )}

      {/* SEGMENT 2: COMPLETED TRIPS */}
      {activeSegment === 'trips' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number or store..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-200/80 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-[#009DE0] shadow-2xs"
            />
          </div>

          <div className="space-y-3">
            {filteredTrips.length > 0 ? (
              filteredTrips.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-4 sm:p-5 bg-white rounded-3xl border border-neutral-200/80 shadow-xs hover:border-[#009DE0]/40 transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-neutral-900 text-sm">{task.orderNumber}</span>
                      <Badge variant="emerald" size="sm">
                        DELIVERED
                      </Badge>
                    </div>
                    <span className="text-sm font-black text-[#009DE0] tabular-nums">
                      +₹{task.payoutBreakdown.totalPayout}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-neutral-600">
                    <p>
                      <strong className="text-neutral-800">Pickup:</strong> {task.pickup.storeName}
                    </p>
                    <p className="text-neutral-500 truncate">
                      <strong className="text-neutral-800">Drop:</strong> {task.drop.customerName} ({task.drop.address})
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2.5 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span>{task.deliveredAt ? new Date(task.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                      {(task.pickupProof || task.deliveryProof) && (
                        <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Vault Proofs
                        </span>
                      )}
                    </div>
                    <span className="text-[#009DE0] font-bold flex items-center gap-1">
                      View Audit <ChevronRight className="w-3.5 h-3.5 text-[#009DE0]" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200/80 my-4 text-xs text-neutral-500">
                <History className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                No completed trip records matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trip Detail Audit Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Trip Audit Log - ${selectedTask.orderNumber}`}
          subtitle="Detailed order breakdown, anti-tamper proofs & payout"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-emerald-800 text-[11px] font-bold">Partner Payout Earned</p>
                <p className="text-xl font-extrabold text-emerald-950">₹{selectedTask.payoutBreakdown.totalPayout}</p>
              </div>
              <Badge variant="emerald" size="md">
                OTP VERIFIED
              </Badge>
            </div>

            <div className="space-y-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
              <p><strong>Store:</strong> {selectedTask.pickup.storeName}</p>
              <p><strong>Customer:</strong> {selectedTask.drop.customerName}</p>
              <p><strong>Address:</strong> {selectedTask.drop.address}</p>
              <p><strong>Payment Method:</strong> {selectedTask.paymentMethod}</p>
            </div>

            {/* Anti-Tamper Photo Proofs Section */}
            {(selectedTask.pickupProof || selectedTask.deliveryProof) && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Tamper-Evident Photo Audit Vault
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                    7-Day Retention Shield
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Store Pickup Proof */}
                  {selectedTask.pickupProof && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-emerald-600" />
                          Store Pickup Proof
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                          SEAL INTACT
                        </span>
                      </div>
                      <div
                        onClick={() => setPreviewPhotoUrl(selectedTask.pickupProof?.photoUrl || null)}
                        className="relative group cursor-pointer overflow-hidden rounded-lg aspect-4/3 bg-neutral-900 border border-neutral-200"
                      >
                        <img
                          src={selectedTask.pickupProof.photoUrl}
                          alt="Store Pickup Proof"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                          Click to Expand
                        </div>
                      </div>
                      <div className="space-y-0.5 text-[10px] text-slate-600">
                        <p className="font-mono text-[9px] text-slate-500 truncate">
                          {selectedTask.pickupProof.securityHash}
                        </p>
                        <p className="text-slate-500">
                          {selectedTask.pickupProof.timestamp}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Customer Delivery Proof */}
                  {selectedTask.deliveryProof && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Customer Handover Proof
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                          DELIVERED
                        </span>
                      </div>
                      <div
                        onClick={() => setPreviewPhotoUrl(selectedTask.deliveryProof?.photoUrl || null)}
                        className="relative group cursor-pointer overflow-hidden rounded-lg aspect-4/3 bg-neutral-900 border border-neutral-200"
                      >
                        <img
                          src={selectedTask.deliveryProof.photoUrl}
                          alt="Customer Delivery Proof"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                          Click to Expand
                        </div>
                      </div>
                      <div className="space-y-0.5 text-[10px] text-slate-600">
                        <p className="font-mono text-[9px] text-slate-500 truncate">
                          {selectedTask.deliveryProof.securityHash}
                        </p>
                        <p className="text-slate-500">
                          {selectedTask.deliveryProof.timestamp}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p className="font-bold text-neutral-900">Payout Breakdown:</p>
              <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5 border border-neutral-200/60">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Base Pickup Pay</span>
                  <span className="font-bold">₹{selectedTask.payoutBreakdown.basePay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Distance Pay ({selectedTask.route.distanceKm} km)</span>
                  <span className="font-bold">₹{selectedTask.payoutBreakdown.distancePay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Surge / Peak Incentive</span>
                  <span className="font-bold">₹{selectedTask.payoutBreakdown.surgeBonus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer Tip</span>
                  <span className="font-bold">₹{selectedTask.payoutBreakdown.customerTip}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Full Photo Lightbox Modal */}
      {previewPhotoUrl && (
        <div
          onClick={() => setPreviewPhotoUrl(null)}
          className="fixed inset-0 z-60 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-300">
            <img
              src={previewPhotoUrl}
              alt="Audit Watermarked Proof Full"
              className="w-full h-auto max-h-[80vh] object-contain bg-neutral-950"
            />
            <div className="p-3 bg-neutral-900 text-white flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">Cryptographically Sealed & Watermarked</span>
              <span className="text-neutral-400">Click anywhere to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
