import React, { useState } from 'react';
import { Banknote, CheckCircle2, AlertTriangle, Calculator, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface CodCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (amount: number) => void;
  orderTotal: number;
  orderNumber: string;
}

export const CodCollectionModal: React.FC<CodCollectionModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  orderTotal,
  orderNumber,
}) => {
  const { showToast } = useToast();
  const [cashTendered, setCashTendered] = useState<string>(orderTotal.toString());

  if (!isOpen) return null;

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeToReturn = Math.max(0, tenderedNum - orderTotal);
  const isInsufficient = tenderedNum < orderTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficient) {
      showToast(`Cannot collect less than order total of ₹${orderTotal}`, 'error');
      return;
    }
    onConfirmPayment(orderTotal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Banknote className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-neutral-900">
              Collect Cash on Delivery (COD)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bill Amount */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-center space-y-0.5">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Total COD Due
          </span>
          <div className="text-3xl font-black text-neutral-900">
            ₹{orderTotal.toFixed(2)}
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            Order: {orderNumber}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Cash Handed by Customer (₹)
            </label>
            <input
              type="number"
              step="1"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              className="w-full text-lg font-black text-neutral-900 px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#f25100]"
              placeholder="Enter cash given"
              required
            />
          </div>

          {/* Change to Return Calculator */}
          <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#f25100]" />
              <span className="font-bold text-neutral-800">Change to Return:</span>
            </div>
            <span
              className={`text-base font-black ${
                isInsufficient ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {isInsufficient ? 'Short by ₹' + (orderTotal - tenderedNum) : '₹' + changeToReturn.toFixed(2)}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isInsufficient}
              className="font-bold"
            >
              Confirm ₹{orderTotal} Collected
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
