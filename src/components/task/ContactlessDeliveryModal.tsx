import React, { useState } from 'react';
import { Camera, CheckCircle2, MapPin, Clock, ShieldCheck, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface ContactlessDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmProof: (note?: string) => void;
  customerName: string;
  orderNumber: string;
}

export const ContactlessDeliveryModal: React.FC<ContactlessDeliveryModalProps> = ({
  isOpen,
  onClose,
  onConfirmProof,
  customerName,
  orderNumber,
}) => {
  const { showToast } = useToast();
  const [photoTaken, setPhotoTaken] = useState(false);
  const [doorNote, setDoorNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleCapturePhoto = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setPhotoTaken(true);
      showToast('Doorstep package photo captured with GPS watermark.', 'info');
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTaken) {
      showToast('Please capture photo proof before completing', 'error');
      return;
    }
    onConfirmProof(doorNote || 'Left at doorstep as instructed');
    onClose();
  };

  const nowTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-neutral-900">
              Contactless Proof-of-Delivery
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-neutral-600">
          <p>
            Place order at customer's doorstep or security desk and take a clear photo showing the parcel and house number.
          </p>
        </div>

        {/* Camera Viewfinder Simulation */}
        <div className="relative rounded-2xl bg-neutral-100 aspect-4/3 flex flex-col items-center justify-center overflow-hidden border border-neutral-200">
          {photoTaken ? (
            <div className="relative w-full h-full bg-neutral-800 flex items-center justify-center">
              {/* Simulated Doorstep Delivery Photo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="text-center z-10 space-y-1">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <span className="text-xs font-bold text-white block">
                  Photo Proof Verified
                </span>
                <span className="text-[10px] text-neutral-300">
                  EXIF & GPS Geotagged
                </span>
              </div>

              {/* Watermark Overlay */}
              <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/90 font-mono bg-black/50 p-1.5 rounded-lg backdrop-blur-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span>ORD: {orderNumber}</span>
                  <span>{nowTime}</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-neutral-300">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>12.9716° N, 77.5946° E (±2.1m precision)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 space-y-3">
              <Camera className="w-10 h-10 text-neutral-400 mx-auto" />
              <div className="text-xs text-neutral-500 font-medium">
                <span>Align package & door entry in frame</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCapturePhoto}
                disabled={isUploading}
                className="font-bold text-xs"
              >
                {isUploading ? 'Capturing Watermark...' : 'Take Doorstep Photo'}
              </Button>
            </div>
          )}
        </div>

        {photoTaken && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Drop Location Note (Optional)
              </label>
              <input
                type="text"
                value={doorNote}
                onChange={(e) => setDoorNote(e.target.value)}
                placeholder="e.g. Left on shoe rack near flat 302"
                className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhotoTaken(false)}
              >
                Retake
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                Confirm & Complete Delivery
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
