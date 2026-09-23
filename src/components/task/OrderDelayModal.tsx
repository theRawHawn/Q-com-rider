import React, { useState } from 'react';
import { Clock, AlertTriangle, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface OrderDelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelay: (reason: string) => void;
  storeName: string;
}

export const OrderDelayModal: React.FC<OrderDelayModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelay,
  storeName,
}) => {
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string>('STORE_PACKING_DELAY');

  if (!isOpen) return null;

  const reasons = [
    { id: 'STORE_PACKING_DELAY', label: 'Store is still picking and packing items' },
    { id: 'LONG_BILLING_QUEUE', label: 'Heavy rush & long dispatch counter queue' },
    { id: 'ITEM_OUT_OF_STOCK', label: 'Store staff looking for alternative stock' },
    { id: 'STORE_UNREACHABLE', label: 'Store dispatch executive not at counter' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonObj = reasons.find((r) => r.id === selectedReason);
    onConfirmDelay(reasonObj?.label || selectedReason);
    showToast('Store delay logged. Wait time compensation clock started.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-neutral-900">
              Report Store Delay
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-neutral-600 space-y-1">
          <p className="font-bold text-neutral-900">{storeName}</p>
          <p>
            Quick-commerce orders have a strict 3-minute packing SLA. If the order is not handed over, report the delay to start wait-time compensation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            {reasons.map((r) => (
              <label
                key={r.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  selectedReason === r.id
                    ? 'border-[#009DE0] bg-[#EBF7FD] text-neutral-900 ring-1 ring-[#009DE0]/20'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="delayReason"
                  value={r.id}
                  checked={selectedReason === r.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mt-0.5 accent-[#009DE0]"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-neutral-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Wait Time Payout Guarantee</span>
            </div>
            <p>
              ₹1.20 per minute credited automatically for store delays exceeding 5 minutes from arrival.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold">
              Submit & Start Timer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
