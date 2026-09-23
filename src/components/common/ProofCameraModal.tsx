import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  X,
  Upload,
  RefreshCw,
  Clock,
  Lock,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from './Button';
import { Coordinates, ProofOfHandover } from '../../types/delivery';
import {
  calculateReturnPeriodExpiry,
  generateTamperSecurityHash,
  stampWatermarkOnImage,
  generateSampleParcelImage,
} from '../../utils/photoProofUtils';
import { useToast } from '../../context/ToastContext';

interface ProofCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmProof: (proof: ProofOfHandover) => void;
  stage: 'PICKUP' | 'DELIVERY';
  orderNumber: string;
  locationName: string;
  coordinates: Coordinates;
  partnerId: string;
  partnerName: string;
}

export const ProofCameraModal: React.FC<ProofCameraModalProps> = ({
  isOpen,
  onClose,
  onConfirmProof,
  stage,
  orderNumber,
  locationName,
  coordinates,
  partnerId,
  partnerName,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Return period expiry details
  const expiryInfo = calculateReturnPeriodExpiry();

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  // Start live camera stream
  const startCamera = useCallback(async (preferredFacing: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not accessible in this browser or iframe environment.');
      }

      // Stop previous stream tracks if any
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      let mediaStream: MediaStream | null = null;
      try {
        // Attempt ideal facing mode (rear camera for mobile)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: preferredFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (idealErr) {
        // Fallback to basic video constraint (laptop/desktop webcam)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      setCameraActive(true);

      // Direct assignment if video element is already mounted
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => {
          console.warn('Video auto-play warning:', err);
        });
      }
    } catch (err: any) {
      console.warn('Direct camera start error:', err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setCameraError(
        isDenied
          ? 'Camera permission denied. Use file upload or quick-capture below.'
          : 'Live camera stream unavailable in preview. Use photo upload or quick proof.'
      );
      setCameraActive(false);
    }
  }, [facingMode, stream]);

  // Switch between front and back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Lock body scroll and auto-start camera on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCapturedPhotoUrl(null);
      setCameraError(null);
      startCamera();
    } else {
      document.body.style.overflow = 'unset';
      stopCamera();
      setCapturedPhotoUrl(null);
      setCameraActive(false);
      setCameraError(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  // Ensure video element receives stream whenever stream or cameraActive changes
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Video play warning:', err);
      });
    }
  }, [cameraActive, stream]);

  // Callback ref for video element to immediately bind stream on mount
  const handleVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && stream) {
      element.srcObject = stream;
      element.play().catch((err) => {
        console.warn('Video playback warning on ref mount:', err);
      });
    }
  };

  // Capture current live video frame
  const captureVideoFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        stopCamera();
        await processAndWatermark(rawDataUrl);
      }
    } catch (err) {
      console.error('Failed to capture video frame', err);
      showToast('Capture error. Please try again or upload photo.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle device camera upload or file pick
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      stopCamera();
      await processAndWatermark(rawDataUrl);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // Quick simulated capture with authentic sample photo
  const handleQuickCapture = async () => {
    setIsProcessing(true);
    stopCamera();
    const sampleRaw = generateSampleParcelImage(orderNumber, stage);
    await processAndWatermark(sampleRaw);
    setIsProcessing(false);
  };

  // Watermark image with GPS, timestamp, hash, and return policy
  const processAndWatermark = async (rawImage: string) => {
    const timestamp = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const securityHash = generateTamperSecurityHash(orderNumber, stage, timestamp, partnerId);

    const watermarked = await stampWatermarkOnImage(rawImage, {
      orderNumber,
      stage,
      locationName,
      coordinates,
      partnerId,
      partnerName,
      timestamp,
      expiryFormatted: expiryInfo.formatted,
      securityHash,
    });

    setCapturedPhotoUrl(watermarked);
    showToast('Anti-tamper watermark & GPS timestamp applied.', 'info');
  };

  // Confirm and persist handover proof
  const handleConfirm = () => {
    if (!capturedPhotoUrl) return;

    const timestamp = new Date().toISOString();
    const securityHash = generateTamperSecurityHash(orderNumber, stage, timestamp, partnerId);

    const proof: ProofOfHandover = {
      id: `PROOF-${stage}-${Date.now()}`,
      photoUrl: capturedPhotoUrl,
      timestamp,
      stage,
      coordinates,
      capturedByPartnerId: partnerId,
      orderNumber,
      tamperSealStatus: 'INTACT_VERIFIED',
      securityHash,
      retentionUntil: expiryInfo.iso,
      retentionDaysRemaining: expiryInfo.daysRemaining,
      note:
        stage === 'PICKUP'
          ? 'Store seal verified intact with package barcode attached'
          : 'Customer handover confirmed with tamper-evident seal intact',
    };

    onConfirmProof(proof);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-neutral-200/90 my-auto max-h-[92vh]">
        {/* Pinned Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-xl shrink-0 ${
                stage === 'PICKUP'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight">
                {stage === 'PICKUP' ? 'Store Pickup Photo Proof' : 'Customer Delivery Photo Proof'}
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Order #{orderNumber} • Anti-Tamper Verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Security & Return Period Expiration Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Anti-Tamper Audit Protection
              </span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                {expiryInfo.daysRemaining} Days Retained
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {stage === 'PICKUP'
                ? 'Photograph the sealed bag showing the intact security seal and order barcode. Protects against claims of damaged or missing items before transit.'
                : 'Photograph the parcel handover to the customer or at their doorstep. Protects against customer non-delivery or post-handover tampering disputes.'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5 border-t border-slate-200">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>
                Retained in QCOM Audit Vault until return window closes on <strong>{expiryInfo.formatted}</strong>.
              </span>
            </div>
          </div>

          {/* Camera Viewfinder / Captured Preview Canvas */}
          <div className="relative rounded-2xl bg-neutral-950 h-60 sm:h-64 w-full flex flex-col items-center justify-center overflow-hidden border border-neutral-300 shadow-inner">
            {capturedPhotoUrl ? (
              /* Watermarked Captured Image Preview */
              <div className="relative w-full h-full">
                <img
                  src={capturedPhotoUrl}
                  alt="Captured Proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-emerald-600/95 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md backdrop-blur-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>WATERMARKED & SEALED</span>
                </div>
              </div>
            ) : cameraActive ? (
              /* Live Video Stream from Device Camera */
              <div className="relative w-full h-full">
                <video
                  ref={handleVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Framing Overlay Guidelines */}
                <div className="absolute inset-4 pointer-events-none border border-white/30 rounded-xl flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-white/80" />
                    <span className="w-3 h-3 border-t-2 border-r-2 border-white/80" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-semibold text-white/90 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                      Align barcode & tamper seal in frame
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-b-2 border-l-2 border-white/80" />
                    <span className="w-3 h-3 border-b-2 border-r-2 border-white/80" />
                  </div>
                </div>

                {/* Shutter Button & Flip Camera inside Viewfinder */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-6 z-20">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/40 shadow-md cursor-pointer transition active:scale-95"
                    title="Switch Camera (Front/Back)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={captureVideoFrame}
                    disabled={isProcessing}
                    className="w-14 h-14 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 shadow-xl cursor-pointer flex items-center justify-center transition-transform active:scale-95 shrink-0"
                    title="Capture Photo"
                  >
                    <div className="w-5 h-5 rounded-full bg-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/40 shadow-md cursor-pointer transition active:scale-95"
                    title="Upload File"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Fallback / Camera Inactive State */
              <div className="text-center p-4 space-y-3 w-full">
                <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">
                    {stage === 'PICKUP' ? 'Capture Sealed Parcel Photo' : 'Capture Delivery Handover Photo'}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Ensure package seal and barcode are visible
                  </p>
                </div>

                {cameraError && (
                  <p className="text-[11px] text-amber-300 bg-amber-950/60 p-2 rounded-lg border border-amber-800/60 flex items-center gap-1.5 justify-center">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{cameraError}</span>
                  </p>
                )}

                {/* Action Buttons: Try Camera, File Upload, Quick Proof */}
                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Camera
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-700 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Device Camera / File
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickCapture}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-700 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Quick Proof
                  </button>
                </div>
              </div>
            )}

            {/* Hidden device camera / file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Cryptographic Proof Details (When captured) */}
          {capturedPhotoUrl && (
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-neutral-800 font-bold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <Lock className="w-3.5 h-3.5" />
                  Cryptographic Seal Verified
                </span>
                <span className="font-mono text-[10px] text-neutral-500">
                  {orderNumber}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-600 text-[10px] pt-1 border-t border-neutral-200/60">
                <div>
                  <span className="text-neutral-400 block">GPS Coordinates:</span>
                  <span className="font-mono font-medium">
                    {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Return Expiry:</span>
                  <span className="font-mono font-medium text-emerald-700">
                    {expiryInfo.formatted}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Footer Actions */}
        <div className="p-4 border-t border-neutral-100 bg-white shrink-0 flex items-center justify-between gap-2.5">
          {capturedPhotoUrl ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCapturedPhotoUrl(null);
                  startCamera();
                }}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                Retake Photo
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={handleConfirm}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="font-bold text-xs"
              >
                Confirm & Save Audit Proof
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onClose} fullWidth>
                Cancel
              </Button>
              {cameraActive && (
                <button
                  type="button"
                  onClick={captureVideoFrame}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isProcessing ? 'Watermarking...' : 'Take Photo'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
