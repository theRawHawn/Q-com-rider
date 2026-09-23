import React, { useState, useEffect } from 'react';
import {
  Clock,
  PhoneCall,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface CustomerUnreachableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReturnToStore: () => void;
  onTriggerIvrCall: () => void;
  customerName: string;
  orderNumber: string;
}

export const CustomerUnreachableModal: React.FC<CustomerUnreachableModalProps> = ({
  isOpen,
  onClose,
  onConfirmReturnToStore,
  onTriggerIvrCall,
  customerName,
  orderNumber,
}) => {
  const { showToast } = useToast();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 minutes
  const [ivrCallsCount, setIvrCallsCount] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const canReturn = secondsRemaining === 0;

  const handleCall = () => {
    setIvrCallsCount((prev) => prev + 1);
    onTriggerIvrCall();
    showToast(`Sending automated high-priority IVR prompt to ${customerName}...`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-neutral-900">
              Customer Unreachable Protocol
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
          <p className="font-bold text-neutral-900">Customer: {customerName}</p>
          <p>
            Doorstep protocol requires couriers to wait 5 minutes while system fires automated IVR voice pings.
          </p>
        </div>

        {/* 5-Minute Live Countdown */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-neutral-900 text-center space-y-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Mandatory Waiting Window
          </span>
          <div className="text-4xl font-mono font-black text-amber-700">
            {timeFormatted}
          </div>
          <span className="text-[11px] text-amber-900/80 block font-medium">
            {canReturn
              ? 'Waiting window elapsed. Return to hub authorized.'
              : `${secondsRemaining}s remaining before return unlock`}
          </span>
        </div>

        {/* IVR Call Action */}
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-neutral-900 block">Automated IVR Trigger</span>
            <span className="text-[11px] text-neutral-500">
              {ivrCallsCount} call attempt{ivrCallsCount > 1 ? 's' : ''} logged
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCall}
            icon={<PhoneCall className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-xs font-bold"
          >
            Ping IVR Again
          </Button>
        </div>

        {/* Compensation Protection Note */}
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Courier Trip Compensation Guaranteed</span>
          </div>
          <p className="text-emerald-800">
            If customer remains unreachable, you receive 100% of order payout + ₹25 Return Fee upon handing items back to the seller store.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Customer Responded
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canReturn}
            onClick={() => {
              onConfirmReturnToStore();
              onClose();
            }}
            className="font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Return to Store (+₹25)
          </Button>
        </div>
      </div>
    </div>
  );
};
