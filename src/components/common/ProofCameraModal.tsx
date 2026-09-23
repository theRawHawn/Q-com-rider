import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  X,
  Upload,
  Clock,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Plus,
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
  const [photos, setPhotos] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Return period expiry details
  const expiryInfo = calculateReturnPeriodExpiry();

  // Normalize order number formatting (avoid ##Q88192)
  const cleanOrderNumber = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  // Start live camera stream
  const startCamera = useCallback(
    async (preferredFacing: 'environment' | 'user' = facingMode) => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not accessible in this environment.');
        }

        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }

        let mediaStream: MediaStream | null = null;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: preferredFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (idealErr) {
          // Fallback to standard video stream (e.g. laptop webcam)
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        setStream(mediaStream);
        setCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => {
            console.warn('Video playback warning:', err);
          });
        }
      } catch (err: any) {
        console.warn('Direct camera start error:', err);
        const isDenied =
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
        setCameraError(
          isDenied
            ? 'Camera access denied. Use device upload or quick proof.'
            : 'Camera unavailable in preview. Use photo upload or quick proof.'
        );
        setCameraActive(false);
      }
    },
    [facingMode, stream]
  );

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
      setPhotos([]);
      setCameraError(null);
      startCamera();
    } else {
      document.body.style.overflow = 'unset';
      stopCamera();
      setPhotos([]);
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

  // Synchronize video element with media stream
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Video play warning:', err);
      });
    }
  }, [cameraActive, stream]);

  const handleVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && stream) {
      element.srcObject = stream;
      element.play().catch((err) => {
        console.warn('Video playback warning on ref mount:', err);
      });
    }
  };

  // Process and watermark photo, then add to photos array
  const processAndAddPhoto = async (rawImage: string) => {
    if (photos.length >= 3) {
      showToast('Maximum 3 photos already added.', 'warning');
      return;
    }

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

    setPhotos((prev) => [...prev, watermarked]);
    showToast(`Photo ${photos.length + 1} added successfully.`, 'info');
  };

  // Capture frame from video feed
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
        await processAndAddPhoto(rawDataUrl);
      }
    } catch (err) {
      console.error('Failed to capture frame', err);
      showToast('Error capturing frame. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload photo from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      await processAndAddPhoto(rawDataUrl);
      setIsProcessing(false);
      // Reset input value so same file can be picked again if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Quick simulated photo capture
  const handleQuickCapture = async () => {
    setIsProcessing(true);
    const sampleRaw = generateSampleParcelImage(cleanOrderNumber, stage, photos.length + 1);
    await processAndAddPhoto(sampleRaw);
    setIsProcessing(false);
  };

  // Remove individual photo
  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Confirm and persist handover proof
  const handleConfirm = () => {
    if (photos.length < 2) {
      showToast('Please add at least 2 pictures before confirming.', 'warning');
      return;
    }

    const timestamp = new Date().toISOString();
    const securityHash = generateTamperSecurityHash(orderNumber, stage, timestamp, partnerId);

    const proof: ProofOfHandover = {
      id: `PROOF-${stage}-${Date.now()}`,
      photoUrl: photos[0],
      photoUrls: photos,
      timestamp,
      stage,
      coordinates,
      capturedByPartnerId: partnerId,
      orderNumber: cleanOrderNumber,
      tamperSealStatus: 'INTACT_VERIFIED',
      securityHash,
      retentionUntil: expiryInfo.iso,
      retentionDaysRemaining: expiryInfo.daysRemaining,
      note:
        stage === 'PICKUP'
          ? `${photos.length} store verification photos attached with intact seal`
          : `${photos.length} customer delivery handover photos attached with intact seal`,
    };

    onConfirmProof(proof);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Standard Modal Header matching app pattern */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
              {stage === 'PICKUP' ? 'Store Pickup Photo Proof' : 'Customer Delivery Photo Proof'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Order {cleanOrderNumber} · Anti-Tamper Verification
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Security & Audit Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Anti-Tamper Audit Protection
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
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

          {/* Photo Count Tracker */}
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-bold text-neutral-800">
              Photos Added: <span className="text-emerald-700">{photos.length} of 3</span>
            </span>
            <span
              className={`text-[11px] font-medium ${
                photos.length >= 2 ? 'text-emerald-600' : 'text-amber-700'
              }`}
            >
              {photos.length < 2 ? 'Min. 2 pictures required' : '✓ Minimum met (Max 3)'}
            </span>
          </div>

          {/* 3 Photo Slots Thumbnails Grid */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => {
              const photo = photos[idx];
              const isRequired = idx < 2;

              return (
                <div
                  key={idx}
                  className={`relative rounded-xl border aspect-4/3 overflow-hidden flex flex-col items-center justify-center transition-all ${
                    photo
                      ? 'border-emerald-500 bg-neutral-900 shadow-xs'
                      : 'border-dashed border-neutral-300 bg-neutral-50/80'
                  }`}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo}
                        alt={`Proof ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        title="Remove this photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        Photo {idx + 1}
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-1 text-neutral-400">
                      <Camera className="w-4 h-4 mx-auto mb-0.5 opacity-50 text-neutral-500" />
                      <span className="text-[10px] block font-bold text-neutral-700 leading-tight">
                        Photo {idx + 1}
                      </span>
                      <span
                        className={`text-[9px] block ${
                          isRequired ? 'text-amber-600 font-semibold' : 'text-neutral-400'
                        }`}
                      >
                        {isRequired ? 'Required' : 'Optional'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Viewfinder / Capture Area (Visible if less than 3 photos taken) */}
          {photos.length < 3 ? (
            <div className="relative rounded-2xl bg-neutral-950 h-48 sm:h-52 w-full flex flex-col items-center justify-center overflow-hidden border border-neutral-300 shadow-inner">
              {cameraActive ? (
                /* Live Camera Stream */
                <div className="relative w-full h-full">
                  <video
                    ref={handleVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Shutter Button & Controls inside Viewfinder */}
                  <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-6 z-20">
                    <button
                      type="button"
                      onClick={toggleFacingMode}
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/40 shadow-md cursor-pointer transition active:scale-95"
                      title="Switch Camera (Front/Back)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={captureVideoFrame}
                      disabled={isProcessing}
                      className="w-12 h-12 rounded-full border-3 border-white bg-red-600 hover:bg-red-500 shadow-xl cursor-pointer flex items-center justify-center transition-transform active:scale-95 shrink-0"
                      title="Capture Photo"
                    >
                      <div className="w-4 h-4 rounded-full bg-white" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/40 shadow-md cursor-pointer transition active:scale-95"
                      title="Upload / Device Camera"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Fallback State */
                <div className="text-center p-3 space-y-2.5 w-full">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center mx-auto">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">
                      Take Picture {photos.length + 1} of 3
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {photos.length === 0
                        ? 'Frame the security seal and order barcode'
                        : photos.length === 1
                        ? 'Frame the entire sealed parcel or handover point'
                        : 'Capture additional verification angle'}
                    </p>
                  </div>

                  {cameraError && (
                    <p className="text-[11px] text-amber-300 bg-amber-950/60 p-1.5 rounded-lg border border-amber-800/60 flex items-center gap-1.5 justify-center max-w-xs mx-auto">
                      <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{cameraError}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 justify-center pt-0.5">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Live Camera
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-neutral-700 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Device Camera
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickCapture}
                      className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-neutral-700 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Quick Proof
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file / native camera input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            /* All 3 Photos Captured Message */
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">
                All 3 Verification Pictures Added
              </p>
              <p className="text-[11px] text-emerald-700">
                You can review or delete any photo above, or click Confirm and save.
              </p>
            </div>
          )}
        </div>

        {/* Pinned Footer Actions */}
        <div className="px-5 py-4 border-t border-neutral-100 bg-white shrink-0 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="brand"
            size="sm"
            onClick={handleConfirm}
            disabled={photos.length < 2 || isProcessing}
            className="font-bold text-xs"
          >
            Confirm and save
          </Button>
        </div>
      </div>
    </div>
  );
};
