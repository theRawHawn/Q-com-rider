import React, { useState } from 'react';
import { DollarSign, Building, CheckCircle2, Zap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { earningsService } from '../../services/earningsService';
import { useToast } from '../../context/ToastContext';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { partner } = useAuth();
  const { showToast } = useToast();
  const summary = earningsService.getSummary();

  const [amount, setAmount] = useState<string>(summary.pendingWithdrawableBalance.toString());
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amount);

    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (withdrawAmt > summary.pendingWithdrawableBalance) {
      showToast(`Maximum withdrawable balance is ₹${summary.pendingWithdrawableBalance}`, 'error');
      return;
    }

    setLoading(true);
    try {
      const upiOrAccount = partner.bankAccount.upiId || partner.bankAccount.accountNumber;
      await earningsService.requestInstantPayout(withdrawAmt, upiOrAccount);
      showToast(`Payout of ₹${withdrawAmt} released instantly!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Withdrawal failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instant Payout Withdrawal"
      subtitle="Transfer cleared partner earnings directly to your verified UPI / Bank"
    >
      <form onSubmit={handleWithdraw} className="space-y-4">
        {/* Available Balance Header */}
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
              Available Withdrawable Balance
            </span>
            <div className="text-2xl font-black text-emerald-950 mt-0.5">
              ₹{summary.pendingWithdrawableBalance}
            </div>
          </div>
          <Zap className="w-6 h-6 text-emerald-600" />
        </div>

        {/* Withdrawal Amount Input */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
            Enter Amount to Transfer (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400 text-lg">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl font-extrabold text-neutral-900 focus:border-emerald-600 focus:outline-none transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Destination Bank Account */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
          <p className="font-bold text-neutral-800 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-600" />
            Transfer Destination
          </p>
          <p className="text-neutral-600">
            UPI: <strong>{partner.bankAccount.upiId || 'vikram.singh@okaxis'}</strong>
          </p>
          <p className="text-neutral-500">
            Bank: {partner.bankAccount.bankName} (A/C: ****{partner.bankAccount.accountNumber.slice(-4)})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="brand" type="submit" loading={loading} fullWidth icon={<Zap className="w-4 h-4" />}>
            Request Instant Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
