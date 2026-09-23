import React, { useState } from 'react';
import { Banknote, CheckCircle2, AlertTriangle, Calculator, X, ShieldCheck, QrCode } from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

/**
 * ============================================================================
 * BACKEND INTEGRATION SPECIFICATION: Cash On Delivery (COD) Handover Protocol
 * ============================================================================
 * 
 * In Quick-Commerce operations, Cash on Delivery does NOT require a customer OTP
 * because physical currency exchange (or dynamic doorstep UPI QR settlement) serves 
 * as non-repudiable proof of delivery.
 * 
 * When integrating real QCOM Backend:
 * - API Endpoint: POST /api/v1/delivery/tasks/:taskId/collect-cod
 * - Payload:
 *   {
 *     taskId: string,
 *     orderId: string,
 *     amountCollected: number,
 *     paymentMode: 'CASH' | 'DOORSTEP_UPI',
 *     tenderedAmount: number,
 *     changeReturned: number,
 *     collectedAt: ISO8601Timestamp,
 *     coordinates: { lat: number, lng: number }
 *   }
 * - Server Side Actions:
 *   1. Transition order state: 'out_for_delivery' -> 'delivered'
 *   2. Update order payment status: 'PENDING_COD' -> 'PAID'
 *   3. Increment Delivery Partner's floating cash ledger (Cash in Hand)
 *   4. Credit Delivery Partner's delivery fee & incentives to wallet
 *   5. Emit real-time WebSocket event to Customer App & Seller Portal
 * ============================================================================
 */

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
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'DYNAMIC_UPI'>('CASH');

  if (!isOpen) return null;

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeToReturn = Math.max(0, tenderedNum - orderTotal);
  const isInsufficient = tenderedNum < orderTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMode === 'CASH' && isInsufficient) {
      showToast(`Cannot collect less than order total of ₹${orderTotal}`, 'error');
      return;
    }

    // Handover verified by payment - complete delivery directly without OTP
    onConfirmPayment(orderTotal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900">
                Collect COD Payment
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                Order: <span className="font-mono font-bold text-neutral-700">{orderNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bill Amount Display */}
        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-center space-y-0.5">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Total Cash Due
          </span>
          <div className="text-3xl font-black text-neutral-900">
            ₹{orderTotal.toFixed(2)}
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Payment acts as Delivery Verification (No OTP needed)</span>
          </div>
        </div>

        {/* Payment Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
          <button
            type="button"
            onClick={() => setPaymentMode('CASH')}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentMode === 'CASH'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash Tendered</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode('DYNAMIC_UPI')}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentMode === 'DYNAMIC_UPI'
                ? 'bg-white text-[#009DE0] shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Doorstep UPI QR</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {paymentMode === 'CASH' ? (
            <>
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Cash Handed by Customer (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full text-lg font-black text-neutral-900 px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#009DE0] focus:ring-1 focus:ring-[#009DE0]"
                  placeholder="Enter cash given"
                  required
                />
              </div>

              {/* Quick Bill Preset Buttons */}
              <div className="flex gap-1.5">
                {[orderTotal, Math.ceil(orderTotal / 100) * 100, Math.ceil(orderTotal / 500) * 500].filter((v, i, a) => a.indexOf(v) === i).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashTendered(amt.toString())}
                    className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-bold text-neutral-700 cursor-pointer"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Change to Return Calculator */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-neutral-600" />
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
            </>
          ) : (
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-2">
              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-20 h-20 text-neutral-900 mx-auto" />
                  <span className="text-[9px] font-bold text-[#009DE0] block">UPI Auto-Reconcile</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-600 font-medium">
                Customer scans with GPay/PhonePe/Paytm to pay <strong className="text-neutral-900">₹{orderTotal}</strong>
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl font-bold">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              disabled={paymentMode === 'CASH' && isInsufficient}
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="rounded-xl font-bold"
            >
              {paymentMode === 'CASH' ? `Collect ₹${orderTotal} & Complete` : 'Confirm Received & Complete'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
