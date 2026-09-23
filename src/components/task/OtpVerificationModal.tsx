import React, { useState } from 'react';
import { KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';
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
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  if (!activeTask) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim().length !== 4) {
      setError('Please enter a 4-digit numeric OTP.');
      return;
    }

    const verified = verifyDeliveryOtp(otp);
    if (verified) {
      onClose();
    } else {
      setError(`Incorrect OTP. Hint for testing: Use '${activeTask.deliveryOtp}'`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Customer Delivery OTP"
      subtitle={`Ask ${activeTask.drop.customerName} for the 4-digit code shown on their QCOM App`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <KeyRound className="w-7 h-7" />
        </div>

        <div>
          <h4 className="text-base font-bold text-neutral-900">Enter Delivery Pin</h4>
          <p className="text-xs text-neutral-500 mt-1">
            Order <span className="font-bold text-neutral-800">{activeTask.orderNumber}</span> · Jobsite Dropoff
          </p>
        </div>

        {/* 4-digit OTP Input */}
        <div className="flex justify-center gap-2 my-2">
          <input
            type="text"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="• • • •"
            className="w-48 h-12 text-center text-2xl font-black tracking-widest bg-neutral-50 border-2 border-neutral-300 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors"
            autoFocus
          />
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-left text-neutral-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-neutral-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy & Verification Guarantee</span>
          </div>
          <p>Once verified, ₹{activeTask.payoutBreakdown.totalPayout} is credited instantly to your partner wallet.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="brand" type="submit" fullWidth icon={<CheckCircle2 className="w-4 h-4" />}>
            Verify & Complete
          </Button>
        </div>
      </form>
    </Modal>
  );
};
