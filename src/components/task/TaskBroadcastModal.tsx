import React from 'react';
import { MapPin, Clock, DollarSign, Package, Check, Zap, ArrowRight } from 'lucide-react';
import { DeliveryTask } from '../../types/delivery';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTask } from '../../context/TaskContext';

interface TaskBroadcastModalProps {
  task: DeliveryTask;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskBroadcastModal: React.FC<TaskBroadcastModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { acceptBroadcastTask } = useTask();

  const handleAccept = () => {
    acceptBroadcastTask(task.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delivery Request ${task.orderNumber}`}
      subtitle="Review task details & guaranteed payout before accepting"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Payout Hero Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-950 flex items-center justify-between border border-emerald-200 shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Guaranteed Partner Earnings
            </span>
            <div className="text-2xl font-black text-emerald-950 mt-0.5">
              ₹{task.payoutBreakdown.totalPayout}
            </div>
            <span className="text-xs text-emerald-800/80 font-medium">
              Base ₹{task.payoutBreakdown.basePay} + Distance ₹{task.payoutBreakdown.distancePay} + Bonus ₹{task.payoutBreakdown.surgeBonus}
            </span>
          </div>
          <Badge variant="emerald" size="md">
            {task.route.distanceKm} km · ~{task.route.formattedEta}
          </Badge>
        </div>

        {/* Pickup Store Section */}
        <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Pickup: {task.pickup.storeName}
            </span>
            <Badge variant="indigo" size="sm">
              PACKED & READY
            </Badge>
          </div>
          <p className="text-neutral-600 pl-5">{task.pickup.address}</p>
          {task.pickup.pickupNotes && (
            <p className="text-neutral-500 pl-5 text-[11px] italic bg-white p-2 rounded-lg border border-neutral-200/60 mt-1">
              Note: {task.pickup.pickupNotes}
            </p>
          )}
        </div>

        {/* Dropoff Customer Section */}
        <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Dropoff: {task.drop.customerName}
            </span>
            {task.drop.businessName && (
              <span className="text-[11px] text-neutral-500 font-medium">
                {task.drop.businessName}
              </span>
            )}
          </div>
          <p className="text-neutral-600 pl-5">{task.drop.address}</p>
        </div>

        {/* Package & Handover Information */}
        <div className="border-t border-neutral-100 pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              Package & Handover Assignment
            </span>
            <span className="text-neutral-500 font-mono text-[11px]">Ref: {task.orderNumber}</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <p className="font-bold text-neutral-900">1 Sealed Bag / Parcel</p>
                <p className="text-[11px] text-neutral-500">Pick up with seller verification • Deliver with customer OTP</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 font-mono block">Weight</span>
              <span className="font-bold text-neutral-800">~1.8 kg</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" onClick={onClose} fullWidth>
            Reject
          </Button>
          <Button variant="brand" onClick={handleAccept} fullWidth icon={<Zap className="w-4 h-4" />}>
            Start order
          </Button>
        </div>
      </div>
    </Modal>
  );
};
