import React, { useState } from 'react';
import {
  Banknote,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  QrCode,
  Copy,
  TrendingUp,
  ShieldAlert,
  X,
} from 'lucide-react';
import { floatingCashService } from '../../services/floatingCashService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const FloatingCashCard: React.FC = () => {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(() => floatingCashService.getSummary());
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>(
    summary.collectedCash.toString()
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const refreshSummary = () => {
    const s = floatingCashService.getSummary();
    setSummary(s);
    setDepositAmount(s.collectedCash.toString());
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid deposit amount', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = floatingCashService.depositCashViaUpi(
        amountNum,
        'qcom.settlement@hdfcbank'
      );
      setIsProcessing(false);
      if (res.success) {
        showToast(res.message, 'success');
        refreshSummary();
        setIsDepositModalOpen(false);
      } else {
        showToast(res.message, 'error');
      }
    }, 1000);
  };

  const copyVpa = () => {
    navigator.clipboard.writeText('qcom.settlement@hdfcbank');
    showToast('UPI VPA copied to clipboard', 'info');
  };

  const cashRatio = summary.collectedCash / summary.limit;
  const isNearLimit = summary.collectedCash >= summary.warningThreshold;
  const isOverLimit = summary.isBlocked;

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900">
                Floating Cash & COD Limit
              </h3>
              <p className="text-[11px] text-neutral-500">
                Cash collected from doorstep COD deliveries
              </p>
            </div>
          </div>
          <Badge
            variant={isOverLimit ? 'rose' : isNearLimit ? 'amber' : 'emerald'}
            size="sm"
            dot
          >
            {isOverLimit ? 'Limit Exceeded' : isNearLimit ? 'Deposit Due' : 'Normal'}
          </Badge>
        </div>

        {/* Amount & Ceiling Visual */}
        <div className="bg-neutral-50/80 p-3.5 rounded-xl border border-neutral-200/60">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold text-neutral-500 block uppercase tracking-wider">
                Current Cash in Hand
              </span>
              <span className="text-2xl font-black text-neutral-900">
                ₹{summary.collectedCash.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-400 block font-medium">
                Maximum Limit
              </span>
              <span className="text-sm font-extrabold text-neutral-600">
                ₹{summary.limit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-200/70 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverLimit
                  ? 'bg-rose-600'
                  : isNearLimit
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, cashRatio * 100)}%` }}
            />
          </div>
        </div>

        {/* Warning Alert if near or over limit */}
        {isOverLimit ? (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">COD Order Allocation Blocked</p>
              <p className="text-[11px] text-rose-700">
                You have reached the ₹2,500 threshold. Remit cash via UPI to unlock COD order dispatches.
              </p>
            </div>
          </div>
        ) : isNearLimit ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Approaching Cash Limit</p>
              <p className="text-[11px] text-amber-700">
                Floating cash balance is above ₹2,000. Consider remitting before starting your next trip.
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-neutral-500">
            Instant automatic reconciliation via UPI
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshSummary();
              setIsDepositModalOpen(true);
            }}
            className="text-xs font-bold"
          >
            Deposit via UPI
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* UPI Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-neutral-900">
                  Deposit Floating Cash via UPI
                </h3>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={summary.collectedCash}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-lg font-black text-neutral-900 px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Enter amount"
                  required
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Available to remit: ₹{summary.collectedCash.toFixed(2)}
                </span>
              </div>

              {/* Virtual Account / UPI VPA */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  QCOM Virtual Settlement Account
                </span>
                <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-800">
                  <span>qcom.settlement@hdfcbank</span>
                  <button
                    type="button"
                    onClick={copyVpa}
                    className="p-1 rounded-md hover:bg-neutral-200/60 text-neutral-600 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDepositModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isProcessing || summary.collectedCash <= 0}
                  className="font-bold"
                >
                  {isProcessing ? 'Verifying Transfer...' : 'Confirm UPI Transfer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
