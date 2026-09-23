import React, { useState, useRef, useEffect } from 'react';
import { KeyRound, CheckCircle2, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useTask } from '../../context/TaskContext';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeTask, verifyDeliveryOtp } = useTask();
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset digits when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setError('');
      setIsSubmitting(false);
      // Auto-focus first input box
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!activeTask) return null;

  const currentOtp = digits.join('');

  const handleDigitChange = (index: number, value: string) => {
    setError('');
    const numericChar = value.replace(/[^0-9]/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = numericChar;
    setDigits(newDigits);

    // Auto-advance to next input if digit entered
    if (numericChar && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 4 digits are filled
    const fullOtp = newDigits.join('');
    if (fullOtp.length === 4 && index === 3) {
      handleVerify(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is empty
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pastedData) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    const focusIdx = Math.min(pastedData.length, 3);
    inputRefs.current[focusIdx]?.focus();

    if (pastedData.length === 4) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = (otpToVerify: string) => {
    setError('');
    if (otpToVerify.length !== 4) {
      setError('Please enter all 4 digits of the delivery OTP.');
      return;
    }

    setIsSubmitting(true);
    const verified = verifyDeliveryOtp(otpToVerify);

    if (verified) {
      onClose();
    } else {
      setIsSubmitting(false);
      setError(`Incorrect OTP. Ask customer for the 4-digit code shown in their app.`);
      // Focus first input box on error
      inputRefs.current[0]?.focus();
      inputRefs.current[0]?.select();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(currentOtp);
  };

  const handleFillDemoOtp = () => {
    if (!activeTask.deliveryOtp) return;
    const otpChars = activeTask.deliveryOtp.split('').slice(0, 4);
    setDigits(otpChars);
    handleVerify(activeTask.deliveryOtp);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Customer Delivery OTP"
      subtitle={`Ask ${activeTask.drop.customerName} for the 4-digit code shown on their QCOM App`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-center">
        {/* Key Icon Header Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#EBF7FD] border border-[#009DE0]/30 text-[#009DE0] flex items-center justify-center shadow-xs">
          <KeyRound className="w-7 h-7" />
        </div>

        <div>
          <h4 className="text-base font-black text-neutral-900 tracking-tight">
            Enter 4-Digit Delivery PIN
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            Order <span className="font-bold text-neutral-800">{activeTask.orderNumber}</span> · Doorstep Handover
          </p>
        </div>

        {/* 4 Separate Digit Input Boxes */}
        <div className="flex justify-center items-center gap-3 py-1">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = digits[index] !== '';
            const isError = Boolean(error);

            return (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digits[index]}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-13 h-15 sm:w-14 sm:h-16 text-center text-2xl font-black font-mono rounded-2xl border-2 transition-all duration-150 outline-none shadow-xs select-none ${
                  isError
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                    : isFilled
                    ? 'border-[#009DE0] bg-[#F0F9FE] text-neutral-900 focus:ring-2 focus:ring-[#009DE0]/20'
                    : 'border-neutral-200 bg-neutral-50/80 text-neutral-900 focus:border-[#009DE0] focus:bg-white focus:ring-2 focus:ring-[#009DE0]/20'
                }`}
              />
            );
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-xl border border-rose-100 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Testing Helper Pin Demo Banner */}
        <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-neutral-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#009DE0]" />
            <span>Customer App OTP: <strong className="font-mono text-neutral-900 font-bold tracking-wider">{activeTask.deliveryOtp}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleFillDemoOtp}
            className="text-[11px] font-bold text-[#009DE0] hover:underline cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {/* Privacy & Settlement Guarantee */}
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs text-left text-neutral-600 space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant Payout & Verification Guarantee</span>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Once OTP is verified, ₹{activeTask.payoutBreakdown.totalPayout} is instantly credited to your rider settlement account.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            fullWidth
            className="rounded-2xl font-bold"
          >
            Cancel
          </Button>
          <Button
            variant="brand"
            type="submit"
            disabled={currentOtp.length !== 4 || isSubmitting}
            loading={isSubmitting}
            fullWidth
            icon={<CheckCircle2 className="w-4 h-4" />}
            className="rounded-2xl font-bold"
          >
            Verify & Complete
          </Button>
        </div>
      </form>
    </Modal>
  );
};
