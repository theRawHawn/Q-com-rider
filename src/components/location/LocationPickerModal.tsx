import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, RefreshCw, Radio } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { partner } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerifyLocation = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setVerified(true);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rider Location Verification"
      subtitle="Verify GPS position for auto-assignment & geofence compliance"
      maxWidth="md"
    >
      <div className="space-y-3">
        {/* Current Location Status Card */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-semibold">Assigned Delivery Zone:</span>
            <span className="font-extrabold text-neutral-900 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
              {partner.assignedHubName}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60">
            <span className="text-neutral-500 font-semibold">GPS Precision:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              High Accuracy (&lt; 5 meters)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
            <span>Coordinates: 12.9716° N, 77.5946° E</span>
            <span>Updated Just Now</span>
          </div>
        </div>

        {verified && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Location verified successfully! Dispatch system updated.</span>
          </div>
        )}

        <div className="pt-2 flex gap-2">
          <Button
            variant="brand"
            fullWidth
            onClick={handleVerifyLocation}
            disabled={isUpdating}
            icon={
              isUpdating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )
            }
          >
            {isUpdating ? 'Pinging Satellites...' : 'Verify My Location Now'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
