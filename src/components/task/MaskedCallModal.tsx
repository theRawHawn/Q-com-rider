import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, ShieldCheck, User, Store, Headset, Volume2, X } from 'lucide-react';
import { Button } from '../common/Button';

interface MaskedCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientRole: 'CUSTOMER' | 'SELLER' | 'DISPATCH_SUPPORT';
}

export const MaskedCallModal: React.FC<MaskedCallModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  recipientRole,
}) => {
  const [callState, setCallState] = useState<'CONNECTING' | 'RINGING' | 'IN_CALL' | 'ENDED'>('CONNECTING');
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setCallState('CONNECTING');
      setSeconds(0);
      return;
    }

    const t1 = setTimeout(() => setCallState('RINGING'), 1200);
    const t2 = setTimeout(() => setCallState('IN_CALL'), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (callState === 'IN_CALL') {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  if (!isOpen) return null;

  const handleEndCall = () => {
    setCallState('ENDED');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white text-neutral-900 rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-5 border border-neutral-200 text-center animate-in fade-in zoom-in-95 duration-150">
        {/* Header Privacy Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mx-auto border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Number Masking Active</span>
        </div>

        {/* Contact Avatar & Name */}
        <div className="space-y-1.5">
          <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-700">
            {recipientRole === 'SELLER' ? (
              <Store className="w-8 h-8 text-indigo-600" />
            ) : recipientRole === 'DISPATCH_SUPPORT' ? (
              <Headset className="w-8 h-8 text-amber-600" />
            ) : (
              <User className="w-8 h-8 text-emerald-600" />
            )}
          </div>
          <h3 className="text-base font-extrabold text-neutral-900 truncate px-2">{recipientName}</h3>
          <p className="text-xs text-neutral-500 font-mono">+91 80 6902 4410 (IVR Proxy)</p>
        </div>

        {/* Status & Timer */}
        <div className="py-2">
          {callState === 'CONNECTING' && (
            <span className="text-xs text-neutral-500 animate-pulse">Connecting to secure bridge...</span>
          )}
          {callState === 'RINGING' && (
            <span className="text-xs text-amber-700 font-bold">Ringing...</span>
          )}
          {callState === 'IN_CALL' && (
            <div className="space-y-1">
              <span className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                In Secure Call
              </span>
              <span className="text-2xl font-mono font-black text-neutral-900">{timeStr}</span>
            </div>
          )}
          {callState === 'ENDED' && (
            <span className="text-xs text-rose-600 font-bold">Call Disconnected</span>
          )}
        </div>

        {/* Call Controls */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
