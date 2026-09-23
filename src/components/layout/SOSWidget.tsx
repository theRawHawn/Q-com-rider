import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { locationService } from '../../services/locationService';

interface SOSWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSWidget: React.FC<SOSWidgetProps> = ({ isOpen, onClose }) => {
  const { partner } = useAuth();
  const { activeTask } = useTask();
  const [triggeredAlert, setTriggeredAlert] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTriggerSos = () => {
    setLoading(true);
    setTimeout(() => {
      const alert = locationService.triggerEmergencySos(partner.id, activeTask?.id);
      setTriggeredAlert(alert);
      setLoading(false);
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emergency Safety SOS"
      subtitle="QCOM High-Priority Dispatch Emergency Assist"
    >
      {!triggeredAlert ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-8 h-8 animate-bounce" />
          </div>

          <div>
            <h4 className="text-base font-bold text-neutral-900">Are you in immediate danger or distress?</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Pressing SOS will broadcast your exact live GPS location, partner code ({partner.partnerCode}), and active order trace directly to QCOM Emergency Response & Local Authorities.
            </p>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-left text-xs space-y-1">
            <p className="font-semibold text-neutral-700">Live Telemetry Details Sent:</p>
            <p className="text-neutral-500">
              Partner: <span className="font-bold text-neutral-800">{partner.name}</span> ({partner.phone})
            </p>
            <p className="text-neutral-500">
              Vehicle: <span className="font-bold text-neutral-800">{partner.vehicleNumber}</span>
            </p>
            {activeTask && (
              <p className="text-neutral-500">
                Active Order: <span className="font-bold text-neutral-800">{activeTask.orderNumber}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleTriggerSos} loading={loading} fullWidth icon={<ShieldAlert className="w-4 h-4" />}>
              TRIGGER SOS
            </Button>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-600">
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>Direct QCOM Safety Hotline: <strong>1800-419-9090</strong></span>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-base font-bold text-neutral-900">Emergency Alert Dispatched</h4>
            <p className="text-xs text-neutral-600 mt-1">
              Alert ID: <strong>{triggeredAlert.alertId}</strong>. QCOM Dispatch Center in {triggeredAlert.assignedDispatchManager} has been notified.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs text-left border border-emerald-200 space-y-1">
            <p className="font-bold">Next Actions:</p>
            <p>1. Stay in a safe, visible location if possible.</p>
            <p>2. QCOM Safety Team is calling your registered phone ({partner.phone}).</p>
            <p>3. Nearby active fleet captains have been alerted to assist.</p>
          </div>

          <Button variant="primary" onClick={onClose} fullWidth>
            Acknowledge & Close
          </Button>
        </div>
      )}
    </Modal>
  );
};
